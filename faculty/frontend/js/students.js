// students.js — Student Management Page

let _students = [];
let _studentRanksMap = {};

async function loadStudents() {
  const [sr, ranksMap] = await Promise.all([
    API.getStudents(),
    (typeof API.getStudentRankingsMap === 'function') ? API.getStudentRankingsMap() : {}
  ]);
  _students = sr.ok ? sr.data : [];
  _studentRanksMap = ranksMap || {};

  const uniqueClasses = Array.from(new Set(_students.map(s => s.className || 'CSBS-A'))).filter(Boolean).sort();

  document.getElementById('pageContent').innerHTML = `
    <div class="page-header">
      <div>
        <h1>Students &amp; Cohort Rankings</h1>
        <p>Manage student records, roll numbers, class sections, and academic standing</p>
      </div>
      <button class="btn btn-primary" onclick="openAddStudentModal()">+ Add Student</button>
    </div>

    <div class="card">
      <div class="filter-bar" style="display:flex; gap:12px; flex-wrap:wrap; align-items:center;">
        <input type="text" class="search-input" id="studentSearch" style="flex:1; min-width:240px;"
          placeholder="Search by student name or roll number..." oninput="filterStudents()">
        <select class="form-control" style="width:auto; min-width:160px;" id="classFilter" onchange="filterStudents()">
          <option value="">All Classes / Sections</option>
          ${uniqueClasses.map(c => `<option value="${c}">Class ${c}</option>`).join('')}
        </select>
        <select class="form-control" style="width:auto; min-width:140px;" id="semesterFilter" onchange="filterStudents()">
          <option value="">All Semesters</option>
          ${[1,2,3,4,5,6,7,8].map(s=>`<option value="${s}">Semester ${s}</option>`).join('')}
        </select>
      </div>
      <div id="studentsTable"></div>
    </div>
  `;

  filterStudents();
}

function filterStudents() {
  const q   = (document.getElementById('studentSearch')?.value || '').toLowerCase().trim();
  const cls = (document.getElementById('classFilter')?.value || '').trim();
  const sem = (document.getElementById('semesterFilter')?.value || '').trim();
  const filtered = _students.filter(st =>
    (!q || st.name.toLowerCase().includes(q) || st.rollNo.toLowerCase().includes(q) || (st.email && st.email.toLowerCase().includes(q))) &&
    (!cls || (st.className || 'CSBS-A') === cls) &&
    (!sem || String(st.semester) === sem)
  );
  renderStudentsTable(filtered);
}

function renderStudentsTable(students) {
  const el = document.getElementById('studentsTable');
  if (!el) return;
  if (students.length === 0) {
    el.innerHTML = emptyState('👨‍🎓', 'No Students Found',
      _students.length === 0 ? 'Click below to add your first student.' : 'No students match your search.',
      _students.length === 0 ? `<button class="btn btn-primary" onclick="openAddStudentModal()">Add Student</button>` : '');
    return;
  }

  el.innerHTML = `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th style="width:36px;">#</th>
            <th>Roll No</th>
            <th>Student Name</th>
            <th>Class</th>
            <th style="text-align:center;">Class Rank</th>
            <th style="text-align:center;">Dept &amp; College Rank</th>
            <th style="text-align:center;">CGPA</th>
            <th>Semester</th>
            <th style="text-align:center;">Actions</th>
          </tr>
        </thead>
        <tbody>
          ${students.map((st, i) => {
            const rk = _studentRanksMap[st.id] || _studentRanksMap[st.rollNo];
            const classRankBadge = rk ? `
              <span class="badge" style="background:rgba(245,158,11,0.14);border:1px solid rgba(245,158,11,0.35);color:#fbbf24;font-weight:700;padding:4px 10px;border-radius:8px">
                ${rk.classRank === 1 ? '🥇 #1' : rk.classRank === 2 ? '🥈 #2' : rk.classRank === 3 ? '🥉 #3' : '#' + rk.classRank} <small style="opacity:0.85">of ${rk.totalInClass}</small>
              </span>
            ` : '<span style="color:var(--slate-500)">—</span>';

            const multiRankInfo = rk ? `
              <div style="font-size:11.5px;color:var(--slate-400);line-height:1.4">
                <div>🏛️ Dept: <strong style="color:var(--sky)">#${rk.deptRank}</strong> <span style="opacity:0.7">/${rk.totalInDept}</span></div>
                <div>🎓 College: <strong style="color:#c4b5fd">#${rk.collegeRank}</strong> <span style="opacity:0.7">/${rk.totalInCollege}</span></div>
              </div>
            ` : '<span style="color:var(--slate-500)">—</span>';

            const cgpaDisplay = rk && rk.cgpa > 0 ? `
              <strong style="color:var(--cyan);font-size:14px;font-weight:800">${fmt2(rk.cgpa)}</strong>
            ` : '<span style="color:var(--slate-500)">—</span>';

            return `
              <tr>
                <td>${i + 1}</td>
                <td><code><strong>${escHtml(st.rollNo)}</strong></code></td>
                <td>
                  <strong>${escHtml(st.name)}</strong>
                  <br>
                  <small style="color:var(--slate-500); font-family:monospace; font-size:11px;">✉ ${escHtml(st.email || 'No email assigned')}</small>
                </td>
                <td><span class="badge" style="background:rgba(56,189,248,0.12);color:var(--sky);border-color:rgba(56,189,248,0.3)">${escHtml(st.className || 'CSBS-A')}</span></td>
                <td style="text-align:center;">${classRankBadge}</td>
                <td style="text-align:center;">${multiRankInfo}</td>
                <td style="text-align:center;">${cgpaDisplay}</td>
                <td>Sem ${st.semester}</td>
                <td style="text-align:center;">
                  <div style="display:inline-flex; gap:6px;">
                    <button class="btn btn-outline btn-sm" onclick="viewTranscript('${st.id}')">Marksheet</button>
                    <button class="btn btn-outline btn-sm" onclick="openEditStudentModal('${st.id}')">Edit</button>
                    <button class="btn btn-outline btn-sm" style="color:var(--danger);" onclick="deleteStudent('${st.id}','${escHtml(st.name)}')">Delete</button>
                  </div>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function openAddStudentModal() {
  showModal('Add Student', `
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Student Name <span class="required">*</span></label>
        <input type="text" class="form-control" id="sName" placeholder="e.g. Aarav Sharma">
      </div>
      <div class="form-group">
        <label class="form-label">Roll Number <span class="required">*</span></label>
        <input type="text" class="form-control" id="sRoll" placeholder="e.g. 0901CSBS251001">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Student College Email ID <span class="required">*</span></label>
        <input type="email" class="form-control" id="sEmail" placeholder="e.g. rollno@mitsgwl.ac.in or student@mitsgwl.ac.in">
        <small style="color:var(--sky); font-size:11px; display:block; margin-top:2px;">Must end with <strong>@mitsgwl.ac.in</strong> for student login.</small>
      </div>
      <div class="form-group">
        <label class="form-label">Class / Section</label>
        <input type="text" class="form-control" id="sClass" value="CSBS-A">
      </div>
    </div>
      <div class="form-group">
        <label class="form-label">Semester</label>
        <select class="form-control" id="sSem">
          ${[1,2,3,4,5,6,7,8].map(s=>`<option value="${s}" ${s===(window._settings?.currentSemester||1)?'selected':''}>Semester ${s}</option>`).join('')}
        </select>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Department</label>
        <input type="text" class="form-control" id="sDept" value="${escHtml(window._settings?.department||'Department of Computer Science and Technology')}">
      </div>
      <div class="form-group">
        <label class="form-label">Session</label>
        <input type="text" class="form-control" id="sYear" value="${escHtml(window._settings?.academicYear||'2025-2026')}">
      </div>
    </div>`,
    `<button class="btn btn-outline" onclick="hideModal()">Cancel</button>
     <button class="btn btn-primary" onclick="submitAddStudent()">Save Student</button>`
  );
}

async function submitAddStudent() {
  const name   = document.getElementById('sName').value.trim();
  const rollNo = document.getElementById('sRoll').value.trim();
  const email  = (document.getElementById('sEmail')?.value || '').trim();

  if (!name)   { showToast('Please enter student name.', 'error'); return; }
  if (!rollNo) { showToast('Please enter roll number.', 'error'); return; }
  if (!email)  { showToast('Please enter student college email ID.', 'error'); return; }
  if (!email.toLowerCase().endsWith('@mitsgwl.ac.in')) {
    showToast('Student college email must end with @mitsgwl.ac.in', 'error');
    return;
  }

  const body = {
    name, rollNo, email,
    className:    document.getElementById('sClass').value.trim(),
    semester:     parseInt(document.getElementById('sSem').value),
    department:   document.getElementById('sDept').value.trim(),
    academicYear: document.getElementById('sYear').value.trim(),
  };

  const r = await API.addStudent(body);
  if (r.ok) {
    hideModal();
    showToast(`Student "${name}" added!`, 'success');
    loadStudents();
  } else {
    showToast(r.error, 'error');
  }
}

function openEditStudentModal(id) {
  const st = _students.find(s => s.id === id);
  if (!st) return;
  showModal('Edit Student', `
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Student Name</label>
        <input type="text" class="form-control" id="eName" value="${escHtml(st.name)}">
      </div>
      <div class="form-group">
        <label class="form-label">Roll Number</label>
        <input type="text" class="form-control" id="eRoll" value="${escHtml(st.rollNo)}">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Student College Email ID</label>
        <input type="email" class="form-control" id="eEmail" value="${escHtml(st.email || '')}" placeholder="e.g. rollno@mitsgwl.ac.in">
        <small style="color:var(--sky); font-size:11px; display:block; margin-top:2px;">Must end with <strong>@mitsgwl.ac.in</strong> for student login.</small>
      </div>
      <div class="form-group">
        <label class="form-label">Class</label>
        <input type="text" class="form-control" id="eClass" value="${escHtml(st.className)}">
      </div>
    </div>
      <div class="form-group">
        <label class="form-label">Semester</label>
        <select class="form-control" id="eSem">
          ${[1,2,3,4,5,6,7,8].map(s=>`<option value="${s}" ${s===st.semester?'selected':''}>Semester ${s}</option>`).join('')}
        </select>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Department</label>
        <input type="text" class="form-control" id="eDept" value="${escHtml(st.department)}">
      </div>
      <div class="form-group">
        <label class="form-label">Session</label>
        <input type="text" class="form-control" id="eYear" value="${escHtml(st.academicYear)}">
      </div>
    </div>`,
    `<button class="btn btn-outline" onclick="hideModal()">Cancel</button>
     <button class="btn btn-primary" onclick="submitEditStudent('${id}')">Save Changes</button>`
  );
}

async function submitEditStudent(id) {
  const email = (document.getElementById('eEmail')?.value || '').trim();
  if (email && !email.toLowerCase().endsWith('@mitsgwl.ac.in')) {
    showToast('Student college email must end with @mitsgwl.ac.in', 'error');
    return;
  }
  const body = {
    name:         document.getElementById('eName').value.trim(),
    rollNo:       document.getElementById('eRoll').value.trim(),
    email:        email,
    className:    document.getElementById('eClass').value.trim(),
    semester:     parseInt(document.getElementById('eSem').value),
    department:   document.getElementById('eDept').value.trim(),
    academicYear: document.getElementById('eYear').value.trim(),
  };
  const r = await API.updateStudent(id, body);
  if (r.ok) {
    hideModal();
    showToast('Student updated successfully.', 'success');
    loadStudents();
  } else {
    showToast(r.error, 'error');
  }
}

async function deleteStudent(id, name) {
  showModal('Delete Student',
    `<div class="warn-alert">Are you sure you want to delete <strong>${escHtml(name)}</strong>?<br>All marks entered for this student will also be deleted.</div>`,
    `<button class="btn btn-outline" onclick="hideModal()">Cancel</button>
     <button class="btn btn-danger" id="confirmDelBtn">Delete</button>`
  );
  document.getElementById('confirmDelBtn').onclick = async () => {
    const r = await API.deleteStudent(id);
    if (r.ok) {
      hideModal();
      showToast(`Student "${name}" deleted.`, 'success');
      loadStudents();
    } else {
      showToast(r.error, 'error');
    }
  };
}

function viewTranscript(id) {
  window._preloadReportId = id;
  location.hash = '#results';
}
