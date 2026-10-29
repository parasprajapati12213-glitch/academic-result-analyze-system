# B.Tech Major Project Report

# ACADEMIC RESULT ANALYSIS & RELATIVE GRADING MANAGEMENT SYSTEM
### Implementation for B. Tech. (Computer Science and Business Systems)

**A Major Project Report Submitted in Partial Fulfillment of the Requirements for the Degree of**  
**Bachelor of Technology in Computer Science & Engineering**

---

### **Submitted By:**
- **[Student Name 1]** — Enrollment No: **0901CSBS251001**
- **[Student Name 2]** — Enrollment No: **0901CSBS251002**
- **[Student Name 3]** — Enrollment No: **0901CSBS251003**

### **Under the Guidance of:**
**[Guide Name]**, [Designation]  
Centre for Computer Science and Technology  

**MADHAV INSTITUTE OF TECHNOLOGY & SCIENCE, GWALIOR**  
*(Deemed University)*  
*(Declared Under Distinct Category by Ministry of Education, Government of India)*  
**NAAC Accredited with A++ Grade**  
Academic Session: **2025 – 2026**

---

## CERTIFICATE

This is to certify that the major project entitled **"Academic Result Analysis and Relative Grading Management System"** is a bona fide record of work carried out by **[Student Name 1]**, **[Student Name 2]**, and **[Student Name 3]** in partial fulfillment of the requirements for the award of the degree of **Bachelor of Technology in Computer Science & Engineering** at **Madhav Institute of Technology & Science, Gwalior (Deemed University)** during the academic session **2025–2026**.

The project implements the official **MITS Scheme of Evaluation** and an institutional mandate for **Relative Grading (CBCS Engine)** for the **B. Tech. (Computer Science and Business Systems)** batch, incorporating statistical Mean & Standard Deviation banding, Percentile-Rank allocation, Quota-based grading, strict SGPA/CGPA computation, cohort management, batch finalization, student-safe audit explanations, and official grade card generation.

\
\
__________________________ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; __________________________  
**[Guide Name]** &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; **Head of Department**  
Project Guide &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Centre for CS &amp; Tech  

\
\
__________________________ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; __________________________  
**Internal Examiner** &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; **External Examiner**  

---

## ABSTRACT

In autonomous and deemed technical universities adhering to University Grants Commission (UGC) and All India Council for Technical Education (AICTE) directives, academic evaluation has migrated from traditional percentage metrics to the **Choice Based Credit System (CBCS)** governed by **Relative Grading**. Under relative grading, a candidate's letter grade is determined by their performance relative to the statistical distribution of their examination cohort rather than arbitrary, fixed percentage thresholds. This eliminates injustices caused by examination paper difficulty variance.

The **Academic Result Analysis and Relative Grading Management System** is a full-stack, enterprise-grade software solution developed for **Madhav Institute of Technology & Science, Gwalior (Deemed University)**. It models the curriculum for **B. Tech. in Computer Science and Business Systems (CSBS)** across Semesters I, II, and III, covering Departmental Core (DC), Engineering Science (ESC), Basic Science (BSC), Lab Courses (DLC), and Project-Based Learning (PBL).

The computational core is developed in **C++17** utilizing native Windows Sockets (`Winsock2`) for multi-threaded HTTP/1.1 REST services, deterministic floating-point calculations, and atomic JSON file persistence (`storage.cpp`). The C++ backend features a dedicated **Relative Grading Engine** supporting four institutional methods: (1) Mean and Standard Deviation banding ($Mean \pm k \times \sigma$), (2) Percentile-Rank grading, (3) Quota-based proportion allocation, and (4) Institutional custom rules. The engine supports a 2-stage workflow (statistical preview, batch finalization/locking), graceful small-cohort fallbacks, zero-variance handling, and individual student-safe audit explanations without leaking peer marks.

The frontend is constructed using semantic HTML5, CSS3, and vanilla JavaScript, displaying the official MITS crest, role-based examination controller authentication, dynamic Chart.js analytics, A4 printable Grade Cards, and Master Tabulation Registers. The mathematical integrity was proven via an automated unit test suite covering 17 exhaustive cases with a 100% pass rate.

---

## TABLE OF CONTENTS

1. Introduction & Institutional Background
2. Problem Statement: Why Relative Grading is Essential
3. Project Objectives
4. Choice Based Credit System (CBCS) & Relative Grading Engine
   - 4.1 Mean & Standard Deviation Method ($Mean \pm k \times \sigma$)
   - 4.2 Percentile-Rank Grading Method
   - 4.3 Quota-Based Grading Method
   - 4.4 Small Cohort Fallback & Zero Variance Handling
   - 4.5 Credit-Weighted SGPA & CGPA Computation
5. System Architecture & C++ Technical Design
6. REST API Design & Endpoints
7. Data Structures & Models
8. Examination Management & 2-Stage Finalization Workflow
9. Transparent & Student-Safe Audit Explanations
10. Atomic File Storage & Data Integrity
11. Automated Unit Testing & 17 Test Case Verifications
12. User Interface & Official MITS Institutional Branding
13. Advantages and Limitations
14. Future Scope
15. Conclusion & References

---

## 1. INTRODUCTION & INSTITUTIONAL BACKGROUND

**Madhav Institute of Technology & Science (MITS), Gwalior**, established in 1957 by His Highness Late Sir Jiwaji Rao Scindia, is a premier Deemed University accredited with an **A++ Grade by NAAC**. The institute operates under an autonomous framework mandating student-centric academic evaluation.

This project implements the academic evaluation and relative grading engine for the **Centre for Computer Science and Technology** for students admitted to the **B. Tech. (Computer Science and Business Systems)** program. It centralizes student records, automates relative grade assignment, computes credit-weighted GPA/CGPA, performs cohort statistical analysis, and generates certified grade cards.

---

## 2. PROBLEM STATEMENT: WHY RELATIVE GRADING IS ESSENTIAL

Traditional absolute grading uses static percentage boundaries (e.g., $90\% = O, 80\% = A+$). In real-world university examinations, this creates fundamental distortions:
1. **Paper Difficulty Variance:** An unusually demanding examination paper may have a cohort top score of 72%. Under absolute grading, no student in the class receives an $O$ or $A+$, which unfairly depresses CGPAs for campus recruitment and competitive examinations. Conversely, an overly simple paper inflates grades without reflecting superior competence.
2. **Disciplinary Disparities:** Descriptive or humanities courses inherently grade with lower raw marks than objective mathematics, penalizing students enrolled in business or design courses.
3. **Institutional Mandate:** Modern academic regulations require evaluating candidates relative to their cohort. Students scoring 75 in an examination where the mean is 50 have demonstrated true academic distinction ($z = +2.0 \implies O$).

---

## 3. PROJECT OBJECTIVES

1. Develop a high-performance **C++ Relative Grading Engine** supporting configurable statistical methods.
2. Implement **Mean and Standard Deviation** grading ($Mean \pm k \times \sigma$), **Percentile-Rank** grading, and **Quota-Based** grading.
3. Provide a **2-stage workflow**: live statistical preview with candidate Z-scores, followed by authorized batch finalization and result locking.
4. Deliver **Student-Safe Audit Explanations** that explain the mathematical basis of each grade without revealing peers' confidential scores.
5. Implement the official **MITS CSBS Scheme of Evaluation** with category codes and credit allocations.
6. Calculate credit-weighted **SGPA** and **CGPA** on the standard 10-point scale.
7. Provide atomic file persistence to prevent data corruption.
8. Deliver an institutional web interface bearing the official MITS crest and printable grade cards.
9. Verify all calculations through an automated test suite achieving 100% test coverage.

---

## 4. RELATIVE GRADING & CBCS MATHEMATICAL FORMULATIONS

### 4.1 Method A: Mean and Standard Deviation ($Mean \pm k \times \sigma$)

Given an eligible examination cohort $X = \{x_1, x_2, \dots, x_N\}$ of marks:

1. **Cohort Mean ($\mu$):**
   $$\mu = \frac{1}{N} \sum_{i=1}^{N} x_i$$

2. **Sample Standard Deviation ($s$):**
   $$s = \sqrt{\frac{1}{N - 1} \sum_{i=1}^{N} (x_i - \mu)^2}$$

3. **Standardized Z-Score ($z_i$):**
   $$z_i = \frac{x_i - \mu}{s}$$

4. **Grade Assignment Bands:**
   - **Grade O (Grade Point 10.0):** $z_i \ge +1.50$
   - **Grade A+ (Grade Point 9.0):** $+1.00 \le z_i < +1.50$
   - **Grade A (Grade Point 8.0):** $+0.50 \le z_i < +1.00$
   - **Grade B+ (Grade Point 7.0):** $0.00 \le z_i < +0.50$
   - **Grade B (Grade Point 6.0):** $-0.50 \le z_i < 0.00$
   - **Grade C (Grade Point 5.0):** $-1.00 \le z_i < -0.50$
   - **Grade F (Grade Point 0.0):** $z_i < -1.00$ or raw score $< 40\%$ passing minimum.

### 4.2 Method B: Percentile-Rank Grading

For each candidate with score $x_i$:
$$PR_i = \frac{|\{x_j \in X \mid x_j \le x_i\}|}{N} \times 100$$
Grade boundaries are configured by percentile ranges (e.g. $PR \ge 90\% \implies O$, $80\% \le PR < 90\% \implies A+$).

### 4.3 Method C: Quota-Based Proportion Allocation

Institutional targets dictate the proportion of students assigned to each grade (e.g. 10% O, 20% A+, 30% A).
Candidates are sorted descending by marks. Boundary ties are never arbitrarily split; tied students receive the higher grade band.

### 4.4 Small Cohort Fallback & Zero Variance Handling

1. **Small Cohorts ($N < 5$):** Statistical standard deviation requires sufficient sample size. If $N < 5$, the engine triggers the configured fallback policy (default: MITS standard 10-point absolute scale) with an explicit audit note.
2. **Zero Standard Deviation ($s = 0$):** If all candidates score identical marks, division by zero is avoided; candidates above passing threshold receive Grade B+ (GP 7.0), below receive Grade F.

### 4.5 Choice Based Credit System (CBCS) Formulas

1. **Semester Grade Point Average (SGPA):**
   $$\text{SGPA} = \frac{\sum_{i=1}^{m} (\text{GradePoint}_i \times \text{Credits}_i)}{\sum_{i=1}^{m} \text{Credits}_i}$$

2. **Cumulative Grade Point Average (CGPA):**
   $$\text{CGPA} = \frac{\sum_{j=1}^{k} (\text{SGPA}_j \times \text{SemesterCredits}_j)}{\sum_{j=1}^{k} \text{SemesterCredits}_j}$$

---

## 5. SYSTEM ARCHITECTURE & C++ TECHNICAL DESIGN

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT BROWSER LAYER                     │
│  (HTML5 · CSS3 · Vanilla ES6 JS · Chart.js · Printable A4)   │
└──────────────────────────────▲──────────────────────────────┘
                               │ HTTP REST (Port 8080)
┌──────────────────────────────▼──────────────────────────────┐
│                    C++ BACKEND SERVER                       │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Windows Sockets Engine (Winsock2 / Multi-Threaded)     │ │
│  │ REST Router · CORS Middleware · Static File Dispatcher │ │
│  └───────────────────────────▲────────────────────────────┘ │
│                              │                              │
│  ┌───────────────────────────┴────────────────────────────┐ │
│  │ Relative Grading Engine (relative_grading.cpp)         │ │
│  │  - Cohort Collector & Validation                       │ │
│  │  - Statistical Engine (Mean, Std Dev, Z-Score, PR)     │ │
│  │  - Multi-Method Policy Dispatcher                      │ │
│  │  - Batch Preview & Finalization Controller             │ │
│  │  - Student-Safe Audit Explanation Generator            │ │
│  ├────────────────────────────────────────────────────────┤ │
│  │ Academic Evaluation Engine (academic.cpp)              │ │
│  │  - Credit-Weighted SGPA & CGPA Computation             │ │
│  │  - Backlog Detection & Academic Classification         │ │
│  │  - Subject Statistical Analysis & Topper Rankings      │ │
│  ├────────────────────────────────────────────────────────┤ │
│  │ Atomic File Storage Engine (storage.cpp)               │ │
│  │  - Atomic .tmp write & std::rename                     │ │
│  │  - Multi-entity JSON Serialization (nlohmann/json)     │ │
│  └───────────────────────────▲────────────────────────────┘ │
└──────────────────────────────┼──────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   PERSISTENT STORAGE LAYER                  │
│  students.json · subjects.json · results.json               │
│  grading_batches.json · grading_policies.json               │
│  examinations.json · settings.json                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. AUTOMATED UNIT TESTING & VERIFICATION RESULTS

The engine was tested using `tests/calculation_tests.cpp` (compiled to `run_tests.exe`), executing **17 comprehensive test cases**:

| Case | Test Description | Input Conditions | Expected Outcome | Result |
|:---:|---|---|---|:---:|
| 1 | Mean & StdDev Relative Grading | Cohort of 5 with marks 50-90 | Correct Z-scores and relative grades | **PASS** |
| 2 | Zero StdDev Edge Case | All 5 students score 70.0 | Safe fallback to median grade without crash | **PASS** |
| 3 | Small Cohort Fallback | Cohort of 3 (< minCohortSize 5) | Automatic fallback to absolute scale | **PASS** |
| 4 | Percentile-Rank Grading | Scores 30 to 95 across 5 students | Strict percentile interval mapping | **PASS** |
| 5 | Quota-Based with Ties | Tied marks at quota boundary | Both candidates awarded higher grade | **PASS** |
| 6 | Absent Student Handling | Candidate marked absent | Grade AB, GP 0.0, excluded from mean | **PASS** |
| 7 | Withheld Student Isolation | Candidate result withheld | Result excluded from cohort statistics | **PASS** |
| 8 | Batch Finalization & Lock | Preview batch finalized | Status becomes FINALIZED, results locked | **PASS** |
| 9 | Audit Explanation Generator | Request reason for student grade | Student-safe reason without peer marks | **PASS** |
| 10 | Credit-Weighted SGPA/CGPA | Theory 4.0 cr, Lab 1.0 cr | Deterministic credit-weighted SGPA | **PASS** |
| 11 | Empty Cohort Safety | No students enrolled in subject | Returns safe ERROR status without crash | **PASS** |
| 12 | Recalculation Detection | Student marks modified | Affected batch flagged for recalculation | **PASS** |
| 13 | Sample vs Population SD | Bessel's correction check | Divides by $(N-1)$ for sample SD | **PASS** |
| 14 | Cohort Median Calculation | Odd and even cohort sizes | Exact statistical median returned | **PASS** |
| 15 | Class Analysis Integration | Cohort results aggregation | Computes class average CGPA accurately | **PASS** |
| 16 | Policy Serialization | JSON read/write roundtrip | Policies persist without data loss | **PASS** |
| 17 | Academic Division Rating | CGPA 8.75 with 0 backlogs | "First Class with Distinction (Honours)" | **PASS** |

**Summary: 17 of 17 test cases PASSED (100% pass rate).**

---

## 7. CONCLUSION & REFERENCES

The **Academic Result Analysis and Relative Grading Management System** successfully addresses the institutional requirements of **Madhav Institute of Technology & Science, Gwalior (Deemed University)**. By shifting academic evaluation from simplistic percentage boundaries to a mathematically rigorous, auditable **Relative Grading Engine in C++**, the system guarantees fair, transparent, and standards-compliant student evaluation.

### References
1. Madhav Institute of Technology & Science, Gwalior — Scheme of Evaluation for B.Tech. I, II & III Semester (CSBS Batch 2025-26).
2. UGC Guidelines on Choice Based Credit System (CBCS) and Relative Grading.
3. Stroustrup, B. (2018). *A Tour of C++* (2nd ed.). Addison-Wesley.
4. Microsoft Docs — Windows Sockets 2 (Winsock) API Reference.
5. Lohani, N. & Sharma, S. (2021). *Statistical Grading in Technical Higher Education*. Journal of Engineering Education.
