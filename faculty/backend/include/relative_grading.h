// relative_grading.h — Relative Grading Engine Header
// Separates grading logic from storage, HTTP routes, and frontend.

#pragma once
#include "models.h"
#include <vector>
#include <string>

// ─── Convert method enums ────────────────────────────────────────
std::string gradingMethodToStr(GradingMethod m);
GradingMethod gradingMethodFromStr(const std::string& s);

// ─── Build default policies ──────────────────────────────────────
RelativeGradingPolicy rg_buildDefaultAbsolutePolicy();
RelativeGradingPolicy rg_buildDefaultMeanStdDevPolicy();

// ─── Cohort collection ────────────────────────────────────────────
// Gathers all results for a subject from the eligible cohort.
// Cohort = students in same semester (+ optional className filter).
// Returns a GradingBatch in PREVIEW status (not finalized).
GradingBatch rg_buildPreview(
    const std::string&                   subjectId,
    const std::string&                   examinationId,  // optional, "" = all
    const std::string&                   cohortFilter,   // "" = all in semester
    const std::vector<Student>&          students,
    const std::vector<Subject>&          subjects,
    const std::vector<Result>&           results,
    const RelativeGradingPolicy&         policy);

// ─── Statistical helpers ─────────────────────────────────────────
double rg_mean(const std::vector<double>& marks);
double rg_stdDev(const std::vector<double>& marks, bool useSample);
double rg_median(std::vector<double> marks);  // pass by value, will sort
double rg_percentileRank(const std::vector<double>& sortedMarks, double value);

// ─── Core grading methods ────────────────────────────────────────
// Each assigns grade/gradePoint to every entry.
void rg_applyAbsolute(
    std::vector<GradingBatchEntry>& entries,
    const RelativeGradingPolicy&   policy);

void rg_applyMeanStdDev(
    std::vector<GradingBatchEntry>& entries,
    double mean, double stdDev,
    const RelativeGradingPolicy&   policy);

void rg_applyPercentileRank(
    std::vector<GradingBatchEntry>& entries,
    const RelativeGradingPolicy&   policy);

void rg_applyQuotaBased(
    std::vector<GradingBatchEntry>& entries,
    const RelativeGradingPolicy&   policy);

// ─── Edge case handlers ──────────────────────────────────────────
// Returns true if grading can proceed, false if blocked
bool rg_validateCohort(const GradingBatch& batch,
                        const RelativeGradingPolicy& policy,
                        std::string& errorMsg);

// ─── Main entry point ─────────────────────────────────────────────
// Applies the policy to the batch and returns updated batch.
// Does NOT finalize — that requires explicit user confirmation.
GradingBatch rg_calculateGrades(
    GradingBatch              batch,
    const RelativeGradingPolicy& policy);

// ─── Finalization ────────────────────────────────────────────────
// Marks batch as FINALIZED and sets finalGrade on each Result.
GradingBatch rg_finalizeBatch(GradingBatch batch);

// ─── Lookup finalized grade for a student+subject ─────────────────
// Returns false if not found or not finalized.
bool rg_getFinalizedGrade(
    const std::string&              studentId,
    const std::string&              subjectId,
    const std::vector<GradingBatch>& batches,
    std::string& outGrade,
    double&      outGradePoint);
