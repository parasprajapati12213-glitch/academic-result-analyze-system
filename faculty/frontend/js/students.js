// students.js — Student Management Page

let _students = [];

async function loadStudents() {
  const sr = await API.getStudents();
  _students = sr.ok ? sr.data : [];

  document.getElementById('pageContent').innerHTML = `
    <div class="page-header">
      <div>
        <h1>Students</h1>
        <p>Manage student records, roll numbers, and classes</p>
      </div>
      <button class="btn btn-primary" onclick="openAddStudentModal()">+ Add Student</button>
    </div>

    <div class="card">
      <div class="filter-bar">
        <input type="text" class="search-input" id="studentSearch"
          placeholder="Search by student name or roll number..." oninput="filterStudents()">
        <select class="form-control" style="width:auto" id="semesterFilter" onchange="filterStudents()">
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
  const q   = (document.getElementById('studentSearch')?.value || '').toLowerCase();
  const sem = document.getElementById('semesterFilter')?.value || '';
  const filtered = _students.filter(st =>
    (!q || st.name.toLowerCase().includes(q) || st.rollNo.toLowerCase().includes(q) || (st.email && st.email.toLowerCase().includes(q))) &&
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
            <th>Semester</th>
            <th>Department</th>
            <th>Session</th>
            <th style="text-align:center;">Actions</th>
          </tr>
        </thead>
        <tbody>
          ${students.map((st, i) => `
            <tr>
              <td>${i + 1}</td>
              <td><code><strong>${escHtml(st.rollNo)}</strong></code></td>
              <td>
                <strong>${escHtml(st.name)}</strong>
                <br>
                <small style="color:var(--slate-500); font-family:monospace; font-size:11px;">✉ ${escHtml(st.email || 'No email assigned')}</small>
              </td>
              <td>${escHtml(st.className || 'CSBS-A')}</td>
              <td>Sem ${st.semester}</td>
              <td>${escHtml(st.department || 'Computer Science')}</td>
              <td>${escHtml(st.academicYear || '2025-26')}</td>
              <td style="text-align:center;">
                <div style="display:inline-flex; gap:6px;">
                  <button class="btn btn-outline btn-sm" onclick="viewTranscript('${st.id}')">Marksheet</button>
                  <button class="btn btn-outline btn-sm" onclick="openEditStudentModal('${st.id}')">Edit</button>
                  <button class="btn btn-outline btn-sm" style="color:var(--danger);" onclick="deleteStudent('${st.id}','${escHtml(st.name)}')">Delete</button>
                </div>
              </td>
            </tr>
          `).join('')}
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
        <input type="email" class="form-control" id="sEmail" placeholder="e.g. aarav.sharma@mitsgwalior.in">
        <small style="color:var(--slate-500); font-size:11px; display:block; margin-top:2px;">Student logs in with this email to view their result & dashboard.</small>
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
        <input type="email" class="form-control" id="eEmail" value="${escHtml(st.email || '')}" placeholder="e.g. aarav.sharma@mitsgwalior.in">
        <small style="color:var(--slate-500); font-size:11px; display:block; margin-top:2px;">Student logs in with this email to view their result & dashboard.</small>
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
  const body = {
    name:         document.getElementById('eName').value.trim(),
    rollNo:       document.getElementById('eRoll').value.trim(),
    email:        (document.getElementById('eEmail')?.value || '').trim(),
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
