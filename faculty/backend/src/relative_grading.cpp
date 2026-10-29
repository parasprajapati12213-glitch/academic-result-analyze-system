// relative_grading.cpp — Relative Grading Engine Implementation
// Supports: Absolute, Mean+StdDev, Percentile-Rank, Quota-Based grading
// All grade assignments happen HERE, never in JavaScript.

#include "../include/relative_grading.h"
#include <algorithm>
#include <cmath>
#include <numeric>
#include <sstream>
#include <iomanip>
#include <chrono>
#include <ctime>

// ════════════════════════════════════════════════════════════════
//  ENUM CONVERSIONS
// ════════════════════════════════════════════════════════════════

std::string gradingMethodToStr(GradingMethod m) {
    switch(m) {
        case GradingMethod::METHOD_ABSOLUTE:        return "ABSOLUTE";
        case GradingMethod::METHOD_MEAN_STD_DEV:    return "MEAN_STD_DEV";
        case GradingMethod::METHOD_PERCENTILE_RANK: return "PERCENTILE_RANK";
        case GradingMethod::METHOD_QUOTA_BASED:     return "QUOTA_BASED";
        case GradingMethod::METHOD_CUSTOM_RULES:    return "CUSTOM_RULES";
        default:                                    return "ABSOLUTE";
    }
}

GradingMethod gradingMethodFromStr(const std::string& s) {
    if (s == "MEAN_STD_DEV")    return GradingMethod::METHOD_MEAN_STD_DEV;
    if (s == "PERCENTILE_RANK") return GradingMethod::METHOD_PERCENTILE_RANK;
    if (s == "QUOTA_BASED")     return GradingMethod::METHOD_QUOTA_BASED;
    if (s == "CUSTOM_RULES")    return GradingMethod::METHOD_CUSTOM_RULES;
    return GradingMethod::METHOD_ABSOLUTE;
}

// ════════════════════════════════════════════════════════════════
//  DEFAULT POLICIES
// ════════════════════════════════════════════════════════════════

RelativeGradingPolicy rg_buildDefaultAbsolutePolicy() {
    RelativeGradingPolicy p;
    p.id = "policy_default_absolute";
    p.name = "Default Absolute Grading (MITS 10-Point Scale)";
    p.version = "1.0";
    p.method = GradingMethod::METHOD_ABSOLUTE;
    p.methodStr = "ABSOLUTE";
    p.isDefault = true;

    // MITS 10-point scale
    p.absoluteRules = {
        {90.0, 100.0,  "O",  10.0, true},
        {80.0,  89.99, "A+",  9.0, true},
        {70.0,  79.99, "A",   8.0, true},
        {60.0,  69.99, "B+",  7.0, true},
        {50.0,  59.99, "B",   6.0, true},
        {40.0,  49.99, "C",   5.0, true},
        { 0.0,  39.99, "F",   0.0, false},
    };
    p.failGrade = "F";
    p.failGradePoint = 0.0;
    p.passingGradePoint = 5.0;
    p.absentGrade = "AB";
    p.minCohortSize = 1;
    p.smallCohortAction = "ABSOLUTE";
    return p;
}

RelativeGradingPolicy rg_buildDefaultMeanStdDevPolicy() {
    RelativeGradingPolicy p;
    p.id = "policy_default_relative";
    p.name = "Relative Grading — Mean & Std Dev Method";
    p.version = "1.0";
    p.method = GradingMethod::METHOD_MEAN_STD_DEV;
    p.methodStr = "MEAN_STD_DEV";
    p.isDefault = false;
    p.useSampleStdDev = true; // sample std dev (n-1)

    // Bands: grade if score is in [mean + lowerK*std, mean + upperK*std)
    p.stdDevBands = {
        {"O",  10.0,  1.5, 999.0, true},   // score >= mean + 1.5*std
        {"A+",  9.0,  1.0, 1.5,   true},   // mean+1.0*std to mean+1.5*std
        {"A",   8.0,  0.5, 1.0,   true},   // mean+0.5*std to mean+1.0*std
        {"B+",  7.0,  0.0, 0.5,   true},   // mean to mean+0.5*std
        {"B",   6.0, -0.5, 0.0,   true},   // mean-0.5*std to mean
        {"C",   5.0, -1.0,-0.5,   true},   // mean-1.0*std to mean-0.5*std
        {"F",   0.0,-999.0,-1.0,  false},  // below mean - 1.0*std
    };

    p.absoluteRules = {
        {90.0, 100.0,  "O",  10.0, true},
        {80.0,  89.99, "A+",  9.0, true},
        {70.0,  79.99, "A",   8.0, true},
        {60.0,  69.99, "B+",  7.0, true},
        {50.0,  59.99, "B",   6.0, true},
        {40.0,  49.99, "C",   5.0, true},
        { 0.0,  39.99, "F",   0.0, false},
    };

    p.failGrade = "F";
    p.failGradePoint = 0.0;
    p.passingGradePoint = 5.0;
    p.absentGrade = "AB";
    p.minCohortSize = 5;
    p.smallCohortAction = "ABSOLUTE";
    return p;
}

// ════════════════════════════════════════════════════════════════
//  STATISTICAL HELPERS
// ════════════════════════════════════════════════════════════════

double rg_mean(const std::vector<double>& marks) {
    if (marks.empty()) return 0.0;
    return std::accumulate(marks.begin(), marks.end(), 0.0) / marks.size();
}

double rg_stdDev(const std::vector<double>& marks, bool useSample) {
    if (marks.size() < 2) return 0.0;
    double m = rg_mean(marks);
    double sumSq = 0.0;
    for (double v : marks) sumSq += (v - m) * (v - m);
    double divisor = useSample ? (marks.size() - 1) : marks.size();
    return std::sqrt(sumSq / divisor);
}

double rg_median(std::vector<double> marks) {
    if (marks.empty()) return 0.0;
    std::sort(marks.begin(), marks.end());
    size_t n = marks.size();
    if (n % 2 == 0) return (marks[n/2-1] + marks[n/2]) / 2.0;
    return marks[n/2];
}

// Returns percentile rank 0-100 (what % of students scored <= value)
double rg_percentileRank(const std::vector<double>& sortedMarks, double value) {
    if (sortedMarks.empty()) return 0.0;
    size_t count = 0;
    for (double m : sortedMarks) {
        if (m <= value) count++;
    }
    return (double)count / sortedMarks.size() * 100.0;
}

static std::string nowStr() {
    time_t t = time(nullptr);
    char buf[64] = {0};
    struct tm* tm_info = localtime(&t);
    if (tm_info) {
        strftime(buf, sizeof(buf), "%Y-%m-%dT%H:%M:%S", tm_info);
    }
    return std::string(buf);
}

static std::string fmt2(double v) {
    std::ostringstream ss;
    ss << std::fixed << std::setprecision(2) << v;
    return ss.str();
}

// ════════════════════════════════════════════════════════════════
//  COHORT COLLECTION
// ════════════════════════════════════════════════════════════════

GradingBatch rg_buildPreview(
    const std::string&              subjectId,
    const std::string&              examinationId,
    const std::string&              cohortFilter,
    const std::vector<Student>&     students,
    const std::vector<Subject>&     subjects,
    const std::vector<Result>&      results,
    const RelativeGradingPolicy&    policy)
{
    GradingBatch batch;
    batch.id          = "batch_" + subjectId + "_" + nowStr();
    batch.subjectId   = subjectId;
    batch.examinationId = examinationId;
    batch.policyId    = policy.id;
    batch.policyVersion = policy.version;
    batch.status      = "PREVIEW";
    batch.createdAt   = nowStr();

    // Find subject
    const Subject* sub = nullptr;
    for (auto& s : subjects) {
        if (s.id == subjectId) { sub = &s; break; }
    }
    if (!sub) {
        batch.status = "ERROR";
        return batch;
    }

    // Collect eligible students
    for (auto& st : students) {
        if (sub->semester != 0 && st.semester != sub->semester) continue;
        if (!cohortFilter.empty() && cohortFilter != "ALL" &&
            st.className != cohortFilter) continue;

        GradingBatchEntry entry;
        entry.studentId   = st.id;
        entry.rollNo      = st.rollNo;
        entry.studentName = st.name;
        entry.maxMarks    = sub->maxMarks;
        entry.isEligible  = true;

        // Find result
        const Result* rPtr = nullptr;
        for (auto& r : results) {
            if (r.studentId == st.id && r.subjectId == subjectId) {
                if (examinationId.empty() || r.examinationId == examinationId) {
                    rPtr = &r;
                    break;
                }
            }
        }

        if (!rPtr) {
            entry.marksObtained = -1.0;
            entry.isEligible    = false;
            entry.ineligibleReason = "No marks entered yet";
            entry.assignedGrade = "—";
            entry.assignedGradePoint = 0.0;
            entry.passed = false;
            entry.explanation = "Marks not entered.";
        } else if (rPtr->isWithheld) {
            entry.marksObtained = rPtr->marksObtained;
            entry.isWithheld    = true;
            entry.isEligible    = false;
            entry.ineligibleReason = "Result withheld";
            entry.assignedGrade = "WH";
            entry.assignedGradePoint = 0.0;
            entry.passed = false;
            entry.explanation = "Result withheld by authority.";
        } else if (rPtr->isAbsent) {
            entry.isAbsent  = true;
            entry.isEligible = false; // absent excluded from cohort stats
            entry.ineligibleReason = "Absent";
            entry.assignedGrade = policy.absentGrade;
            entry.assignedGradePoint = policy.failGradePoint;
            entry.passed = false;
            entry.explanation = "Student was absent for this examination.";
            batch.absentCount++;
        } else if (rPtr->marksObtained < 0.0) {
            entry.marksObtained = -1.0;
            entry.isEligible    = false;
            entry.ineligibleReason = "Marks not entered";
            entry.assignedGrade = "—";
            entry.assignedGradePoint = 0.0;
            entry.passed = false;
            entry.explanation = "Marks not recorded.";
        } else {
            entry.marksObtained = rPtr->marksObtained;
            entry.percentage    = (sub->maxMarks > 0) ?
                (entry.marksObtained / sub->maxMarks * 100.0) : 0.0;
        }

        batch.entries.push_back(entry);
        batch.cohortSize++;
    }

    // Count eligible (marks entered, not absent, not withheld)
    for (auto& e : batch.entries) {
        if (e.isEligible) batch.eligibleCount++;
    }
    batch.withheldCount = 0;
    for (auto& e : batch.entries) {
        if (e.isWithheld) batch.withheldCount++;
    }

    // Compute cohort stats from eligible entries only
    std::vector<double> eligibleMarks;
    for (auto& e : batch.entries) {
        if (e.isEligible) eligibleMarks.push_back(e.marksObtained);
    }

    if (!eligibleMarks.empty()) {
        batch.mean   = rg_mean(eligibleMarks);
        batch.stdDev = rg_stdDev(eligibleMarks, policy.useSampleStdDev);
        batch.median = rg_median(eligibleMarks);
        batch.highest = *std::max_element(eligibleMarks.begin(), eligibleMarks.end());
        batch.lowest  = *std::min_element(eligibleMarks.begin(), eligibleMarks.end());
    }

    // Compute ranks and percentiles for eligible entries
    std::vector<double> sortedMarks = eligibleMarks;
    std::sort(sortedMarks.begin(), sortedMarks.end());

    for (auto& e : batch.entries) {
        if (!e.isEligible) continue;
        e.cohortMean    = batch.mean;
        e.cohortStdDev  = batch.stdDev;
        e.percentileRank = rg_percentileRank(sortedMarks, e.marksObtained);
        // Rank: 1 = highest
        int higherCount = 0;
        for (double m : eligibleMarks) {
            if (m > e.marksObtained) higherCount++;
        }
        e.rank = higherCount + 1;
        if (batch.stdDev > 0.001) {
            e.zScore = (e.marksObtained - batch.mean) / batch.stdDev;
        }
    }

    return batch;
}

// ════════════════════════════════════════════════════════════════
//  GRADING METHODS
// ════════════════════════════════════════════════════════════════

// ── METHOD A: Absolute ────────────────────────────────────────────
void rg_applyAbsolute(
    std::vector<GradingBatchEntry>& entries,
    const RelativeGradingPolicy&   policy)
{
    for (auto& e : entries) {
        if (!e.isEligible) continue;
        std::string grade = policy.failGrade;
        double gp = policy.failGradePoint;
        double pct = (e.maxMarks > 0) ? (e.marksObtained / e.maxMarks * 100.0) : 0.0;

        for (auto& r : policy.absoluteRules) {
            if (pct >= r.minPercent && pct <= r.maxPercent) {
                grade = r.grade;
                gp    = r.gradePoint;
                break;
            }
        }
        e.assignedGrade      = grade;
        e.assignedGradePoint = gp;
        e.passed             = (gp >= policy.passingGradePoint);
        e.explanation        = "Absolute grading: score " + fmt2(pct)
                             + "% -> Grade " + grade + " (GP " + fmt2(gp) + ")";
    }
}

// ── METHOD B: Mean + StdDev ───────────────────────────────────────
void rg_applyMeanStdDev(
    std::vector<GradingBatchEntry>& entries,
    double mean, double stdDev,
    const RelativeGradingPolicy&   policy)
{
    bool zeroStd = (stdDev < 0.001);

    for (auto& e : entries) {
        if (!e.isEligible) continue;

        std::string grade = policy.failGrade;
        double gp = policy.failGradePoint;
        std::string explanationDetail;

        if (zeroStd) {
            for (auto& band : policy.stdDevBands) {
                if (band.lowerK <= 0.0 && band.upperK > 0.0) {
                    grade = band.grade;
                    gp    = band.gradePoint;
                    break;
                }
            }
            explanationDetail = "All students scored equally (std dev = 0). "
                                "Grade assigned as the mean band.";
        } else {
            double z = (e.marksObtained - mean) / stdDev;
            e.zScore = z;
            for (auto& band : policy.stdDevBands) {
                if (z >= band.lowerK && z < band.upperK) {
                    grade = band.grade;
                    gp    = band.gradePoint;
                    break;
                }
            }
            explanationDetail = "Score: " + fmt2(e.marksObtained)
                + ", Mean: " + fmt2(mean)
                + ", Std Dev: " + fmt2(stdDev)
                + ", Z-score: " + fmt2(z)
                + " -> Grade " + grade + " (GP " + fmt2(gp) + ")";
        }

        e.assignedGrade      = grade;
        e.assignedGradePoint = gp;
        e.passed             = (gp >= policy.passingGradePoint);
        e.explanation        = "Relative grading (Mean+/-StdDev): " + explanationDetail;
    }
}

// ── METHOD C: Percentile Rank ─────────────────────────────────────
void rg_applyPercentileRank(
    std::vector<GradingBatchEntry>& entries,
    const RelativeGradingPolicy&   policy)
{
    for (auto& e : entries) {
        if (!e.isEligible) continue;

        std::string grade = policy.failGrade;
        double gp = policy.failGradePoint;
        double pr = e.percentileRank;

        std::vector<PercentileBand> sorted = policy.percentileBands;
        std::sort(sorted.begin(), sorted.end(),
            [](const PercentileBand& a, const PercentileBand& b) {
                return a.minPercentile > b.minPercentile;
            });

        for (auto& band : sorted) {
            if (pr >= band.minPercentile && pr <= band.maxPercentile) {
                grade = band.grade;
                gp    = band.gradePoint;
                break;
            }
        }

        e.assignedGrade      = grade;
        e.assignedGradePoint = gp;
        e.passed             = (gp >= policy.passingGradePoint);
        e.explanation        = "Relative grading (Percentile): score at "
            + fmt2(pr) + "th percentile -> Grade " + grade
            + " (GP " + fmt2(gp) + ")";
    }
}

// ── METHOD D: Quota-Based ─────────────────────────────────────────
void rg_applyQuotaBased(
    std::vector<GradingBatchEntry>& entries,
    const RelativeGradingPolicy&   policy)
{
    std::vector<GradingBatchEntry*> eligible;
    for (auto& e : entries) {
        if (e.isEligible) eligible.push_back(&e);
    }
    std::sort(eligible.begin(), eligible.end(),
        [](GradingBatchEntry* a, GradingBatchEntry* b) {
            return a->marksObtained > b->marksObtained;
        });

    int total = (int)eligible.size();
    if (total == 0) return;

    std::vector<QuotaBand> bands = policy.quotaBands;
    std::sort(bands.begin(), bands.end(),
        [](const QuotaBand& a, const QuotaBand& b) {
            return a.gradePoint > b.gradePoint;
        });

    int cursor = 0;
    for (size_t bi = 0; bi < bands.size(); bi++) {
        auto& band = bands[bi];
        int count = (int)std::round(band.targetPercent / 100.0 * total);

        if (bi == bands.size() - 1) {
            count = total - cursor;
        }

        if (policy.strictQuota) {
            for (int i = cursor; i < cursor + count && i < total; i++) {
                eligible[i]->assignedGrade      = band.grade;
                eligible[i]->assignedGradePoint = band.gradePoint;
                eligible[i]->passed             = (band.gradePoint >= policy.passingGradePoint);
                eligible[i]->explanation        = "Quota grading: rank "
                    + std::to_string(i+1) + " of " + std::to_string(total)
                    + " (quota " + fmt2(band.targetPercent) + "%) -> Grade "
                    + band.grade;
            }
        } else {
            int end = cursor + count;
            if (end < total && end > cursor) {
                double boundaryMarks = eligible[end-1]->marksObtained;
                while (end < total && eligible[end]->marksObtained == boundaryMarks) {
                    end++;
                }
            }
            for (int i = cursor; i < end && i < total; i++) {
                eligible[i]->assignedGrade      = band.grade;
                eligible[i]->assignedGradePoint = band.gradePoint;
                eligible[i]->passed             = (band.gradePoint >= policy.passingGradePoint);
                eligible[i]->explanation        = "Quota grading: rank "
                    + std::to_string(i+1) + " of " + std::to_string(total)
                    + " (target quota " + fmt2(band.targetPercent) + "%) -> Grade "
                    + band.grade;
            }
            count = end - cursor;
        }
        cursor += count;
        if (cursor >= total) break;
    }

    for (int i = cursor; i < total; i++) {
        eligible[i]->assignedGrade      = policy.failGrade;
        eligible[i]->assignedGradePoint = policy.failGradePoint;
        eligible[i]->passed             = false;
        eligible[i]->explanation        = "Quota exhausted — assigned fail grade.";
    }
}

// ════════════════════════════════════════════════════════════════
//  VALIDATION
// ════════════════════════════════════════════════════════════════

bool rg_validateCohort(const GradingBatch& batch,
                        const RelativeGradingPolicy& policy,
                        std::string& errorMsg)
{
    if (batch.eligibleCount == 0) {
        errorMsg = "No eligible students found in cohort. "
                   "Please enter marks for at least one student before grading.";
        return false;
    }

    if (batch.eligibleCount < policy.minCohortSize &&
        policy.method != GradingMethod::METHOD_ABSOLUTE) {
        if (policy.smallCohortAction == "FAIL") {
            errorMsg = "Cohort too small for relative grading ("
                + std::to_string(batch.eligibleCount) + " eligible, minimum "
                + std::to_string(policy.minCohortSize) + " required). "
                + "Change policy or use Absolute grading.";
            return false;
        }
        errorMsg = "WARN:Cohort size " + std::to_string(batch.eligibleCount)
            + " is below minimum " + std::to_string(policy.minCohortSize)
            + ". Falling back to Absolute grading for this batch.";
        return true;
    }

    return true;
}

// ════════════════════════════════════════════════════════════════
//  MAIN ENTRY POINT
// ════════════════════════════════════════════════════════════════

GradingBatch rg_calculateGrades(
    GradingBatch               batch,
    const RelativeGradingPolicy& policy)
{
    std::string validationMsg;
    bool valid = rg_validateCohort(batch, policy, validationMsg);

    bool fallbackToAbsolute = false;
    if (!valid) {
        batch.status = "ERROR";
        for (auto& e : batch.entries) {
            if (e.isEligible) {
                e.assignedGrade      = "—";
                e.assignedGradePoint = 0.0;
                e.passed             = false;
                e.explanation        = "Grading blocked: " + validationMsg;
            }
        }
        return batch;
    }

    if (validationMsg.rfind("WARN:", 0) == 0) {
        fallbackToAbsolute = true;
    }

    GradingMethod effectiveMethod = fallbackToAbsolute
        ? GradingMethod::METHOD_ABSOLUTE
        : policy.method;

    switch (effectiveMethod) {
        case GradingMethod::METHOD_ABSOLUTE:
            rg_applyAbsolute(batch.entries, policy);
            break;

        case GradingMethod::METHOD_MEAN_STD_DEV:
            rg_applyMeanStdDev(batch.entries, batch.mean, batch.stdDev, policy);
            break;

        case GradingMethod::METHOD_PERCENTILE_RANK:
            rg_applyPercentileRank(batch.entries, policy);
            break;

        case GradingMethod::METHOD_QUOTA_BASED:
            rg_applyQuotaBased(batch.entries, policy);
            break;

        default:
            rg_applyAbsolute(batch.entries, policy);
            break;
    }

    batch.gradeDistribution.clear();
    for (auto& e : batch.entries) {
        if (!e.assignedGrade.empty() && e.assignedGrade != "—") {
            batch.gradeDistribution[e.assignedGrade]++;
        }
    }

    batch.status = "PREVIEW";
    return batch;
}

// ════════════════════════════════════════════════════════════════
//  FINALIZATION
// ════════════════════════════════════════════════════════════════

GradingBatch rg_finalizeBatch(GradingBatch batch) {
    batch.status      = "FINALIZED";
    batch.finalizedAt = nowStr();
    return batch;
}

// ════════════════════════════════════════════════════════════════
//  LOOKUP FINALIZED GRADE
// ════════════════════════════════════════════════════════════════

bool rg_getFinalizedGrade(
    const std::string&              studentId,
    const std::string&              subjectId,
    const std::vector<GradingBatch>& batches,
    std::string& outGrade,
    double&      outGradePoint)
{
    const GradingBatch* best = nullptr;
    for (auto& b : batches) {
        if (b.subjectId == subjectId && b.status == "FINALIZED") {
            if (!best || b.finalizedAt > best->finalizedAt) {
                best = &b;
            }
        }
    }
    if (!best) return false;

    for (auto& entry : best->entries) {
        if (entry.studentId == studentId) {
            outGrade      = entry.assignedGrade;
            outGradePoint = entry.assignedGradePoint;
            return true;
        }
    }
    return false;
}
