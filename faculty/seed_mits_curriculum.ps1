# seed_mits_curriculum.ps1 — Seeds exact MITS Gwalior CSBS scheme from official evaluation PDF
$base = "http://localhost:8080/api"

Write-Host "Configuring MITS Gwalior institutional settings..."
$settings = @{
  collegeName = "MADHAV INSTITUTE OF TECHNOLOGY & SCIENCE, GWALIOR"
  collegeSub = "(Deemed University) | NAAC Accredited with A++ Grade"
  department = "Centre for Computer Science and Technology"
  programName = "B. Tech. (Computer Science and Business Systems)"
  academicYear = "2025-2026"
  currentSemester = 1
  passingPercent = 40.0
  difficultThreshold = 55.0
  gradeRules = @(
    @{ minPercent = 90.0; maxPercent = 100.0; grade = "O";  gradePoint = 10.0 },
    @{ minPercent = 80.0; maxPercent = 89.99; grade = "A+"; gradePoint = 9.0  },
    @{ minPercent = 70.0; maxPercent = 79.99; grade = "A";  gradePoint = 8.0  },
    @{ minPercent = 60.0; maxPercent = 69.99; grade = "B+"; gradePoint = 7.0  },
    @{ minPercent = 50.0; maxPercent = 59.99; grade = "B";  gradePoint = 6.0  },
    @{ minPercent = 40.0; maxPercent = 49.99; grade = "C";  gradePoint = 5.0  },
    @{ minPercent = 0.0;  maxPercent = 39.99; grade = "F";  gradePoint = 0.0  }
  )
}
Invoke-RestMethod -Uri "$base/settings" -Method Put -Body ($settings | ConvertTo-Json -Depth 5) -ContentType "application/json" | Out-Null

Write-Host "Seeding MITS Curriculum Courses from Evaluation Scheme PDF..."

# ── Semester 1 Courses (from Page 1 of PDF) ──────────────────────────────────
$sem1Courses = @(
  @{ code = "30251101"; categoryCode = "DC";   name = "Introduction to Computer Science and Business Systems"; maxMarks = 100; passingMarks = 40; credits = 3.0; semester = 1 },
  @{ code = "30251102"; categoryCode = "ESC";  name = "Computer Programming";                                 maxMarks = 100; passingMarks = 40; credits = 2.0; semester = 1 },
  @{ code = "30251103"; categoryCode = "DC";   name = "Digital Logic Design";                                 maxMarks = 100; passingMarks = 40; credits = 3.0; semester = 1 },
  @{ code = "30251104"; categoryCode = "DC";   name = "Web Technology";                                       maxMarks = 100; passingMarks = 40; credits = 3.0; semester = 1 },
  @{ code = "30251105"; categoryCode = "BSC";  name = "Matrices and Calculus";                                maxMarks = 100; passingMarks = 40; credits = 3.0; semester = 1 },
  @{ code = "30251106"; categoryCode = "DLC";  name = "Computer Programming Lab";                             maxMarks = 100; passingMarks = 40; credits = 1.0; semester = 1 },
  @{ code = "30251107"; categoryCode = "DLC";  name = "Web Technology Lab";                                   maxMarks = 100; passingMarks = 40; credits = 1.0; semester = 1 },
  @{ code = "30251108"; categoryCode = "SP";   name = "Semester Proficiency";                                 maxMarks = 50;  passingMarks = 20; credits = 1.0; semester = 1 },
  @{ code = "30251109"; categoryCode = "PBL";  name = "Micro Project-I";                                      maxMarks = 100; passingMarks = 40; credits = 1.0; semester = 1 },
  @{ code = "30251110"; categoryCode = "HSMC"; name = "Language Lab";                                         maxMarks = 100; passingMarks = 40; credits = 1.0; semester = 1 },
  @{ code = "NEC10001"; categoryCode = "NEC";  name = "Novel Engaging Course (Activity Based Learning)";      maxMarks = 50;  passingMarks = 20; credits = 1.0; semester = 1 }
)

# ── Semester 2 Courses (from Page 2 of PDF) ──────────────────────────────────
$sem2Courses = @(
  @{ code = "30251201"; categoryCode = "DC";   name = "Data Structures";                                      maxMarks = 100; passingMarks = 40; credits = 3.0; semester = 2 },
  @{ code = "30251202"; categoryCode = "DC";   name = "Object Oriented Programming";                          maxMarks = 100; passingMarks = 40; credits = 3.0; semester = 2 },
  @{ code = "30251203"; categoryCode = "DC";   name = "Discrete Structures";                                  maxMarks = 100; passingMarks = 40; credits = 3.0; semester = 2 },
  @{ code = "30251204"; categoryCode = "BSC";  name = "Probability and Random Processes";                     maxMarks = 100; passingMarks = 40; credits = 3.0; semester = 2 },
  @{ code = "30251205"; categoryCode = "ESC";  name = "Basic Electrical & Electronics Engineering";           maxMarks = 100; passingMarks = 40; credits = 2.0; semester = 2 },
  @{ code = "30251206"; categoryCode = "DLC";  name = "Data Structures Lab";                                  maxMarks = 100; passingMarks = 40; credits = 1.0; semester = 2 },
  @{ code = "30251207"; categoryCode = "DLC";  name = "Object Oriented Programming Lab";                      maxMarks = 100; passingMarks = 40; credits = 1.0; semester = 2 },
  @{ code = "30251208"; categoryCode = "DLC";  name = "Electrical & Electronics Engineering Lab";             maxMarks = 100; passingMarks = 40; credits = 1.0; semester = 2 },
  @{ code = "30251209"; categoryCode = "SP";   name = "Semester Proficiency";                                 maxMarks = 50;  passingMarks = 20; credits = 1.0; semester = 2 },
  @{ code = "30251210"; categoryCode = "PBL";  name = "Micro Project-II";                                     maxMarks = 100; passingMarks = 40; credits = 1.0; semester = 2 },
  @{ code = "NEC20001"; categoryCode = "NEC";  name = "Novel Engaging Course (Activity Based Learning)";      maxMarks = 50;  passingMarks = 20; credits = 1.0; semester = 2 },
  @{ code = "SIP10001"; categoryCode = "SIP";  name = "Skill Internship Program (Soft Skill)";                maxMarks = 60;  passingMarks = 24; credits = 2.0; semester = 2 }
)

# ── Semester 3 Courses (from Page 3 of PDF) ──────────────────────────────────
$sem3Courses = @(
  @{ code = "30252101"; categoryCode = "BSC";  name = "Numerical Techniques";                                 maxMarks = 100; passingMarks = 40; credits = 3.0; semester = 3 },
  @{ code = "30252102"; categoryCode = "DC";   name = "Design and Analysis of Algorithms";                    maxMarks = 100; passingMarks = 40; credits = 3.0; semester = 3 },
  @{ code = "30252103"; categoryCode = "DC";   name = "Computer Networks";                                    maxMarks = 100; passingMarks = 40; credits = 3.0; semester = 3 },
  @{ code = "30252104"; categoryCode = "DC";   name = "Computer Organization and Architecture";               maxMarks = 100; passingMarks = 40; credits = 3.0; semester = 3 },
  @{ code = "30252105"; categoryCode = "DC";   name = "E-Commerce and Digital Business";                      maxMarks = 100; passingMarks = 40; credits = 3.0; semester = 3 },
  @{ code = "30252106"; categoryCode = "DLC";  name = "Design and Analysis of Algorithms Lab";                maxMarks = 100; passingMarks = 40; credits = 1.0; semester = 3 },
  @{ code = "30252107"; categoryCode = "DLC";  name = "Design & Thinking Lab";                                maxMarks = 100; passingMarks = 40; credits = 1.0; semester = 3 },
  @{ code = "30252108"; categoryCode = "DLC";  name = "Problem Solving through Python Programming";           maxMarks = 100; passingMarks = 40; credits = 1.0; semester = 3 },
  @{ code = "30252109"; categoryCode = "SP";   name = "Semester Proficiency";                                 maxMarks = 50;  passingMarks = 20; credits = 1.0; semester = 3 },
  @{ code = "30252110"; categoryCode = "PBL";  name = "Macro Project-I";                                      maxMarks = 100; passingMarks = 40; credits = 1.0; semester = 3 },
  @{ code = "30252111"; categoryCode = "SLP";  name = "Self-learning/Presentation (SWAYAM/NPTEL)";            maxMarks = 40;  passingMarks = 16; credits = 1.0; semester = 3 },
  @{ code = "NEC30001"; categoryCode = "NEC";  name = "Novel Engaging Course (Activity Based Learning)";      maxMarks = 50;  passingMarks = 20; credits = 1.0; semester = 3 }
)

$subMap = @{}

# Clear existing subjects and post MITS subjects
$existingSubs = Invoke-RestMethod -Uri "$base/subjects" -Method Get
foreach ($s in $existingSubs) {
  Invoke-RestMethod -Uri "$base/subjects/$($s.id)" -Method Delete | Out-Null
}

$allCourses = $sem1Courses + $sem2Courses + $sem3Courses
foreach ($c in $allCourses) {
  $res = Invoke-RestMethod -Uri "$base/subjects" -Method Post -Body ($c | ConvertTo-Json) -ContentType "application/json"
  $subMap[$c.code] = $res.id
}
Write-Host "Seeded $($allCourses.Count) courses across Semesters I, II, & III."

# ── Seed MITS Students ───────────────────────────────────────────────────────
Write-Host "Seeding MITS CSBS Cohort Students..."
$existingStudents = Invoke-RestMethod -Uri "$base/students" -Method Get
foreach ($st in $existingStudents) {
  Invoke-RestMethod -Uri "$base/students/$($st.id)" -Method Delete | Out-Null
}

$students = @(
  @{ rollNo = "0901CSBS251001"; name = "Aarav Sharma";    className = "CSBS-A"; semester = 1; department = "Centre for Computer Science and Technology"; academicYear = "2025-2026" },
  @{ rollNo = "0901CSBS251002"; name = "Priya Patel";     className = "CSBS-A"; semester = 1; department = "Centre for Computer Science and Technology"; academicYear = "2025-2026" },
  @{ rollNo = "0901CSBS251003"; name = "Rohan Verma";     className = "CSBS-A"; semester = 1; department = "Centre for Computer Science and Technology"; academicYear = "2025-2026" },
  @{ rollNo = "0901CSBS251004"; name = "Ananya Iyer";     className = "CSBS-A"; semester = 1; department = "Centre for Computer Science and Technology"; academicYear = "2025-2026" },
  @{ rollNo = "0901CSBS251005"; name = "Vikram Singh";    className = "CSBS-A"; semester = 1; department = "Centre for Computer Science and Technology"; academicYear = "2025-2026" },
  @{ rollNo = "0901CSBS251006"; name = "Sneha Kulkarni";  className = "CSBS-A"; semester = 1; department = "Centre for Computer Science and Technology"; academicYear = "2025-2026" }
)

$stuMap = @{}
foreach ($st in $students) {
  $res = Invoke-RestMethod -Uri "$base/students" -Method Post -Body ($st | ConvertTo-Json) -ContentType "application/json"
  $stuMap[$st.rollNo] = $res.id
}

# ── Seed Semester I Marks According to Scheme (Total 20 Credits) ────────────
Write-Host "Entering Semester 1 Marks for Cohort Students..."
$marksData = @(
  # 1. Aarav Sharma (Top Distinction: Grade O & A+ across all 20 credits, SGPA: 9.35)
  @{ roll = "0901CSBS251001"; code = "30251101"; m = 92; ab = $false },
  @{ roll = "0901CSBS251001"; code = "30251102"; m = 94; ab = $false },
  @{ roll = "0901CSBS251001"; code = "30251103"; m = 88; ab = $false },
  @{ roll = "0901CSBS251001"; code = "30251104"; m = 90; ab = $false },
  @{ roll = "0901CSBS251001"; code = "30251105"; m = 95; ab = $false },
  @{ roll = "0901CSBS251001"; code = "30251106"; m = 96; ab = $false },
  @{ roll = "0901CSBS251001"; code = "30251107"; m = 94; ab = $false },
  @{ roll = "0901CSBS251001"; code = "30251108"; m = 48; ab = $false }, # Max 50
  @{ roll = "0901CSBS251001"; code = "30251109"; m = 92; ab = $false },
  @{ roll = "0901CSBS251001"; code = "30251110"; m = 90; ab = $false },
  @{ roll = "0901CSBS251001"; code = "NEC10001"; m = 46; ab = $false }, # Max 50

  # 2. Priya Patel (Rank 2: Grade A+ & A, SGPA: 8.65, Clear Pass)
  @{ roll = "0901CSBS251002"; code = "30251101"; m = 84; ab = $false },
  @{ roll = "0901CSBS251002"; code = "30251102"; m = 86; ab = $false },
  @{ roll = "0901CSBS251002"; code = "30251103"; m = 82; ab = $false },
  @{ roll = "0901CSBS251002"; code = "30251104"; m = 85; ab = $false },
  @{ roll = "0901CSBS251002"; code = "30251105"; m = 88; ab = $false },
  @{ roll = "0901CSBS251002"; code = "30251106"; m = 90; ab = $false },
  @{ roll = "0901CSBS251002"; code = "30251107"; m = 92; ab = $false },
  @{ roll = "0901CSBS251002"; code = "30251108"; m = 44; ab = $false },
  @{ roll = "0901CSBS251002"; code = "30251109"; m = 86; ab = $false },
  @{ roll = "0901CSBS251002"; code = "30251110"; m = 84; ab = $false },
  @{ roll = "0901CSBS251002"; code = "NEC10001"; m = 42; ab = $false },

  # 3. Rohan Verma (Rank 3: Grade A & B+, SGPA: 7.70, Clear Pass)
  @{ roll = "0901CSBS251003"; code = "30251101"; m = 75; ab = $false },
  @{ roll = "0901CSBS251003"; code = "30251102"; m = 78; ab = $false },
  @{ roll = "0901CSBS251003"; code = "30251103"; m = 72; ab = $false },
  @{ roll = "0901CSBS251003"; code = "30251104"; m = 76; ab = $false },
  @{ roll = "0901CSBS251003"; code = "30251105"; m = 70; ab = $false },
  @{ roll = "0901CSBS251003"; code = "30251106"; m = 85; ab = $false },
  @{ roll = "0901CSBS251003"; code = "30251107"; m = 82; ab = $false },
  @{ roll = "0901CSBS251003"; code = "30251108"; m = 38; ab = $false },
  @{ roll = "0901CSBS251003"; code = "30251109"; m = 80; ab = $false },
  @{ roll = "0901CSBS251003"; code = "30251110"; m = 78; ab = $false },
  @{ roll = "0901CSBS251003"; code = "NEC10001"; m = 36; ab = $false },

  # 4. Ananya Iyer (Failed in Web Technology 30251104: 32 < 40 -> Arrear, SGPA: 6.25, Status: Fail)
  @{ roll = "0901CSBS251004"; code = "30251101"; m = 68; ab = $false },
  @{ roll = "0901CSBS251004"; code = "30251102"; m = 72; ab = $false },
  @{ roll = "0901CSBS251004"; code = "30251103"; m = 65; ab = $false },
  @{ roll = "0901CSBS251004"; code = "30251104"; m = 32; ab = $false }, # Fail (32 < 40)
  @{ roll = "0901CSBS251004"; code = "30251105"; m = 62; ab = $false },
  @{ roll = "0901CSBS251004"; code = "30251106"; m = 80; ab = $false },
  @{ roll = "0901CSBS251004"; code = "30251107"; m = 78; ab = $false },
  @{ roll = "0901CSBS251004"; code = "30251108"; m = 34; ab = $false },
  @{ roll = "0901CSBS251004"; code = "30251109"; m = 75; ab = $false },
  @{ roll = "0901CSBS251004"; code = "30251110"; m = 72; ab = $false },
  @{ roll = "0901CSBS251004"; code = "NEC10001"; m = 35; ab = $false },

  # 5. Vikram Singh (Absent in Digital Logic Design 30251103 -> Status: Fail)
  @{ roll = "0901CSBS251005"; code = "30251101"; m = 58; ab = $false },
  @{ roll = "0901CSBS251005"; code = "30251102"; m = 60; ab = $false },
  @{ roll = "0901CSBS251005"; code = "30251103"; m = 0;  ab = $true  }, # Absent
  @{ roll = "0901CSBS251005"; code = "30251104"; m = 64; ab = $false },
  @{ roll = "0901CSBS251005"; code = "30251105"; m = 55; ab = $false },
  @{ roll = "0901CSBS251005"; code = "30251106"; m = 74; ab = $false },
  @{ roll = "0901CSBS251005"; code = "30251107"; m = 70; ab = $false },
  @{ roll = "0901CSBS251005"; code = "30251108"; m = 30; ab = $false },
  @{ roll = "0901CSBS251005"; code = "30251109"; m = 70; ab = $false },
  @{ roll = "0901CSBS251005"; code = "30251110"; m = 68; ab = $false },
  @{ roll = "0901CSBS251005"; code = "NEC10001"; m = 32; ab = $false },

  # 6. Sneha Kulkarni (Partial entries -> Status: Incomplete)
  @{ roll = "0901CSBS251006"; code = "30251101"; m = 82; ab = $false },
  @{ roll = "0901CSBS251006"; code = "30251102"; m = 85; ab = $false },
  @{ roll = "0901CSBS251006"; code = "30251103"; m = 80; ab = $false },
  @{ roll = "0901CSBS251006"; code = "30251104"; m = 84; ab = $false },
  @{ roll = "0901CSBS251006"; code = "30251105"; m = 86; ab = $false }
  # Remaining 6 courses pending evaluation
)

foreach ($item in $marksData) {
  $payload = @{
    studentId = $stuMap[$item.roll]
    subjectId = $subMap[$item.code]
    marksObtained = $item.m
    isAbsent = $item.ab
  }
  Invoke-RestMethod -Uri "$base/results" -Method Post -Body ($payload | ConvertTo-Json) -ContentType "application/json" | Out-Null
}

Write-Host "MITS Gwalior official curriculum and result data seeded successfully!"
