// academic.h — Declares academic calculation engine for SGPA/CGPA evaluation
// Supports both Absolute Grading and Relative Grading (via finalized batches or Result fields)

#pragma once
#include "models.h"
#include <vector>
#include <string>

// ─── Grade lookup (Absolute Fallback) ──────────────────────────────
std::string academic_getGrade(double percent, const std::vector<GradeRule>& rules);
double      academic_getGradePoint(double percent, const std::vector<GradeRule>& rules);

// ─── Per-subject result ─────────────────────────────────────────────
SubjectResult academic_computeSubjectResult(
    const Result&                    result,
    const Subject&                   subject,
    const Settings&                  settings,
    const std::vector<GradingBatch>& batches = {});

// ─── Full student report (SGPA & CGPA) ──────────────────────────────
StudentReport academic_computeStudentReport(
    const Student&                   student,
    const std::vector<Subject>&      subjects,
    const std::vector<Result>&       results,
    const Settings&                  settings,
    const std::vector<GradingBatch>& batches = {});

// ─── Subject statistics across all students ─────────────────────────
SubjectStats academic_computeSubjectStats(
    const Subject&                   subject,
    const std::vector<Student>&      students,
    const std::vector<Result>&       results,
    const Settings&                  settings,
    const std::vector<GradingBatch>& batches = {});

// ─── Class-level analysis (CGPA / SGPA focused) ─────────────────────
ClassAnalysis academic_computeClassAnalysis(
    const std::vector<Student>&      students,
    const std::vector<Subject>&      subjects,
    const std::vector<Result>&       results,
    const Settings&                  settings,
    const std::vector<GradingBatch>& batches = {});

// ─── Default grade rules ────────────────────────────────────────────
std::vector<GradeRule> academic_defaultGradeRules();
Settings               academic_defaultSettings();
