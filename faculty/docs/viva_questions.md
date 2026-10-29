# MITS Gwalior — Academic Result Analysis & Relative Grading System
## Comprehensive Viva Voce Preparation Guide (B.Tech Major Project)

This document contains **35+ targeted viva voce questions and answers** specifically tailored for the **B.Tech (Computer Science and Business Systems)** evaluation scheme at **Madhav Institute of Technology & Science, Gwalior (Deemed University)**.

---

## 🎯 1. Demonstration Script (For Examiner Presentation)

When the external examiner asks you to demonstrate your project, use this 2-minute structured walkthrough:

> **Student Script:**
> *"Good morning/afternoon, Respected Examiners. My project is the **Academic Result Analysis and Relative Grading Management System**, developed specifically for **Madhav Institute of Technology & Science, Gwalior (Deemed University)** for the **B.Tech. in Computer Science and Business Systems (CSBS)** program.
>
> *The central innovation of our project is that it adheres strictly to an institutional mandate: **Relative Grading, Not Absolute Grading**.*
>
> *Under traditional absolute grading, fixed percentage boundaries (such as 90% = O or 80% = A+) are applied regardless of question paper difficulty. This penalizes students when an examination paper is exceptionally tough and inflates grades when it is easy.*
>
> *In contrast, our system features a **Configurable Relative Grading Engine built in C++** that evaluates students relative to their cohort distribution:*
> 1. *It calculates statistical parameters for each subject cohort: Cohort Mean ($\mu$), Sample Standard Deviation ($s$), and each candidate's Standardized Z-Score ($z = \frac{x - \mu}{s}$).*
> 2. *It maps grades dynamically across statistical bands (such as $z \ge +1.5 \to O$, $+1.0 \le z < +1.5 \to A+$, down to $z < -1.0 \to F$).*
> 3. *It supports alternative institutional methods including **Percentile-Rank grading**, **Quota-based grading**, and a graceful fallback for small cohorts.*
> 4. *It provides a transparent, student-safe **Audit Explanation** for every grade without leaking other students' private marks.*
> 5. *It integrates with the **Choice Based Credit System (CBCS)** to calculate credit-weighted **SGPA** and **CGPA** on a 10-point scale.*
> 6. *All calculations are powered by our compiled C++ backend, verified against 17 automated unit tests with a 100% pass rate.*
>
> *I would like to demonstrate our live system on port 8080 by previewing a cohort, examining the statistical Z-score distribution, finalizing a batch, and inspecting a student's grade card."*

---

## 📚 2. Core Viva Questions & Answers

### Chapter A: Relative Grading vs. Absolute Grading

#### Q1. Why does your college require Relative Grading instead of Absolute Grading?
**Answer:**
Absolute grading assigns fixed letter grades based on arbitrary percentage boundaries (e.g., $\ge 90\% = O, 80-89\% = A+$). This suffers from major academic flaws:
1. **Paper Difficulty Variance:** If an examination is very tough, the highest score in the cohort might be 68%. Under absolute grading, no student would receive an $O$ or $A+$, which unfairly damages students' CGPA for campus placements and higher education.
2. **Subject Subjectivity:** Evaluating descriptive courses (e.g., Humanities or Business Systems) often yields lower raw marks than objective mathematics, creating an unlevel playing field.
3. **Cohort Normalization:** Relative grading evaluates a student's performance in comparison to their actual peer cohort taking the same examination. A student scoring $75$ in a difficult paper where the mean is $50$ has demonstrated true excellence ($Z = +2.0 \to O$).

#### Q2. Can you explain the Mean and Standard Deviation relative grading method ($Mean \pm k \times \sigma$)?
**Answer:**
In this method, the examination cohort's marks distribution is calculated:
1. **Cohort Mean ($\mu$):**
   $$\mu = \frac{1}{N} \sum_{i=1}^{N} x_i$$
2. **Sample Standard Deviation ($s$):**
   $$s = \sqrt{\frac{1}{N - 1} \sum_{i=1}^{N} (x_i - \mu)^2}$$
3. **Candidate Z-Score ($z$):**
   $$z = \frac{x_i - \mu}{s}$$
4. **Grade Allocation Bands:**
   - **Grade O (Grade Point 10.0):** $z \ge +1.5$
   - **Grade A+ (Grade Point 9.0):** $+1.0 \le z < +1.5$
   - **Grade A (Grade Point 8.0):** $+0.5 \le z < +1.0$
   - **Grade B+ (Grade Point 7.0):** $0.0 \le z < +0.5$ (At or above average)
   - **Grade B (Grade Point 6.0):** $-0.5 \le z < 0.0$ (Slightly below average)
   - **Grade C (Grade Point 5.0):** $-1.0 \le z < -0.5$ (Passing threshold)
   - **Grade F (Grade Point 0.0):** $z < -1.0$ or raw score below institutional minimum passing threshold (e.g. $< 40\%$).

#### Q3. Why did a student scoring 92% in your system receive Grade A+ instead of Grade O?
**Answer:**
This is the textbook proof that Relative Grading is active! In that subject, the cohort performed exceptionally well (Mean $\mu = 78.0$, Standard Deviation $s = 11.82$).
The student's Z-score was:
$$z = \frac{92.0 - 78.0}{11.82} = +1.18$$
According to the institutional relative grading policy, the band for Grade O requires $z \ge +1.50$ (which would require a score of $78.0 + 1.5 \times 11.82 = 95.73$).
Since $z = +1.18$ falls squarely inside the $[+1.00, +1.50)$ band, the student was assigned Grade **A+** (Grade Point 9.0).

#### Q4. What happens when the standard deviation of a class is zero ($s = 0$)?
**Answer:**
If all students in a cohort obtain the exact same score, the standard deviation is zero ($s = 0.0$), which would cause a division by zero in $z = \frac{x - \mu}{s}$.
Our C++ Relative Grading Engine explicitly checks for $s < 10^{-6}$. In this edge case, it treats all students equally: if the common score is above the passing threshold, all candidates are awarded a respectable passing median grade (Grade B+, GP 7.0); if below, Grade F. It never crashes or produces `NaN` or `Infinity`.

#### Q5. How does your system handle small cohorts (e.g., elective classes with fewer than 5 students)?
**Answer:**
Statistical methods require a minimum sample size to be statistically sound. Our system features a configurable `minCohortSize` parameter (default: 5 candidates).
When an elective cohort has fewer than 5 students, the engine triggers the configured **Small Cohort Fallback Policy** (`smallCohortAction`). By default, it falls back to the institution's approved standard absolute scale (MITS 10-point scale), while generating a clear audit explanation that standard absolute grading was applied due to small cohort size ($N < 5$).

#### Q6. What other relative grading methods does your system support?
**Answer:**
Our modular C++ grading engine supports four configurable methods:
1. **Method A: Mean & Standard Deviation ($Mean \pm k \times \sigma$):** Based on statistical normal distribution bands.
2. **Method B: Percentile / Rank-Based Grading:** Grades assigned based on candidate's percentile rank $PR = \frac{\text{Count}(\le x)}{N} \times 100$. For example, top 10% get O, next 15% get A+, etc.
3. **Method C: Configurable Quota-Based Grading:** Institution defines fixed target percentages (e.g. 10% O, 20% A+, 30% A, etc.).
4. **Method D: Custom College Regulations:** Extensible policy engine allowing custom mathematical formulas without touching core API routes.

#### Q7. How does the system handle ties during quota-based or percentile grading?
**Answer:**
Arbitrary tie-splitting is strictly forbidden. If two students obtain the exact same raw marks at a quota boundary, our engine treats them identically—both students receive the higher grade band. The system logs that the advisory quota was expanded to accommodate tied candidates.

#### Q8. What is a "Grading Batch" and why is finalization/locking required?
**Answer:**
Relative grades depend on the entire cohort. If grades were floating live, a teacher editing one student's marks at 5 PM would silently change every other classmate's letter grades and SGPA!
To maintain institutional audit integrity, we implemented a **2-Stage Workflow**:
1. **Preview Mode:** Allows teachers to view statistical summaries, Z-scores, and proposed grade distributions before committing.
2. **Finalization & Locking:** The batch is finalized, creating a permanent, immutable `GradingBatch` record with timestamp, mean, standard deviation, and policy snapshot. The finalized grades are locked into the students' permanent academic records.
3. **Revert/Recalculation:** If marks are legitimately re-evaluated, an authorized controller can delete/reopen the batch, which triggers an automated recalculation notice.

#### Q9. How does your system preserve student privacy during grade audits?
**Answer:**
Students have the legal and academic right to understand how their relative grade was assigned. However, the university cannot reveal other students' individual marks.
Our dedicated endpoint (`GET /api/grading/explanation/:studentId/:subjectId`) provides a **Student-Safe Audit Explanation**:
It displays the student's own score, the cohort average ($\mu$), cohort standard deviation ($s$), the student's Z-score, and the policy formula applied. It does **not** leak any other candidate's name, roll number, or score.

---

### Chapter B: Choice Based Credit System (CBCS) & Calculations

#### Q10. What is the formula for SGPA (Semester Grade Point Average)?
**Answer:**
$$\text{SGPA} = \frac{\sum_{i=1}^{m} (\text{GradePoint}_i \times \text{Credits}_i)}{\sum_{i=1}^{m} \text{Credits}_i}$$
Where $\text{GradePoint}_i$ is the numerical point on the 10-point scale assigned to course $i$, and $\text{Credits}_i$ is the credit weight assigned to course $i$ in the MITS Scheme of Evaluation.

#### Q11. What is the formula for CGPA (Cumulative Grade Point Average)?
**Answer:**
$$\text{CGPA} = \frac{\sum_{j=1}^{k} (\text{SGPA}_j \times \text{SemesterCredits}_j)}{\sum_{j=1}^{k} \text{SemesterCredits}_j}$$
Where $\text{SGPA}_j$ is the SGPA of semester $j$ and $\text{SemesterCredits}_j$ is the total registered credits in semester $j$.

#### Q12. Why are percentages strictly omitted from the student's final marksheet and degree?
**Answer:**
Under UGC, AICTE, and MITS Deemed University regulations, engineering degrees are evaluated strictly on Credits, SGPA, and CGPA on a 10-point scale. Courses carry differential credit weights (e.g., Theory Core is 3.0 credits, while Laboratory is 1.0 credit). A percentage formula treats all hours equally, which is academically invalid under CBCS. Percentage values are only used internally as descriptive statistics.

#### Q13. How are Absent and Withheld students handled in the cohort?
**Answer:**
- **Absent (AB):** Scored as $0.0$ marks, assigned Grade **AB** with Grade Point **0.0**. By institutional default, absent candidates are excluded from the cohort mean and standard deviation calculation so they do not artificially depress the class average.
- **Withheld (WH):** Candidate result is flagged as incomplete, excluded from active batch ranking, and their marksheet shows "Withheld" until cleared.

#### Q14. What are the academic divisions awarded in your system?
**Answer:**
- **First Class with Distinction (Honours):** $\text{CGPA} \ge 8.00$ with zero backlogs.
- **First Class:** $6.50 \le \text{CGPA} < 8.00$ with zero backlogs.
- **Second Class:** $5.00 \le \text{CGPA} < 6.50$ with zero backlogs.
- **Academic Arrear / Backlog:** Failed in one or more subjects ($\text{Grade} = F \text{ or } AB$).

---

### Chapter C: Technical Architecture & C++ Implementation

#### Q15. Why did you choose C++ for the backend rather than Python or Node.js?
**Answer:**
1. **Computational Speed & Precision:** Academic result processing involves heavy matrix multiplications, statistical standard deviations, and sorting. C++ executes in native machine code with zero runtime garbage collection pauses.
2. **Zero Deployment Dependencies:** The entire backend compiles into a single standalone Windows executable (`server.exe`). It requires no Python interpreter, virtual environment, npm modules, or external runtime on the college examination computer.
3. **Type Safety & Data Integrity:** C++ strong typing prevents runtime coercion bugs (such as string concatenation `'8' + '2' = '82'`).

#### Q16. How did you implement the REST API in C++ without third-party frameworks?
**Answer:**
We built a self-contained multi-threaded HTTP/1.1 server using native Windows Sockets (`winsock2.h` / `ws2_32.lib`).
The server accepts TCP client connections, parses HTTP methods (`GET`, `POST`, `PUT`, `DELETE`), handles URL routing with dynamic parameters (e.g., `/api/students/:id/report`), handles CORS pre-flight (`OPTIONS`), parses and serializes JSON bodies using `json.hpp`, and serves static frontend assets directly.

#### Q17. How is data persisted, and how do you prevent data corruption?
**Answer:**
Data is stored persistently in structured JSON files (`students.json`, `subjects.json`, `results.json`, `grading_batches.json`, `grading_policies.json`, `examinations.json`, `settings.json`).
To prevent data corruption during power cuts or abrupt terminations, we implemented **Atomic File Writing**:
1. Data is first written completely to a temporary file (`filename.tmp`).
2. The temporary file is flushed and closed.
3. The original file is atomically replaced via `std::rename`.

#### Q18. How did you test your Relative Grading Engine?
**Answer:**
We built a dedicated test suite (`tests/calculation_tests.cpp`) covering **17 comprehensive automated test cases**:
1. Mean & Standard Deviation calculation ($Mean \pm k \times \sigma$)
2. Zero Standard Deviation edge case
3. Small cohort fallback to absolute scale ($N < 5$)
4. Percentile-Rank relative grading
5. Quota-based grading with boundary ties
6. Absent student handling (Grade AB, GP 0.0)
7. Withheld student isolation
8. Batch finalization and Result locking
9. Student-safe audit explanation generation
10. Credit-weighted SGPA & CGPA calculation
11. Empty cohort error handling
12. Recalculation notice flags
13. Sample vs Population standard deviation verification
14. Cohort Median computation
15. Class-wide statistical performance analysis
16. Policy persistence and serialization
17. Academic division classification

All 17 automated unit tests passed with a **100% pass rate**.

---

## 📊 3. Summary Formula Table

| Concept | Mathematical Formula | Purpose |
|---|---|---|
| **Cohort Mean** | $\mu = \frac{1}{N} \sum_{i=1}^N x_i$ | Average performance of class cohort |
| **Sample Std Dev** | $s = \sqrt{\frac{1}{N-1}\sum_{i=1}^N (x_i - \mu)^2}$ | Class marks spread (Bessel's correction) |
| **Z-Score** | $z = \frac{x - \mu}{s}$ | Candidate's relative deviation in standard deviations |
| **Percentile Rank** | $PR = \frac{\text{Count}(\le x)}{N} \times 100$ | Relative percentage of peers scored below |
| **Semester SGPA** | $\text{SGPA} = \frac{\sum (GP_i \times C_i)}{\sum C_i}$ | Credit-weighted semester grade average |
| **Cumulative CGPA** | $\text{CGPA} = \frac{\sum (SGPA_j \times C_j)}{\sum C_j}$ | Degree-level cumulative academic standing |
