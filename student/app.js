// ═══════════════════════════════════════════════════════════════
//  Result Analyzer — Shared Data Layer & Utilities
//  All pages include this file.
// ═══════════════════════════════════════════════════════════════

// ── Subject Catalog (BTech CSE) ──────────────────────────────
const SUBJECT_CATALOG = {
  1: [
    { code: 'MA101', name: 'Engineering Mathematics I',    credits: 4 },
    { code: 'PH101', name: 'Engineering Physics',          credits: 4 },
    { code: 'CP101', name: 'C Programming',                credits: 3 },
    { code: 'EN101', name: 'English Communication',        credits: 2 },
    { code: 'ED101', name: 'Engineering Drawing',          credits: 2 },
  ],
  2: [
    { code: 'MA201', name: 'Engineering Mathematics II',   credits: 4 },
    { code: 'CH201', name: 'Engineering Chemistry',        credits: 4 },
    { code: 'DS201', name: 'Data Structures',              credits: 3 },
    { code: 'BE201', name: 'Basic Electrical Engineering', credits: 3 },
    { code: 'WS201', name: 'Workshop Practice',            credits: 2 },
  ],
  3: [
    { code: 'MA301', name: 'Engineering Mathematics III',  credits: 4 },
    { code: 'OJ301', name: 'OOP with Java',                credits: 4 },
    { code: 'DE301', name: 'Digital Electronics',          credits: 3 },
    { code: 'DB301', name: 'Database Management Systems',  credits: 4 },
    { code: 'CO301', name: 'Computer Organization',        credits: 3 },
  ],
  4: [
    { code: 'TC401', name: 'Theory of Computation',        credits: 4 },
    { code: 'OS401', name: 'Operating Systems',            credits: 4 },
    { code: 'CN401', name: 'Computer Networks',            credits: 4 },
    { code: 'AA401', name: 'Design & Analysis of Algorithms', credits: 4 },
    { code: 'MP401', name: 'Microprocessors & Interfacing', credits: 3 },
  ],
  5: [
    { code: 'SE501', name: 'Software Engineering',         credits: 4 },
    { code: 'CD501', name: 'Compiler Design',              credits: 4 },
    { code: 'WT501', name: 'Web Technologies',             credits: 4 },
    { code: 'ML501', name: 'Machine Learning',             credits: 4 },
    { code: 'EL501', name: 'Elective I',                   credits: 3 },
  ],
  6: [
    { code: 'IS601', name: 'Information Security',         credits: 4 },
    { code: 'CC601', name: 'Cloud Computing',              credits: 4 },
    { code: 'DM601', name: 'Data Mining & Warehousing',    credits: 4 },
    { code: 'EL601', name: 'Elective II',                  credits: 3 },
    { code: 'PR601', name: 'Project I',                    credits: 2 },
  ],
  7: [
    { code: 'DS701', name: 'Distributed Systems',          credits: 4 },
    { code: 'AI701', name: 'Artificial Intelligence',      credits: 4 },
    { code: 'EL701', name: 'Elective III',                 credits: 3 },
    { code: 'EL702', name: 'Elective IV',                  credits: 3 },
    { code: 'PR701', name: 'Project II',                   credits: 4 },
  ],
  8: [
    { code: 'IN801', name: 'Internship',                   credits: 6 },
    { code: 'PR801', name: 'Final Year Project',           credits: 6 },
  ],
};

// ── Grade Scale ──────────────────────────────────────────────
function getGrade(marks) {
  if (marks >= 90) return { grade: 'O',  points: 10 };
  if (marks >= 80) return { grade: 'A+', points: 9  };
  if (marks >= 70) return { grade: 'A',  points: 8  };
  if (marks >= 60) return { grade: 'B+', points: 7  };
  if (marks >= 50) return { grade: 'B',  points: 6  };
  if (marks >= 45) return { grade: 'C',  points: 5  };
  if (marks >= 40) return { grade: 'P',  points: 4  };
  return               { grade: 'F',  points: 0  };
}

function gradeColor(grade) {
  const map = { O: '#00F0FF', 'A+': '#38BDF8', A: '#4ade80', 'B+': '#a3e635',
                B: '#facc15', C: '#fb923c', P: '#f87171', F: '#ef4444' };
  return map[grade] || '#ffffff';
}

// ── SGPA Calculation ─────────────────────────────────────────
function calcSGPA(subjectMarks) {
  // subjectMarks: array of { credits, total }
  let totalPoints = 0, totalCredits = 0;
  for (const s of subjectMarks) {
    const { points } = getGrade(s.total);
    totalPoints  += points * s.credits;
    totalCredits += s.credits;
  }
  if (totalCredits === 0) return 0;
  return +(totalPoints / totalCredits).toFixed(2);
}

// ── CGPA Calculation ─────────────────────────────────────────
function calcCGPA(studentId) {
  const allMarks = getMarksForStudent(studentId);
  if (!allMarks.length) return 0;
  let totalPoints = 0, totalCredits = 0;
  for (const semRecord of allMarks) {
    for (const s of semRecord.subjects) {
      const { points } = getGrade(s.total);
      totalPoints  += points * s.credits;
      totalCredits += s.credits;
    }
  }
  if (totalCredits === 0) return 0;
  return +(totalPoints / totalCredits).toFixed(2);
}

// ══════════════════════════════════════════════════════════════
//  LOCAL STORAGE LAYER
// ══════════════════════════════════════════════════════════════
const DB = {
  STUDENTS: 'ra_students',
  MARKS:    'ra_marks',
  SESSION:  'ra_session',
};

function dbGet(key)      { return JSON.parse(localStorage.getItem(key) || '[]'); }
function dbSet(key, val) { localStorage.setItem(key, JSON.stringify(val)); }

// Students
function getStudents()            {
  const list = dbGet(DB.STUDENTS);
  return list.map(s => ({
    department: 'Computer Science & Engineering',
    batch: '2021',
    phone: '',
    ...s
  }));
}
function saveStudents(arr)        { dbSet(DB.STUDENTS, arr); }
function getStudent(id)           { return getStudents().find(s => s.id === id) || null; }

function addStudent(data) {
  const students = getStudents();
  const id = 'STU' + Date.now();
  students.push({ id, ...data, createdAt: new Date().toISOString() });
  saveStudents(students);
  return id;
}

function updateStudent(id, data) {
  const students = getStudents().map(s => s.id === id ? { ...s, ...data } : s);
  saveStudents(students);
}

function deleteStudent(id) {
  saveStudents(getStudents().filter(s => s.id !== id));
  // also remove marks
  dbSet(DB.MARKS, dbGet(DB.MARKS).filter(m => m.studentId !== id));
}

// Marks
function getAllMarks()               { return dbGet(DB.MARKS); }
function getMarksForStudent(sid)     { return getAllMarks().filter(m => m.studentId === sid); }
function getMarksForStudentSem(sid, sem) {
  const semNum = Number(sem);
  return getAllMarks().find(m => m.studentId === sid && Number(m.semester) === semNum) || null;
}

function saveMarks(studentId, semester, subjects) {
  const all = getAllMarks();
  const semNum = Number(semester);
  const idx = all.findIndex(m => m.studentId === studentId && Number(m.semester) === semNum);
  const record = {
    id: 'MRK_' + studentId + '_' + semNum,
    studentId,
    semester: semNum,
    subjects,
    updatedAt: new Date().toISOString()
  };
  if (idx >= 0) all[idx] = record; else all.push(record);
  dbSet(DB.MARKS, all);
}

// Session
function setSession(data) { localStorage.setItem(DB.SESSION, JSON.stringify(data)); }
function getSession()     { return JSON.parse(localStorage.getItem(DB.SESSION) || '{}'); }
function clearSession()   { localStorage.removeItem(DB.SESSION); }

// ══════════════════════════════════════════════════════════════
//  ANALYTICS
// ══════════════════════════════════════════════════════════════
function getToppers(semester, limit = 10) {
  const marks = getAllMarks().filter(m => m.semester === semester);
  const students = getStudents();
  return marks
    .map(m => {
      const sgpa = calcSGPA(m.subjects);
      const stu  = students.find(s => s.id === m.studentId);
      return { student: stu, sgpa, semester };
    })
    .filter(x => x.student)
    .sort((a, b) => b.sgpa - a.sgpa)
    .slice(0, limit);
}

function getOverallToppers(limit = 10) {
  const students = getStudents();
  return students
    .map(s => ({ student: s, cgpa: calcCGPA(s.id) }))
    .filter(x => x.cgpa > 0)
    .sort((a, b) => b.cgpa - a.cgpa)
    .slice(0, limit);
}

function getSubjectDifficulty(semester) {
  const catalog = SUBJECT_CATALOG[semester] || [];
  const marks   = getAllMarks().filter(m => m.semester === semester);
  return catalog.map(sub => {
    const allTotals = marks
      .map(m => (m.subjects.find(s => s.code === sub.code) || {}).total)
      .filter(v => v !== undefined);
    const avg      = allTotals.length ? +(allTotals.reduce((a,b)=>a+b,0)/allTotals.length).toFixed(1) : null;
    const passCount= allTotals.filter(v => v >= 40).length;
    const passRate = allTotals.length ? Math.round(passCount / allTotals.length * 100) : null;
    return { ...sub, avg, passRate, count: allTotals.length };
  });
}


// ── Student Lookup by Email ──────────────────────────────────
function getStudentByEmail(email) {
  if (!email) return null;
  const clean = String(email).trim().toLowerCase();
  return getStudents().find(s => {
    const sEmail = (s.email || '').trim().toLowerCase();
    const sRollEmail = (s.rollNo || '').trim().toLowerCase() + '@mitsgwl.ac.in';
    const sRoll = (s.rollNo || '').trim().toLowerCase();
    return sEmail === clean || 
           sRollEmail === clean || 
           (sEmail.replace('@mitsgwalior.in', '@mitsgwl.ac.in') === clean) || 
           sRoll === clean;
  }) || null;
}

function getLoggedInStudent() {
  const session = getSession();
  if (!session || !session.email) return null;
  return getStudentByEmail(session.email);
}

// ── Relative Grading Engine ──────────────────────────────────
function getRelativeGrade(score, allScores) {
  if (score < 40) return { grade: 'F', points: 0 };
  const valid = (allScores || []).filter(s => typeof s === 'number' && !isNaN(s) && s >= 0);
  if (valid.length < 3) {
    return getGrade(score); // Fallback to absolute scale for small samples
  }
  const mean = valid.reduce((a, b) => a + b, 0) / valid.length;
  const sd   = Math.sqrt(valid.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / valid.length) || 1;

  if (score >= mean + 2.0 * sd)   return { grade: 'O',  points: 10 };
  if (score >= mean + 1.5 * sd)   return { grade: 'A+', points: 9  };
  if (score >= mean + 1.0 * sd)   return { grade: 'A',  points: 8  };
  if (score >= mean + 0.5 * sd)   return { grade: 'B+', points: 7  };
  if (score >= mean)              return { grade: 'B',  points: 6  };
  if (score >= mean - 0.5 * sd)   return { grade: 'C',  points: 5  };
  if (score >= 40)                return { grade: 'P',  points: 4  };
  return { grade: 'F', points: 0 };
}

function buildClassMarkMap(sem) {
  const allMarks = getAllMarks().filter(m => m.semester === sem);
  const map = {};
  for (const record of allMarks) {
    for (const s of record.subjects) {
      if (!map[s.code]) map[s.code] = [];
      map[s.code].push(s.total);
    }
  }
  return map;
}

function calcRelativeSGPA(subjects, classMarkMap) {
  if (!subjects || !subjects.length) return 0;
  let tp = 0, tc = 0;
  for (const s of subjects) {
    const allScores = (classMarkMap && classMarkMap[s.code]) ? classMarkMap[s.code] : [];
    const { points } = getRelativeGrade(s.total, allScores);
    tp += points * s.credits;
    tc += s.credits;
  }
  return tc ? +(tp / tc).toFixed(2) : 0;
}

function calcRelativeCGPA(studentId) {
  const allMarks = getMarksForStudent(studentId);
  if (!allMarks.length) return 0;
  let tp = 0, tc = 0;
  for (const record of allMarks) {
    const map = buildClassMarkMap(record.semester);
    for (const s of record.subjects) {
      const allScores = map[s.code] || [];
      const { points } = getRelativeGrade(s.total, allScores);
      tp += points * s.credits;
      tc += s.credits;
    }
  }
  return tc ? +(tp / tc).toFixed(2) : 0;
}

// ── Department & Multi-Branch Hierarchy ──────────────────────
const DEPARTMENT_BRANCH_MAP = {
  'Computer Science & Engineering': [
    'Computer Science & Engineering',
    'CSE',
    'CSE (AI & ML)',
    'CSE (Data Science)',
    'Information Technology',
    'IT'
  ],
  'Electrical & Electronics Engineering': [
    'Electrical Engineering',
    'EE',
    'Electronics & Communication',
    'ECE'
  ],
  'Mechanical Engineering': [
    'Mechanical Engineering',
    'ME',
    'Mechatronics'
  ]
};

function getDepartmentForBranch(branch) {
  if (!branch) return 'Computer Science & Engineering';
  const clean = String(branch).trim().toLowerCase();
  for (const [dept, branches] of Object.entries(DEPARTMENT_BRANCH_MAP)) {
    if (branches.some(b => b.toLowerCase() === clean || clean.includes(b.toLowerCase()))) {
      return dept;
    }
  }
  return 'Computer Science & Engineering';
}

// ── Exam Component Breakdown (Minor, Lab, Major, Total) ──────
function getExamBreakdown(s) {
  const total = Number(s.total) || 0;
  let minor = s.minor !== undefined ? Number(s.minor) : undefined;
  let lab   = s.lab !== undefined ? Number(s.lab) : undefined;
  let major = s.major !== undefined ? Number(s.major) : undefined;

  if (minor === undefined && s.internal !== undefined) {
    minor = Math.round(Number(s.internal) * 0.4);
    lab   = Number(s.internal) - minor;
    major = Number(s.external) !== undefined ? Number(s.external) : (total - Number(s.internal));
  } else if (minor === undefined) {
    minor = Math.round(total * 0.2);
    lab   = Math.round(total * 0.3);
    major = total - (minor + lab);
  }

  return {
    minor: Math.max(0, minor),
    lab: Math.max(0, lab),
    major: Math.max(0, major),
    total: total
  };
}

// ── Multi-Tier Hierarchy Ranks (Class, Branch, Dept, College) ─
function getStudentHierarchyRanks(studentId, semester) {
  const semNum = Number(semester);
  const student = getStudent(studentId);
  if (!student) return null;

  const studentBranch = student.branch || 'CSE';
  const studentDept   = student.department || getDepartmentForBranch(studentBranch);
  const allStudents   = getStudents();
  const classMap      = buildClassMarkMap(semNum);

  // Pool for current semester SGPA
  const semStudents = allStudents.map(s => {
    const semRecord = getMarksForStudentSem(s.id, semNum);
    if (!semRecord) return null;
    const sgpa = calcRelativeSGPA(semRecord.subjects, classMap);
    const sBranch = s.branch || 'CSE';
    const sDept   = s.department || getDepartmentForBranch(sBranch);
    return {
      id: s.id,
      name: s.name,
      rollNo: s.rollNo,
      branch: sBranch,
      department: sDept,
      batch: s.batch || '2021',
      sgpa: sgpa,
      cgpa: calcRelativeCGPA(s.id)
    };
  }).filter(Boolean);

  // Fallback if current student has no record in this semester yet
  const studentSemEntry = semStudents.find(x => x.id === studentId);
  const mySGPA = studentSemEntry ? studentSemEntry.sgpa : 0;
  const myCGPA = calcRelativeCGPA(studentId);

  // 1. College Pool (All students in MITS)
  const collegeSGPA = [...semStudents].sort((a,b) => b.sgpa - a.sgpa);
  const collegeCGPA = [...allStudents].map(s => ({ id: s.id, name: s.name, cgpa: calcRelativeCGPA(s.id), branch: s.branch, department: s.department || getDepartmentForBranch(s.branch) })).filter(x => x.cgpa > 0).sort((a,b) => b.cgpa - a.cgpa);

  // 2. Department Pool (Students across all branches in this department)
  const deptSGPA = collegeSGPA.filter(s => s.department === studentDept);
  const deptCGPA = collegeCGPA.filter(s => s.department === studentDept);

  // 3. Branch Pool (Students in this specific branch)
  const branchSGPA = deptSGPA.filter(s => s.branch.toLowerCase() === studentBranch.toLowerCase());
  const branchCGPA = deptCGPA.filter(s => (s.branch || '').toLowerCase() === studentBranch.toLowerCase());

  // 4. Class / Section Pool (Same batch & branch)
  const classSGPA = branchSGPA.filter(s => (s.batch || '2021') === (student.batch || '2021'));
  const classCGPA = branchCGPA.filter(s => (s.batch || '2021') === (student.batch || '2021'));

  // Calculate Ranks (1-indexed)
  const findRank = (arr, id, key = 'sgpa') => {
    const idx = arr.findIndex(x => x.id === id);
    return idx >= 0 ? idx + 1 : 1;
  };

  const cRank = findRank(classSGPA.length ? classSGPA : branchSGPA, studentId);
  const bRank = findRank(branchSGPA.length ? branchSGPA : collegeSGPA, studentId);
  const dRank = findRank(deptSGPA.length ? deptSGPA : collegeSGPA, studentId);
  const colRank = findRank(collegeSGPA, studentId);

  const cTotal = Math.max(1, (classSGPA.length ? classSGPA : branchSGPA).length);
  const bTotal = Math.max(1, (branchSGPA.length ? branchSGPA : collegeSGPA).length);
  const dTotal = Math.max(1, (deptSGPA.length ? deptSGPA : collegeSGPA).length);
  const colTotal = Math.max(1, collegeSGPA.length);

  // CGPA Ranks
  const cgCRank = findRank(classCGPA.length ? classCGPA : branchCGPA, studentId, 'cgpa');
  const cgBRank = findRank(branchCGPA.length ? branchCGPA : collegeCGPA, studentId, 'cgpa');
  const cgDRank = findRank(deptCGPA.length ? deptCGPA : collegeCGPA, studentId, 'cgpa');
  const cgColRank = findRank(collegeCGPA, studentId, 'cgpa');

  return {
    studentBranch,
    studentDept,
    sgpa: {
      myScore: mySGPA,
      classRank: cRank, classTotal: cTotal, classPct: Math.max(1, Math.round((cTotal - cRank + 1) / cTotal * 100)),
      branchRank: bRank, branchTotal: bTotal, branchPct: Math.max(1, Math.round((bTotal - bRank + 1) / bTotal * 100)),
      deptRank: dRank, deptTotal: dTotal, deptPct: Math.max(1, Math.round((dTotal - dRank + 1) / dTotal * 100)),
      collegeRank: colRank, collegeTotal: colTotal, collegePct: Math.max(1, Math.round((colTotal - colRank + 1) / colTotal * 100)),
      topper: collegeSGPA[0] || null,
      classTopper: classSGPA[0] || branchSGPA[0] || null
    },
    cgpa: {
      myScore: myCGPA,
      classRank: cgCRank, classTotal: Math.max(1, classCGPA.length),
      branchRank: cgBRank, branchTotal: Math.max(1, branchCGPA.length),
      deptRank: cgDRank, deptTotal: Math.max(1, deptCGPA.length),
      collegeRank: cgColRank, collegeTotal: Math.max(1, collegeCGPA.length),
      topper: collegeCGPA[0] || null
    }
  };
}

// ── Subject-Wise Ranking & Difficulty Index ──────────────────
function getSubjectWiseRanking(studentId, semester) {
  const semNum = Number(semester);
  const semRecord = getMarksForStudentSem(studentId, semNum);
  if (!semRecord || !semRecord.subjects) return [];

  const allSemMarks = getAllMarks().filter(m => Number(m.semester) === semNum);
  const students = getStudents();

  return semRecord.subjects.map(s => {
    // Collect all scores for this subject
    const subjectScores = [];
    allSemMarks.forEach(m => {
      const matchSub = m.subjects.find(sub => sub.code === s.code);
      if (matchSub && matchSub.total !== undefined) {
        const stu = students.find(x => x.id === m.studentId);
        subjectScores.push({
          studentId: m.studentId,
          studentName: stu ? stu.name : 'Student',
          score: matchSub.total,
          breakdown: getExamBreakdown(matchSub)
        });
      }
    });

    // Sort descending
    subjectScores.sort((a,b) => b.score - a.score);
    const myRankIdx = subjectScores.findIndex(x => x.studentId === studentId);
    const myRank = myRankIdx >= 0 ? myRankIdx + 1 : 1;
    const totalCount = Math.max(1, subjectScores.length);
    const topper = subjectScores[0] || { studentName: '—', score: s.total };

    // Mean and SD
    const scoresOnly = subjectScores.map(x => x.score);
    const mean = scoresOnly.length ? +(scoresOnly.reduce((a,b)=>a+b,0) / scoresOnly.length).toFixed(1) : s.total;
    const sd = scoresOnly.length > 1
      ? +(Math.sqrt(scoresOnly.reduce((a,b) => a + Math.pow(b - mean, 2), 0) / scoresOnly.length)).toFixed(1)
      : 5.0;

    // Difficulty calculation
    let diffLabel = 'Moderate';
    let diffScore = 6.0; // out of 10
    let diffColor = '#facc15';

    if (mean < 55) {
      diffLabel = 'Tough (Hard Paper)';
      diffScore = 8.8;
      diffColor = '#f87171';
    } else if (mean >= 75) {
      diffLabel = 'Easy / High Scoring';
      diffScore = 3.5;
      diffColor = '#4ade80';
    } else {
      diffLabel = 'Moderate';
      diffScore = 5.8;
      diffColor = '#38BDF8';
    }

    const relGrade = getRelativeGrade(s.total, scoresOnly);

    return {
      code: s.code,
      name: s.name,
      credits: s.credits,
      studentScore: s.total,
      studentRank: myRank,
      totalStudents: totalCount,
      percentile: Math.max(1, Math.round((totalCount - myRank + 1) / totalCount * 100)),
      topperName: topper.studentName,
      topperScore: topper.score,
      avgScore: mean,
      stdDev: sd,
      difficulty: diffLabel,
      diffScore: diffScore,
      diffColor: diffColor,
      grade: relGrade.grade,
      gradePoints: relGrade.points,
      breakdown: getExamBreakdown(s)
    };
  });
}

// ══════════════════════════════════════════════════════════════
//  SAMPLE DATA SEEDER
// ══════════════════════════════════════════════════════════════
function seedSampleData() {
  // Purge any mock sample students previously auto-seeded so faculty starts with their own students
  try {
    const list = dbGet(DB.STUDENTS);
    const mockRolls = new Set([
      'CS2021001','CS2021002','CS2021003','CS2021004','CS2021005',
      'CS2021006','CS2021007','CS2021008','CS2021009','CS2021010',
      'CS2021011','CS2021012','CS2021013','CS2021014','CS2021015'
    ]);
    const filtered = list.filter(s => !mockRolls.has(s.rollNo));
    if (filtered.length !== list.length) {
      dbSet(DB.STUDENTS, filtered);
      const remainingIds = new Set(filtered.map(s => s.id));
      const filteredMarks = dbGet(DB.MARKS).filter(m => remainingIds.has(m.studentId));
      dbSet(DB.MARKS, filteredMarks);
    }
  } catch (err) {}
  // Do NOT add any mock students. Faculty adds all students from Semester 1 to 3 manually.
}

// ══════════════════════════════════════════════════════════════
//  NAV BUILDER  (call buildNav('dashboard') etc.)
// ══════════════════════════════════════════════════════════════
function buildNav(activePage) {
  const session = getSession();
  const role    = session.role || 'faculty';
  
  const facultyLinks = [
    { id: 'faculty',    icon: '🧑‍🏫', label: 'Faculty Portal',      href: '../faculty/frontend/index.html' },
    { id: 'dashboard',  icon: '⊞',   label: 'Student Dashboard',   href: 'dashboard.html' },
    { id: 'ranking',    icon: '🏆',  label: 'Student Rankings',    href: 'ranking.html' },
    { id: 'doubts',     icon: '💡',  label: 'Doubts & Mentors',    href: 'doubts.html' },
    { id: 'results',    icon: '📊',  label: 'Student Results',     href: 'results.html' },
  ];

  const studentLinks = [
    { id: 'dashboard',  icon: '⊞',   label: 'Dashboard',           href: 'dashboard.html' },
    { id: 'ranking',    icon: '🏆',  label: 'Rankings',           href: 'ranking.html' },
    { id: 'doubts',     icon: '💡',  label: 'Doubts & Lectures',   href: 'doubts.html' },
    { id: 'results',    icon: '📊',  label: 'Results',            href: 'results.html' },
  ];

  const visible = role === 'student' ? studentLinks : facultyLinks;

  const linksHTML = visible.map(l => `
    <a href="${l.href}" class="sidebar-link ${l.id === activePage ? 'active' : ''}">
      <span class="sidebar-icon">${l.icon}</span>
      <span class="sidebar-label">${l.label}</span>
      ${l.id === activePage ? '<span class="sidebar-active-pill"></span>' : ''}
    </a>
  `).join('');

  return `
  <!-- Mobile Top Bar (Screen < 992px) -->
  <header class="mobile-top-bar">
    <a class="mobile-brand" href="dashboard.html">
      <img class="nav-logo" src="mits_logo.jpg" alt="MITS" />
      <span class="mobile-title">Result Analyzer</span>
    </a>
    <div style="display:flex;align-items:center;gap:10px">
      <span class="nav-role-badge">${role === 'faculty' ? '🧑‍🏫 Faculty' : '🎓 Student'}</span>
      <button class="nav-hamburger" onclick="toggleSidebarNav()" id="hamburger" aria-label="Toggle Navigation">☰</button>
    </div>
  </header>

  <!-- Mobile Backdrop Overlay -->
  <div class="sidebar-backdrop" id="sidebarBackdrop" onclick="toggleSidebarNav()"></div>

  <!-- Vertical Left Sidebar -->
  <aside class="app-sidebar" id="appSidebar">
    <div class="sidebar-top">
      <a class="sidebar-brand" href="dashboard.html">
        <img class="nav-logo" src="mits_logo.jpg" alt="MITS" />
        <div class="nav-title-wrap">
          <span class="nav-title-main">Result Analyzer</span>
          <span class="nav-title-sub">MITS · CSE Department</span>
        </div>
      </a>

      <div class="sidebar-nav-heading">NAVIGATION MENU</div>
      <nav class="sidebar-nav-links">
        ${linksHTML}
      </nav>
    </div>

    <div class="sidebar-bottom">
      <div class="sidebar-user-card">
        <div class="sidebar-user-avatar">${role === 'faculty' ? '🧑‍🏫' : '🎓'}</div>
        <div class="sidebar-user-details">
          <div class="sidebar-user-name">${escHTML(session.name || (role === 'faculty' ? 'Faculty Admin' : 'Student'))}</div>
          <div class="sidebar-user-email">${escHTML(session.email || '')}</div>
        </div>
      </div>
      <button class="sidebar-logout-btn" onclick="logout()">
        <span>🚪</span>
        <span>Logout</span>
      </button>
    </div>
  </aside>
  `;
}

function logout() {
  clearSession();
  window.location.href = 'login.html';
}

function toggleSidebarNav() {
  const sb = document.getElementById('appSidebar');
  const bd = document.getElementById('sidebarBackdrop');
  if (sb) sb.classList.toggle('open');
  if (bd) bd.classList.toggle('open');
}
window.toggleSidebarNav = toggleSidebarNav;

// ── Element Hover Controller (Individual Bar / Slice Pop-up) ───
function init3DGraphCards() {
  // Whole-card tilt is disabled per user request: cards remain stationary while individual bars/slices pop up
}
window.init3DGraphCards = init3DGraphCards;

// ── Shared Nav CSS (injected into <head>) ────────────────────
const NAV_CSS = `
  /* ── Chart Card & Element Pop-up Styles ── */
  .chart-card-3d {
    transition: border-color 0.25s ease, box-shadow 0.25s ease;
    position: relative;
    border-radius: 16px;
    background: rgba(6,18,38,0.78);
    border: 1px solid rgba(56,189,248,0.22);
    box-shadow: 0 10px 30px rgba(0,0,0,0.5), 0 0 15px rgba(56,189,248,0.06);
  }
  .chart-card-3d:hover {
    border-color: rgba(0, 240, 255, 0.45);
    box-shadow: 0 12px 35px rgba(0,0,0,0.6), 0 0 20px rgba(0,240,255,0.12);
  }
  .chart-3d-inner {
    height: 100%;
    display: flex;
    flex-direction: column;
  }
  .chart-inspector {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: var(--muted);
    background: rgba(2, 10, 24, 0.75);
    border: 1px solid rgba(56, 189, 248, 0.18);
    border-radius: 10px;
    padding: 8px 14px;
    margin: 0 18px 14px 18px;
    min-height: 38px;
    transition: all 0.25s ease;
  }
  .chart-inspector.active {
    border-color: rgba(0, 240, 255, 0.55);
    background: rgba(0, 240, 255, 0.09);
    color: #fff;
    box-shadow: 0 0 18px rgba(0, 240, 255, 0.22);
  }
  .chart-inspector strong {
    color: #00F0FF;
  }

  /* ── Vertical Left Sidebar Layout ── */
  @media (min-width: 992px) {
    body {
      padding-left: 270px !important;
      margin: 0 !important;
    }
    .mobile-top-bar {
      display: none !important;
    }
    .sidebar-backdrop {
      display: none !important;
    }
    .app-sidebar {
      position: fixed;
      top: 0;
      left: 0;
      bottom: 0;
      width: 270px;
      height: 100vh;
      background: linear-gradient(180deg, #030712 0%, #050C1A 50%, #071428 100%);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border-right: 1px solid rgba(0, 240, 255, 0.22);
      box-shadow: 5px 0 30px rgba(0, 0, 0, 0.65);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      z-index: 500;
      overflow-y: auto;
      padding: 22px 16px;
    }
  }

  @media (max-width: 991px) {
    body {
      padding-left: 0 !important;
    }
    .mobile-top-bar {
      position: sticky;
      top: 0;
      z-index: 400;
      height: 62px;
      background: rgba(3, 7, 18, 0.96);
      backdrop-filter: blur(20px);
      border-bottom: 1px solid rgba(0, 240, 255, 0.2);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 18px;
    }
    .mobile-brand {
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
    }
    .mobile-title {
      font-size: 15px;
      font-weight: 800;
      color: #00F0FF;
    }
    .app-sidebar {
      position: fixed;
      top: 0;
      left: -290px;
      bottom: 0;
      width: 280px;
      height: 100vh;
      background: #030712;
      backdrop-filter: blur(24px);
      border-right: 1px solid rgba(0, 240, 255, 0.3);
      box-shadow: 12px 0 40px rgba(0, 0, 0, 0.85);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      z-index: 999;
      padding: 22px 16px;
      transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      overflow-y: auto;
    }
    .app-sidebar.open {
      left: 0 !important;
    }
    .sidebar-backdrop {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(4px);
      z-index: 998;
    }
    .sidebar-backdrop.open {
      display: block !important;
    }
  }

  /* ── Sidebar Branding & Elements ── */
  .sidebar-brand {
    display: flex;
    align-items: center;
    gap: 12px;
    text-decoration: none;
    padding: 6px 8px 18px 8px;
    border-bottom: 1px solid rgba(56, 189, 248, 0.14);
    margin-bottom: 14px;
  }
  .nav-logo {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: #fff;
    padding: 3px;
    object-fit: contain;
    box-shadow: 0 0 14px rgba(0, 240, 255, 0.3);
    flex-shrink: 0;
  }
  .nav-title-wrap {
    display: flex;
    flex-direction: column;
  }
  .nav-title-main {
    font-size: 15px;
    font-weight: 800;
    color: #00F0FF;
    line-height: 1.2;
    letter-spacing: 0.2px;
  }
  .nav-title-sub {
    font-size: 11px;
    color: rgba(186, 230, 253, 0.65);
    font-weight: 500;
  }
  .sidebar-nav-heading {
    font-size: 10.5px;
    font-weight: 700;
    letter-spacing: 1.2px;
    color: rgba(186, 230, 253, 0.45);
    text-transform: uppercase;
    padding: 8px 10px 10px 10px;
  }
  .sidebar-nav-links {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .sidebar-link {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 11px 16px;
    border-radius: 12px;
    color: rgba(186, 230, 253, 0.8);
    text-decoration: none;
    font-size: 13.5px;
    font-weight: 600;
    border: 1px solid transparent;
    transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    user-select: none;
  }
  .sidebar-link:hover {
    color: #00F0FF;
    background: rgba(0, 240, 255, 0.08);
    border-color: rgba(0, 240, 255, 0.25);
    transform: translateX(4px);
  }
  .sidebar-link.active {
    color: #00F0FF;
    background: linear-gradient(90deg, rgba(0, 240, 255, 0.16), rgba(0, 163, 255, 0.06));
    border-color: rgba(0, 240, 255, 0.4);
    box-shadow: 0 0 16px rgba(0, 240, 255, 0.18);
    font-weight: 700;
  }
  .sidebar-icon {
    font-size: 18px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    flex-shrink: 0;
  }
  .sidebar-label {
    flex-grow: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .sidebar-active-pill {
    width: 6px;
    height: 18px;
    background: #00F0FF;
    border-radius: 3px;
    box-shadow: 0 0 8px #00F0FF;
  }

  /* ── Sidebar Bottom User Card ── */
  .sidebar-bottom {
    margin-top: auto;
    padding-top: 16px;
    border-top: 1px solid rgba(56, 189, 248, 0.15);
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .sidebar-user-card {
    background: rgba(2, 10, 24, 0.65);
    border: 1px solid rgba(56, 189, 248, 0.18);
    border-radius: 12px;
    padding: 10px 12px;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .sidebar-user-avatar {
    width: 34px;
    height: 34px;
    border-radius: 9px;
    background: rgba(0, 240, 255, 0.12);
    border: 1px solid rgba(0, 240, 255, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    flex-shrink: 0;
  }
  .sidebar-user-details {
    overflow: hidden;
    flex-grow: 1;
  }
  .sidebar-user-name {
    font-size: 12.5px;
    font-weight: 700;
    color: #fff;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .sidebar-user-email {
    font-size: 10.5px;
    color: rgba(186, 230, 253, 0.6);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-family: monospace;
  }
  .sidebar-logout-btn {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 9px 14px;
    border-radius: 10px;
    border: 1px solid rgba(239, 68, 68, 0.35);
    background: rgba(239, 68, 68, 0.08);
    color: #f87171;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }
  .sidebar-logout-btn:hover {
    background: rgba(239, 68, 68, 0.2);
    border-color: rgba(239, 68, 68, 0.6);
    box-shadow: 0 0 14px rgba(239, 68, 68, 0.3);
  }
  .nav-hamburger {
    background: rgba(0, 240, 255, 0.1);
    border: 1px solid rgba(0, 240, 255, 0.3);
    color: #00F0FF;
    font-size: 18px;
    padding: 6px 12px;
    border-radius: 8px;
    cursor: pointer;
  }
  .nav-role-badge {
    font-size: 12px;
    padding: 4px 10px;
    border-radius: 14px;
    background: rgba(0, 240, 255, 0.1);
    border: 1px solid rgba(0, 240, 255, 0.25);
    color: #38BDF8;
    font-weight: 600;
  }
`;

// ── Common page init ─────────────────────────────────────────
function initPage(pageId) {
  seedSampleData();
  // Inject nav CSS
  const style = document.createElement('style');
  style.textContent = NAV_CSS;
  document.head.appendChild(style);
  // Build nav
  const navEl = document.getElementById('appNav');
  if (navEl) navEl.innerHTML = buildNav(pageId);

  // Initialize interactive 3D graph tilt after DOM render
  setTimeout(init3DGraphCards, 150);
}

// ── Utility helpers ──────────────────────────────────────────
function fmt2(n)   { return isNaN(n) ? '—' : n.toFixed(2); }
function pct(n)    { return isNaN(n) || n === null ? '—' : n + '%'; }
function escHTML(s){ return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

// Make globally available
window.RA = {
  SUBJECT_CATALOG, getGrade, gradeColor, calcSGPA, calcCGPA,
  getRelativeGrade, buildClassMarkMap, calcRelativeSGPA, calcRelativeCGPA,
  DEPARTMENT_BRANCH_MAP, getDepartmentForBranch, getExamBreakdown,
  getStudentHierarchyRanks, getSubjectWiseRanking,
  getStudents, getStudent, getStudentByEmail, getLoggedInStudent,
  addStudent, updateStudent, deleteStudent,
  getAllMarks, getMarksForStudent, getMarksForStudentSem, saveMarks,
  getToppers, getOverallToppers, getSubjectDifficulty,
  getSession, setSession, clearSession, logout,
  initPage, fmt2, pct, escHTML,
};
