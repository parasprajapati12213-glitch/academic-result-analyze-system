// main.cpp — C++ HTTP server for MITS Gwalior Academic Result Analysis & Relative Grading Management System
// Powered by lightweight Winsock2 HTTP engine. No external libraries required.

#include "../include/tiny_http.h"
#include "../include/json.hpp"
#include "../include/storage.h"
#include "../include/academic.h"
#include "../include/relative_grading.h"
#include <iostream>
#include <string>
#include <vector>
#include <algorithm>
#include <direct.h>

using json = nlohmann::json;
using namespace thttp;

// ── In-memory state ──────────────────────────────────────────────────────────
static std::vector<Student>               g_students;
static std::vector<Teacher>               g_teachers;
static std::vector<Subject>               g_subjects;
static std::vector<Result>                g_results;
static Settings                           g_settings;
static std::vector<Examination>           g_examinations;
static std::vector<RelativeGradingPolicy> g_policies;
static std::vector<GradingBatch>          g_batches;

static void saveStudents()     { storage_saveStudents(g_students); }
static void saveTeachers()     { storage_saveTeachers(g_teachers); }
static void saveSubjects()     { storage_saveSubjects(g_subjects); }
static void saveResults()      { storage_saveResults(g_results); }
static void saveSettings()     { storage_saveSettings(g_settings); }
static void saveExaminations() { storage_saveExaminations(g_examinations); }
static void savePolicies()     { storage_savePolicies(g_policies); }
static void saveBatches()      { storage_saveBatches(g_batches); }

static void setOk(Response& res, const json& body) {
    res.status = 200;
    res.set(body.dump());
}

static void setErr(Response& res, int code, const std::string& msg) {
    res.status = code;
    json j; j["error"] = msg;
    res.set(j.dump());
}

static bool parseBody(const std::string& rawBody, Response& res, json& out) {
    try {
        out = json::parse(rawBody);
        return true;
    } catch (...) {
        setErr(res, 400, "Invalid JSON in request body.");
        return false;
    }
}

// Convert StudentReport to JSON (Strict SGPA & CGPA + Relative Grading metadata)
static json reportToJson(const StudentReport& rpt) {
    json j;
    j["studentId"]         = rpt.student.id;
    j["studentName"]       = rpt.student.name;
    j["rollNo"]            = rpt.student.rollNo;
    j["className"]         = rpt.student.className;
    j["semester"]          = rpt.student.semester;
    j["department"]        = rpt.student.department;
    j["academicYear"]      = rpt.student.academicYear;
    j["sgpa"]              = rpt.sgpa;
    j["cgpa"]              = rpt.cgpa;
    j["creditsRegistered"] = rpt.creditsRegistered;
    j["creditsEarned"]     = rpt.creditsEarned;
    j["academicClass"]     = rpt.academicClass;
    j["status"]            = rpt.status;
    j["completedSubjects"] = rpt.completedSubjects;
    j["totalSubjects"]     = rpt.totalSubjects;

    json subs = json::array();
    for (auto& sr : rpt.subjects) {
        json s;
        s["subjectId"]       = sr.subject.id;
        s["subjectCode"]     = sr.subject.code;
        s["categoryCode"]    = sr.subject.categoryCode;
        s["subjectName"]     = sr.subject.name;
        s["maxMarks"]        = sr.subject.maxMarks;
        s["passingMarks"]    = sr.subject.passingMarks;
        s["credits"]         = sr.subject.credits;
        s["marksObtained"]   = sr.marksObtained;
        s["isAbsent"]        = sr.isAbsent;
        s["isWithheld"]      = sr.isWithheld;
        s["isComplete"]      = sr.isComplete;
        s["grade"]           = sr.grade;
        s["gradePoint"]      = sr.gradePoint;
        s["passed"]          = sr.passed;
        s["earnedCredits"]   = sr.earnedCredits;
        s["isRelativeGrade"] = sr.isRelativeGrade;
        s["explanation"]     = sr.explanation;
        subs.push_back(s);
    }
    j["subjects"] = subs;
    return j;
}

// Convert GradingBatch to JSON
static json batchToJson(const GradingBatch& b) {
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
    for (auto& e : b.entries) {
        json ej;
        ej["studentId"]          = e.studentId;
        ej["rollNo"]             = e.rollNo;
        ej["studentName"]        = e.studentName;
        ej["marksObtained"]      = e.marksObtained;
        ej["maxMarks"]           = e.maxMarks;
        ej["percentage"]         = e.percentage;
        ej["isAbsent"]           = e.isAbsent;
        ej["isWithheld"]         = e.isWithheld;
        ej["isEligible"]         = e.isEligible;
        ej["ineligibleReason"]   = e.ineligibleReason;
        ej["cohortMean"]         = e.cohortMean;
        ej["cohortStdDev"]       = e.cohortStdDev;
        ej["zScore"]             = e.zScore;
        ej["percentileRank"]     = e.percentileRank;
        ej["rank"]               = e.rank;
        ej["assignedGrade"]      = e.assignedGrade;
        ej["assignedGradePoint"] = e.assignedGradePoint;
        ej["passed"]             = e.passed;
        ej["explanation"]        = e.explanation;
        entries.push_back(ej);
    }
    bj["entries"] = entries;
    return bj;
}

// Convert Policy to JSON
static json policyToJsonObj(const RelativeGradingPolicy& p) {
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

// ════════════════════════════════════════════════════════════════════════════
//  ROUTES
// ════════════════════════════════════════════════════════════════════════════
void registerRoutes(Server& svr) {

    // ── Health ────────────────────────────────────────────────────────────────
    svr.Get("/api/health", [](const Request&, Response& res) {
        json j;
        j["status"] = "ok";
        j["institution"] = g_settings.collegeName;
        j["program"] = g_settings.programName;
        j["evaluationSystem"] = g_settings.relativeGradingEnabled
            ? "Relative Grading & CBCS Engine"
            : "Choice Based Credit System (SGPA/CGPA)";
        j["relativeGradingEnabled"] = g_settings.relativeGradingEnabled;
        j["activePolicyId"] = g_settings.activeGradingPolicyId;
        setOk(res, j);
    });

    // ── Auth ──────────────────────────────────────────────────────────────────
    svr.Post("/api/auth/login", [](const Request& req, Response& res) {
        json body;
        if (!parseBody(req.body, res, body)) return;
        std::string user = body.value("username", "");
        std::string pass = body.value("password", "");
        if (user.empty()) user = "Faculty User";
        json j;
        j["ok"] = true;
        j["token"] = "mits-authenticated-session";
        j["username"] = user;
        j["role"] = "Faculty In-Charge / Evaluation Controller";
        setOk(res, j);
    });

    // ── Settings ──────────────────────────────────────────────────────────────
    svr.Get("/api/settings", [](const Request&, Response& res) {
        json j;
        j["collegeName"]            = g_settings.collegeName;
        j["collegeSub"]             = g_settings.collegeSub;
        j["department"]             = g_settings.department;
        j["programName"]            = g_settings.programName;
        j["academicYear"]           = g_settings.academicYear;
        j["currentSemester"]        = g_settings.currentSemester;
        j["passingPercent"]         = g_settings.passingPercent;
        j["difficultThreshold"]     = g_settings.difficultThreshold;
        j["activeGradingPolicyId"]  = g_settings.activeGradingPolicyId;
        j["relativeGradingEnabled"] = g_settings.relativeGradingEnabled;

        json rules = json::array();
        for (auto& r : g_settings.gradeRules) {
            json rj;
            rj["minPercent"] = r.minPercent;
            rj["maxPercent"] = r.maxPercent;
            rj["grade"]      = r.grade;
            rj["gradePoint"] = r.gradePoint;
            rj["isPassing"]  = r.isPassing;
            rules.push_back(rj);
        }
        j["gradeRules"] = rules;
        setOk(res, j);
    });

    svr.Put("/api/settings", [](const Request& req, Response& res) {
        json body;
        if (!parseBody(req.body, res, body)) return;
        if (body.contains("collegeName"))            g_settings.collegeName            = body["collegeName"];
        if (body.contains("collegeSub"))             g_settings.collegeSub             = body["collegeSub"];
        if (body.contains("department"))             g_settings.department             = body["department"];
        if (body.contains("programName"))            g_settings.programName            = body["programName"];
        if (body.contains("academicYear"))           g_settings.academicYear           = body["academicYear"];
        if (body.contains("currentSemester"))        g_settings.currentSemester        = body["currentSemester"];
        if (body.contains("passingPercent"))         g_settings.passingPercent         = body["passingPercent"];
        if (body.contains("difficultThreshold"))     g_settings.difficultThreshold     = body["difficultThreshold"];
        if (body.contains("activeGradingPolicyId"))  g_settings.activeGradingPolicyId  = body["activeGradingPolicyId"];
        if (body.contains("relativeGradingEnabled")) g_settings.relativeGradingEnabled = body["relativeGradingEnabled"];

        if (body.contains("gradeRules") && body["gradeRules"].is_array()) {
            g_settings.gradeRules.clear();
            for (auto& r : body["gradeRules"]) {
                GradeRule gr;
                gr.minPercent = r.value("minPercent", 0.0);
                gr.maxPercent = r.value("maxPercent", 100.0);
                gr.grade      = r.value("grade", "F");
                gr.gradePoint = r.value("gradePoint", 0.0);
                gr.isPassing  = r.value("isPassing", gr.gradePoint >= 5.0);
                g_settings.gradeRules.push_back(gr);
            }
        }
        saveSettings();
        json j; j["success"] = true;
        setOk(res, j);
    });

    // ── Students ──────────────────────────────────────────────────────────────
    svr.Get("/api/students", [](const Request&, Response& res) {
        json arr = json::array();
        for (auto& st : g_students) {
            json j;
            j["id"]           = st.id;
            j["rollNo"]       = st.rollNo;
            j["name"]         = st.name;
            j["className"]    = st.className;
            j["semester"]     = st.semester;
            j["department"]   = st.department;
            j["academicYear"] = st.academicYear;
            j["email"]        = st.email;
            arr.push_back(j);
        }
        setOk(res, arr);
    });

    svr.Post("/api/students", [](const Request& req, Response& res) {
        json body;
        if (!parseBody(req.body, res, body)) return;
        std::string name   = body.value("name",   "");
        std::string rollNo = body.value("rollNo", "");
        if (name.empty())   { setErr(res, 400, "Student name is required."); return; }
        if (rollNo.empty()) { setErr(res, 400, "Enrollment / Roll number is required."); return; }

        for (auto& st : g_students) {
            if (st.rollNo == rollNo) {
                setErr(res, 409, "Enrollment number '" + rollNo + "' already exists.");
                return;
            }
        }

        Student st;
        st.id           = storage_generateId("s");
        st.name         = name;
        st.rollNo       = rollNo;
        st.className    = body.value("className", "CSBS-A");
        st.semester     = body.value("semester", g_settings.currentSemester);
        st.department   = body.value("department", g_settings.department);
        st.academicYear = body.value("academicYear", g_settings.academicYear);
        st.email        = body.value("email", "");
        g_students.push_back(st);
        saveStudents();

        json j;
        j["id"]=st.id; j["rollNo"]=st.rollNo; j["name"]=st.name;
        j["className"]=st.className; j["semester"]=st.semester;
        j["department"]=st.department; j["academicYear"]=st.academicYear;
        j["email"]=st.email;
        res.status = 201;
        setOk(res, j);
    });

    svr.Put("/api/students/:id", [](const Request& req, Response& res) {
        std::string id = req.params.count("id") ? req.params.at("id") : "";
        json body;
        if (!parseBody(req.body, res, body)) return;
        for (auto& st : g_students) {
            if (st.id == id) {
                std::string newRoll = body.value("rollNo", st.rollNo);
                for (auto& o : g_students) {
                    if (o.id != id && o.rollNo == newRoll) {
                        setErr(res, 409, "Enrollment number already exists.");
                        return;
                    }
                }
                if (body.contains("name"))         st.name         = body["name"];
                if (body.contains("rollNo"))       st.rollNo       = body["rollNo"];
                if (body.contains("className"))    st.className    = body["className"];
                if (body.contains("semester"))     st.semester     = body["semester"];
                if (body.contains("department"))   st.department   = body["department"];
                if (body.contains("academicYear")) st.academicYear = body["academicYear"];
                if (body.contains("email"))        st.email        = body["email"];
                saveStudents();
                json j;
                j["id"]=st.id; j["rollNo"]=st.rollNo; j["name"]=st.name;
                j["className"]=st.className; j["semester"]=st.semester;
                j["department"]=st.department; j["academicYear"]=st.academicYear;
                j["email"]=st.email;
                setOk(res, j);
                return;
            }
        }
        setErr(res, 404, "Student record not found.");
    });

    svr.Delete("/api/students/:id", [](const Request& req, Response& res) {
        std::string id = req.params.count("id") ? req.params.at("id") : "";
        auto it = std::remove_if(g_students.begin(), g_students.end(),
            [&](const Student& s){ return s.id == id; });
        if (it == g_students.end()) { setErr(res, 404, "Student not found."); return; }
        g_students.erase(it, g_students.end());

        // Remove associated marks
        auto rit = std::remove_if(g_results.begin(), g_results.end(),
            [&](const Result& r){ return r.studentId == id; });
        g_results.erase(rit, g_results.end());

        saveStudents(); saveResults();
        json j; j["success"]=true; setOk(res, j);
    });

    svr.Get("/api/students/:id/report", [](const Request& req, Response& res) {
        std::string id = req.params.count("id") ? req.params.at("id") : "";
        for (auto& st : g_students) {
            if (st.id == id) {
                std::vector<Subject> semSubs;
                for (auto& sub : g_subjects) {
                    if (sub.semester == st.semester) semSubs.push_back(sub);
                }
                auto rpt = academic_computeStudentReport(st, semSubs, g_results, g_settings, g_batches);
                setOk(res, reportToJson(rpt));
                return;
            }
        }
        setErr(res, 404, "Student transcript not found.");
    });

    // ── Teachers ──────────────────────────────────────────────────────────────
    svr.Get("/api/teachers", [](const Request&, Response& res) {
        json arr = json::array();
        for (auto& t : g_teachers) {
            json j;
            j["id"]                 = t.id;
            j["employeeId"]         = t.employeeId;
            j["name"]               = t.name;
            j["designation"]        = t.designation;
            j["department"]         = t.department;
            j["email"]              = t.email;
            j["assignedSubjectIds"] = t.assignedSubjectIds;
            j["assignedClasses"]    = t.assignedClasses;
            arr.push_back(j);
        }
        setOk(res, arr);
    });

    svr.Post("/api/teachers", [](const Request& req, Response& res) {
        json body;
        if (!parseBody(req.body, res, body)) return;
        std::string name = body.value("name", "");
        if (name.empty()) { setErr(res, 400, "Teacher name is required."); return; }

        Teacher t;
        t.id          = storage_generateId("tch");
        t.employeeId  = body.value("employeeId", "");
        t.name        = name;
        t.designation = body.value("designation", "Assistant Professor");
        t.department  = body.value("department", "Centre for Computer Science and Technology");
        t.email       = body.value("email", "");
        if (body.contains("assignedSubjectIds") && body["assignedSubjectIds"].is_array()) {
            for (auto& s : body["assignedSubjectIds"]) t.assignedSubjectIds.push_back(s.get<std::string>());
        }
        if (body.contains("assignedClasses") && body["assignedClasses"].is_array()) {
            for (auto& c : body["assignedClasses"]) t.assignedClasses.push_back(c.get<std::string>());
        }

        g_teachers.push_back(t);
        saveTeachers();
        res.status = 201;
        json j; j["id"] = t.id; j["name"] = t.name;
        setOk(res, j);
    });

    svr.Put("/api/teachers/:id", [](const Request& req, Response& res) {
        std::string id = req.params.count("id") ? req.params.at("id") : "";
        json body;
        if (!parseBody(req.body, res, body)) return;
        for (auto& t : g_teachers) {
            if (t.id == id) {
                if (body.contains("employeeId"))  t.employeeId  = body["employeeId"];
                if (body.contains("name"))        t.name        = body["name"];
                if (body.contains("designation")) t.designation = body["designation"];
                if (body.contains("department"))  t.department  = body["department"];
                if (body.contains("email"))       t.email       = body["email"];
                if (body.contains("assignedSubjectIds") && body["assignedSubjectIds"].is_array()) {
                    t.assignedSubjectIds.clear();
                    for (auto& s : body["assignedSubjectIds"]) t.assignedSubjectIds.push_back(s.get<std::string>());
                }
                if (body.contains("assignedClasses") && body["assignedClasses"].is_array()) {
                    t.assignedClasses.clear();
                    for (auto& c : body["assignedClasses"]) t.assignedClasses.push_back(c.get<std::string>());
                }
                saveTeachers();
                json j; j["id"] = t.id; j["name"] = t.name;
                setOk(res, j);
                return;
            }
        }
        setErr(res, 404, "Teacher record not found.");
    });

    svr.Delete("/api/teachers/:id", [](const Request& req, Response& res) {
        std::string id = req.params.count("id") ? req.params.at("id") : "";
        auto it = std::remove_if(g_teachers.begin(), g_teachers.end(),
            [&](const Teacher& t){ return t.id == id; });
        if (it == g_teachers.end()) { setErr(res, 404, "Teacher not found."); return; }
        g_teachers.erase(it, g_teachers.end());
        saveTeachers();
        json j; j["success"] = true; setOk(res, j);
    });

    // ── Subjects ──────────────────────────────────────────────────────────────
    svr.Get("/api/subjects", [](const Request&, Response& res) {
        json arr = json::array();
        for (auto& sub : g_subjects) {
            json j;
            j["id"]              = sub.id;
            j["code"]            = sub.code;
            j["categoryCode"]    = sub.categoryCode;
            j["name"]            = sub.name;
            j["maxMarks"]        = sub.maxMarks;
            j["passingMarks"]    = sub.passingMarks;
            j["credits"]         = sub.credits;
            j["semester"]        = sub.semester;
            j["gradingPolicyId"] = sub.gradingPolicyId;
            arr.push_back(j);
        }
        setOk(res, arr);
    });

    svr.Post("/api/subjects", [](const Request& req, Response& res) {
        json body;
        if (!parseBody(req.body, res, body)) return;
        std::string code = body.value("code", "");
        std::string name = body.value("name", "");
        if (code.empty()) { setErr(res, 400, "Course code is required."); return; }
        if (name.empty()) { setErr(res, 400, "Course title is required."); return; }

        Subject sub;
        sub.id              = storage_generateId("sub");
        sub.code            = code;
        sub.categoryCode    = body.value("categoryCode", "DC");
        sub.name            = name;
        sub.maxMarks        = body.value("maxMarks", 100.0);
        sub.passingMarks    = body.value("passingMarks", 40.0);
        sub.credits         = body.value("credits", 3.0);
        sub.semester        = body.value("semester", 1);
        sub.gradingPolicyId = body.value("gradingPolicyId", "");

        if (sub.maxMarks <= 0)     { setErr(res, 400, "Maximum marks must be greater than zero."); return; }
        if (sub.passingMarks <= 0) { setErr(res, 400, "Passing marks must be greater than zero."); return; }
        if (sub.credits < 0)       { setErr(res, 400, "Credits cannot be negative."); return; }

        g_subjects.push_back(sub);
        saveSubjects();

        json j;
        j["id"]=sub.id; j["code"]=sub.code; j["categoryCode"]=sub.categoryCode;
        j["name"]=sub.name; j["maxMarks"]=sub.maxMarks; j["passingMarks"]=sub.passingMarks;
        j["credits"]=sub.credits; j["semester"]=sub.semester; j["gradingPolicyId"]=sub.gradingPolicyId;
        res.status = 201; setOk(res, j);
    });

    svr.Put("/api/subjects/:id", [](const Request& req, Response& res) {
        std::string id = req.params.count("id") ? req.params.at("id") : "";
        json body;
        if (!parseBody(req.body, res, body)) return;
        for (auto& sub : g_subjects) {
            if (sub.id == id) {
                if (body.contains("code"))            sub.code            = body["code"];
                if (body.contains("categoryCode"))    sub.categoryCode    = body["categoryCode"];
                if (body.contains("name"))            sub.name            = body["name"];
                if (body.contains("maxMarks"))        sub.maxMarks        = body["maxMarks"];
                if (body.contains("passingMarks"))    sub.passingMarks    = body["passingMarks"];
                if (body.contains("credits"))         sub.credits         = body["credits"];
                if (body.contains("semester"))        sub.semester        = body["semester"];
                if (body.contains("gradingPolicyId")) sub.gradingPolicyId = body["gradingPolicyId"];

                saveSubjects();
                json j;
                j["id"]=sub.id; j["code"]=sub.code; j["categoryCode"]=sub.categoryCode;
                j["name"]=sub.name; j["maxMarks"]=sub.maxMarks; j["passingMarks"]=sub.passingMarks;
                j["credits"]=sub.credits; j["semester"]=sub.semester; j["gradingPolicyId"]=sub.gradingPolicyId;
                setOk(res, j); return;
            }
        }
        setErr(res, 404, "Course not found.");
    });

    svr.Delete("/api/subjects/:id", [](const Request& req, Response& res) {
        std::string id = req.params.count("id") ? req.params.at("id") : "";
        auto it = std::remove_if(g_subjects.begin(), g_subjects.end(),
            [&](const Subject& s){ return s.id == id; });
        if (it == g_subjects.end()) { setErr(res, 404, "Course not found."); return; }
        g_subjects.erase(it, g_subjects.end());

        int cnt = (int)std::count_if(g_results.begin(), g_results.end(),
            [&](const Result& r){ return r.subjectId == id; });
        auto rit = std::remove_if(g_results.begin(), g_results.end(),
            [&](const Result& r){ return r.subjectId == id; });
        g_results.erase(rit, g_results.end());
        saveSubjects(); saveResults();
        json j; j["success"]=true; j["resultsRemoved"]=cnt; setOk(res, j);
    });

    // ── Results ───────────────────────────────────────────────────────────────
    svr.Get("/api/results", [](const Request& req, Response& res) {
        std::string stuF = req.queryParams.count("studentId") ? req.queryParams.at("studentId") : "";
        std::string subF = req.queryParams.count("subjectId") ? req.queryParams.at("subjectId") : "";
        json arr = json::array();
        for (auto& r : g_results) {
            if (!stuF.empty() && r.studentId != stuF) continue;
            if (!subF.empty() && r.subjectId != subF) continue;
            json j;
            j["id"]              = r.id;
            j["studentId"]       = r.studentId;
            j["subjectId"]       = r.subjectId;
            j["examinationId"]   = r.examinationId;
            j["marksObtained"]   = r.marksObtained;
            j["isAbsent"]        = r.isAbsent;
            j["isWithheld"]      = r.isWithheld;
            j["finalGrade"]      = r.finalGrade;
            j["finalGradePoint"] = r.finalGradePoint;
            j["isFinalized"]     = r.isFinalized;
            j["gradingBatchId"]  = r.gradingBatchId;
            arr.push_back(j);
        }
        setOk(res, arr);
    });

    svr.Post("/api/results", [](const Request& req, Response& res) {
        json body;
        if (!parseBody(req.body, res, body)) return;
        std::string sid = body.value("studentId","");
        std::string bid = body.value("subjectId","");
        if (sid.empty()) { setErr(res, 400, "studentId required."); return; }
        if (bid.empty()) { setErr(res, 400, "subjectId required."); return; }

        bool stuFound=false; Subject foundSub;
        for (auto& st : g_students) if (st.id==sid) { stuFound=true; break; }
        for (auto& sub : g_subjects) if (sub.id==bid) { foundSub=sub; break; }
        if (!stuFound) { setErr(res, 404, "Student not found."); return; }
        if (foundSub.id.empty()) { setErr(res, 404, "Course not found."); return; }

        for (auto& r : g_results) {
            if (r.studentId==sid && r.subjectId==bid) {
                setErr(res, 409, "Marks record exists. Use PUT to update."); return;
            }
        }

        bool isAbsent   = body.value("isAbsent", false);
        bool isWithheld = body.value("isWithheld", false);
        double marks    = body.value("marksObtained", -1.0);
        if (!isAbsent && !isWithheld && marks >= 0.0) {
            if (marks < 0) { setErr(res, 400, "Marks cannot be negative."); return; }
            if (marks > foundSub.maxMarks) {
                setErr(res, 400, "Marks exceed maximum course allotment."); return;
            }
        }

        Result r;
        r.id            = storage_generateId("r");
        r.studentId     = sid;
        r.subjectId     = bid;
        r.examinationId = body.value("examinationId", "");
        r.marksObtained = (isAbsent || isWithheld) ? 0.0 : marks;
        r.isAbsent      = isAbsent;
        r.isWithheld    = isWithheld;
        r.isFinalized   = false;
        g_results.push_back(r);
        saveResults();

        json j;
        j["id"]=r.id; j["studentId"]=r.studentId; j["subjectId"]=r.subjectId;
        j["marksObtained"]=r.marksObtained; j["isAbsent"]=r.isAbsent; j["isWithheld"]=r.isWithheld;
        res.status=201; setOk(res, j);
    });

    svr.Put("/api/results/:id", [](const Request& req, Response& res) {
        std::string id = req.params.count("id") ? req.params.at("id") : "";
        json body;
        if (!parseBody(req.body, res, body)) return;
        for (auto& r : g_results) {
            if (r.id == id) {
                Subject foundSub;
                for (auto& sub : g_subjects) if (sub.id==r.subjectId) { foundSub=sub; break; }
                bool isAbsent   = body.value("isAbsent", r.isAbsent);
                bool isWithheld = body.value("isWithheld", r.isWithheld);
                double marks    = body.value("marksObtained", r.marksObtained);
                if (!isAbsent && !isWithheld && marks >= 0 && marks > foundSub.maxMarks) {
                    setErr(res, 400, "Marks exceed course allotment."); return;
                }
                r.isAbsent      = isAbsent;
                r.isWithheld    = isWithheld;
                r.marksObtained = (isAbsent || isWithheld) ? 0.0 : marks;
                // If marks changed, prompt for relative grading recalculation
                r.isFinalized   = false;
                r.finalGrade    = "";
                r.finalGradePoint = -1.0;
                saveResults();

                json j;
                j["id"]=r.id; j["studentId"]=r.studentId; j["subjectId"]=r.subjectId;
                j["marksObtained"]=r.marksObtained; j["isAbsent"]=r.isAbsent; j["isWithheld"]=r.isWithheld;
                j["isFinalized"]=r.isFinalized;
                j["recalculationAlert"] = "Marks updated. Recalculate relative grading batch for this subject.";
                setOk(res, j); return;
            }
        }
        setErr(res, 404, "Marks record not found.");
    });

    svr.Delete("/api/results/:id", [](const Request& req, Response& res) {
        std::string id = req.params.count("id") ? req.params.at("id") : "";
        auto it = std::remove_if(g_results.begin(), g_results.end(),
            [&](const Result& r){ return r.id == id; });
        if (it == g_results.end()) { setErr(res, 404, "Marks record not found."); return; }
        g_results.erase(it, g_results.end());
        saveResults();
        json j; j["success"]=true; setOk(res, j);
    });

    // ── Bulk Marks Entry ──────────────────────────────────────────────────────
    svr.Post("/api/results/bulk", [](const Request& req, Response& res) {
        json body;
        if (!parseBody(req.body, res, body)) return;
        if (!body.is_array()) { setErr(res, 400, "Bulk payload must be an array of result objects."); return; }

        int savedCount = 0;
        for (auto& item : body) {
            std::string sid = item.value("studentId", "");
            std::string subId = item.value("subjectId", "");
            if (sid.empty() || subId.empty()) continue;

            Subject foundSub;
            for (auto& s : g_subjects) if (s.id == subId) { foundSub = s; break; }

            bool isAbsent   = item.value("isAbsent", false);
            bool isWithheld = item.value("isWithheld", false);
            double marks    = item.value("marksObtained", -1.0);

            if (!isAbsent && !isWithheld && marks > foundSub.maxMarks) {
                marks = foundSub.maxMarks;
            }

            bool found = false;
            for (auto& r : g_results) {
                if (r.studentId == sid && r.subjectId == subId) {
                    r.marksObtained = (isAbsent || isWithheld) ? 0.0 : marks;
                    r.isAbsent      = isAbsent;
                    r.isWithheld    = isWithheld;
                    r.isFinalized   = false;
                    found = true;
                    savedCount++;
                    break;
                }
            }
            if (!found) {
                Result r;
                r.id            = storage_generateId("r");
                r.studentId     = sid;
                r.subjectId     = subId;
                r.examinationId = item.value("examinationId", "");
                r.marksObtained = (isAbsent || isWithheld) ? 0.0 : marks;
                r.isAbsent      = isAbsent;
                r.isWithheld    = isWithheld;
                r.isFinalized   = false;
                g_results.push_back(r);
                savedCount++;
            }
        }
        saveResults();
        json j;
        j["success"] = true;
        j["savedCount"] = savedCount;
        setOk(res, j);
    });

    // ── Relative Grading Policies ─────────────────────────────────────────────
    svr.Get("/api/policies", [](const Request&, Response& res) {
        json arr = json::array();
        for (auto& p : g_policies) {
            arr.push_back(policyToJsonObj(p));
        }
        setOk(res, arr);
    });

    svr.Post("/api/policies", [](const Request& req, Response& res) {
        json body;
        if (!parseBody(req.body, res, body)) return;

        RelativeGradingPolicy p;
        p.id                = storage_generateId("pol");
        p.name              = body.value("name", "Custom Relative Policy");
        p.version           = body.value("version", "1.0");
        p.methodStr         = body.value("method", "MEAN_STD_DEV");
        p.method            = gradingMethodFromStr(p.methodStr);
        p.useSampleStdDev   = body.value("useSampleStdDev", true);
        p.strictQuota       = body.value("strictQuota", false);
        p.passingGradePoint = body.value("passingGradePoint", 5.0);
        p.failGrade         = body.value("failGrade", "F");
        p.failGradePoint    = body.value("failGradePoint", 0.0);
        p.absentGrade       = body.value("absentGrade", "AB");
        p.minCohortSize     = body.value("minCohortSize", 3);
        p.smallCohortAction = body.value("smallCohortAction", "ABSOLUTE");
        p.isDefault         = false;

        // Parse stdDevBands if present
        if (body.contains("stdDevBands") && body["stdDevBands"].is_array()) {
            for (auto& b : body["stdDevBands"]) {
                MeanStdDevBand mb;
                mb.grade      = b.value("grade", "F");
                mb.gradePoint = b.value("gradePoint", 0.0);
                mb.lowerK     = b.value("lowerK", -999.0);
                mb.upperK     = b.value("upperK", 999.0);
                mb.isPassing  = b.value("isPassing", mb.gradePoint >= 5.0);
                p.stdDevBands.push_back(mb);
            }
        } else {
            // Supply default bands if creating MEAN_STD_DEV
            auto defPol = rg_buildDefaultMeanStdDevPolicy();
            p.stdDevBands = defPol.stdDevBands;
        }

        // Parse percentileBands if present
        if (body.contains("percentileBands") && body["percentileBands"].is_array()) {
            for (auto& b : body["percentileBands"]) {
                PercentileBand pb;
                pb.grade         = b.value("grade", "F");
                pb.gradePoint    = b.value("gradePoint", 0.0);
                pb.minPercentile = b.value("minPercentile", 0.0);
                pb.maxPercentile = b.value("maxPercentile", 100.0);
                pb.isPassing     = b.value("isPassing", pb.gradePoint >= 5.0);
                p.percentileBands.push_back(pb);
            }
        }

        // Parse quotaBands if present
        if (body.contains("quotaBands") && body["quotaBands"].is_array()) {
            for (auto& b : body["quotaBands"]) {
                QuotaBand qb;
                qb.grade         = b.value("grade", "F");
                qb.gradePoint    = b.value("gradePoint", 0.0);
                qb.targetPercent = b.value("targetPercent", 10.0);
                qb.isPassing     = b.value("isPassing", qb.gradePoint >= 5.0);
                p.quotaBands.push_back(qb);
            }
        }

        p.absoluteRules = academic_defaultGradeRules();
        g_policies.push_back(p);
        savePolicies();

        res.status = 201;
        setOk(res, policyToJsonObj(p));
    });

    svr.Put("/api/policies/:id", [](const Request& req, Response& res) {
        std::string id = req.params.count("id") ? req.params.at("id") : "";
        json body;
        if (!parseBody(req.body, res, body)) return;

        for (auto& p : g_policies) {
            if (p.id == id) {
                if (body.contains("name"))              p.name              = body["name"];
                if (body.contains("version"))           p.version           = body["version"];
                if (body.contains("method"))            { p.methodStr = body["method"]; p.method = gradingMethodFromStr(p.methodStr); }
                if (body.contains("useSampleStdDev"))   p.useSampleStdDev   = body["useSampleStdDev"];
                if (body.contains("strictQuota"))       p.strictQuota       = body["strictQuota"];
                if (body.contains("passingGradePoint")) p.passingGradePoint = body["passingGradePoint"];
                if (body.contains("failGrade"))         p.failGrade         = body["failGrade"];
                if (body.contains("minCohortSize"))     p.minCohortSize     = body["minCohortSize"];
                if (body.contains("smallCohortAction")) p.smallCohortAction = body["smallCohortAction"];

                if (body.contains("stdDevBands") && body["stdDevBands"].is_array()) {
                    p.stdDevBands.clear();
                    for (auto& b : body["stdDevBands"]) {
                        MeanStdDevBand mb;
                        mb.grade      = b.value("grade", "F");
                        mb.gradePoint = b.value("gradePoint", 0.0);
                        mb.lowerK     = b.value("lowerK", -999.0);
                        mb.upperK     = b.value("upperK", 999.0);
                        mb.isPassing  = b.value("isPassing", mb.gradePoint >= 5.0);
                        p.stdDevBands.push_back(mb);
                    }
                }
                savePolicies();
                setOk(res, policyToJsonObj(p));
                return;
            }
        }
        setErr(res, 404, "Policy not found.");
    });

    svr.Delete("/api/policies/:id", [](const Request& req, Response& res) {
        std::string id = req.params.count("id") ? req.params.at("id") : "";
        if (id == "policy_default_relative" || id == "policy_default_absolute") {
            setErr(res, 400, "Default system policies cannot be deleted.");
            return;
        }
        auto it = std::remove_if(g_policies.begin(), g_policies.end(),
            [&](const RelativeGradingPolicy& p){ return p.id == id; });
        if (it == g_policies.end()) { setErr(res, 404, "Policy not found."); return; }
        g_policies.erase(it, g_policies.end());
        savePolicies();
        json j; j["success"]=true; setOk(res, j);
    });

    // ── Examinations ──────────────────────────────────────────────────────────
    svr.Get("/api/examinations", [](const Request&, Response& res) {
        json arr = json::array();
        for (auto& ex : g_examinations) {
            json j;
            j["id"]              = ex.id;
            j["name"]            = ex.name;
            j["type"]            = ex.type;
            j["semester"]        = ex.semester;
            j["academicYear"]    = ex.academicYear;
            j["subjectId"]       = ex.subjectId;
            j["cohortFilter"]    = ex.cohortFilter;
            j["gradingPolicyId"] = ex.gradingPolicyId;
            j["status"]          = ex.status;
            j["createdAt"]       = ex.createdAt;
            j["finalizedAt"]     = ex.finalizedAt;
            j["isLocked"]        = ex.isLocked;

            j["approvalStatus"]  = ex.approvalStatus.empty() ? "DRAFT" : ex.approvalStatus;
            j["approvedBy"]      = ex.approvedBy;
            j["approvedAt"]      = ex.approvedAt;
            j["publishedAt"]     = ex.publishedAt;
            j["reopenReason"]    = ex.reopenReason;

            // Compute marks entered count
            int entered = 0;
            for (auto& r : g_results) {
                if (r.examinationId == ex.id && r.marksObtained >= 0) entered++;
            }
            j["marksEnteredCount"] = entered;
            arr.push_back(j);
        }
        setOk(res, arr);
    });

    svr.Post("/api/examinations", [](const Request& req, Response& res) {
        json body;
        if (!parseBody(req.body, res, body)) return;

        std::string name = body.value("name", "");
        if (name.empty()) { setErr(res, 400, "Examination name is required."); return; }

        Examination ex;
        ex.id              = storage_generateId("exam");
        ex.name            = name;
        ex.type            = body.value("type", "ENDSEM");
        ex.semester        = body.value("semester", g_settings.currentSemester);
        ex.academicYear    = body.value("academicYear", g_settings.academicYear);
        ex.subjectId       = body.value("subjectId", "");
        ex.cohortFilter    = body.value("cohortFilter", "ALL");
        ex.gradingPolicyId = body.value("gradingPolicyId", g_settings.activeGradingPolicyId);
        ex.status          = "OPEN";
        ex.isLocked        = false;
        ex.approvalStatus  = "DRAFT";

        g_examinations.push_back(ex);
        saveExaminations();

        json j;
        j["id"]=ex.id; j["name"]=ex.name; j["type"]=ex.type;
        j["semester"]=ex.semester; j["academicYear"]=ex.academicYear;
        j["subjectId"]=ex.subjectId; j["cohortFilter"]=ex.cohortFilter;
        j["status"]=ex.status; j["approvalStatus"]=ex.approvalStatus;
        res.status = 201; setOk(res, j);
    });

    svr.Put("/api/examinations/:id", [](const Request& req, Response& res) {
        std::string id = req.params.count("id") ? req.params.at("id") : "";
        json body;
        if (!parseBody(req.body, res, body)) return;

        for (auto& ex : g_examinations) {
            if (ex.id == id) {
                if (body.contains("name"))            ex.name            = body["name"];
                if (body.contains("type"))            ex.type            = body["type"];
                if (body.contains("semester"))        ex.semester        = body["semester"];
                if (body.contains("academicYear"))    ex.academicYear    = body["academicYear"];
                if (body.contains("subjectId"))       ex.subjectId       = body["subjectId"];
                if (body.contains("cohortFilter"))    ex.cohortFilter    = body["cohortFilter"];
                if (body.contains("gradingPolicyId")) ex.gradingPolicyId = body["gradingPolicyId"];
                if (body.contains("status"))          ex.status          = body["status"];
                if (body.contains("isLocked"))        ex.isLocked        = body["isLocked"];
                if (body.contains("approvalStatus"))  ex.approvalStatus  = body["approvalStatus"];

                saveExaminations();
                json j; j["id"]=ex.id; j["name"]=ex.name; j["status"]=ex.status; j["approvalStatus"]=ex.approvalStatus;
                setOk(res, j); return;
            }
        }
        setErr(res, 404, "Examination not found.");
    });

    svr.Post("/api/examinations/:id/approve", [](const Request& req, Response& res) {
        std::string id = req.params.count("id") ? req.params.at("id") : "";
        json body;
        parseBody(req.body, res, body);
        std::string user = body.value("user", "Examination Controller");
        for (auto& ex : g_examinations) {
            if (ex.id == id) {
                ex.approvalStatus = "APPROVED";
                ex.approvedBy     = user;
                saveExaminations();
                json j; j["id"]=ex.id; j["approvalStatus"]=ex.approvalStatus;
                setOk(res, j); return;
            }
        }
        setErr(res, 404, "Examination not found.");
    });

    svr.Post("/api/examinations/:id/publish", [](const Request& req, Response& res) {
        std::string id = req.params.count("id") ? req.params.at("id") : "";
        for (auto& ex : g_examinations) {
            if (ex.id == id) {
                ex.approvalStatus = "PUBLISHED";
                ex.isLocked       = true;
                saveExaminations();
                json j; j["id"]=ex.id; j["approvalStatus"]=ex.approvalStatus;
                setOk(res, j); return;
            }
        }
        setErr(res, 404, "Examination not found.");
    });

    svr.Post("/api/examinations/:id/reopen", [](const Request& req, Response& res) {
        std::string id = req.params.count("id") ? req.params.at("id") : "";
        json body;
        parseBody(req.body, res, body);
        std::string reason = body.value("reason", "Administrative Re-evaluation");
        for (auto& ex : g_examinations) {
            if (ex.id == id) {
                ex.approvalStatus = "DRAFT";
                ex.isLocked       = false;
                ex.reopenReason   = reason;
                saveExaminations();
                json j; j["id"]=ex.id; j["approvalStatus"]=ex.approvalStatus;
                setOk(res, j); return;
            }
        }
        setErr(res, 404, "Examination not found.");
    });

    svr.Delete("/api/examinations/:id", [](const Request& req, Response& res) {
        std::string id = req.params.count("id") ? req.params.at("id") : "";
        auto it = std::remove_if(g_examinations.begin(), g_examinations.end(),
            [&](const Examination& ex){ return ex.id == id; });
        if (it == g_examinations.end()) { setErr(res, 404, "Examination not found."); return; }
        g_examinations.erase(it, g_examinations.end());
        saveExaminations();
        json j; j["success"]=true; setOk(res, j);
    });

    // ── Relative Grading Engine: Preview & Finalize ───────────────────────────
    // POST /api/grading/preview
    // Input: { "subjectId": "...", "examinationId": "...", "cohortFilter": "...", "policyId": "..." }
    svr.Post("/api/grading/preview", [](const Request& req, Response& res) {
        json body;
        if (!parseBody(req.body, res, body)) return;

        std::string subjectId     = body.value("subjectId", "");
        std::string examinationId = body.value("examinationId", "");
        std::string cohortFilter  = body.value("cohortFilter", "");
        std::string policyId      = body.value("policyId", "");

        if (subjectId.empty()) {
            setErr(res, 400, "subjectId is required for relative grading calculation.");
            return;
        }

        // Determine which policy to use
        RelativeGradingPolicy policy = rg_buildDefaultMeanStdDevPolicy();
        if (!policyId.empty()) {
            for (auto& p : g_policies) {
                if (p.id == policyId) { policy = p; break; }
            }
        } else if (!g_settings.activeGradingPolicyId.empty()) {
            for (auto& p : g_policies) {
                if (p.id == g_settings.activeGradingPolicyId) { policy = p; break; }
            }
        }

        // Build preview batch and compute grades
        GradingBatch batch = rg_buildPreview(subjectId, examinationId, cohortFilter,
                                             g_students, g_subjects, g_results, policy);
        batch = rg_calculateGrades(batch, policy);

        setOk(res, batchToJson(batch));
    });

    // POST /api/grading/finalize
    // Input: Complete batch JSON or { "subjectId": "...", "policyId": "..." }
    svr.Post("/api/grading/finalize", [](const Request& req, Response& res) {
        json body;
        if (!parseBody(req.body, res, body)) return;

        GradingBatch batch;
        std::string subjectId = body.value("subjectId", "");

        // If batch object provided directly
        if (body.contains("entries") && body["entries"].is_array()) {
            std::string policyId = body.value("policyId", "");
            RelativeGradingPolicy policy = rg_buildDefaultMeanStdDevPolicy();
            for (auto& p : g_policies) if (p.id == policyId) { policy = p; break; }

            batch = rg_buildPreview(subjectId, body.value("examinationId", ""),
                                    body.value("cohortFilter", ""),
                                    g_students, g_subjects, g_results, policy);
            batch = rg_calculateGrades(batch, policy);
        } else {
            std::string policyId = body.value("policyId", g_settings.activeGradingPolicyId);
            RelativeGradingPolicy policy = rg_buildDefaultMeanStdDevPolicy();
            for (auto& p : g_policies) if (p.id == policyId) { policy = p; break; }

            batch = rg_buildPreview(subjectId, body.value("examinationId", ""),
                                    body.value("cohortFilter", ""),
                                    g_students, g_subjects, g_results, policy);
            batch = rg_calculateGrades(batch, policy);
        }

        if (batch.status == "ERROR" || batch.eligibleCount == 0) {
            setErr(res, 400, "Cannot finalize grading batch: No eligible student records found.");
            return;
        }

        // Finalize batch
        batch = rg_finalizeBatch(batch);

        // Update Results with finalized relative grades
        for (auto& entry : batch.entries) {
            for (auto& r : g_results) {
                if (r.studentId == entry.studentId && r.subjectId == batch.subjectId) {
                    r.finalGrade      = entry.assignedGrade;
                    r.finalGradePoint = entry.assignedGradePoint;
                    r.isFinalized     = true;
                    r.gradingBatchId  = batch.id;
                    break;
                }
            }
        }

        // Save batch to historical batches (replace existing for same subject if previewing)
        bool replaced = false;
        for (auto& b : g_batches) {
            if (b.subjectId == batch.subjectId && b.examinationId == batch.examinationId) {
                b = batch;
                replaced = true;
                break;
            }
        }
        if (!replaced) g_batches.push_back(batch);

        // Mark examination as finalized if present
        if (!batch.examinationId.empty()) {
            for (auto& ex : g_examinations) {
                if (ex.id == batch.examinationId) {
                    ex.status = "FINALIZED";
                    ex.finalizedAt = batch.finalizedAt;
                    break;
                }
            }
            saveExaminations();
        }

        saveResults();
        saveBatches();

        setOk(res, batchToJson(batch));
    });

    // GET /api/grading/batches
    svr.Get("/api/grading/batches", [](const Request& req, Response& res) {
        std::string subId = req.queryParams.count("subjectId") ? req.queryParams.at("subjectId") : "";
        json arr = json::array();
        for (auto& b : g_batches) {
            if (!subId.empty() && b.subjectId != subId) continue;
            arr.push_back(batchToJson(b));
        }
        setOk(res, arr);
    });

    // GET /api/grading/batches/:id
    svr.Get("/api/grading/batches/:id", [](const Request& req, Response& res) {
        std::string id = req.params.count("id") ? req.params.at("id") : "";
        for (auto& b : g_batches) {
            if (b.id == id) {
                setOk(res, batchToJson(b));
                return;
            }
        }
        setErr(res, 404, "Grading batch not found.");
    });

    // DELETE /api/grading/batches/:id (Revert/Unfinalize Batch)
    svr.Delete("/api/grading/batches/:id", [](const Request& req, Response& res) {
        std::string id = req.params.count("id") ? req.params.at("id") : "";
        auto it = std::remove_if(g_batches.begin(), g_batches.end(),
            [&](const GradingBatch& b){ return b.id == id; });
        if (it == g_batches.end()) { setErr(res, 404, "Batch not found."); return; }

        // Unlock results linked to this batch
        for (auto& r : g_results) {
            if (r.gradingBatchId == id) {
                r.isFinalized     = false;
                r.finalGrade      = "";
                r.finalGradePoint = -1.0;
                r.gradingBatchId  = "";
            }
        }
        g_batches.erase(it, g_batches.end());
        saveBatches(); saveResults();
        json j; j["success"] = true; setOk(res, j);
    });

    // GET /api/grading/explanation/:studentId/:subjectId
    // Transparent, student-safe audit explanation (does not leak other students' marks)
    svr.Get("/api/grading/explanation/:studentId/:subjectId", [](const Request& req, Response& res) {
        std::string sid = req.params.count("studentId") ? req.params.at("studentId") : "";
        std::string subId = req.params.count("subjectId") ? req.params.at("subjectId") : "";

        // Check if there is a finalized batch for this subject
        for (auto& b : g_batches) {
            if (b.subjectId == subId && b.status == "FINALIZED") {
                for (auto& e : b.entries) {
                    if (e.studentId == sid) {
                        json j;
                        j["studentId"]          = sid;
                        j["studentName"]        = e.studentName;
                        j["rollNo"]             = e.rollNo;
                        j["subjectId"]          = subId;
                        for (auto& s : g_subjects) {
                            if (s.id == subId) {
                                j["subjectCode"] = s.code;
                                j["subjectName"] = s.name;
                                break;
                            }
                        }
                        j["marksObtained"]      = e.marksObtained;
                        j["maxMarks"]           = e.maxMarks;
                        j["percentage"]         = e.percentage;
                        j["cohortSize"]         = b.cohortSize;
                        j["eligibleCount"]      = b.eligibleCount;
                        j["cohortMean"]         = b.mean;
                        j["cohortStdDev"]       = b.stdDev;
                        j["zScore"]             = e.zScore;
                        j["percentileRank"]     = e.percentileRank;
                        j["rank"]               = e.rank;
                        j["assignedGrade"]      = e.assignedGrade;
                        j["assignedGradePoint"] = e.assignedGradePoint;
                        j["explanation"]        = e.explanation;
                        j["policyId"]           = b.policyId;
                        j["finalizedAt"]        = b.finalizedAt;
                        setOk(res, j);
                        return;
                    }
                }
            }
        }
        setErr(res, 404, "No finalized relative grading record found for this student and subject.");
    });

    // ── Backup and Restore ────────────────────────────────────────────────────
    svr.Get("/api/backup", [](const Request&, Response& res) {
        json b;
        b["timestamp"]    = "2026-10-27T02:00:00Z";
        b["version"]      = "2.0-relative-grading";
        b["settings"]     = json::parse(storage_loadSettings().collegeName); // simple tag
        // Collect all models
        json stArr = json::array();
        for (auto& s : g_students) {
            json item; item["id"]=s.id; item["rollNo"]=s.rollNo; item["name"]=s.name;
            item["className"]=s.className; item["semester"]=s.semester;
            item["department"]=s.department; item["academicYear"]=s.academicYear;
            stArr.push_back(item);
        }
        b["students"] = stArr;

        json subArr = json::array();
        for (auto& sub : g_subjects) {
            json item; item["id"]=sub.id; item["code"]=sub.code; item["name"]=sub.name;
            item["credits"]=sub.credits; item["maxMarks"]=sub.maxMarks; item["passingMarks"]=sub.passingMarks;
            item["semester"]=sub.semester; item["categoryCode"]=sub.categoryCode;
            subArr.push_back(item);
        }
        b["subjects"] = subArr;

        json rArr = json::array();
        for (auto& r : g_results) {
            json item; item["id"]=r.id; item["studentId"]=r.studentId; item["subjectId"]=r.subjectId;
            item["marksObtained"]=r.marksObtained; item["isAbsent"]=r.isAbsent;
            item["finalGrade"]=r.finalGrade; item["finalGradePoint"]=r.finalGradePoint;
            item["isFinalized"]=r.isFinalized;
            rArr.push_back(item);
        }
        b["results"] = rArr;
        setOk(res, b);
    });

    // ── Dashboard (Strict SGPA / CGPA + Relative Grading Status) ──────────────
    svr.Get("/api/dashboard", [](const Request&, Response& res) {
        auto ca = academic_computeClassAnalysis(g_students, g_subjects, g_results, g_settings, g_batches);
        json j;
        j["totalStudents"]          = ca.totalStudents;
        j["totalTeachers"]          = (int)g_teachers.size();
        j["totalSubjects"]          = (int)g_subjects.size();
        j["totalExaminations"]      = (int)g_examinations.size();
        j["totalBatches"]           = (int)g_batches.size();
        j["relativeGradingEnabled"] = g_settings.relativeGradingEnabled;

        int approvedCount = 0, publishedCount = 0, pendingCount = 0;
        for (auto& ex : g_examinations) {
            if (ex.approvalStatus == "APPROVED") approvedCount++;
            else if (ex.approvalStatus == "PUBLISHED") publishedCount++;
            else pendingCount++;
        }
        j["approvedExamsCount"]     = approvedCount;
        j["publishedExamsCount"]    = publishedCount;
        j["pendingExamsCount"]      = pendingCount;
        j["passCount"]              = ca.passCount;
        j["failCount"]              = ca.failCount;
        j["incompleteCount"]        = ca.incompleteCount;
        j["classAvgCgpa"]           = ca.classAvgCgpa;
        j["highestCgpa"]            = ca.highestCgpa;
        j["lowestCgpa"]             = ca.lowestCgpa;
        j["topperName"]             = ca.topperName;
        j["topperId"]               = ca.topperId;
        j["topperRoll"]             = ca.topperRoll;
        j["topperCgpa"]             = ca.topperCgpa;
        j["distinctionCount"]       = ca.distinctionCount;
        j["firstClassCount"]        = ca.firstClassCount;
        j["secondClassCount"]       = ca.secondClassCount;
        j["collegeName"]            = g_settings.collegeName;
        j["collegeSub"]             = g_settings.collegeSub;
        j["department"]             = g_settings.department;
        j["programName"]            = g_settings.programName;
        j["academicYear"]           = g_settings.academicYear;
        j["currentSemester"]        = g_settings.currentSemester;

        json recent = json::array();
        int start = (int)g_students.size() > 6 ? (int)g_students.size() - 6 : 0;
        for (int i = start; i < (int)g_students.size(); i++) {
            auto& st = g_students[i];
            std::vector<Subject> semSubs;
            for (auto& sub : g_subjects) if (sub.semester == st.semester) semSubs.push_back(sub);
            auto rpt = academic_computeStudentReport(st, semSubs, g_results, g_settings, g_batches);
            json s;
            s["id"]             = st.id;
            s["name"]           = st.name;
            s["rollNo"]         = st.rollNo;
            s["className"]      = st.className;
            s["sgpa"]           = rpt.sgpa;
            s["cgpa"]           = rpt.cgpa;
            s["creditsEarned"]  = rpt.creditsEarned;
            s["creditsTotal"]   = rpt.creditsRegistered;
            s["academicClass"]  = rpt.academicClass;
            s["status"]         = rpt.status;
            recent.push_back(s);
        }
        j["recentStudents"] = recent;

        json subOv = json::array();
        for (auto& sub : g_subjects) {
            auto stats = academic_computeSubjectStats(sub, g_students, g_results, g_settings, g_batches);
            json s;
            s["id"]               = sub.id;
            s["code"]             = sub.code;
            s["categoryCode"]     = sub.categoryCode;
            s["name"]             = sub.name;
            s["credits"]          = sub.credits;
            s["avgGradePoint"]    = stats.averageGradePoint;
            s["passPercent"]      = stats.passPercent;
            s["difficultyLevel"]  = stats.difficultyLevel;
            s["stdDevMarks"]      = stats.stdDevMarks;
            s["averageMarks"]     = stats.averageMarks;
            // Check if relative grading finalized for this subject
            bool isFinal = false;
            for (auto& b : g_batches) {
                if (b.subjectId == sub.id && b.status == "FINALIZED") { isFinal = true; break; }
            }
            s["isRelativeGraded"] = isFinal;
            subOv.push_back(s);
        }
        j["subjectOverview"] = subOv;
        setOk(res, j);
    });

    // ── Class Analytics ───────────────────────────────────────────────────────
    svr.Get("/api/analysis/class", [](const Request&, Response& res) {
        auto ca = academic_computeClassAnalysis(g_students, g_subjects, g_results, g_settings, g_batches);
        json j;
        j["totalStudents"]    = ca.totalStudents;
        j["passCount"]        = ca.passCount;
        j["failCount"]        = ca.failCount;
        j["incompleteCount"]  = ca.incompleteCount;
        j["classAvgCgpa"]     = ca.classAvgCgpa;
        j["highestCgpa"]      = ca.highestCgpa;
        j["lowestCgpa"]       = ca.lowestCgpa;
        j["distinctionCount"] = ca.distinctionCount;
        j["firstClassCount"]  = ca.firstClassCount;
        j["secondClassCount"] = ca.secondClassCount;

        json gd = json::object();
        for (auto& kv : ca.gradeDist) gd[kv.first] = kv.second;
        j["gradeDist"] = gd;

        json rankings = json::array();
        for (auto& e : ca.rankings) {
            json s;
            s["id"]             = e.id;
            s["name"]           = e.name;
            s["rollNo"]         = e.rollNo;
            s["className"]      = e.className;
            s["sgpa"]           = e.sgpa;
            s["cgpa"]           = e.cgpa;
            s["creditsEarned"]  = e.creditsEarned;
            s["creditsTotal"]   = e.creditsTotal;
            s["academicClass"]  = e.academicClass;
            s["status"]         = e.status;
            rankings.push_back(s);
        }
        j["rankings"] = rankings;
        setOk(res, j);
    });

    // ── Subject Difficulty Analytics ──────────────────────────────────────────
    svr.Get("/api/analysis/subjects", [](const Request&, Response& res) {
        json arr = json::array();
        for (auto& sub : g_subjects) {
            auto stats = academic_computeSubjectStats(sub, g_students, g_results, g_settings, g_batches);
            json j;
            j["id"]                = sub.id;
            j["code"]              = sub.code;
            j["categoryCode"]      = sub.categoryCode;
            j["name"]              = sub.name;
            j["semester"]          = sub.semester;
            j["credits"]           = sub.credits;
            j["totalStudents"]     = stats.totalStudents;
            j["completedStudents"] = stats.completedStudents;
            j["passCount"]         = stats.passCount;
            j["failCount"]         = stats.failCount;
            j["absentCount"]       = stats.absentCount;
            j["averageMarks"]      = stats.averageMarks;
            j["averageGradePoint"] = stats.averageGradePoint;
            j["passPercent"]       = stats.passPercent;
            j["highestMarks"]      = stats.highestMarks;
            j["highestScorerName"] = stats.highestScorerName;
            j["highestScorerRoll"] = stats.highestScorerRoll;
            j["lowestMarks"]       = stats.lowestMarks;
            j["lowestScorerName"]  = stats.lowestScorerName;
            j["lowestScorerRoll"]  = stats.lowestScorerRoll;
            j["medianMarks"]       = stats.medianMarks;
            j["stdDevMarks"]       = stats.stdDevMarks;
            j["difficultyLevel"]   = stats.difficultyLevel;
            j["needsSupportCount"] = stats.needsSupportCount;

            json gd = json::object();
            for (auto& kv : stats.gradeDist) gd[kv.first] = kv.second;
            j["gradeDist"] = gd;
            arr.push_back(j);
        }
        setOk(res, arr);
    });

    // ── Subject Highest Scorers (Toppers in each Subject) ─────────────────────
    svr.Get("/api/analysis/subject-toppers", [](const Request&, Response& res) {
        json arr = json::array();
        for (auto& sub : g_subjects) {
            auto stats = academic_computeSubjectStats(sub, g_students, g_results, g_settings, g_batches);
            if (stats.completedStudents > 0) {
                json j;
                j["subjectId"]          = sub.id;
                j["subjectCode"]        = sub.code;
                j["subjectName"]        = sub.name;
                j["categoryCode"]       = sub.categoryCode;
                j["credits"]            = sub.credits;
                j["semester"]           = sub.semester;
                j["maxMarks"]           = sub.maxMarks;
                j["highestMarks"]       = stats.highestMarks;
                j["topperName"]         = stats.highestScorerName.empty() ? "—" : stats.highestScorerName;
                j["topperRoll"]         = stats.highestScorerRoll.empty() ? "—" : stats.highestScorerRoll;
                j["lowestMarks"]        = stats.lowestMarks;
                j["averageMarks"]       = stats.averageMarks;
                j["averageGradePoint"]  = stats.averageGradePoint;
                j["passPercent"]        = stats.passPercent;
                j["difficultyLevel"]    = stats.difficultyLevel;
                j["completedStudents"]  = stats.completedStudents;
                j["totalStudents"]      = stats.totalStudents;
                j["needsSupportCount"]  = stats.needsSupportCount;
                arr.push_back(j);
            }
        }
        setOk(res, arr);
    });

    // ── Students Needing Academic Support ─────────────────────────────────────
    svr.Get("/api/analysis/needs-support", [](const Request&, Response& res) {
        json arr = json::array();
        for (auto& st : g_students) {
            std::vector<Subject> semSubs;
            for (auto& sub : g_subjects) if (sub.semester == st.semester) semSubs.push_back(sub);
            auto rpt = academic_computeStudentReport(st, semSubs, g_results, g_settings, g_batches);

            std::vector<std::string> failingSubs;
            for (auto& sr : rpt.subjects) {
                if (sr.isComplete && (!sr.passed || sr.grade == "F" || sr.grade == "AB")) {
                    failingSubs.push_back(sr.subject.code + ": " + sr.subject.name);
                }
            }

            if (rpt.status == "Fail" || !failingSubs.empty() || (rpt.completedSubjects > 0 && rpt.sgpa < 5.0)) {
                json j;
                j["studentId"]         = st.id;
                j["rollNo"]            = st.rollNo;
                j["name"]              = st.name;
                j["className"]         = st.className;
                j["semester"]          = st.semester;
                j["sgpa"]              = rpt.sgpa;
                j["cgpa"]              = rpt.cgpa;
                j["creditsEarned"]     = rpt.creditsEarned;
                j["creditsRegistered"] = rpt.creditsRegistered;
                j["status"]            = rpt.status;
                j["failingSubjects"]   = failingSubs;
                arr.push_back(j);
            }
        }
        setOk(res, arr);
    });

    // ── Merit Toppers ─────────────────────────────────────────────────────────
    svr.Get("/api/analysis/toppers", [](const Request&, Response& res) {
        struct Entry { std::string id,name,rollNo,cls; double cgpa,sgpa; std::string status, academicClass; };
        std::vector<Entry> entries;
        for (auto& st : g_students) {
            std::vector<Subject> semSubs;
            for (auto& sub : g_subjects) if (sub.semester == st.semester) semSubs.push_back(sub);
            auto rpt = academic_computeStudentReport(st, semSubs, g_results, g_settings, g_batches);
            entries.push_back({st.id, st.name, st.rollNo, st.className,
                               rpt.cgpa, rpt.sgpa, rpt.status, rpt.academicClass});
        }
        std::sort(entries.begin(), entries.end(),
            [](const Entry& a, const Entry& b){ return a.cgpa > b.cgpa; });

        json j;
        json top3 = json::array();
        for (int i=0; i<(int)std::min((size_t)3, entries.size()); i++) {
            json e;
            e["rank"]          = i+1;
            e["id"]            = entries[i].id;
            e["name"]          = entries[i].name;
            e["rollNo"]        = entries[i].rollNo;
            e["className"]     = entries[i].cls;
            e["cgpa"]          = entries[i].cgpa;
            e["sgpa"]          = entries[i].sgpa;
            e["academicClass"] = entries[i].academicClass;
            e["status"]        = entries[i].status;
            top3.push_back(e);
        }
        j["top3"] = top3;

        json subTop = json::array();
        for (auto& sub : g_subjects) {
            double hi = -1.0;
            std::string topName,topRoll,topId,topGrade;
            double topGP = 0.0;
            for (auto& r : g_results) {
                if (r.subjectId==sub.id && !r.isAbsent && !r.isWithheld && r.marksObtained>=0) {
                    if (r.marksObtained > hi) {
                        hi = r.marksObtained;
                        for (auto& st : g_students) {
                            if (st.id == r.studentId) {
                                topName = st.name;
                                topRoll = st.rollNo;
                                topId   = st.id;
                            }
                        }
                        auto sr = academic_computeSubjectResult(r, sub, g_settings, g_batches);
                        topGrade = sr.grade;
                        topGP    = sr.gradePoint;
                    }
                }
            }
            if (!topName.empty()) {
                json s;
                s["subjectId"]    = sub.id;
                s["subjectName"]  = sub.name;
                s["subjectCode"]  = sub.code;
                s["categoryCode"] = sub.categoryCode;
                s["credits"]      = sub.credits;
                s["topperName"]   = topName;
                s["topperRoll"]   = topRoll;
                s["topperId"]     = topId;
                s["marks"]        = hi;
                s["maxMarks"]     = sub.maxMarks;
                s["grade"]        = topGrade;
                s["gradePoint"]   = topGP;
                subTop.push_back(s);
            }
        }
        j["subjectToppers"] = subTop;
        setOk(res, j);
    });
}

// ════════════════════════════════════════════════════════════════════════════
//  MAIN
// ════════════════════════════════════════════════════════════════════════════
int main() {
    std::string dataDir = "data";
    storage_setDataDir(dataDir);

    g_settings = storage_loadSettings();
    if (g_settings.gradeRules.empty()) {
        g_settings.gradeRules = academic_defaultGradeRules();
    }
    // Enable relative grading by default
    g_settings.relativeGradingEnabled = true;

    g_students     = storage_loadStudents();
    g_teachers     = storage_loadTeachers();
    g_subjects     = storage_loadSubjects();
    g_results      = storage_loadResults();
    g_examinations = storage_loadExaminations();
    g_policies     = storage_loadPolicies();
    g_batches      = storage_loadBatches();

    // Ensure active policy ID is set
    if (g_settings.activeGradingPolicyId.empty() && !g_policies.empty()) {
        for (auto& p : g_policies) {
            if (p.method == GradingMethod::METHOD_MEAN_STD_DEV) {
                g_settings.activeGradingPolicyId = p.id;
                break;
            }
        }
        if (g_settings.activeGradingPolicyId.empty()) {
            g_settings.activeGradingPolicyId = g_policies[0].id;
        }
        saveSettings();
    }

    char cwdBuf[512] = {0};
    _getcwd(cwdBuf, sizeof(cwdBuf));

    std::cout << "========================================================\n";
    std::cout << "  MADHAV INSTITUTE OF TECHNOLOGY & SCIENCE, GWALIOR\n";
    std::cout << "  Academic Result Analysis & Relative Grading System\n";
    std::cout << "========================================================\n";
    std::cout << "  Enrolled Students     : " << g_students.size() << "\n";
    std::cout << "  Faculty Members       : " << g_teachers.size() << "\n";
    std::cout << "  Curriculum Courses    : " << g_subjects.size() << "\n";
    std::cout << "  Assessment Scores     : " << g_results.size()  << "\n";
    std::cout << "  Grading Policies      : " << g_policies.size() << "\n";
    std::cout << "  Finalized Batches     : " << g_batches.size()  << "\n";
    std::cout << "  Data Repository       : " << cwdBuf << "\\" << dataDir << "\n";
    std::cout << "  Default Grading Mode  : RELATIVE GRADING (Mean +/- StdDev)\n";
    std::cout << "  Active Policy         : " << g_settings.activeGradingPolicyId << "\n";
    std::cout << "  Portal Service        : http://localhost:8080\n";
    std::cout << "========================================================\n\n";

    Server svr;
    svr.staticRoot = "..\\frontend";
    registerRoutes(svr);

    if (!svr.listen("127.0.0.1", 8080)) {
        std::cerr << "FATAL: Could not bind Winsock listener on port 8080.\n";
        return 1;
    }
    return 0;
}
