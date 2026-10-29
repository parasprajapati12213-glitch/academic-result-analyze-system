// seed_data.js — Helper script to populate demonstration records via the live C++ API
const http = require('http');

function postJson(path, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    const options = {
      hostname: 'localhost',
      port: 8080,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve(JSON.parse(body)));
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

function putJson(path, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    const options = {
      hostname: 'localhost',
      port: 8080,
      path: path,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve(JSON.parse(body)));
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function run() {
  console.log("Configuring settings...");
  await putJson('/api/settings', {
    collegeName: "APJ Abdul Kalam College of Engineering & Technology",
    department: "Department of Computer Science & Engineering",
    academicYear: "2025-2026",
    currentSemester: 5,
    passingPercent: 40.0,
    difficultThreshold: 55.0,
    gradeRules: [
      { minPercent: 90.0, maxPercent: 100.0, grade: "O",  gradePoint: 10.0 },
      { minPercent: 80.0, maxPercent: 89.99, grade: "A+", gradePoint: 9.0 },
      { minPercent: 70.0, maxPercent: 79.99, grade: "A",  gradePoint: 8.0 },
      { minPercent: 60.0, maxPercent: 69.99, grade: "B+", gradePoint: 7.0 },
      { minPercent: 50.0, maxPercent: 59.99, grade: "B",  gradePoint: 6.0 },
      { minPercent: 40.0, maxPercent: 49.99, grade: "C",  gradePoint: 5.0 },
      { minPercent: 0.0,  maxPercent: 39.99, grade: "F",  gradePoint: 0.0 }
    ]
  });

  console.log("Adding 5 subjects...");
  const subjects = [
    { code: "CS501", name: "Theory of Computation", maxMarks: 100, passingMarks: 40, credits: 4, semester: 5 },
    { code: "CS502", name: "Database Management Systems", maxMarks: 100, passingMarks: 40, credits: 4, semester: 5 },
    { code: "CS503", name: "Computer Networks", maxMarks: 100, passingMarks: 40, credits: 4, semester: 5 },
    { code: "CS504", name: "Design & Analysis of Algorithms", maxMarks: 100, passingMarks: 40, credits: 4, semester: 5 },
    { code: "CS505", name: "Software Engineering & PM", maxMarks: 100, passingMarks: 40, credits: 3, semester: 5 }
  ];

  const subMap = {};
  for (const s of subjects) {
    const res = await postJson('/api/subjects', s);
    subMap[s.code] = res.id;
  }

  console.log("Adding 6 students...");
  const students = [
    { rollNo: "23CS001", name: "Aarav Sharma", className: "TE-CSE-A", semester: 5, department: "Computer Science", academicYear: "2025-2026" },
    { rollNo: "23CS002", name: "Priya Patel", className: "TE-CSE-A", semester: 5, department: "Computer Science", academicYear: "2025-2026" },
    { rollNo: "23CS003", name: "Rohan Verma", className: "TE-CSE-A", semester: 5, department: "Computer Science", academicYear: "2025-2026" },
    { rollNo: "23CS004", name: "Ananya Iyer", className: "TE-CSE-A", semester: 5, department: "Computer Science", academicYear: "2025-2026" },
    { rollNo: "23CS005", name: "Vikram Singh", className: "TE-CSE-A", semester: 5, department: "Computer Science", academicYear: "2025-2026" },
    { rollNo: "23CS006", name: "Sneha Kulkarni", className: "TE-CSE-A", semester: 5, department: "Computer Science", academicYear: "2025-2026" }
  ];

  const stuMap = {};
  for (const st of students) {
    const res = await postJson('/api/students', st);
    stuMap[st.rollNo] = res.id;
  }

  console.log("Entering subject marks...");
  // Marks configuration:
  // Aarav: 92, 95, 90, 88, 94 (Class Topper, Clear Pass)
  // Priya: 84, 88, 82, 85, 89 (2nd Rank, Clear Pass)
  // Rohan: 72, 75, 78, 68, 74 (3rd Rank, Clear Pass)
  // Ananya: 65, 70, 68, 32 (Failed DAA: 32 < 40), 72 (Final Status: Fail)
  // Vikram: Absent in TOC (isAbsent: true), 62, 58, 60, 65 (Final Status: Fail)
  // Sneha: 80, 82, 85 (pending CS504 and CS505 -> Incomplete)

  const marksData = [
    // Aarav
    { stu: "23CS001", sub: "CS501", m: 92, ab: false },
    { stu: "23CS001", sub: "CS502", m: 95, ab: false },
    { stu: "23CS001", sub: "CS503", m: 90, ab: false },
    { stu: "23CS001", sub: "CS504", m: 88, ab: false },
    { stu: "23CS001", sub: "CS505", m: 94, ab: false },

    // Priya
    { stu: "23CS002", sub: "CS501", m: 84, ab: false },
    { stu: "23CS002", sub: "CS502", m: 88, ab: false },
    { stu: "23CS002", sub: "CS503", m: 82, ab: false },
    { stu: "23CS002", sub: "CS504", m: 85, ab: false },
    { stu: "23CS002", sub: "CS505", m: 89, ab: false },

    // Rohan
    { stu: "23CS003", sub: "CS501", m: 72, ab: false },
    { stu: "23CS003", sub: "CS502", m: 75, ab: false },
    { stu: "23CS003", sub: "CS503", m: 78, ab: false },
    { stu: "23CS003", sub: "CS504", m: 68, ab: false },
    { stu: "23CS003", sub: "CS505", m: 74, ab: false },

    // Ananya (Fail in CS504)
    { stu: "23CS004", sub: "CS501", m: 65, ab: false },
    { stu: "23CS004", sub: "CS502", m: 70, ab: false },
    { stu: "23CS004", sub: "CS503", m: 68, ab: false },
    { stu: "23CS004", sub: "CS504", m: 32, ab: false },
    { stu: "23CS004", sub: "CS505", m: 72, ab: false },

    // Vikram (Absent in CS501)
    { stu: "23CS005", sub: "CS501", m: 0,  ab: true },
    { stu: "23CS005", sub: "CS502", m: 62, ab: false },
    { stu: "23CS005", sub: "CS503", m: 58, ab: false },
    { stu: "23CS005", sub: "CS504", m: 60, ab: false },
    { stu: "23CS005", sub: "CS505", m: 65, ab: false },

    // Sneha (Partially entered -> Incomplete)
    { stu: "23CS006", sub: "CS501", m: 80, ab: false },
    { stu: "23CS006", sub: "CS502", m: 82, ab: false },
    { stu: "23CS006", sub: "CS503", m: 85, ab: false }
  ];

  for (const item of marksData) {
    await postJson('/api/results', {
      studentId: stuMap[item.stu],
      subjectId: subMap[item.sub],
      marksObtained: item.m,
      isAbsent: item.ab
    });
  }

  console.log("Demo seed data created successfully!");
}

run().catch(console.error);
