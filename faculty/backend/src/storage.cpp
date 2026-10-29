// storage.cpp — File I/O using standard C++ (GCC 6 compatible)
// Extended with: RelativeGradingPolicy, GradingBatch, Examination persistence

#include "../include/storage.h"
#include "../include/json.hpp"
#include "../include/relative_grading.h"
#include <fstream>
#include <iostream>
#include <chrono>
#include <sys/stat.h>
#include <direct.h>

using json = nlohmann::json;

static std::string g_dataDir = "data";

void storage_setDataDir(const std::string& dir) {
    g_dataDir = dir;
    _mkdir(g_dataDir.c_str());
}

static std::string path(const std::string& filename) {
    return g_dataDir + "/" + filename;
}

static json readJsonFile(const std::string& filename, bool asArray = false) {
    std::string filepath = path(filename);
    std::ifstream f(filepath);
    if (!f.is_open()) return asArray ? json::array() : json::object();
    try {
        json j; f >> j; return j;
    } catch (const json::exception& e) {
        std::cerr << "[storage] WARNING: Cannot parse " << filepath << " — " << e.what() << "\n";
        std::rename(filepath.c_str(), (filepath + ".bak").c_str());
        return asArray ? json::array() : json::object();
    }
}

static bool writeJsonFile(const std::string& filename, const json& j) {
    std::string filepath = path(filename);
    std::string tmppath  = filepath + ".tmp";
    try {
        std::ofstream f(tmppath);
        if (!f.is_open()) { std::cerr << "[storage] ERROR: Cannot write " << tmppath << "\n"; return false; }
        f << j.dump(2);
        f.close();
        std::remove(filepath.c_str());
        if (std::rename(tmppath.c_str(), filepath.c_str()) != 0) {
            std::cerr << "[storage] ERROR: Cannot rename temp file to " << filepath << "\n";
            return false;
        }
        return true;
    } catch (const std::exception& e) {
        std::cerr << "[storage] ERROR: " << e.what() << "\n";
        return false;
    }
}

std::string storage_generateId(const std::string& prefix) {
    auto ms = std::chrono::duration_cast<std::chrono::milliseconds>(
        std::chrono::system_clock::now().time_since_epoch()).count();
    static int counter = 0;
    return prefix + std::to_string(ms) + std::to_string(++counter);
}

// ════════ SETTINGS ══════════════════════════════════════════════

Settings storage_loadSettings() {
    json j = readJsonFile("settings.json");
    Settings s;
    s.collegeName        = j.value("collegeName", "MADHAV INSTITUTE OF TECHNOLOGY & SCIENCE, GWALIOR");
    s.collegeSub         = j.value("collegeSub", "(Deemed to be University) | NAAC Accredited with A++ Grade");
    s.department         = j.value("department", "Department of Computer Science and Technology");
    s.programName        = j.value("programName", "B. Tech. (Computer Science and Business Systems)");
    s.academicYear       = j.value("academicYear", "2025-2026");
    s.currentSemester    = j.value("currentSemester", 1);
    s.passingPercent     = j.value("passingPercent", 40.0);
    s.difficultThreshold = j.value("difficultThreshold", 55.0);
    s.activeGradingPolicyId   = j.value("activeGradingPolicyId", "");
    s.relativeGradingEnabled  = j.value("relativeGradingEnabled", false);

    if (j.contains("gradeRules") && j["gradeRules"].is_array()) {
        for (auto& r : j["gradeRules"]) {
            GradeRule gr;
            gr.minPercent = r.value("minPercent", 0.0);
            gr.maxPercent = r.value("maxPercent", 100.0);
            gr.grade      = r.value("grade", "F");
            gr.gradePoint = r.value("gradePoint", 0.0);
            gr.isPassing  = r.value("isPassing", (gr.gradePoint >= 5.0));
            s.gradeRules.push_back(gr);
        }
    }
    return s;
}

bool storage_saveSettings(const Settings& s) {
    json j;
    j["collegeName"]             = s.collegeName;
    j["collegeSub"]              = s.collegeSub;
    j["department"]              = s.department;
    j["programName"]             = s.programName;
    j["academicYear"]            = s.academicYear;
    j["currentSemester"]         = s.currentSemester;
    j["passingPercent"]          = s.passingPercent;
    j["difficultThreshold"]      = s.difficultThreshold;
    j["activeGradingPolicyId"]   = s.activeGradingPolicyId;
    j["relativeGradingEnabled"]  = s.relativeGradingEnabled;
    json rules = json::array();
    for (auto& r : s.gradeRules) {
        json rj;
        rj["minPercent"] = r.minPercent;
        rj["maxPercent"] = r.maxPercent;
        rj["grade"]      = r.grade;
        rj["gradePoint"] = r.gradePoint;
        rj["isPassing"]  = r.isPassing;
        rules.push_back(rj);
    }
    j["gradeRules"] = rules;
    return writeJsonFile("settings.json", j);
}

// ════════ STUDENTS ═══════════════════════════════════════════════

std::vector<Student> storage_loadStudents() {
    json j = readJsonFile("students.json", true);
    std::vector<Student> v;
    for (auto& item : j) {
        Student st;
        st.id           = item.value("id", "");
        st.rollNo       = item.value("rollNo", "");
        st.name         = item.value("name", "");
        st.className    = item.value("className", "");
        st.semester     = item.value("semester", 1);
        st.department   = item.value("department", "");
        st.academicYear = item.value("academicYear", "");
        st.email        = item.value("email", "");
        if (!st.id.empty() && !st.name.empty()) v.push_back(st);
    }
    return v;
}

bool storage_saveStudents(const std::vector<Student>& v) {
    json j = json::array();
    for (auto& st : v) {
        json item;
        item["id"]           = st.id;
        item["rollNo"]       = st.rollNo;
        item["name"]         = st.name;
        item["className"]    = st.className;
        item["semester"]     = st.semester;
        item["department"]   = st.department;
        item["academicYear"] = st.academicYear;
        item["email"]        = st.email;
        j.push_back(item);
    }
    return writeJsonFile("students.json", j);
}

// ════════ TEACHERS ═══════════════════════════════════════════════

std::vector<Teacher> storage_loadTeachers() {
    json j = readJsonFile("teachers.json", true);
    std::vector<Teacher> v;
    for (auto& item : j) {
        Teacher t;
        t.id          = item.value("id", "");
        t.employeeId  = item.value("employeeId", "");
        t.name        = item.value("name", "");
        t.designation = item.value("designation", "Faculty Member");
        t.department  = item.value("department", "Centre for Computer Science and Technology");
        t.email       = item.value("email", "");
        if (item.contains("assignedSubjectIds") && item["assignedSubjectIds"].is_array()) {
            for (auto& s : item["assignedSubjectIds"]) t.assignedSubjectIds.push_back(s.get<std::string>());
        }
        if (item.contains("assignedClasses") && item["assignedClasses"].is_array()) {
            for (auto& c : item["assignedClasses"]) t.assignedClasses.push_back(c.get<std::string>());
        }
        if (!t.id.empty() && !t.name.empty()) v.push_back(t);
    }
    return v;
}

bool storage_saveTeachers(const std::vector<Teacher>& v) {
    json j = json::array();
    for (auto& t : v) {
        json item;
        item["id"]                 = t.id;
        item["employeeId"]         = t.employeeId;
        item["name"]               = t.name;
        item["designation"]        = t.designation;
        item["department"]         = t.department;
        item["email"]              = t.email;
        item["assignedSubjectIds"] = t.assignedSubjectIds;
        item["assignedClasses"]    = t.assignedClasses;
        j.push_back(item);
    }
    return writeJsonFile("teachers.json", j);
}

// ════════ SUBJECTS ════════════════════════════════════════════════

std::vector<Subject> storage_loadSubjects() {
    json j = readJsonFile("subjects.json", true);
    std::vector<Subject> v;
    for (auto& item : j) {
        Subject sub;
        sub.id              = item.value("id", "");
        sub.code            = item.value("code", "");
        sub.categoryCode    = item.value("categoryCode", "DC");
        sub.name            = item.value("name", "");
        sub.maxMarks        = item.value("maxMarks", 100.0);
        sub.passingMarks    = item.value("passingMarks", 40.0);
        sub.credits         = item.value("credits", 3.0);
        sub.semester        = item.value("semester", 1);
        sub.gradingPolicyId = item.value("gradingPolicyId", "");
        if (!sub.id.empty() && !sub.name.empty()) v.push_back(sub);
    }
    return v;
}

bool storage_saveSubjects(const std::vector<Subject>& v) {
    json j = json::array();
    for (auto& sub : v) {
        json item;
        item["id"]              = sub.id;
        item["code"]            = sub.code;
        item["categoryCode"]    = sub.categoryCode;
        item["name"]            = sub.name;
        item["maxMarks"]        = sub.maxMarks;
        item["passingMarks"]    = sub.passingMarks;
        item["credits"]         = sub.credits;
        item["semester"]        = sub.semester;
        item["gradingPolicyId"] = sub.gradingPolicyId;
        j.push_back(item);
    }
    return writeJsonFile("subjects.json", j);
}

// ════════ RESULTS ═════════════════════════════════════════════════

std::vector<Result> storage_loadResults() {
    json j = readJsonFile("results.json", true);
    std::vector<Result> v;
    for (auto& item : j) {
        Result r;
        r.id              = item.value("id", "");
        r.studentId       = item.value("studentId", "");
        r.subjectId       = item.value("subjectId", "");
        r.examinationId   = item.value("examinationId", "");
        r.marksObtained   = item.value("marksObtained", -1.0);
        r.isAbsent        = item.value("isAbsent", false);
        r.isWithheld      = item.value("isWithheld", false);
        r.enteredAt       = item.value("enteredAt", "");
        r.finalGrade      = item.value("finalGrade", "");
        r.finalGradePoint = item.value("finalGradePoint", -1.0);
        r.isFinalized     = item.value("isFinalized", false);
        r.gradingBatchId  = item.value("gradingBatchId", "");
        if (!r.id.empty() && !r.studentId.empty()) v.push_back(r);
    }
    return v;
}

bool storage_saveResults(const std::vector<Result>& v) {
    json j = json::array();
    for (auto& r : v) {
        json item;
        item["id"]              = r.id;
        item["studentId"]       = r.studentId;
        item["subjectId"]       = r.subjectId;
        item["examinationId"]   = r.examinationId;
        item["marksObtained"]   = r.marksObtained;
        item["isAbsent"]        = r.isAbsent;
        item["isWithheld"]      = r.isWithheld;
        item["enteredAt"]       = r.enteredAt;
        item["finalGrade"]      = r.finalGrade;
        item["finalGradePoint"] = r.finalGradePoint;
        item["isFinalized"]     = r.isFinalized;
        item["gradingBatchId"]  = r.gradingBatchId;
        j.push_back(item);
    }
    return writeJsonFile("results.json", j);
}

// ════════ EXAMINATIONS ════════════════════════════════════════════

std::vector<Examination> storage_loadExaminations() {
    json j = readJsonFile("examinations.json", true);
    std::vector<Examination> v;
    for (auto& item : j) {
        Examination ex;
        ex.id              = item.value("id", "");
        ex.name            = item.value("name", "");
        ex.type            = item.value("type", "ENDSEM");
        ex.semester        = item.value("semester", 1);
        ex.academicYear    = item.value("academicYear", "");
        ex.subjectId       = item.value("subjectId", "");
        ex.cohortFilter    = item.value("cohortFilter", "");
        ex.gradingPolicyId = item.value("gradingPolicyId", "");
        ex.status          = item.value("status", "OPEN");
        ex.createdAt       = item.value("createdAt", "");
        ex.finalizedAt     = item.value("finalizedAt", "");
        ex.isLocked        = item.value("isLocked", false);

        ex.approvalStatus  = item.value("approvalStatus", "DRAFT");
        ex.approvedBy      = item.value("approvedBy", "");
        ex.approvedAt      = item.value("approvedAt", "");
        ex.publishedAt     = item.value("publishedAt", "");
        ex.reopenReason    = item.value("reopenReason", "");
        if (!ex.id.empty()) v.push_back(ex);
    }
    return v;
}

bool storage_saveExaminations(const std::vector<Examination>& v) {
    json j = json::array();
    for (auto& ex : v) {
        json item;
        item["id"]              = ex.id;
        item["name"]            = ex.name;
        item["type"]            = ex.type;
        item["semester"]        = ex.semester;
        item["academicYear"]    = ex.academicYear;
        item["subjectId"]       = ex.subjectId;
        item["cohortFilter"]    = ex.cohortFilter;
        item["gradingPolicyId"] = ex.gradingPolicyId;
        item["status"]          = ex.status;
        item["createdAt"]       = ex.createdAt;
        item["finalizedAt"]     = ex.finalizedAt;
        item["isLocked"]        = ex.isLocked;

        item["approvalStatus"]  = ex.approvalStatus;
        item["approvedBy"]      = ex.approvedBy;
        item["approvedAt"]      = ex.approvedAt;
        item["publishedAt"]     = ex.publishedAt;
        item["reopenReason"]    = ex.reopenReason;
        j.push_back(item);
    }
    return writeJsonFile("examinations.json", j);
}

// ════════ GRADING POLICIES ════════════════════════════════════════

static json policyToJson(const RelativeGradingPolicy& p) {
    json j;
    j["id"]                = p.id;
    j["name"]              = p.name;
    j["version"]           = p.version;
    j["method"]            = gradingMethodToStr(p.method);
    j["useSampleStdDev"]   = p.useSampleStdDev;
    j["strictQuota"]       = p.strictQuota;
    j["passingGradePoint"] = p.passingGradePoint;
    j["failGrade"]         = p.failGrade;
    j["failGradePoint"]    = p.failGradePoint;
    j["absentGrade"]       = p.absentGrade;
    j["minCohortSize"]     = p.minCohortSize;
    j["smallCohortAction"] = p.smallCohortAction;
    j["createdAt"]         = p.createdAt;
    j["isDefault"]         = p.isDefault;

    json absRules = json::array();
    for (auto& r : p.absoluteRules) {
        json rj;
        rj["minPercent"] = r.minPercent; rj["maxPercent"] = r.maxPercent;
        rj["grade"] = r.grade; rj["gradePoint"] = r.gradePoint;
        rj["isPassing"] = r.isPassing;
        absRules.push_back(rj);
    }
    j["absoluteRules"] = absRules;

    json sdBands = json::array();
    for (auto& b : p.stdDevBands) {
        json bj;
        bj["grade"] = b.grade; bj["gradePoint"] = b.gradePoint;
        bj["lowerK"] = b.lowerK; bj["upperK"] = b.upperK;
        bj["isPassing"] = b.isPassing;
        sdBands.push_back(bj);
    }
    j["stdDevBands"] = sdBands;

    json pcBands = json::array();
    for (auto& b : p.percentileBands) {
        json bj;
        bj["grade"] = b.grade; bj["gradePoint"] = b.gradePoint;
        bj["minPercentile"] = b.minPercentile; bj["maxPercentile"] = b.maxPercentile;
        bj["isPassing"] = b.isPassing;
        pcBands.push_back(bj);
    }
    j["percentileBands"] = pcBands;

    json qBands = json::array();
    for (auto& b : p.quotaBands) {
        json bj;
        bj["grade"] = b.grade; bj["gradePoint"] = b.gradePoint;
        bj["targetPercent"] = b.targetPercent; bj["isPassing"] = b.isPassing;
        qBands.push_back(bj);
    }
    j["quotaBands"] = qBands;

    return j;
}

static RelativeGradingPolicy policyFromJson(const json& j) {
    RelativeGradingPolicy p;
    p.id                = j.value("id", "");
    p.name              = j.value("name", "");
    p.version           = j.value("version", "1.0");
    p.methodStr         = j.value("method", "ABSOLUTE");
    p.method            = gradingMethodFromStr(p.methodStr);
    p.useSampleStdDev   = j.value("useSampleStdDev", true);
    p.strictQuota       = j.value("strictQuota", false);
    p.passingGradePoint = j.value("passingGradePoint", 5.0);
    p.failGrade         = j.value("failGrade", "F");
    p.failGradePoint    = j.value("failGradePoint", 0.0);
    p.absentGrade       = j.value("absentGrade", "AB");
    p.minCohortSize     = j.value("minCohortSize", 3);
    p.smallCohortAction = j.value("smallCohortAction", "ABSOLUTE");
    p.createdAt         = j.value("createdAt", "");
    p.isDefault         = j.value("isDefault", false);

    if (j.contains("absoluteRules") && j["absoluteRules"].is_array()) {
        for (auto& r : j["absoluteRules"]) {
            GradeRule gr;
            gr.minPercent = r.value("minPercent", 0.0);
            gr.maxPercent = r.value("maxPercent", 100.0);
            gr.grade      = r.value("grade", "F");
            gr.gradePoint = r.value("gradePoint", 0.0);
            gr.isPassing  = r.value("isPassing", gr.gradePoint >= 5.0);
            p.absoluteRules.push_back(gr);
        }
    }
    if (j.contains("stdDevBands") && j["stdDevBands"].is_array()) {
        for (auto& b : j["stdDevBands"]) {
            MeanStdDevBand bd;
            bd.grade      = b.value("grade", "F");
            bd.gradePoint = b.value("gradePoint", 0.0);
            bd.lowerK     = b.value("lowerK", -999.0);
            bd.upperK     = b.value("upperK", 999.0);
            bd.isPassing  = b.value("isPassing", bd.gradePoint >= 5.0);
            p.stdDevBands.push_back(bd);
        }
    }
    if (j.contains("percentileBands") && j["percentileBands"].is_array()) {
        for (auto& b : j["percentileBands"]) {
            PercentileBand pb;
            pb.grade          = b.value("grade", "F");
            pb.gradePoint     = b.value("gradePoint", 0.0);
            pb.minPercentile  = b.value("minPercentile", 0.0);
            pb.maxPercentile  = b.value("maxPercentile", 100.0);
            pb.isPassing      = b.value("isPassing", pb.gradePoint >= 5.0);
            p.percentileBands.push_back(pb);
        }
    }
    if (j.contains("quotaBands") && j["quotaBands"].is_array()) {
        for (auto& b : j["quotaBands"]) {
            QuotaBand qb;
            qb.grade          = b.value("grade", "F");
            qb.gradePoint     = b.value("gradePoint", 0.0);
            qb.targetPercent  = b.value("targetPercent", 10.0);
            qb.isPassing      = b.value("isPassing", qb.gradePoint >= 5.0);
            p.quotaBands.push_back(qb);
        }
    }
    return p;
}

std::vector<RelativeGradingPolicy> storage_loadPolicies() {
    json j = readJsonFile("grading_policies.json", true);
    std::vector<RelativeGradingPolicy> v;
    for (auto& item : j) {
        RelativeGradingPolicy p = policyFromJson(item);
        if (!p.id.empty()) v.push_back(p);
    }
    // Ensure we always have at least the default absolute policy
    if (v.empty()) {
        v.push_back(rg_buildDefaultAbsolutePolicy());
        v.push_back(rg_buildDefaultMeanStdDevPolicy());
    }
    return v;
}

bool storage_savePolicies(const std::vector<RelativeGradingPolicy>& v) {
    json j = json::array();
    for (auto& p : v) j.push_back(policyToJson(p));
    return writeJsonFile("grading_policies.json", j);
}

// ════════ GRADING BATCHES ════════════════════════════════════════

static json entryToJson(const GradingBatchEntry& e) {
    json j;
    j["studentId"]         = e.studentId;
    j["rollNo"]            = e.rollNo;
    j["studentName"]       = e.studentName;
    j["marksObtained"]     = e.marksObtained;
    j["maxMarks"]          = e.maxMarks;
    j["percentage"]        = e.percentage;
    j["isAbsent"]          = e.isAbsent;
    j["isWithheld"]        = e.isWithheld;
    j["isEligible"]        = e.isEligible;
    j["ineligibleReason"]  = e.ineligibleReason;
    j["cohortMean"]        = e.cohortMean;
    j["cohortStdDev"]      = e.cohortStdDev;
    j["zScore"]            = e.zScore;
    j["percentileRank"]    = e.percentileRank;
    j["rank"]              = e.rank;
    j["assignedGrade"]     = e.assignedGrade;
    j["assignedGradePoint"]= e.assignedGradePoint;
    j["passed"]            = e.passed;
    j["explanation"]       = e.explanation;
    return j;
}

static GradingBatchEntry entryFromJson(const json& j) {
    GradingBatchEntry e;
    e.studentId         = j.value("studentId", "");
    e.rollNo            = j.value("rollNo", "");
    e.studentName       = j.value("studentName", "");
    e.marksObtained     = j.value("marksObtained", 0.0);
    e.maxMarks          = j.value("maxMarks", 100.0);
    e.percentage        = j.value("percentage", 0.0);
    e.isAbsent          = j.value("isAbsent", false);
    e.isWithheld        = j.value("isWithheld", false);
    e.isEligible        = j.value("isEligible", true);
    e.ineligibleReason  = j.value("ineligibleReason", "");
    e.cohortMean        = j.value("cohortMean", 0.0);
    e.cohortStdDev      = j.value("cohortStdDev", 0.0);
    e.zScore            = j.value("zScore", 0.0);
    e.percentileRank    = j.value("percentileRank", 0.0);
    e.rank              = j.value("rank", 0);
    e.assignedGrade     = j.value("assignedGrade", "—");
    e.assignedGradePoint= j.value("assignedGradePoint", 0.0);
    e.passed            = j.value("passed", false);
    e.explanation       = j.value("explanation", "");
    return e;
}

std::vector<GradingBatch> storage_loadBatches() {
    json j = readJsonFile("grading_batches.json", true);
    std::vector<GradingBatch> v;
    for (auto& item : j) {
        GradingBatch b;
        b.id             = item.value("id", "");
        b.examinationId  = item.value("examinationId", "");
        b.subjectId      = item.value("subjectId", "");
        b.policyId       = item.value("policyId", "");
        b.policyVersion  = item.value("policyVersion", "");
        b.policySnapshot = item.value("policySnapshot", "");
        b.status         = item.value("status", "PREVIEW");
        b.cohortSize     = item.value("cohortSize", 0);
        b.eligibleCount  = item.value("eligibleCount", 0);
        b.absentCount    = item.value("absentCount", 0);
        b.withheldCount  = item.value("withheldCount", 0);
        b.mean           = item.value("mean", 0.0);
        b.stdDev         = item.value("stdDev", 0.0);
        b.median         = item.value("median", 0.0);
        b.highest        = item.value("highest", 0.0);
        b.lowest         = item.value("lowest", 0.0);
        b.createdAt      = item.value("createdAt", "");
        b.finalizedAt    = item.value("finalizedAt", "");

        if (item.contains("gradeDistribution") && item["gradeDistribution"].is_object()) {
            for (auto it = item["gradeDistribution"].begin(); it != item["gradeDistribution"].end(); ++it) {
                b.gradeDistribution[it.key()] = it.value().get<int>();
            }
        }
        if (item.contains("entries") && item["entries"].is_array()) {
            for (auto& ej : item["entries"]) {
                b.entries.push_back(entryFromJson(ej));
            }
        }
        if (!b.id.empty()) v.push_back(b);
    }
    return v;
}

bool storage_saveBatches(const std::vector<GradingBatch>& v) {
    json j = json::array();
    for (auto& b : v) {
        json bj;
        bj["id"]             = b.id;
        bj["examinationId"]  = b.examinationId;
        bj["subjectId"]      = b.subjectId;
        bj["policyId"]       = b.policyId;
        bj["policyVersion"]  = b.policyVersion;
        bj["policySnapshot"] = b.policySnapshot;
        bj["status"]         = b.status;
        bj["cohortSize"]     = b.cohortSize;
        bj["eligibleCount"]  = b.eligibleCount;
        bj["absentCount"]    = b.absentCount;
        bj["withheldCount"]  = b.withheldCount;
        bj["mean"]           = b.mean;
        bj["stdDev"]         = b.stdDev;
        bj["median"]         = b.median;
        bj["highest"]        = b.highest;
        bj["lowest"]         = b.lowest;
        bj["createdAt"]      = b.createdAt;
        bj["finalizedAt"]    = b.finalizedAt;

        json dist = json::object();
        for (auto& kv : b.gradeDistribution) dist[kv.first] = kv.second;
        bj["gradeDistribution"] = dist;

        json entries = json::array();
        for (auto& e : b.entries) entries.push_back(entryToJson(e));
        bj["entries"] = entries;

        j.push_back(bj);
    }
    return writeJsonFile("grading_batches.json", j);
}
