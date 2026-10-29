// academic.cpp — Core calculation logic for MITS Gwalior Scheme of Evaluation
// Strictly implements Choice Based Credit System (CBCS):
//   SGPA = Σ(GradePoint_i × Credits_i) / Σ(Credits_i)
//   CGPA = Σ(SGPA_s × SemesterCredits_s) / Σ(SemesterCredits_s)
// Supports Relative Grading via batches / finalized Results with fallback to Absolute Grading.

#include "../include/academic.h"
#include "../include/relative_grading.h"
#include <algorithm>
#include <cmath>
#include <map>
#include <numeric>

// ════════════════════════════════════════════════════════════════════════════
//  DEFAULT CONFIGURATION (MITS Gwalior 10-Point Scale)
// ════════════════════════════════════════════════════════════════════════════

std::vector<GradeRule> academic_defaultGradeRules() {
    return {
        {90.0, 100.0, "O",  10.0, true}, // Outstanding
        {80.0,  89.99, "A+",  9.0, true}, // Excellent
        {70.0,  79.99, "A",   8.0, true}, // Very Good
        {60.0,  69.99, "B+",  7.0, true}, // Good
        {50.0,  59.99, "B",   6.0, true}, // Above Average
        {40.0,  49.99, "C",   5.0, true}, // Average / Pass
        { 0.0,  39.99, "F",   0.0, false}, // Fail / Arrear
    };
}

Settings academic_defaultSettings() {
    Settings s;
    s.collegeName        = "MADHAV INSTITUTE OF TECHNOLOGY & SCIENCE, GWALIOR";
    s.collegeSub         = "(Deemed to be University) | NAAC Accredited with A++ Grade";
    s.department         = "Department of Computer Science and Technology";
    s.programName        = "B. Tech. (Computer Science and Business Systems)";
    s.academicYear       = "2025-2026";
    s.currentSemester    = 1;
    s.passingPercent     = 40.0;
    s.difficultThreshold = 55.0;
    s.gradeRules         = academic_defaultGradeRules();
    s.activeGradingPolicyId = "policy_default_relative";
    s.relativeGradingEnabled = true;
    return s;
}

// ════════════════════════════════════════════════════════════════════════════
//  GRADE & GRADE POINT LOOKUP (Absolute Fallback)
// ════════════════════════════════════════════════════════════════════════════

std::string academic_getGrade(double percent, const std::vector<GradeRule>& rules) {
    for (auto& r : rules) {
        if (percent >= r.minPercent && percent <= r.maxPercent)
            return r.grade;
    }
    return "F";
}

double academic_getGradePoint(double percent, const std::vector<GradeRule>& rules) {
    for (auto& r : rules) {
        if (percent >= r.minPercent && percent <= r.maxPercent)
            return r.gradePoint;
    }
    return 0.0;
}

// ════════════════════════════════════════════════════════════════════════════
//  PER-SUBJECT RESULT (Relative or Absolute)
// ════════════════════════════════════════════════════════════════════════════

SubjectResult academic_computeSubjectResult(
    const Result&                    result,
    const Subject&                   subject,
    const Settings&                  settings,
    const std::vector<GradingBatch>& batches)
{
    SubjectResult sr;
    sr.subject       = subject;
    sr.marksObtained = result.marksObtained;
    sr.isAbsent      = result.isAbsent;
    sr.isWithheld    = result.isWithheld;

    if (result.isWithheld) {
        sr.isComplete    = false;
        sr.grade         = "WH";
        sr.gradePoint    = 0.0;
        sr.passed        = false;
        sr.earnedCredits = 0.0;
        sr.explanation   = "Result withheld by academic administration.";
        return sr;
    }

    if (result.isAbsent) {
        sr.isComplete    = true;
        sr.grade         = "AB";
        sr.gradePoint    = 0.0;
        sr.passed        = false;
        sr.earnedCredits = 0.0;
        sr.explanation   = "Candidate was absent for the examination.";
        return sr;
    }

    if (result.marksObtained < 0.0) {
        // Pending / Not yet recorded
        sr.isComplete    = false;
        sr.grade         = "—";
        sr.gradePoint    = 0.0;
        sr.passed        = false;
        sr.earnedCredits = 0.0;
        sr.explanation   = "Marks pending entry.";
        return sr;
    }

    // Completed paper
    sr.isComplete = true;

    // Check if result already has a finalized relative grade stored
    if (result.isFinalized && !result.finalGrade.empty()) {
        sr.grade           = result.finalGrade;
        sr.gradePoint      = result.finalGradePoint;
        sr.isRelativeGrade = true;
        sr.passed          = (sr.gradePoint >= 5.0 && sr.grade != "F" && sr.grade != "AB");
        sr.earnedCredits   = sr.passed ? subject.credits : 0.0;
        sr.explanation     = "Assigned via finalized relative grading batch.";
        return sr;
    }

    // Next check if a finalized batch exists in provided batches list
    std::string bGrade;
    double bGP = 0.0;
    if (!batches.empty() && rg_getFinalizedGrade(result.studentId, subject.id, batches, bGrade, bGP)) {
        sr.grade           = bGrade;
        sr.gradePoint      = bGP;
        sr.isRelativeGrade = true;
        sr.passed          = (sr.gradePoint >= 5.0 && sr.grade != "F" && sr.grade != "AB");
        sr.earnedCredits   = sr.passed ? subject.credits : 0.0;
        sr.explanation     = "Assigned via relative grading batch.";
        return sr;
    }

    // Absolute fallback (or initial preview)
    double rawPercentage = (subject.maxMarks > 0.0) ? (result.marksObtained / subject.maxMarks) * 100.0 : 0.0;
    sr.grade      = academic_getGrade(rawPercentage, settings.gradeRules);
    sr.gradePoint = academic_getGradePoint(rawPercentage, settings.gradeRules);
    sr.passed     = (result.marksObtained >= subject.passingMarks && sr.grade != "F");
    sr.earnedCredits = sr.passed ? subject.credits : 0.0;
    sr.isRelativeGrade = false;
    sr.explanation = "Assigned via standard evaluation scheme.";

    return sr;
}

// ════════════════════════════════════════════════════════════════════════════
//  FULL STUDENT TRANSCRIPT (SGPA, CGPA & Credits)
// ════════════════════════════════════════════════════════════════════════════

StudentReport academic_computeStudentReport(
    const Student&                   student,
    const std::vector<Subject>&      subjects,
    const std::vector<Result>&       results,
    const Settings&                  settings,
    const std::vector<GradingBatch>& batches)
{
    StudentReport report;
    report.student       = student;
    report.totalSubjects = (int)subjects.size();

    // Map subjectId to Result for this student
    std::map<std::string, const Result*> resultMap;
    for (auto& r : results) {
        if (r.studentId == student.id)
            resultMap[r.subjectId] = &r;
    }

    double sumWeightedGP     = 0.0; // Σ(GradePoint × Credits)
    double creditsReg        = 0.0; // Σ Credits registered
    double creditsEarned     = 0.0; // Σ Credits cleared
    bool   anyFail           = false;
    bool   anyIncomplete     = false;

    for (auto& sub : subjects) {
        Result dummy;
        dummy.marksObtained = -1.0;
        dummy.isAbsent      = false;
        dummy.studentId     = student.id;
        dummy.subjectId     = sub.id;

        const Result* rPtr = (resultMap.count(sub.id)) ? resultMap[sub.id] : &dummy;
        SubjectResult sr   = academic_computeSubjectResult(*rPtr, sub, settings, batches);
        report.subjects.push_back(sr);

        creditsReg += sub.credits;

        if (!sr.isComplete) {
            anyIncomplete = true;
        } else {
            report.completedSubjects++;
            sumWeightedGP += (sr.gradePoint * sub.credits);
            if (sr.passed) {
                creditsEarned += sub.credits;
            } else {
                anyFail = true;
            }
        }
    }

    report.creditsRegistered = creditsReg;
    report.creditsEarned     = creditsEarned;

    // SGPA = Σ(GradePoint × Credits) / Σ(Credits)
    if (creditsReg > 0.0) {
        report.sgpa = sumWeightedGP / creditsReg;
    } else {
        report.sgpa = 0.0;
    }

    // In current session single-term evaluation: CGPA = SGPA
    report.cgpa = report.sgpa;

    // Final Status & Academic Division
    if (anyIncomplete) {
        report.status        = "Incomplete";
        report.academicClass = "Result Pending";
    } else if (anyFail) {
        report.status        = "Fail";
        report.academicClass = "Academic Arrear(s)";
    } else {
        report.status = "Pass";
        if (report.cgpa >= 8.0)
            report.academicClass = "First Class with Distinction (Honours)";
        else if (report.cgpa >= 6.5)
            report.academicClass = "First Division";
        else if (report.cgpa >= 5.0)
            report.academicClass = "Second Division";
        else
            report.academicClass = "Pass Division";
    }

    return report;
}

// ════════════════════════════════════════════════════════════════════════════
//  SUBJECT STATISTICS (Average Grade Point, Std Dev & Difficulty)
// ════════════════════════════════════════════════════════════════════════════

SubjectStats academic_computeSubjectStats(
    const Subject&                   subject,
    const std::vector<Student>&      students,
    const std::vector<Result>&       results,
    const Settings&                  settings,
    const std::vector<GradingBatch>& batches)
{
    SubjectStats stats;
    stats.subject       = subject;
    stats.totalStudents = (int)students.size();

    std::vector<double> completedMarks;
    std::vector<double> completedGPs;
    std::map<std::string, int> gradeCounts;

    const Student* highestStudent = nullptr;
    const Student* lowestStudent  = nullptr;
    double maxMarkSeen = -999.0;
    double minMarkSeen = 999999.0;

    for (auto& st : students) {
        const Result* rPtr = nullptr;
        for (auto& r : results) {
            if (r.studentId == st.id && r.subjectId == subject.id) {
                rPtr = &r;
                break;
            }
        }

        if (!rPtr || rPtr->marksObtained < 0.0) continue;

        stats.completedStudents++;
        SubjectResult sr = academic_computeSubjectResult(*rPtr, subject, settings, batches);

        if (rPtr->isAbsent) {
            stats.absentCount++;
            gradeCounts["AB"]++;
            stats.needsSupportCount++;
            stats.needsSupportStudents.push_back({st.rollNo, st.name});
        } else {
            completedMarks.push_back(rPtr->marksObtained);
            completedGPs.push_back(sr.gradePoint);
            gradeCounts[sr.grade]++;
            if (sr.passed) {
                stats.passCount++;
            } else {
                stats.failCount++;
                stats.needsSupportCount++;
                stats.needsSupportStudents.push_back({st.rollNo, st.name});
            }

            if (rPtr->marksObtained > maxMarkSeen) {
                maxMarkSeen = rPtr->marksObtained;
                highestStudent = &st;
            }
            if (rPtr->marksObtained < minMarkSeen) {
                minMarkSeen = rPtr->marksObtained;
                lowestStudent = &st;
            }
        }
    }

    if (!completedMarks.empty()) {
        double sumMarks = std::accumulate(completedMarks.begin(), completedMarks.end(), 0.0);
        double sumGP    = std::accumulate(completedGPs.begin(), completedGPs.end(), 0.0);
        stats.averageMarks      = sumMarks / completedMarks.size();
        stats.averageGradePoint = sumGP / completedGPs.size();
        stats.highestMarks      = (maxMarkSeen >= 0.0) ? maxMarkSeen : 0.0;
        stats.lowestMarks       = (minMarkSeen <= 1000.0) ? minMarkSeen : 0.0;
        stats.medianMarks       = rg_median(completedMarks);
        stats.stdDevMarks       = rg_stdDev(completedMarks, true);

        if (highestStudent) {
            stats.highestScorerName = highestStudent->name;
            stats.highestScorerRoll = highestStudent->rollNo;
        }
        if (lowestStudent) {
            stats.lowestScorerName = lowestStudent->name;
            stats.lowestScorerRoll = lowestStudent->rollNo;
        }
    }

    int gradable = stats.completedStudents - stats.absentCount;
    if (gradable > 0) {
        stats.passPercent = (double)stats.passCount / gradable * 100.0;
    }

    for (auto& kv : gradeCounts) {
        stats.gradeDist.push_back({kv.first, kv.second});
    }

    // Difficulty Classification based on Pass Rate and Average Grade Point
    if (stats.completedStudents == 0) {
        stats.difficultyLevel = "No Data";
    } else if (stats.passPercent < 60.0 || stats.averageGradePoint < 6.0) {
        stats.difficultyLevel = "Needs Attention";
    } else if (stats.passPercent >= 90.0 && stats.averageGradePoint >= 8.0) {
        stats.difficultyLevel = "Easy";
    } else {
        stats.difficultyLevel = "Normal";
    }

    return stats;
}

// ════════════════════════════════════════════════════════════════════════════
//  CLASS-LEVEL ANALYSIS (Ranked by CGPA / SGPA)
// ════════════════════════════════════════════════════════════════════════════

ClassAnalysis academic_computeClassAnalysis(
    const std::vector<Student>&      students,
    const std::vector<Subject>&      subjects,
    const std::vector<Result>&       results,
    const Settings&                  settings,
    const std::vector<GradingBatch>& batches)
{
    ClassAnalysis ca;
    ca.totalStudents = (int)students.size();
    if (students.empty()) return ca;

    double sumCgpa = 0.0;
    int    evaluatedCount = 0;

    for (auto& st : students) {
        std::vector<Subject> semSubs;
        for (auto& sub : subjects) {
            if (sub.semester == st.semester) semSubs.push_back(sub);
        }
        auto rpt = academic_computeStudentReport(st, semSubs, results, settings, batches);
        ca.rankings.push_back({
            st.id,
            st.rollNo,
            st.name,
            st.className,
            rpt.cgpa,
            rpt.sgpa,
            rpt.status,
            rpt.academicClass,
            rpt.creditsEarned,
            rpt.creditsRegistered
        });

        for (auto& sr : rpt.subjects) {
            if (sr.isComplete && !sr.grade.empty() && sr.grade != "—") {
                ca.gradeDist[sr.grade]++;
            }
        }

        if (rpt.status == "Pass") {
            ca.passCount++;
            if (rpt.cgpa >= 8.0) ca.distinctionCount++;
            else if (rpt.cgpa >= 6.5) ca.firstClassCount++;
            else ca.secondClassCount++;
        } else if (rpt.status == "Fail") {
            ca.failCount++;
        } else {
            ca.incompleteCount++;
        }

        if (rpt.completedSubjects > 0) {
            sumCgpa += rpt.cgpa;
            evaluatedCount++;
        }
    }

    if (evaluatedCount > 0) {
        ca.classAvgCgpa = sumCgpa / evaluatedCount;
        double hi = -1.0, lo = 11.0;
        for (auto& e : ca.rankings) {
            if (e.status == "Incomplete" && e.cgpa == 0.0) continue;
            if (e.cgpa > hi) hi = e.cgpa;
            if (e.cgpa < lo) lo = e.cgpa;
        }
        ca.highestCgpa = (hi >= 0.0) ? hi : 0.0;
        ca.lowestCgpa  = (lo <= 10.0) ? lo : 0.0;
    }

    // Sort strictly by CGPA descending to determine merit rank
    std::sort(ca.rankings.begin(), ca.rankings.end(),
        [](const ClassAnalysis::RankEntry& a, const ClassAnalysis::RankEntry& b) { return a.cgpa > b.cgpa; });

    // Pick top passed students
    for (auto& e : ca.rankings) {
        if (e.status == "Pass") {
            if (ca.topperName.empty()) {
                ca.topperName = e.name;
                ca.topperId   = e.id;
                ca.topperRoll = e.rollNo;
                ca.topperCgpa = e.cgpa;
            }
            if ((int)ca.top3Ids.size() < 3) {
                ca.top3Ids.push_back(e.id);
            }
        }
    }

    if (ca.topperName.empty() && !ca.rankings.empty()) {
        ca.topperName = ca.rankings[0].name;
        ca.topperId   = ca.rankings[0].id;
        ca.topperRoll = ca.rankings[0].rollNo;
        ca.topperCgpa = ca.rankings[0].cgpa;
        for (int i = 0; i < std::min(3, (int)ca.rankings.size()); i++)
            ca.top3Ids.push_back(ca.rankings[i].id);
    }

    return ca;
}
