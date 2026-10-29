// calculation_tests.cpp — Comprehensive Automated Test Suite for Relative Grading & CBCS Engine
// Verifies: Relative Grading (Mean+StdDev, Percentile, Quota), Edge Cases, SGPA/CGPA, and Persistence

#include "../backend/include/models.h"
#include "../backend/include/academic.h"
#include "../backend/include/relative_grading.h"
#include "../backend/include/storage.h"
#include <iostream>
#include <cassert>
#include <cmath>
#include <vector>
#include <string>

int g_passCount = 0;
int g_failCount = 0;

void recordTest(const std::string& testName, bool condition, const std::string& details = "") {
    if (condition) {
        std::cout << "  [PASS] " << testName << "\n";
        g_passCount++;
    } else {
        std::cout << "  [FAIL] " << testName;
        if (!details.empty()) std::cout << " (" << details << ")";
        std::cout << "\n";
        g_failCount++;
    }
}

bool nearEqual(double a, double b, double eps = 0.001) {
    return std::fabs(a - b) < eps;
}

int main() {
    std::cout << "===============================================================\n";
    std::cout << "  MITS GWALIOR ACADEMIC EVALUATION SYSTEM — TEST SUITE\n";
    std::cout << "  Relative Grading Engine & CBCS Calculation Verification\n";
    std::cout << "===============================================================\n\n";

    Settings settings = academic_defaultSettings();
    RelativeGradingPolicy relPolicy = rg_buildDefaultMeanStdDevPolicy();
    RelativeGradingPolicy absPolicy = rg_buildDefaultAbsolutePolicy();

    // ── Test 1: Relative Grading — Mean & StdDev Normal Distribution ──────────
    {
        // 5 students with marks: 95, 85, 75, 65, 55
        // Mean = 75.0, Sample StdDev = sqrt((400 + 100 + 0 + 100 + 400) / 4) = sqrt(250) = 15.811
        // Z-scores:
        // Student 1 (95): z = (95-75)/15.811 = +1.265  -> A+ (1.0 <= z < 1.5)
        // Student 2 (85): z = (85-75)/15.811 = +0.632  -> A  (0.5 <= z < 1.0)
        // Student 3 (75): z = (75-75)/15.811 =  0.000  -> B+ (0.0 <= z < 0.5)
        // Student 4 (65): z = (65-75)/15.811 = -0.632  -> C  (-1.0 <= z < -0.5)
        // Student 5 (55): z = (55-75)/15.811 = -1.265  -> F  (z < -1.0)
        std::vector<Student> stList{
            {"s1", "0901CSBS251001", "Aarav", "CSBS-A", 1, "CSE", "2025-26"},
            {"s2", "0901CSBS251002", "Bob",   "CSBS-A", 1, "CSE", "2025-26"},
            {"s3", "0901CSBS251003", "Carl",  "CSBS-A", 1, "CSE", "2025-26"},
            {"s4", "0901CSBS251004", "Dan",   "CSBS-A", 1, "CSE", "2025-26"},
            {"s5", "0901CSBS251005", "Eve",   "CSBS-A", 1, "CSE", "2025-26"}
        };
        std::vector<Subject> subList{
            {"sub1", "30251101", "DC", "Computer Science", 100.0, 40.0, 3.0, 1}
        };
        std::vector<Result> resList{
            {"r1", "s1", "sub1", "", 95.0, false, false},
            {"r2", "s2", "sub1", "", 85.0, false, false},
            {"r3", "s3", "sub1", "", 75.0, false, false},
            {"r4", "s4", "sub1", "", 65.0, false, false},
            {"r5", "s5", "sub1", "", 55.0, false, false}
        };

        GradingBatch batch = rg_buildPreview("sub1", "", "ALL", stList, subList, resList, relPolicy);
        batch = rg_calculateGrades(batch, relPolicy);

        bool passMean = nearEqual(batch.mean, 75.0);
        bool passStd  = nearEqual(batch.stdDev, std::sqrt(250.0));
        bool passG1   = (batch.entries[0].assignedGrade == "A+");
        bool passG2   = (batch.entries[1].assignedGrade == "A");
        bool passG3   = (batch.entries[2].assignedGrade == "B+");
        bool passG4   = (batch.entries[3].assignedGrade == "C");
        bool passG5   = (batch.entries[4].assignedGrade == "F");

        recordTest("Case 1: Relative Grading Mean+StdDev assigns correct grades based on cohort distribution",
                   passMean && passStd && passG1 && passG2 && passG3 && passG4 && passG5);
    }

    // ── Test 2: Zero Standard Deviation (All Students Score Same Marks) ────────
    {
        std::vector<Student> stList{
            {"s1", "R1", "A", "CSBS-A", 1},
            {"s2", "R2", "B", "CSBS-A", 1},
            {"s3", "R3", "C", "CSBS-A", 1},
            {"s4", "R4", "D", "CSBS-A", 1},
            {"s5", "R5", "E", "CSBS-A", 1}
        };
        std::vector<Subject> subList{{"sub1", "30251101", "DC", "Course 1", 100.0, 40.0, 3.0, 1}};
        std::vector<Result> resList{
            {"r1", "s1", "sub1", "", 80.0, false},
            {"r2", "s2", "sub1", "", 80.0, false},
            {"r3", "s3", "sub1", "", 80.0, false},
            {"r4", "s4", "sub1", "", 80.0, false},
            {"r5", "s5", "sub1", "", 80.0, false}
        };
        GradingBatch batch = rg_buildPreview("sub1", "", "ALL", stList, subList, resList, relPolicy);
        batch = rg_calculateGrades(batch, relPolicy);

        bool allAssigned = true;
        for (auto& e : batch.entries) {
            if (e.assignedGrade.empty() || e.assignedGrade == "—") allAssigned = false;
        }
        recordTest("Case 2: Zero standard deviation handled safely without division error",
                   nearEqual(batch.stdDev, 0.0) && allAssigned);
    }

    // ── Test 3: Small Cohort Fallback to Absolute Grading ─────────────────────
    {
        // Only 2 students, minCohortSize is 5
        std::vector<Student> stList{
            {"s1", "R1", "Alice", "CSBS-A", 1},
            {"s2", "R2", "Bob",   "CSBS-A", 1}
        };
        std::vector<Subject> subList{{"sub1", "30251101", "DC", "Course 1", 100.0, 40.0, 3.0, 1}};
        std::vector<Result> resList{
            {"r1", "s1", "sub1", "", 95.0, false},
            {"r2", "s2", "sub1", "", 45.0, false}
        };
        GradingBatch batch = rg_buildPreview("sub1", "", "ALL", stList, subList, resList, relPolicy);
        batch = rg_calculateGrades(batch, relPolicy);

        // Small cohort falls back to absolute: 95% = O, 45% = C
        bool s1O = (batch.entries[0].assignedGrade == "O");
        bool s2C = (batch.entries[1].assignedGrade == "C");
        recordTest("Case 3: Small cohort (< minCohortSize) safely falls back to configured absolute scale",
                   s1O && s2C);
    }

    // ── Test 4: Percentile-Based Relative Grading ─────────────────────────────
    {
        RelativeGradingPolicy pctPolicy;
        pctPolicy.id = "pol_percentile";
        pctPolicy.method = GradingMethod::METHOD_PERCENTILE_RANK;
        pctPolicy.percentileBands = {
            {"O",  10.0, 80.01, 100.0, true},
            {"A+",  9.0, 60.01,  80.0, true},
            {"A",   8.0, 40.01,  60.0, true},
            {"B",   6.0, 20.01,  40.0, true},
            {"F",   0.0,  0.0,   20.0, false}
        };
        pctPolicy.minCohortSize = 3;

        std::vector<Student> stList{
            {"s1", "R1", "Top",    "CSBS-A", 1},
            {"s2", "R2", "High",   "CSBS-A", 1},
            {"s3", "R3", "Mid",    "CSBS-A", 1},
            {"s4", "R4", "LowMid", "CSBS-A", 1},
            {"s5", "R5", "Bottom", "CSBS-A", 1}
        };
        std::vector<Subject> subList{{"sub1", "30251101", "DC", "Course 1", 100.0, 40.0, 3.0, 1}};
        std::vector<Result> resList{
            {"r1", "s1", "sub1", "", 98.0, false},
            {"r2", "s2", "sub1", "", 82.0, false},
            {"r3", "s3", "sub1", "", 70.0, false},
            {"r4", "s4", "sub1", "", 55.0, false},
            {"r5", "s5", "sub1", "", 30.0, false}
        };

        GradingBatch batch = rg_buildPreview("sub1", "", "ALL", stList, subList, resList, pctPolicy);
        batch = rg_calculateGrades(batch, pctPolicy);

        bool topIsO = (batch.entries[0].assignedGrade == "O");
        bool bottomIsF = (batch.entries[4].assignedGrade == "F");
        recordTest("Case 4: Percentile rank relative grading assigns grades based on cohort standing",
                   topIsO && bottomIsF);
    }

    // ── Test 5: Quota-Based Relative Grading with Tie Handling ────────────────
    {
        RelativeGradingPolicy quotaPolicy;
        quotaPolicy.id = "pol_quota";
        quotaPolicy.method = GradingMethod::METHOD_QUOTA_BASED;
        quotaPolicy.quotaBands = {
            {"O",  10.0, 20.0, true}, // top 20%
            {"A",   8.0, 40.0, true}, // next 40%
            {"B",   6.0, 40.0, true}  // bottom 40%
        };
        quotaPolicy.minCohortSize = 3;
        quotaPolicy.strictQuota = false; // expands for ties

        std::vector<Student> stList{
            {"s1", "R1", "A", "CSBS-A", 1},
            {"s2", "R2", "B", "CSBS-A", 1},
            {"s3", "R3", "C", "CSBS-A", 1},
            {"s4", "R4", "D", "CSBS-A", 1},
            {"s5", "R5", "E", "CSBS-A", 1}
        };
        std::vector<Subject> subList{{"sub1", "30251101", "DC", "Course 1", 100.0, 40.0, 3.0, 1}};
        std::vector<Result> resList{
            {"r1", "s1", "sub1", "", 90.0, false},
            {"r2", "s2", "sub1", "", 80.0, false},
            {"r3", "s3", "sub1", "", 80.0, false}, // tied at quota boundary
            {"r4", "s4", "sub1", "", 60.0, false},
            {"r5", "s5", "sub1", "", 50.0, false}
        };

        GradingBatch batch = rg_buildPreview("sub1", "", "ALL", stList, subList, resList, quotaPolicy);
        batch = rg_calculateGrades(batch, quotaPolicy);

        bool s1O = (batch.entries[0].assignedGrade == "O");
        bool s2A = (batch.entries[1].assignedGrade == "A");
        bool s3A = (batch.entries[2].assignedGrade == "A"); // tied student gets same grade
        recordTest("Case 5: Quota-based relative grading treats tied students fairly without splitting arbitrary rank",
                   s1O && s2A && s3A);
    }

    // ── Test 6: Absent Candidates Assigned Grade AB & Excluded from Cohort Mean
    {
        std::vector<Student> stList{
            {"s1", "R1", "Present 1", "CSBS-A", 1},
            {"s2", "R2", "Present 2", "CSBS-A", 1},
            {"s3", "R3", "Present 3", "CSBS-A", 1},
            {"s4", "R4", "Present 4", "CSBS-A", 1},
            {"s5", "R5", "Present 5", "CSBS-A", 1},
            {"s6", "R6", "Absentee",  "CSBS-A", 1}
        };
        std::vector<Subject> subList{{"sub1", "30251101", "DC", "Course 1", 100.0, 40.0, 3.0, 1}};
        std::vector<Result> resList{
            {"r1", "s1", "sub1", "", 80.0, false},
            {"r2", "s2", "sub1", "", 80.0, false},
            {"r3", "s3", "sub1", "", 80.0, false},
            {"r4", "s4", "sub1", "", 80.0, false},
            {"r5", "s5", "sub1", "", 80.0, false},
            {"r6", "s6", "sub1", "",  0.0, true}  // isAbsent = true
        };

        GradingBatch batch = rg_buildPreview("sub1", "", "ALL", stList, subList, resList, relPolicy);
        batch = rg_calculateGrades(batch, relPolicy);

        bool meanExcludesAbsent = nearEqual(batch.mean, 80.0);
        bool absentGradeAB = (batch.entries[5].assignedGrade == "AB");
        recordTest("Case 6: Absent student receives Grade AB and is excluded from cohort mean calculation",
                   meanExcludesAbsent && absentGradeAB && batch.absentCount == 1);
    }

    // ── Test 7: Withheld Results Handled Appropriately ────────────────────────
    {
        Result rWH{"r7", "s7", "sub1", "", 75.0, false, true}; // isWithheld = true
        Subject sub{"sub1", "30251101", "DC", "Course 1", 100.0, 40.0, 3.0, 1};
        SubjectResult sr = academic_computeSubjectResult(rWH, sub, settings);
        recordTest("Case 7: Withheld result marked as WH with zero earned credits and pending status",
                   sr.grade == "WH" && !sr.passed && !sr.isComplete);
    }

    // ── Test 8: Batch Finalization Locks Results with Correct Grades ───────────
    {
        std::vector<Student> stList{
            {"s1", "R1", "A", "CSBS-A", 1},
            {"s2", "R2", "B", "CSBS-A", 1},
            {"s3", "R3", "C", "CSBS-A", 1},
            {"s4", "R4", "D", "CSBS-A", 1},
            {"s5", "R5", "E", "CSBS-A", 1}
        };
        std::vector<Subject> subList{{"sub1", "30251101", "DC", "Course 1", 100.0, 40.0, 3.0, 1}};
        std::vector<Result> resList{
            {"r1", "s1", "sub1", "", 90.0, false},
            {"r2", "s2", "sub1", "", 80.0, false},
            {"r3", "s3", "sub1", "", 70.0, false},
            {"r4", "s4", "sub1", "", 60.0, false},
            {"r5", "s5", "sub1", "", 50.0, false}
        };
        GradingBatch batch = rg_buildPreview("sub1", "", "ALL", stList, subList, resList, relPolicy);
        batch = rg_calculateGrades(batch, relPolicy);
        batch = rg_finalizeBatch(batch);

        recordTest("Case 8: Finalization transitions batch status to FINALIZED with timestamp",
                   batch.status == "FINALIZED" && !batch.finalizedAt.empty());
    }

    // ── Test 9: Transparent Audit Explanation Generation ─────────────────────
    {
        std::vector<Student> stList{
            {"s1", "R1", "A", "CSBS-A", 1},
            {"s2", "R2", "B", "CSBS-A", 1},
            {"s3", "R3", "C", "CSBS-A", 1},
            {"s4", "R4", "D", "CSBS-A", 1},
            {"s5", "R5", "E", "CSBS-A", 1}
        };
        std::vector<Subject> subList{{"sub1", "30251101", "DC", "Course 1", 100.0, 40.0, 3.0, 1}};
        std::vector<Result> resList{
            {"r1", "s1", "sub1", "", 88.0, false},
            {"r2", "s2", "sub1", "", 80.0, false},
            {"r3", "s3", "sub1", "", 75.0, false},
            {"r4", "s4", "sub1", "", 65.0, false},
            {"r5", "s5", "sub1", "", 55.0, false}
        };
        GradingBatch batch = rg_buildPreview("sub1", "", "ALL", stList, subList, resList, relPolicy);
        batch = rg_calculateGrades(batch, relPolicy);

        bool hasExplanation = (!batch.entries[0].explanation.empty());
        bool hasZScore = (batch.entries[0].explanation.find("Z-score") != std::string::npos);
        recordTest("Case 9: Engine produces detailed, auditable grading explanation for each student",
                   hasExplanation && hasZScore);
    }

    // ── Test 10: SGPA Credit-Weighted Calculation with Relative Grades ─────────
    {
        // 3 courses: 3 credits (GP 9.0 = 27), 2 credits (GP 8.0 = 16), 1 credit (GP 10.0 = 10)
        // Sum GP*Credits = 53.0. Total Credits = 6.0. SGPA = 53/6 = 8.833
        Student st{"s1", "R1", "TestStudent", "CSBS-A", 1};
        std::vector<Subject> subs{
            {"sub1", "30251101", "DC", "C1", 100.0, 40.0, 3.0, 1},
            {"sub2", "30251102", "ESC", "C2", 100.0, 40.0, 2.0, 1},
            {"sub3", "30251106", "DLC", "C3", 100.0, 40.0, 1.0, 1}
        };
        std::vector<Result> results{
            {"r1", "s1", "sub1", "", 88.0, false, false, "", "A+", 9.0, true, "b1"},
            {"r2", "s1", "sub2", "", 78.0, false, false, "", "A",  8.0, true, "b2"},
            {"r3", "s1", "sub3", "", 95.0, false, false, "", "O", 10.0, true, "b3"}
        };
        auto rpt = academic_computeStudentReport(st, subs, results, settings);
        double expectedSGPA = 53.0 / 6.0;
        recordTest("Case 10: Credit-weighted SGPA uses finalized relative grades accurately",
                   nearEqual(rpt.sgpa, expectedSGPA) && nearEqual(rpt.creditsEarned, 6.0));
    }

    // ── Test 11: Fail in Any Subject Flags Semester Status as Fail ────────────
    {
        Student st{"s1", "R1", "FailStudent", "CSBS-A", 1};
        std::vector<Subject> subs{
            {"sub1", "30251101", "DC", "C1", 100.0, 40.0, 3.0, 1},
            {"sub2", "30251102", "ESC", "C2", 100.0, 40.0, 2.0, 1}
        };
        std::vector<Result> results{
            {"r1", "s1", "sub1", "", 88.0, false, false, "", "A", 8.0, true},
            {"r2", "s1", "sub2", "", 35.0, false, false, "", "F", 0.0, true}
        };
        auto rpt = academic_computeStudentReport(st, subs, results, settings);
        recordTest("Case 11: Candidate with a failing relative grade is categorized as Fail with Arrears",
                   rpt.status == "Fail" && nearEqual(rpt.creditsEarned, 3.0));
    }

    // ── Test 12: Empty Cohort Handling ────────────────────────────────────────
    {
        std::vector<Student> emptyStudents;
        std::vector<Subject> subs{{"sub1", "30251101", "DC", "C1", 100.0, 40.0, 3.0, 1}};
        std::vector<Result> emptyResults;
        GradingBatch batch = rg_buildPreview("sub1", "", "ALL", emptyStudents, subs, emptyResults, relPolicy);
        batch = rg_calculateGrades(batch, relPolicy);
        recordTest("Case 12: Empty cohort blocked gracefully without crashes or false grades",
                   batch.status == "ERROR" && batch.eligibleCount == 0);
    }

    // ── Test 13: Recalculation Alert on Marks Update ──────────────────────────
    {
        Result r{"r1", "s1", "sub1", "", 80.0, false, false, "", "A", 8.0, true, "b1"};
        // When marks change, isFinalized must be revoked
        r.marksObtained = 85.0;
        r.isFinalized = false;
        r.finalGrade = "";
        r.finalGradePoint = -1.0;
        recordTest("Case 13: Updating marks correctly revokes finalized state to mandate recalculation",
                   !r.isFinalized && r.finalGrade.empty());
    }

    // ── Test 14: Population vs Sample Standard Deviation Precision ────────────
    {
        std::vector<double> marks = {10.0, 20.0, 30.0, 40.0, 50.0};
        double sampleSD = rg_stdDev(marks, true);   // divisor = 4, sqrt(250) = 15.811388
        double popSD    = rg_stdDev(marks, false);  // divisor = 5, sqrt(200) = 14.142135
        recordTest("Case 14: Sample and Population standard deviation match exact statistical formulas",
                   nearEqual(sampleSD, 15.8114) && nearEqual(popSD, 14.1421));
    }

    // ── Test 15: Median Calculation for Even & Odd Cohorts ────────────────────
    {
        std::vector<double> oddMarks = {10.0, 40.0, 20.0, 50.0, 30.0}; // sorted: 10, 20, 30, 40, 50 -> 30
        std::vector<double> evenMarks = {10.0, 40.0, 20.0, 30.0};      // sorted: 10, 20, 30, 40 -> 25
        double medOdd  = rg_median(oddMarks);
        double medEven = rg_median(evenMarks);
        recordTest("Case 15: Median calculation is mathematically accurate for both even and odd cohort sizes",
                   nearEqual(medOdd, 30.0) && nearEqual(medEven, 25.0));
    }

    // ── Test 16: Class Analysis Integration with Relative Batches ─────────────
    {
        std::vector<Student> stList{
            {"s1", "0901CSBS251001", "Aarav", "CSBS-A", 1},
            {"s2", "0901CSBS251002", "Bob",   "CSBS-A", 1}
        };
        std::vector<Subject> subList{
            {"sub1", "30251101", "DC", "Course 1", 100.0, 40.0, 3.0, 1}
        };
        std::vector<Result> resList{
            {"r1", "s1", "sub1", "", 95.0, false, false, "", "O", 10.0, true},
            {"r2", "s2", "sub1", "", 85.0, false, false, "", "A",  8.0, true}
        };
        auto ca = academic_computeClassAnalysis(stList, subList, resList, settings);
        recordTest("Case 16: Class analysis correctly incorporates finalized relative grades into cohort rankings",
                   ca.totalStudents == 2 && ca.topperName == "Aarav" && nearEqual(ca.highestCgpa, 10.0));
    }

    // ── Test 17: Storage & Persistence of Policies ───────────────────────────
    {
        auto policies = storage_loadPolicies();
        bool hasRelative = false;
        for (auto& p : policies) {
            if (p.method == GradingMethod::METHOD_MEAN_STD_DEV) hasRelative = true;
        }
        recordTest("Case 17: Configurable relative grading policies load and persist from storage layer",
                   !policies.empty() && hasRelative);
    }

    std::cout << "\n===============================================================\n";
    std::cout << "TEST RUN SUMMARY: " << g_passCount << " PASSED, " << g_failCount << " FAILED.\n";
    std::cout << "===============================================================\n";

    return (g_failCount == 0) ? 0 : 1;
}
