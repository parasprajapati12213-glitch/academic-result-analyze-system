# seed_full_cohort.ps1 — Seeds all MITS students from PDF and realistic marks

$pdfStudents = @(
    @{ roll="BTCB25O1092"; name="Pranjali Mehra"; group=1; cls="CSBS-B" },
    @{ roll="BTIO25O1042"; name="Bhumika Varfa"; group=1; cls="CSBS-B" },
    @{ roll="BTCB25O1081"; name="Mritunjay Dubey"; group=2; cls="CSBS-B" },
    @{ roll="BTCB25O1116"; name="Satwik Singhal"; group=2; cls="CSBS-B" },
    @{ roll="BTCB25O1091"; name="Pragati Jain"; group=3; cls="CSBS-B" },
    @{ roll="BTCB25O1154"; name="Nikita Tripathi"; group=3; cls="CSBS-B" },
    @{ roll="BTCB25O1101"; name="Rajmani Sisodiya"; group=4; cls="CSBS-B" },
    @{ roll="BTCB25O1139"; name="Vaishali Varma"; group=4; cls="CSBS-B" },
    @{ roll="BTCB25O1108"; name="Ronak Gupta"; group=5; cls="CSBS-B" },
    @{ roll="BTCB25O1133"; name="Tanishka Singh Sengar"; group=5; cls="CSBS-B" },
    @{ roll="BTCB25O1122"; name="Shreyansh Verma"; group=6; cls="CSBS-B" },
    @{ roll="BTCB25O1134"; name="Tanu Samadhiya"; group=6; cls="CSBS-B" },
    @{ roll="BTCB25O1082"; name="Mritunjay Mishra"; group=7; cls="CSBS-B" },
    @{ roll="BTCB25O1113"; name="Sarthak Vashishtha"; group=7; cls="CSBS-B" },
    @{ roll="BTCB25O1093"; name="Pranshu Gupta"; group=8; cls="CSBS-B" },
    @{ roll="BTCB25O1155"; name="Aditya Ahamana"; group=8; cls="CSBS-B" },
    @{ roll="BTCB25O1105"; name="Risikesh Singh Bhadouria"; group=9; cls="CSBS-B" },
    @{ roll="BTCB25O1099"; name="Raj Sahu"; group=10; cls="CSBS-B" },
    @{ roll="BTCB25O1143"; name="Vinamra Tamrakar"; group=10; cls="CSBS-B" },
    @{ roll="BTCB25O1106"; name="Ritik Baghel"; group=11; cls="CSBS-B" },
    @{ roll="BTCB25O1144"; name="Vinay Gaur"; group=11; cls="CSBS-B" },
    @{ roll="BTCB25O1086"; name="Niharika"; group=12; cls="CSBS-B" },
    @{ roll="BTCB25O1104"; name="Rishika Chourasiya"; group=12; cls="CSBS-B" },
    @{ roll="BTCB25O1121"; name="Shivansh Pathak"; group=13; cls="CSBS-B" },
    @{ roll="BTCB25O1138"; name="Utsav Gupta"; group=14; cls="CSBS-B" },
    @{ roll="BTCB25O1146"; name="Virendra Sharma"; group=14; cls="CSBS-B" },
    @{ roll="BTCB25O1126"; name="Srashti Gupta"; group=15; cls="CSBS-B" },
    @{ roll="BTCB25O1132"; name="Swastika Chaubey"; group=15; cls="CSBS-B" },
    @{ roll="BTCB25O1085"; name="Neelam Patel"; group=16; cls="CSBS-B" },
    @{ roll="BTCB25O1118"; name="Shital sangulle"; group=16; cls="CSBS-B" },
    @{ roll="BTCB25O1124"; name="Siddhant Gupta"; group=17; cls="CSBS-B" },
    @{ roll="BTCB25O1130"; name="Sumit Suryawanshi"; group=17; cls="CSBS-B" },
    @{ roll="BTCB25O1111"; name="Sanchit Mandrai"; group=18; cls="CSBS-B" },
    @{ roll="BTCB25O1112"; name="Sandeep Ahirwar"; group=18; cls="CSBS-B" },
    @{ roll="BTCB25O1089"; name="Paras Prajapati"; group=19; cls="CSBS-B" },
    @{ roll="BTCB25O1094"; name="Prateek Singh Chauhan"; group=19; cls="CSBS-B" },
    @{ roll="BTCB25O1095"; name="Prerna Bhadouria"; group=20; cls="CSBS-B" },
    @{ roll="BTCB25O1127"; name="Sujal Agrawal"; group=20; cls="CSBS-B" },
    @{ roll="BTCB25O1148"; name="Vishwabodh Singh"; group=21; cls="CSBS-B" },
    @{ roll="BTCB25O1151"; name="Yashvardhan Singh Chauhan"; group=21; cls="CSBS-B" },
    @{ roll="BTCB25O1137"; name="Tushar Birla"; group=22; cls="CSBS-B" },
    @{ roll="BTCB25O1150"; name="Yash Gupta"; group=22; cls="CSBS-B" },
    @{ roll="BTCB25O1087"; name="Nishchal Pratap Rajawat"; group=23; cls="CSBS-B" },
    @{ roll="BTCB25O1158"; name="Sahib Khan"; group=23; cls="CSBS-B" },
    @{ roll="BTCB25O1100"; name="Rajkumar Patidar"; group=24; cls="CSBS-B" },
    @{ roll="BTCB25O1147"; name="Vishesh Gurjar"; group=24; cls="CSBS-B" },
    @{ roll="BTCB25O1156"; name="Dev Srajan Purohit"; group=25; cls="CSBS-B" },
    @{ roll="BTCB25O1157"; name="Pramod Kushwah"; group=25; cls="CSBS-B" },
    @{ roll="BTCB25O1119"; name="Shiv Bhavsar"; group=26; cls="CSBS-B" },
    @{ roll="BTCB25O1120"; name="Shivam Prasad Sahu"; group=26; cls="CSBS-B" },
    @{ roll="BTCB25O1096"; name="Prithvi Patel"; group=27; cls="CSBS-B" },
    @{ roll="BTCB25O1135"; name="Tanuja Rawat"; group=27; cls="CSBS-B" },
    @{ roll="BTCB25O1107"; name="Rohit Kumar"; group=28; cls="CSBS-B" },
    @{ roll="BTCB25O1110"; name="Sahil Ghorse"; group=28; cls="CSBS-B" },
    @{ roll="BTCB25O1140"; name="Vaishnavi Sharma"; group=29; cls="CSBS-B" },
    @{ roll="BTCB25O1152"; name="Yuvraj Jain"; group=29; cls="CSBS-B" },
    @{ roll="BTCB25O1083"; name="Naman Kumar Tripathi"; group=30; cls="CSBS-B" },
    @{ roll="BTCB25O1136"; name="Tarun Dahiya"; group=30; cls="CSBS-B" },
    @{ roll="BTCB25O1084"; name="Naman Rahangdale"; group=31; cls="CSBS-B" },
    @{ roll="BTCB25O1117"; name="Satyam Sharma"; group=31; cls="CSBS-B" },
    @{ roll="BTCB25O1115"; name="Satakshi Sharma"; group=32; cls="CSBS-B" },
    @{ roll="BTCB25O1145"; name="Vipul Jain"; group=32; cls="CSBS-B" },
    @{ roll="BTCB25O1088"; name="Nitin Meena"; group=33; cls="CSBS-B" },
    @{ roll="BTCB25O1090"; name="Piyush Baghel"; group=33; cls="CSBS-B" },
    @{ roll="BTCB25O1097"; name="Priyansh Patel"; group=34; cls="CSBS-B" },
    @{ roll="BTCB25O1103"; name="Raman Sahu"; group=34; cls="CSBS-B" },
    @{ roll="BTCB25O1114"; name="Sarvesh Patel"; group=35; cls="CSBS-B" },
    @{ roll="BTCB25O1128"; name="Sumit Kumar Patel"; group=35; cls="CSBS-B" },
    @{ roll="BTCB25O1142"; name="Vansh Patidar"; group=36; cls="CSBS-B" },
    @{ roll="BTCB25O1149"; name="Vivek Patidar"; group=36; cls="CSBS-B" },
    @{ roll="BTCB25O1098"; name="Raghvendra Rajput"; group=37; cls="CSBS-B" },
    @{ roll="BTCB25O1102"; name="Ramkrishan Singh Tomar"; group=37; cls="CSBS-B" },
    @{ roll="BTCB25O1123"; name="Shyam Kushwah"; group=38; cls="CSBS-B" },
    @{ roll="BTCB25O1131"; name="Sumit Yadav"; group=38; cls="CSBS-B" },
    @{ roll="BTCB25O1125"; name="Sparsh Tamrakar"; group=39; cls="CSBS-B" },
    @{ roll="BTCB25O1153"; name="Yuvraj Singh Rajpoot"; group=39; cls="CSBS-B" },
    @{ roll="BTEE25O1039"; name="Mayank Jaiswal"; group=40; cls="CSBS-B" },
    @{ roll="BTCB25O1159"; name="Abhijeet Bhadouriya"; group=40; cls="CSBS-B" },
    # Section A Cohort
    @{ roll="BTCB25O1001"; name="Aarav Sharma"; group=0; cls="CSBS-A" },
    @{ roll="BTCB25O1002"; name="Priya Patel"; group=0; cls="CSBS-A" },
    @{ roll="0901CSBS251003"; name="Rohan Verma"; group=0; cls="CSBS-A" },
    @{ roll="0901CSBS251004"; name="Ananya Iyer"; group=0; cls="CSBS-A" },
    @{ roll="0901CSBS251005"; name="Vikram Singh"; group=0; cls="CSBS-A" },
    @{ roll="0901CSBS251006"; name="Sneha Kulkarni"; group=0; cls="CSBS-A" }
)

Write-Output "Building students array ($($pdfStudents.Count) total students)..."
$studentsList = @()
$stIdMap = @{}
$idx = 1
foreach ($st in $pdfStudents) {
    $id = "s_mits_$($st.roll)"
    $stIdMap[$st.roll] = $id
    $email = "$($st.name.ToLower().Replace(' ', '.'))@mitsgwalior.in"
    $studentsList += @{
        id = $id
        rollNo = $st.roll
        name = $st.name
        className = $st.cls
        semester = 1
        department = "Centre for Computer Science and Technology"
        academicYear = "2025-2026"
        email = $email
    }
    $idx++
}

$studentsList | ConvertTo-Json -Depth 4 | Set-Content "C:\Users\Hp\.antigravity\AcademicResultAnalysisSystem\backend\data\students.json" -Encoding UTF8
Write-Output "Saved $($studentsList.Count) students to students.json"

# Read Sem 1 Subjects
$subjects = Get-Content "C:\Users\Hp\.antigravity\AcademicResultAnalysisSystem\backend\data\subjects.json" | ConvertFrom-Json | Where-Object { $_.semester -eq 1 }
Write-Output "Loaded $($subjects.Count) Semester 1 subjects."

# Examinations
$examId = "exam_dec_2025"
$exams = @(
    @{
        id = $examId
        name = "End-Semester Regular Examination (Dec 2025)"
        type = "ENDSEM"
        semester = 1
        academicYear = "2025-2026"
        subjectId = ""
        cohortFilter = "ALL"
        gradingPolicyId = "policy_default_relative"
        status = "FINALIZED"
        isLocked = $true
        approvalStatus = "PUBLISHED"
        approvedBy = "Dr. Abhishek Dixit (Head, CST)"
        approvedAt = "2026-10-25T11:00:00"
        publishedAt = "2026-10-26T15:30:00"
        reopenReason = ""
        createdAt = "2025-12-01T09:00:00"
        finalizedAt = "2026-10-25T11:00:00"
    },
    @{
        id = "exam_midsem_2025"
        name = "Mid-Semester Examination-I (Oct 2025)"
        type = "MIDSEM"
        semester = 1
        academicYear = "2025-2026"
        subjectId = ""
        cohortFilter = "ALL"
        gradingPolicyId = "policy_default_relative"
        status = "OPEN"
        isLocked = $false
        approvalStatus = "APPROVED"
        approvedBy = "Dr. Tejaswita Mishra"
        approvedAt = "2025-10-28T16:00:00"
        publishedAt = ""
        reopenReason = ""
        createdAt = "2025-10-05T09:00:00"
        finalizedAt = ""
    },
    @{
        id = "exam_prac_2025"
        name = "Practical & Skill Lab Assessment (Nov 2025)"
        type = "PRACTICAL"
        semester = 1
        academicYear = "2025-2026"
        subjectId = ""
        cohortFilter = "ALL"
        gradingPolicyId = "policy_default_relative"
        status = "OPEN"
        isLocked = $false
        approvalStatus = "REVIEW_READY"
        approvedBy = ""
        approvedAt = ""
        publishedAt = ""
        reopenReason = ""
        createdAt = "2025-11-10T09:00:00"
        finalizedAt = ""
    }
)
$exams | ConvertTo-Json -Depth 4 | Set-Content "C:\Users\Hp\.antigravity\AcademicResultAnalysisSystem\backend\data\examinations.json" -Encoding UTF8
Write-Output "Saved 3 examinations."

# Generate Realistic Marks
# Distribution:
# - Prateek Singh Chauhan (BTCB25O1094): high scores (92-96)
# - Aarav Sharma (BTCB25O1001): high scores (90-95)
# - Satwik Singhal (BTCB25O1116): high scores (88-94)
# - Nikita Tripathi (BTCB25O1154): high scores (89-95)
# - Middle cohort: bell curve 60 to 88
# - 2-3 students with backlogs (e.g. Mayank Jaiswal, Sahib Khan)
# - 1 student absent in 1 subject
Write-Output "Generating results..."
$resultsList = @()
$rIdx = 1

foreach ($st in $studentsList) {
    # Base capability factor for student:
    $baseScore = 72.0
    if ($st.rollNo -eq "BTCB25O1094" -or $st.rollNo -eq "BTCB25O1001") {
        $baseScore = 93.0
    } elseif ($st.rollNo -eq "BTCB25O1116" -or $st.rollNo -eq "BTCB25O1154" -or $st.rollNo -eq "BTCB25O1092") {
        $baseScore = 88.0
    } elseif ($st.rollNo -eq "BTCB25O1138" -or $st.rollNo -eq "BTCB25O1124" -or $st.rollNo -eq "BTCB25O1081") {
        $baseScore = 84.0
    } elseif ($st.rollNo -eq "BTCB25O1157" -or $st.rollNo -eq "BTCB25O1139") {
        $baseScore = 62.0
    } elseif ($st.rollNo -eq "BTEE25O1039") {
        $baseScore = 48.0 # struggling in a couple
    } else {
        # Pseudo-random variation based on rollNo digits
        $seedVal = [int]($st.rollNo.Substring($st.rollNo.Length - 3))
        $baseScore = 65.0 + ($seedVal % 24) # between 65 and 89
    }

    foreach ($sub in $subjects) {
        $is50Max = ($sub.maxMarks -eq 50.0)
        $is40Max = ($sub.maxMarks -eq 40.0)
        $subMax = $sub.maxMarks

        $isAbsent = $false
        $score = $baseScore
        
        # Scale for 50 or 40 max marks
        if ($is50Max) {
            $score = ($baseScore / 100.0) * 50.0 + (([int]$st.rollNo.Substring($st.rollNo.Length - 1) % 5) - 2)
            if ($score -gt 48.0) { $score = 48.0 }
            if ($score -lt 22.0) { $score = 24.0 }
        } elseif ($is40Max) {
            $score = ($baseScore / 100.0) * 40.0
            if ($score -gt 38.0) { $score = 38.0 }
            if ($score -lt 18.0) { $score = 20.0 }
        } else {
            # 100 max marks
            # Add subject variance
            $var = ([int]$sub.code.Substring($sub.code.Length - 2) % 7) - 3
            $score = [math]::Round($baseScore + $var)

            # Specific backlog cases for testing
            if ($st.rollNo -eq "BTEE25O1039" -and ($sub.code -eq "30251105" -or $sub.code -eq "30251103")) {
                $score = 34.0 # Backlog in Matrices & Digital Logic
            }
            if ($st.rollNo -eq "BTCB25O1157" -and $sub.code -eq "30251104") {
                $score = 36.0 # Backlog in Web Tech
            }
            if ($st.rollNo -eq "BTCB25O1147" -and $sub.code -eq "30251102") {
                $isAbsent = $true
                $score = 0.0
            }

            if ($score -gt 98.0) { $score = 96.0 }
            if ($score -lt 30.0 -and -not $isAbsent) { $score = 35.0 }
        }

        $resultsList += @{
            id = "r_$rIdx"
            studentId = $st.id
            subjectId = $sub.id
            examinationId = $examId
            marksObtained = [double]$score
            isAbsent = $isAbsent
            isWithheld = $false
            enteredAt = "2025-12-20T10:00:00"
            finalGrade = ""
            finalGradePoint = -1.0
            isFinalized = $false
            gradingBatchId = ""
        }
        $rIdx++
    }
}

$resultsList | ConvertTo-Json -Depth 4 | Set-Content "C:\Users\Hp\.antigravity\AcademicResultAnalysisSystem\backend\data\results.json" -Encoding UTF8
Write-Output "Saved $($resultsList.Count) result entries to results.json"
