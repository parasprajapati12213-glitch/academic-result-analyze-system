/**
 * Academic Result Analyzer — Unified Relational Database Engine
 * Persistent, ACID-safe, relational data layer linking Students, Teachers, Marks, Rankings, Doubts & Messages.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.join(__dirname, 'store');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function hashPassword(password, salt) {
  salt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return { hash, salt };
}

function verifyPassword(password, hash, salt) {
  const verify = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return verify === hash;
}

class RelationalDB {
  constructor() {
    this.tables = {
      users: [],
      students: [],
      teachers: [],
      subjects: [],
      results: [],
      rankings: [],
      doubts: [],
      messages: [],
      notifications: [],
      sessions: [],
    };
    this.indexes = {
      userByEmail: new Map(),
      studentByRoll: new Map(),
      studentById: new Map(),
      teacherById: new Map(),
      subjectById: new Map(),
      resultsByStudent: new Map(),
    };
    this.init();
  }

  getFilePath(table) {
    return path.join(DATA_DIR, `${table}.json`);
  }

  loadTable(table) {
    const file = this.getFilePath(table);
    if (fs.existsSync(file)) {
      try {
        const raw = fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '');
        return JSON.parse(raw);
      } catch (e) {
        console.warn(`Error reading ${table}.json:`, e.message);
        return [];
      }
    }
    return [];
  }

  saveTable(table) {
    const file = this.getFilePath(table);
    const tmp = `${file}.tmp`;
    const data = JSON.stringify(this.tables[table], null, 2);
    fs.writeFileSync(tmp, data, 'utf8');
    fs.renameSync(tmp, file);
  }

  init() {
    // 1. Load existing or initialize
    for (const key of Object.keys(this.tables)) {
      this.tables[key] = this.loadTable(key);
    }

    // 2. If subjects empty, seed from faculty/backend/data/subjects.json
    if (!this.tables.subjects.length) {
      this.seedSubjects();
    }

    // 3. If teachers empty, seed from faculty/backend/data/teachers.json
    if (!this.tables.teachers.length) {
      this.seedTeachers();
    }

    // 4. If students empty, seed from faculty/backend/data/students.json
    if (!this.tables.students.length) {
      this.seedStudents();
    }

    // 5. If results empty, seed from faculty/backend/data/results.json
    if (!this.tables.results.length) {
      this.seedResults();
    }

    // 6. Ensure default accounts (Students & Faculty)
    this.ensureUserAccounts();

    // 7. Build indexes
    this.rebuildIndexes();

    console.log(`✅ Relational DB Ready: ${this.tables.students.length} Students, ${this.tables.teachers.length} Teachers, ${this.tables.subjects.length} Subjects, ${this.tables.results.length} Results, ${this.tables.users.length} Auth Users.`);
  }

  seedSubjects() {
    const p = path.join(__dirname, '..', '..', 'faculty', 'backend', 'data', 'subjects.json');
    if (fs.existsSync(p)) {
      const raw = fs.readFileSync(p, 'utf8').replace(/^\uFEFF/, '');
      this.tables.subjects = JSON.parse(raw);
      this.saveTable('subjects');
    }
  }

  seedTeachers() {
    const p = path.join(__dirname, '..', '..', 'faculty', 'backend', 'data', 'teachers.json');
    if (fs.existsSync(p)) {
      const raw = fs.readFileSync(p, 'utf8').replace(/^\uFEFF/, '');
      const list = JSON.parse(raw);
      this.tables.teachers = list.map(t => ({
        id: t.id,
        name: t.name,
        email: (t.email || `${t.name.toLowerCase().replace(/[^a-z]/g, '')}@mitsgwalior.in`).toLowerCase(),
        department: t.department || 'Centre for Computer Science and Technology',
        designation: t.designation || 'Assistant Professor',
        phone: t.phone || '9876543210',
        availableSlots: [
          { day: 'Monday', time: '3:00 PM - 4:00 PM' },
          { day: 'Wednesday', time: '2:00 PM - 3:00 PM' },
          { day: 'Friday', time: '4:00 PM - 5:00 PM' },
        ],
        subjectIds: t.coursesTaught || [],
      }));
      this.saveTable('teachers');
    }
  }

  seedStudents() {
    const p = path.join(__dirname, '..', '..', 'faculty', 'backend', 'data', 'students.json');
    if (fs.existsSync(p)) {
      const raw = fs.readFileSync(p, 'utf8').replace(/^\uFEFF/, '');
      const list = JSON.parse(raw);
      this.tables.students = list.map(s => ({
        id: s.id,
        rollNo: s.rollNo,
        name: s.name,
        email: (s.email || `${s.rollNo.toLowerCase()}@mitsgwl.ac.in`).toLowerCase(),
        className: s.className || s.branch || 'CSBS-B',
        branch: s.branch || 'CSBS',
        department: s.department || 'Centre for Computer Science and Technology',
        semester: s.semester || 3,
        batch: s.academicYear || '2025-2026',
      }));
      this.saveTable('students');
    }
  }

  seedResults() {
    const p = path.join(__dirname, '..', '..', 'faculty', 'backend', 'data', 'results.json');
    if (fs.existsSync(p)) {
      const raw = fs.readFileSync(p, 'utf8').replace(/^\uFEFF/, '');
      this.tables.results = JSON.parse(raw).map(r => ({
        ...r,
        isPublished: true,
      }));
      this.saveTable('results');
    }
  }

  ensureUserAccounts() {
    const defaultPassword = 'Password@123';
    const emailSet = new Set(this.tables.users.map(u => u.email.toLowerCase()));

    // 1. Ensure faculty accounts
    this.tables.teachers.forEach(t => {
      const email = t.email.toLowerCase();
      if (!emailSet.has(email)) {
        const { hash, salt } = hashPassword(defaultPassword);
        this.tables.users.push({
          id: t.id,
          email,
          fullName: t.name,
          role: 'faculty',
          passwordHash: hash,
          salt,
          referenceId: t.id,
          createdAt: new Date().toISOString(),
        });
        emailSet.add(email);
      }
    });

    // Add admin faculty account
    if (!emailSet.has('admin@mitsgwalior.in')) {
      const { hash, salt } = hashPassword('Admin@123');
      this.tables.users.push({
        id: 'user_admin',
        email: 'admin@mitsgwalior.in',
        fullName: 'Academic In-Charge',
        role: 'faculty',
        passwordHash: hash,
        salt,
        referenceId: 't_admin',
        createdAt: new Date().toISOString(),
      });
      emailSet.add('admin@mitsgwalior.in');
    }

    // 2. Ensure student accounts (including Paras Prajapati)
    this.tables.students.forEach(s => {
      const email = s.email.toLowerCase();
      if (!emailSet.has(email)) {
        const { hash, salt } = hashPassword(defaultPassword);
        this.tables.users.push({
          id: s.id,
          email,
          fullName: s.name,
          role: 'student',
          rollNo: s.rollNo,
          passwordHash: hash,
          salt,
          referenceId: s.id,
          createdAt: new Date().toISOString(),
        });
        emailSet.add(email);
      }

      // Add alias for Paras: 25chtpas@mitsgwl.ac.in
      if ((s.rollNo === 'BTCB25O1089' || s.name.toLowerCase().includes('paras')) && !emailSet.has('25chtpas@mitsgwl.ac.in')) {
        const { hash, salt } = hashPassword(defaultPassword);
        this.tables.users.push({
          id: 'user_paras_alias',
          email: '25chtpas@mitsgwl.ac.in',
          fullName: s.name,
          role: 'student',
          rollNo: s.rollNo,
          passwordHash: hash,
          salt,
          referenceId: s.id,
          createdAt: new Date().toISOString(),
        });
        emailSet.add('25chtpas@mitsgwl.ac.in');
      }
    });

    this.saveTable('users');
  }

  rebuildIndexes() {
    this.indexes.userByEmail.clear();
    this.indexes.studentByRoll.clear();
    this.indexes.studentById.clear();
    this.indexes.teacherById.clear();
    this.indexes.subjectById.clear();
    this.indexes.resultsByStudent.clear();

    for (const u of this.tables.users) {
      this.indexes.userByEmail.set(u.email.toLowerCase(), u);
    }
    for (const s of this.tables.students) {
      this.indexes.studentById.set(s.id, s);
      if (s.rollNo) this.indexes.studentByRoll.set(s.rollNo.toLowerCase(), s);
    }
    for (const t of this.tables.teachers) {
      this.indexes.teacherById.set(t.id, t);
    }
    for (const sub of this.tables.subjects) {
      this.indexes.subjectById.set(sub.id, sub);
      if (sub.code) this.indexes.subjectById.set(sub.code, sub);
    }
    for (const r of this.tables.results) {
      let list = this.indexes.resultsByStudent.get(r.studentId);
      if (!list) {
        list = [];
        this.indexes.resultsByStudent.set(r.studentId, list);
      }
      list.push(r);
    }
  }

  // ── Authentication API ──────────────────────────────────────────
  login(email, password) {
    const clean = String(email || '').trim().toLowerCase();
    const user = this.indexes.userByEmail.get(clean);
    if (!user) {
      return { ok: false, error: 'User with this email not found' };
    }
    if (!verifyPassword(password, user.passwordHash, user.salt)) {
      return { ok: false, error: 'Invalid password' };
    }

    // Generate bearer token
    const token = 'mits_token_' + crypto.randomBytes(24).toString('hex');
    const session = {
      token,
      userId: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
      rollNo: user.rollNo || null,
      referenceId: user.referenceId,
      expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days
    };
    this.tables.sessions.push(session);
    this.saveTable('sessions');

    return {
      ok: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
        rollNo: user.rollNo || null,
        referenceId: user.referenceId,
      },
    };
  }

  register(data) {
    const email = String(data.email || '').trim().toLowerCase();
    if (this.indexes.userByEmail.has(email)) {
      return { ok: false, error: 'An account with this email already exists' };
    }

    let role = data.role;
    if (email.endsWith('@mitsgwalior.in')) role = 'faculty';
    else if (email.endsWith('@mitsgwl.ac.in')) role = 'student';
    else if (!role) role = 'student';

    const { hash, salt } = hashPassword(data.password);
    const userId = 'usr_' + Date.now() + '_' + crypto.randomBytes(4).toString('hex');

    let refId = userId;
    if (role === 'student') {
      const stuId = 's_mits_' + (data.rollNo || Date.now());
      refId = stuId;
      const stuObj = {
        id: stuId,
        rollNo: (data.rollNo || 'BTCB25' + Math.floor(Math.random() * 9000 + 1000)).toUpperCase(),
        name: data.fullName,
        email: email,
        className: data.className || 'CSBS-B',
        branch: 'CSBS',
        department: 'Centre for Computer Science and Technology',
        semester: Number(data.semester) || 1,
        batch: '2025-2026',
      };
      this.tables.students.push(stuObj);
      this.saveTable('students');
    } else {
      const facId = 't_' + Date.now();
      refId = facId;
      const facObj = {
        id: facId,
        name: data.fullName,
        email: email,
        department: data.department || 'Centre for Computer Science and Technology',
        designation: data.designation || 'Assistant Professor',
        phone: data.phone || '',
        availableSlots: [
          { day: 'Monday', time: '3:00 PM - 4:00 PM' },
          { day: 'Wednesday', time: '2:00 PM - 3:00 PM' },
          { day: 'Friday', time: '4:00 PM - 5:00 PM' },
        ],
        subjectIds: [],
      };
      this.tables.teachers.push(facObj);
      this.saveTable('teachers');
    }

    const newUser = {
      id: userId,
      email,
      fullName: data.fullName,
      role,
      rollNo: data.rollNo || null,
      passwordHash: hash,
      salt,
      referenceId: refId,
      createdAt: new Date().toISOString(),
    };
    this.tables.users.push(newUser);
    this.saveTable('users');
    this.rebuildIndexes();

    return this.login(email, data.password);
  }

  verifySession(token) {
    if (!token) return null;
    const cleanToken = token.replace('Bearer ', '').trim();
    const s = this.tables.sessions.find(x => x.token === cleanToken && x.expiresAt > Date.now());
    if (!s) return null;
    const user = this.tables.users.find(u => u.id === s.userId);
    return user ? {
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
      rollNo: user.rollNo,
      referenceId: user.referenceId,
    } : null;
  }

  logout(token) {
    const cleanToken = (token || '').replace('Bearer ', '').trim();
    this.tables.sessions = this.tables.sessions.filter(s => s.token !== cleanToken);
    this.saveTable('sessions');
    return { ok: true };
  }

  // ── Marks & Results ─────────────────────────────────────────────
  getResultsForStudent(studentIdOrRoll) {
    const clean = String(studentIdOrRoll || '').trim().toLowerCase();
    let stu = this.indexes.studentById.get(studentIdOrRoll);
    if (!stu) stu = this.indexes.studentByRoll.get(clean);
    if (!stu) stu = this.tables.students.find(s => s.id === studentIdOrRoll || s.rollNo.toLowerCase() === clean);

    const targetId = stu ? stu.id : studentIdOrRoll;
    const rawResults = this.tables.results.filter(r => r.studentId === targetId || r.studentId === clean);

    // Group by semester
    const semMap = {};
    for (const r of rawResults) {
      const sub = this.indexes.subjectById.get(r.subjectId) || this.tables.subjects.find(s => s.id === r.subjectId || s.code === r.subjectId);
      if (!sub) continue;
      const sem = sub.semester || 1;
      if (!semMap[sem]) semMap[sem] = [];

      const m = r.isAbsent ? 0 : (r.marksObtained >= 0 ? r.marksObtained : 0);
      const gr = r.finalGrade || (m >= 90 ? 'O' : m >= 80 ? 'A+' : m >= 70 ? 'A' : m >= 60 ? 'B+' : m >= 50 ? 'B' : m >= 40 ? 'C' : 'F');
      const gp = r.finalGradePoint !== undefined ? r.finalGradePoint : (m >= 90 ? 10 : m >= 80 ? 9 : m >= 70 ? 8 : m >= 60 ? 7 : m >= 50 ? 6 : m >= 40 ? 5 : 0);

      const courseObj = {
        code: sub.code,
        name: sub.name,
        credits: sub.credits || 3,
        minor: Math.round(m * 0.2),
        lab: Math.round(m * 0.3),
        major: Math.round(m * 0.5),
        internal: Math.round(m * 0.4),
        external: Math.round(m * 0.6),
        total: m,
        grade: gr,
        points: gp,
      };
      const existingIdx = semMap[sem].findIndex(x => x.code === sub.code);
      if (existingIdx >= 0) semMap[sem][existingIdx] = courseObj;
      else semMap[sem].push(courseObj);
      if (false) semMap[sem].push({
        code: sub.code,
        name: sub.name,
        credits: sub.credits || 3,
        minor: Math.round(m * 0.2),
        lab: Math.round(m * 0.3),
        major: Math.round(m * 0.5),
        internal: Math.round(m * 0.4),
        external: Math.round(m * 0.6),
        total: m,
        grade: gr,
        points: gp,
      });
    }

    return Object.keys(semMap).map(semStr => ({
      id: `MRK_${targetId}_${semStr}`,
      studentId: targetId,
      semester: Number(semStr),
      subjects: semMap[semStr],
      updatedAt: new Date().toISOString(),
    })).sort((a,b) => a.semester - b.semester);
  }

  saveMark(data, updatedBy) {
    const { studentId, subjectId, marksObtained, isAbsent } = data;
    const m = isAbsent ? 0 : Number(marksObtained || 0);
    const finalGrade = isAbsent ? 'AB' : (m >= 90 ? 'O' : m >= 80 ? 'A+' : m >= 70 ? 'A' : m >= 60 ? 'B+' : m >= 50 ? 'B' : m >= 40 ? 'C' : 'F');
    const finalGradePoint = isAbsent ? 0.0 : (m >= 90 ? 10.0 : m >= 80 ? 9.0 : m >= 70 ? 8.0 : m >= 60 ? 7.0 : m >= 50 ? 6.0 : m >= 40 ? 5.0 : 0.0);

    const targetSub = this.tables.subjects.find(s => s.id === subjectId || s.code === subjectId);
    const resolvedSubId = targetSub ? targetSub.id : subjectId;
    const idx = this.tables.results.findIndex(r => 
      r.studentId === studentId && 
      (r.subjectId === resolvedSubId || r.subjectId === subjectId || (targetSub && (r.subjectId === targetSub.code || r.subjectId === targetSub.id)))
    );
    let record = null;
    if (idx >= 0) {
      record = {
        ...this.tables.results[idx],
        marksObtained: m,
        isAbsent: Boolean(isAbsent),
        finalGrade,
        finalGradePoint,
        isPublished: true,
        updatedBy: updatedBy || 'faculty',
        updatedAt: new Date().toISOString(),
      };
      this.tables.results[idx] = record;
    } else {
      record = {
        id: 'res_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
        studentId,
        subjectId,
        marksObtained: m,
        isAbsent: Boolean(isAbsent),
        finalGrade,
        finalGradePoint,
        isPublished: true,
        updatedBy: updatedBy || 'faculty',
        updatedAt: new Date().toISOString(),
      };
      this.tables.results.push(record);
    }
    this.saveTable('results');
    this.rebuildIndexes();

    // Trigger Notification for student
    const stu = this.tables.students.find(s => s.id === studentId);
    if (stu) {
      const sub = this.tables.subjects.find(s => s.id === subjectId || s.code === subjectId);
      this.createNotification({
        userId: stu.id,
        title: 'Marks Updated by Faculty',
        message: `Your marks for ${sub ? sub.name : 'your subject'} were updated to ${m} (${finalGrade}).`,
        type: 'marks',
        link: 'dashboard.html',
      });
    }

    return record;
  }

  // ── Doubt Sessions ──────────────────────────────────────────────
  bookDoubt(data) {
    const student = this.tables.students.find(s => s.id === data.studentId || s.email === data.studentEmail);
    const teacher = this.tables.teachers.find(t => t.id === data.teacherId);
    const subject = this.tables.subjects.find(s => s.id === data.subjectId || s.code === data.subjectId);

    const sessionObj = {
      id: 'dbt_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      studentId: student ? student.id : data.studentId,
      studentName: student ? student.name : (data.studentName || 'Student'),
      studentRoll: student ? student.rollNo : (data.studentRoll || ''),
      studentEmail: student ? student.email : (data.studentEmail || ''),
      teacherId: teacher ? teacher.id : data.teacherId,
      teacherName: teacher ? teacher.name : (data.teacherName || 'Faculty Mentor'),
      subjectId: subject ? subject.id : data.subjectId,
      subjectName: subject ? subject.name : (data.subjectName || 'General Doubt'),
      topic: data.topic || 'Doubt Consultation',
      description: data.description || '',
      slotDate: data.slotDate || new Date().toISOString().split('T')[0],
      slotTime: data.slotTime || '3:00 PM - 4:00 PM',
      status: 'pending', // 'pending' | 'accepted' | 'rejected' | 'completed'
      responseNote: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.tables.doubts.unshift(sessionObj);
    this.saveTable('doubts');

    // Notify teacher
    this.createNotification({
      userId: sessionObj.teacherId,
      title: 'New Student Doubt Booking',
      message: `${sessionObj.studentName} (${sessionObj.studentRoll}) booked a session on "${sessionObj.topic}" for ${sessionObj.slotDate} (${sessionObj.slotTime}).`,
      type: 'doubt',
      link: '#doubts',
    });

    return sessionObj;
  }

  updateDoubtStatus(doubtId, status, responseNote, teacherId) {
    const idx = this.tables.doubts.findIndex(d => d.id === doubtId);
    if (idx < 0) return null;

    const d = this.tables.doubts[idx];
    d.status = status;
    d.responseNote = responseNote || '';
    d.updatedAt = new Date().toISOString();
    this.tables.doubts[idx] = d;
    this.saveTable('doubts');

    // Notify student
    this.createNotification({
      userId: d.studentId,
      title: `Doubt Request ${status.toUpperCase()}`,
      message: `Your faculty mentor ${d.teacherName} marked your doubt session on "${d.topic}" as ${status.toUpperCase()}.${responseNote ? ' Note: ' + responseNote : ''}`,
      type: 'doubt',
      link: 'doubts.html',
    });

    return d;
  }

  getDoubtsForUser(userId, role) {
    if (role === 'faculty') {
      return this.tables.doubts.filter(d => d.teacherId === userId);
    }
    return this.tables.doubts.filter(d => d.studentId === userId);
  }

  // ── Messaging ───────────────────────────────────────────────────
  sendMessage(senderId, receiverId, content) {
    const sender = this.tables.users.find(u => u.id === senderId) || { fullName: 'User', role: 'student' };
    const receiver = this.tables.users.find(u => u.id === receiverId) || { fullName: 'Recipient', role: 'faculty' };

    const msg = {
      id: 'msg_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      senderId,
      senderName: sender.fullName,
      senderRole: sender.role,
      receiverId,
      receiverName: receiver.fullName,
      receiverRole: receiver.role,
      content,
      readAt: null,
      createdAt: new Date().toISOString(),
    };

    this.tables.messages.push(msg);
    this.saveTable('messages');

    // Notify receiver
    this.createNotification({
      userId: receiverId,
      title: `New Message from ${sender.fullName}`,
      message: content.length > 60 ? content.substring(0, 57) + '...' : content,
      type: 'message',
      link: sender.role === 'student' ? '#messages' : 'doubts.html',
    });

    return msg;
  }

  getConversation(user1, user2) {
    return this.tables.messages.filter(m =>
      (m.senderId === user1 && m.receiverId === user2) ||
      (m.senderId === user2 && m.receiverId === user1)
    ).sort((a,b) => new Date(a.createdAt) - new Date(b.createdAt));
  }

  // ── Notifications ───────────────────────────────────────────────
  createNotification(notif) {
    const n = {
      id: 'notif_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      userId: notif.userId,
      title: notif.title,
      message: notif.message,
      type: notif.type || 'info',
      link: notif.link || '',
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    this.tables.notifications.unshift(n);
    if (this.tables.notifications.length > 500) this.tables.notifications.pop();
    this.saveTable('notifications');
    return n;
  }

  getNotifications(userId) {
    return this.tables.notifications.filter(n => n.userId === userId).slice(0, 50);
  }

  markNotificationRead(id) {
    const n = this.tables.notifications.find(x => x.id === id);
    if (n) {
      n.isRead = true;
      this.saveTable('notifications');
    }
  }

  markAllNotificationsRead(userId) {
    this.tables.notifications.forEach(n => {
      if (n.userId === userId) n.isRead = true;
    });
    this.saveTable('notifications');
  }
}

const db = new RelationalDB();
module.exports = db;
