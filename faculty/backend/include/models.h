// models.h — Data models for MITS Gwalior Academic Result & Relative Grading System
// Extended with: RelativeGradingPolicy, GradingBatch, Examination, Cohort

#pragma once
#include <string>
#include <vector>
#include <map>

// ═══════════════════════════════════════════════════════════════════
//  GRADING METHOD TYPES
// ═══════════════════════════════════════════════════════════════════

enum class GradingMethod {
    METHOD_ABSOLUTE,        // Fixed percentage boundaries (legacy fallback)
    METHOD_MEAN_STD_DEV,    // Mean +/- k*StdDev bands
    METHOD_PERCENTILE_RANK, // Rank/percentile-based grade bands
    METHOD_QUOTA_BASED,     // Quota proportions per grade
    METHOD_CUSTOM_RULES     // Institution-defined configurable rules
};

std::string gradingMethodToStr(GradingMethod m);
GradingMethod gradingMethodFromStr(const std::string& s);

// ─── GradeRule (used by ABSOLUTE and as label mapping) ─────────────
struct GradeRule {
    double minPercent  = 0.0;
    double maxPercent  = 100.0;
    std::string grade;
    double gradePoint  = 0.0;
    bool   isPassing   = true;
};

// ─── MeanStdDevBand: for METHOD_MEAN_STD_DEV method ───────────────
// Grade if score >= (mean + lowerK*stdDev) AND < (mean + upperK*stdDev)
struct MeanStdDevBand {
    std::string grade;
    double gradePoint;
    double lowerK;   // lower K factor
    double upperK;   // upper K factor (use 999 for +inf)
    bool   isPassing = true;
};

// ─── PercentileBand: for METHOD_PERCENTILE_RANK method ────────────
struct PercentileBand {
    std::string grade;
    double gradePoint;
    double minPercentile;
    double maxPercentile;
    bool   isPassing = true;
};

// ─── QuotaBand: for METHOD_QUOTA_BASED method ────────────────────
struct QuotaBand {
    std::string grade;
    double gradePoint;
    double targetPercent; // e.g. 10 means 10% of class gets this grade
    bool   isPassing = true;
};

// ─── Relative Grading Policy ─────────────────────────────────────
struct RelativeGradingPolicy {
    std::string id;
    std::string name;
    std::string version;
    std::string methodStr;
    GradingMethod method        = GradingMethod::METHOD_MEAN_STD_DEV;

    std::vector<GradeRule>       absoluteRules;
    std::vector<MeanStdDevBand>  stdDevBands;
    bool useSampleStdDev        = true;

    std::vector<PercentileBand>  percentileBands;
    std::vector<QuotaBand>       quotaBands;
    bool strictQuota            = false;

    double passingGradePoint    = 5.0;
    std::string failGrade       = "F";
    double failGradePoint       = 0.0;
    std::string absentGrade     = "AB";

    int    minCohortSize        = 3;
    std::string smallCohortAction = "ABSOLUTE"; // "ABSOLUTE" or "FAIL"

    std::string createdAt;
    bool isDefault              = false;
};

// ─── Settings ────────────────────────────────────────────────────
struct Settings {
    std::string collegeName    = "MADHAV INSTITUTE OF TECHNOLOGY & SCIENCE, GWALIOR";
    std::string collegeSub     = "(Deemed to be University) | NAAC Accredited with A++ Grade";
    std::string department     = "Department of Computer Science and Technology";
    std::string programName    = "B. Tech. (Computer Science and Business Systems)";
    std::string academicYear   = "2025-2026";
    int         currentSemester = 1;
    double      passingPercent  = 40.0;
    double      difficultThreshold = 55.0;
    std::vector<GradeRule> gradeRules;  // absolute fallback rules
    std::string activeGradingPolicyId;
    bool relativeGradingEnabled = true;
};

// ─── Student ────────────────────────────────────────────────────
struct Student {
    std::string id;
    std::string rollNo;
    std::string name;
    std::string className;
    int         semester   = 1;
    std::string department;
    std::string academicYear;
    std::string email;
};

// ─── Teacher ────────────────────────────────────────────────────
struct Teacher {
    std::string id;
    std::string employeeId;
    std::string name;
    std::string designation;
    std::string department;
    std::string email;
    std::vector<std::string> assignedSubjectIds;
    std::vector<std::string> assignedClasses;
};

// ─── Subject ────────────────────────────────────────────────────
struct Subject {
    std::string id;
    std::string code;
    std::string categoryCode;
    std::string name;
    double      maxMarks     = 100.0;
    double      passingMarks = 40.0;
    double      credits      = 3.0;
    int         semester     = 1;
    std::string gradingPolicyId;
};

// ─── Examination ─────────────────────────────────────────────────
struct Examination {
    std::string id;
    std::string name;
    std::string type;           // "ENDSEM", "MIDSEM", "INTERNAL", "PRACTICAL"
    int         semester        = 1;
    std::string academicYear;
    std::string subjectId;
    std::string cohortFilter;   // "" = all students in semester
    std::string gradingPolicyId;
    std::string status;         // "OPEN", "GRADED", "FINALIZED"
    std::string createdAt;
    std::string finalizedAt;
    bool        isLocked        = false;

    // Result Approval & Publication Workflow
    std::string approvalStatus  = "DRAFT"; // "DRAFT", "MARKS_ENTERED", "REVIEW_READY", "APPROVED", "PUBLISHED"
    std::string approvedBy;
    std::string approvedAt;
    std::string publishedAt;
    std::string reopenReason;
};

// ─── Result ─────────────────────────────────────────────────────
struct Result {
    std::string id;
    std::string studentId;
    std::string subjectId;
    std::string examinationId;
    double      marksObtained = -1.0;
    bool        isAbsent      = false;
    bool        isWithheld    = false;
    std::string enteredAt;

    // Finalized relative grade
    std::string finalGrade;
    double      finalGradePoint = -1.0;
    bool        isFinalized     = false;
    std::string gradingBatchId;
};

// ─── GradingBatchEntry ────────────────────────────────────────────
struct GradingBatchEntry {
    std::string studentId;
    std::string rollNo;
    std::string studentName;
    double      marksObtained = 0.0;
    double      maxMarks      = 100.0;
    double      percentage    = 0.0;
    bool        isAbsent      = false;
    bool        isWithheld    = false;
    bool        isEligible    = true;
    std::string ineligibleReason;

    double cohortMean     = 0.0;
    double cohortStdDev   = 0.0;
    double zScore         = 0.0;
    double percentileRank = 0.0;
    int    rank           = 0;

    std::string assignedGrade;
    double      assignedGradePoint = 0.0;
    bool        passed             = false;
    std::string explanation;
};

// ─── GradingBatch ────────────────────────────────────────────────
struct GradingBatch {
    std::string id;
    std::string examinationId;
    std::string subjectId;
    std::string policyId;
    std::string policyVersion;
    std::string policySnapshot;
    std::string status;   // "PREVIEW", "FINALIZED"

    int    cohortSize    = 0;
    int    eligibleCount = 0;
    int    absentCount   = 0;
    int    withheldCount = 0;
    double mean          = 0.0;
    double stdDev        = 0.0;
    double median        = 0.0;
    double highest       = 0.0;
    double lowest        = 0.0;

    std::map<std::string, int> gradeDistribution;
    std::vector<GradingBatchEntry> entries;

    std::string createdAt;
    std::string finalizedAt;
};

// ─── SubjectResult (computed, not stored) ────────────────────────
struct SubjectResult {
    Subject     subject;
    double      marksObtained = -1.0;
    bool        isAbsent      = false;
    bool        isWithheld    = false;
    bool        isComplete    = false;
    std::string grade         = "—";
    double      gradePoint    = 0.0;
    bool        passed        = false;
    double      earnedCredits = 0.0;
    bool        isRelativeGrade = false;
    std::string explanation;
};

// ─── StudentReport (computed) ────────────────────────────────────
struct StudentReport {
    Student                    student;
    std::vector<SubjectResult> subjects;
    double sgpa               = 0.0;
    double cgpa               = 0.0;
    double creditsRegistered  = 0.0;
    double creditsEarned      = 0.0;
    std::string academicClass = "—";
    std::string status        = "Incomplete";
    int    completedSubjects  = 0;
    int    totalSubjects      = 0;
};

// ─── SubjectStats (computed) ────────────────────────────────────
struct SubjectStats {
    Subject     subject;
    int         totalStudents     = 0;
    int         completedStudents = 0;
    int         passCount         = 0;
    int         failCount         = 0;
    int         absentCount       = 0;
    double      averageMarks      = 0.0;
    double      averageGradePoint = 0.0;
    double      passPercent       = 0.0;
    double      highestMarks      = 0.0;
    std::string highestScorerName;
    std::string highestScorerRoll;
    double      lowestMarks       = 0.0;
    std::string lowestScorerName;
    std::string lowestScorerRoll;
    double      stdDevMarks       = 0.0;
    double      medianMarks       = 0.0;
    std::string difficultyLevel   = "Normal";
    std::vector<std::pair<std::string,int>> gradeDist;
    int         needsSupportCount = 0;
    std::vector<std::pair<std::string, std::string>> needsSupportStudents; // rollNo, name
};

// ─── ClassAnalysis (computed) ────────────────────────────────────
struct ClassAnalysis {
    int    totalStudents    = 0;
    int    passCount        = 0;
    int    failCount        = 0;
    int    incompleteCount  = 0;
    double classAvgCgpa     = 0.0;
    double highestCgpa      = 0.0;
    double lowestCgpa       = 0.0;
    std::string topperName;
    std::string topperId;
    std::string topperRoll;
    double topperCgpa       = 0.0;
    int    distinctionCount = 0;
    int    firstClassCount  = 0;
    int    secondClassCount = 0;
    std::vector<std::string> top3Ids;

    struct RankEntry {
        std::string id;
        std::string rollNo;
        std::string name;
        std::string className;
        double cgpa;
        double sgpa;
        std::string status;
        std::string academicClass;
        double creditsEarned;
        double creditsTotal;
    };
    std::vector<RankEntry> rankings;
    std::map<std::string, int> gradeDist;
};
