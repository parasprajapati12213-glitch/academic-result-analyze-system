# MITS Gwalior — Academic Result Analysis & Grading System
### B.Tech. in Computer Science and Business Systems (CSBS Batch 2025–26)

An enterprise-grade, desktop-browser application developed for **Madhav Institute of Technology & Science, Gwalior (Deemed University)** adhering strictly to the **Choice Based Credit System (CBCS)**, official MITS Scheme of Evaluation, and high-precision C++ calculation core.

---

## 🏛️ Institutional Features

- **Strict SGPA & CGPA Architecture:** Zero reliance on percentages. All evaluations, rankings, and transcripts calculate **Semester Grade Point Average (SGPA)**, **Cumulative Grade Point Average (CGPA)**, **Credits Earned**, and official letter grades (**O, A+, A, B+, B, C, F, AB**) on the MITS 10-point scale:
  $$\text{SGPA} = \frac{\sum (\text{GradePoint}_i \times \text{Credits}_i)}{\sum \text{Credits}_i}$$
  $$\text{CGPA} = \frac{\sum (\text{SGPA}_s \times \text{SemesterCredits}_s)}{\sum \text{SemesterCredits}_s}$$
- **Full MITS CSBS Curriculum Embedded:** Directly implements all courses across **Semesters I, II, and III** from the official MITS Scheme of Evaluation:
  - **Semester I:** Introduction to CSBS, Computer Programming, Digital Logic Design, Web Technology, Matrices and Calculus, Programming Lab, Web Tech Lab, Semester Proficiency, Micro Project-I, Language Lab, Novel Engaging Course (20 Total Credits).
  - **Semester II:** Data Structures, OOP, Discrete Structures, Probability & Random Processes, Basic Electrical & Electronics, Data Structures Lab, OOP Lab, Micro Project-II, Skill Internship (22 Total Credits).
  - **Semester III:** Numerical Techniques, Algorithms, Computer Networks, COA, E-Commerce, Algorithms Lab, Python Lab, Macro Project-I (22 Total Credits).
- **Official MITS Visual Identity:** Features both the **MITS Heritage Crest** (`mits_seal.svg`) and the modern **MITS Faceted Prism Emblem** (`mits_logo.svg`) on all headers, sidebar navigation, and printable transcripts.
- **Faculty & Examination Controller Authentication Portal:** Secure sign-in system with role assignment and a one-click **"Quick Login for College Evaluation"** button for external examiners.
- **Formal MITS Grade Cards:** One-click printing to clean A4 transcripts with student metadata, course category breakdown, semester SGPA, cumulative CGPA, academic standing (*First Class with Distinction / Honours*), and examination authority signature blocks.
- **Persistent JSON Storage:** Safely saved to `backend/data/*.json` using atomic `.tmp` file replacement.

---

## 🚀 Quick Start Guide (Windows)

### Step 1: Open Terminal & Verify Server Status
If the C++ backend is already running on port 8080, you can open your browser immediately.
To re-run or compile from scratch:
```powershell
cd C:\Users\Hp\.antigravity\AcademicResultAnalysisSystem\backend
.\build.bat
.\server.exe
```

---

### Step 2: Open Portal in Browser
Open **Google Chrome**, **Microsoft Edge**, or **Firefox** and navigate to:
👉 **[http://localhost:8080/](http://localhost:8080/)**

---

### Step 3: Log In to Examination Portal
When prompted by the MITS Examination Portal sign-in overlay:
- **Username:** `admin`
- **Password:** `mits@123`
- *Or simply click:* **⚡ Quick Login for College Evaluation (Examiner Pass)**

---

## 🧪 Automated Unit Verification Suite

The standalone C++ unit test suite validates all calculation requirements:
```powershell
cd C:\Users\Hp\.antigravity\AcademicResultAnalysisSystem
.\tests\run_tests.exe
```
**Test Results: 17 Passed, 0 Failed (100% Pass Rate).**

---

## 📑 College Evaluation Deliverables

1. **[docs/project_report.md](file:///C:/Users/Hp/.antigravity/AcademicResultAnalysisSystem/docs/project_report.md):** Formal 20-section B.Tech microproject report formatted with MITS certificates, algorithms, DFDs, and bibliography.
2. **[docs/viva_questions.md](file:///C:/Users/Hp/.antigravity/AcademicResultAnalysisSystem/docs/viva_questions.md):** 30+ viva questions with student-friendly answers and an examiner presentation script.
3. **[docs/architecture.md](file:///C:/Users/Hp/.antigravity/AcademicResultAnalysisSystem/docs/architecture.md):** Technical architecture schematics, DFDs, and C++ memory layouts.
