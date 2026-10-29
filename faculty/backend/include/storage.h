// storage.h — Declares functions for reading and writing JSON data files.

#pragma once
#include "models.h"
#include <string>
#include <vector>

void storage_setDataDir(const std::string& dir);

// Settings
Settings storage_loadSettings();
bool     storage_saveSettings(const Settings& s);

// Students
std::vector<Student> storage_loadStudents();
bool                 storage_saveStudents(const std::vector<Student>& v);

// Teachers
std::vector<Teacher> storage_loadTeachers();
bool                 storage_saveTeachers(const std::vector<Teacher>& v);

// Subjects
std::vector<Subject> storage_loadSubjects();
bool                 storage_saveSubjects(const std::vector<Subject>& v);

// Results
std::vector<Result> storage_loadResults();
bool                storage_saveResults(const std::vector<Result>& v);

// Examinations
std::vector<Examination> storage_loadExaminations();
bool                     storage_saveExaminations(const std::vector<Examination>& v);

// Grading Policies
std::vector<RelativeGradingPolicy> storage_loadPolicies();
bool                               storage_savePolicies(const std::vector<RelativeGradingPolicy>& v);

// Grading Batches
std::vector<GradingBatch> storage_loadBatches();
bool                      storage_saveBatches(const std::vector<GradingBatch>& v);

// Utility
std::string storage_generateId(const std::string& prefix);
