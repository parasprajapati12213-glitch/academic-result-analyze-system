# seed_data.ps1 — Seeds realistic student, subject, and result data using native PowerShell
$base = "http://localhost:8080/api"

Write-Host "Configuring settings..."
$settings = @{
  collegeName = "APJ Abdul Kalam College of Engineering & Technology"
  department = "Department of Computer Science & Engineering"
  academicYear = "2025-2026"
  currentSemester = 5
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
Invoke-RestMethod -Uri "$base/settings" -Method Put -Body ($settings | ConvertTo-Json -Depth 5) -ContentType "application/json"

Write-Host "Adding subjects..."
$subjects = @(
  @{ code = "CS501"; name = "Theory of Computation"; maxMarks = 100; passingMarks = 40; credits = 4; semester = 5 },
  @{ code = "CS502"; name = "Database Management Systems"; maxMarks = 100; passingMarks = 40; credits = 4; semester = 5 },
  @{ code = "CS503"; name = "Computer Networks"; maxMarks = 100; passingMarks = 40; credits = 4; semester = 5 },
  @{ code = "CS504"; name = "Design & Analysis of Algorithms"; maxMarks = 100; passingMarks = 40; credits = 4; semester = 5 },
  @{ code = "CS505"; name = "Software Engineering & PM"; maxMarks = 100; passingMarks = 40; credits = 3; semester = 5 }
)

$subMap = @{}
foreach ($s in $subjects) {
  $res = Invoke-RestMethod -Uri "$base/subjects" -Method Post -Body ($s | ConvertTo-Json) -ContentType "application/json"
  $subMap[$s.code] = $res.id
}

Write-Host "Adding students..."
$students = @(
  @{ rollNo = "23CS001"; name = "Aarav Sharma"; className = "TE-CSE-A"; semester = 5; department = "Computer Science"; academicYear = "2025-2026" },
  @{ rollNo = "23CS002"; name = "Priya Patel"; className = "TE-CSE-A"; semester = 5; department = "Computer Science"; academicYear = "2025-2026" },
  @{ rollNo = "23CS003"; name = "Rohan Verma"; className = "TE-CSE-A"; semester = 5; department = "Computer Science"; academicYear = "2025-2026" },
  @{ rollNo = "23CS004"; name = "Ananya Iyer"; className = "TE-CSE-A"; semester = 5; department = "Computer Science"; academicYear = "2025-2026" },
  @{ rollNo = "23CS005"; name = "Vikram Singh"; className = "TE-CSE-A"; semester = 5; department = "Computer Science"; academicYear = "2025-2026" },
  @{ rollNo = "23CS006"; name = "Sneha Kulkarni"; className = "TE-CSE-A"; semester = 5; department = "Computer Science"; academicYear = "2025-2026" }
)

$stuMap = @{}
foreach ($st in $students) {
  $res = Invoke-RestMethod -Uri "$base/students" -Method Post -Body ($st | ConvertTo-Json) -ContentType "application/json"
  $stuMap[$st.rollNo] = $res.id
}

Write-Host "Entering marks..."
$marksData = @(
  # Aarav Sharma - Topper (Pass)
  @{ stu = "23CS001"; sub = "CS501"; m = 92; ab = $false },
  @{ stu = "23CS001"; sub = "CS502"; m = 95; ab = $false },
  @{ stu = "23CS001"; sub = "CS503"; m = 90; ab = $false },
  @{ stu = "23CS001"; sub = "CS504"; m = 88; ab = $false },
  @{ stu = "23CS001"; sub = "CS505"; m = 94; ab = $false },

  # Priya Patel - Rank 2 (Pass)
  @{ stu = "23CS002"; sub = "CS501"; m = 84; ab = $false },
  @{ stu = "23CS002"; sub = "CS502"; m = 88; ab = $false },
  @{ stu = "23CS002"; sub = "CS503"; m = 82; ab = $false },
  @{ stu = "23CS002"; sub = "CS504"; m = 85; ab = $false },
  @{ stu = "23CS002"; sub = "CS505"; m = 89; ab = $false },

  # Rohan Verma - Rank 3 (Pass)
  @{ stu = "23CS003"; sub = "CS501"; m = 72; ab = $false },
  @{ stu = "23CS003"; sub = "CS502"; m = 75; ab = $false },
  @{ stu = "23CS003"; sub = "CS503"; m = 78; ab = $false },
  @{ stu = "23CS003"; sub = "CS504"; m = 68; ab = $false },
  @{ stu = "23CS003"; sub = "CS505"; m = 74; ab = $false },

  # Ananya Iyer - Failed in CS504 (32 < 40)
  @{ stu = "23CS004"; sub = "CS501"; m = 65; ab = $false },
  @{ stu = "23CS004"; sub = "CS502"; m = 70; ab = $false },
  @{ stu = "23CS004"; sub = "CS503"; m = 68; ab = $false },
  @{ stu = "23CS004"; sub = "CS504"; m = 32; ab = $false },
  @{ stu = "23CS004"; sub = "CS505"; m = 72; ab = $false },

  # Vikram Singh - Absent in CS501
  @{ stu = "23CS005"; sub = "CS501"; m = 0;  ab = $true  },
  @{ stu = "23CS005"; sub = "CS502"; m = 62; ab = $false },
  @{ stu = "23CS005"; sub = "CS503"; m = 58; ab = $false },
  @{ stu = "23CS005"; sub = "CS504"; m = 60; ab = $false },
  @{ stu = "23CS005"; sub = "CS505"; m = 65; ab = $false },

  # Sneha Kulkarni - Incomplete (2 papers pending)
  @{ stu = "23CS006"; sub = "CS501"; m = 80; ab = $false },
  @{ stu = "23CS006"; sub = "CS502"; m = 82; ab = $false },
  @{ stu = "23CS006"; sub = "CS503"; m = 85; ab = $false }
)

foreach ($item in $marksData) {
  $payload = @{
    studentId = $stuMap[$item.stu]
    subjectId = $subMap[$item.sub]
    marksObtained = $item.m
    isAbsent = $item.ab
  }
  Invoke-RestMethod -Uri "$base/results" -Method Post -Body ($payload | ConvertTo-Json) -ContentType "application/json" | Out-Null
}

Write-Host "Demo seed data successfully loaded into system!"
