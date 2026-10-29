// teachers.js — Teacher & Faculty Management Page
// Simple college words: "Teachers", "Add Teacher", "Assigned Classes", "Assigned Subjects"

let _allTeachers = [];
let _teacherSubjects = [];

async function loadTeachers() {
  const contentEl = document.getElementById('pageContent');
  if (!contentEl) return;

  contentEl.innerHTML = `
    <div class="page-header">
      <div>
        <h1>Teachers &amp; Faculty</h1>
        <p>Manage teachers, assigned courses, and class sections</p>
      </div>
      <div class="action-btns">
        <button class="btn btn-primary" onclick="openAddTeacherModal()">+ Add Teacher</button>
      </div>
    </div>

    <!-- Filter & Search Bar -->
    <div class="card" style="margin-bottom: 20px;">
      <div class="form-row-3" style="align-items: flex-end;">
        <div class="form-group" style="margin-bottom: 0;">
          <label class="form-label">Search Teachers</label>
          <input type="text" class="form-control" id="searchTeacherInput" placeholder="Search by name or employee ID..." oninput="renderTeachersTable()">
        </div>
        <div class="form-group" style="margin-bottom: 0;">
          <label class="form-label">Filter by Designation</label>
          <select class="form-control" id="filterTeacherDesig" onchange="renderTeachersTable()">
            <option value="">All Designations</option>
            <option value="Professor">Professors</option>
            <option value="Associate Professor">Associate Professors</option>
            <option value="Assistant Professor">Assistant Professors</option>
          </select>
        </div>
        <div class="form-group" style="margin-bottom: 0;">
          <button class="btn btn-outline" onclick="loadTeachers()" style="width: 100%;">↺ Refresh</button>
        </div>
      </div>
    </div>

    <!-- Teachers Table Card -->
    <div class="card">
      <div class="card-header">
        <h2>Faculty List (<span id="teacherCount">0</span> Teachers)</h2>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th style="width: 40px;">#</th>
              <th>Emp ID</th>
              <th>Teacher Name</th>
              <th>Designation</th>
              <th>Department</th>
              <th>Email</th>
              <th>Assigned Classes</th>
              <th style="text-align: center;">Actions</th>
            </tr>
          </thead>
          <tbody id="teachersTableBody">
            <tr><td colspan="8" style="text-align:center; padding:30px;">Loading teachers...</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;

  const [tr, sr] = await Promise.all([
    API.getTeachers(),
    API.getSubjects()
  ]);

  _allTeachers = tr.ok ? tr.data : [];
  _teacherSubjects = sr.ok ? sr.data : [];

  renderTeachersTable();
}

function renderTeachersTable() {
  const tbody = document.getElementById('teachersTableBody');
  const countEl = document.getElementById('teacherCount');
  if (!tbody) return;

  const query = (document.getElementById('searchTeacherInput')?.value || '').toLowerCase().trim();
  const desig = document.getElementById('filterTeacherDesig')?.value || '';

  const filtered = _allTeachers.filter(t => {
    if (query && !t.name.toLowerCase().includes(query) && !t.employeeId.toLowerCase().includes(query)) return false;
    if (desig && !t.designation.includes(desig)) return false;
    return true;
  });

  if (countEl) countEl.textContent = filtered.length;

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align:center; padding:40px; color:var(--slate-500);">
          No teachers found matching your search.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map((t, idx) => {
    const classes = (t.assignedClasses || []).map(c => 
      `<span class="badge" style="background:#eff6ff; color:#1e40af; border:1px solid #bfdbfe; font-size:11px; margin:2px;">${escHtml(c)}</span>`
    ).join('') || '<span style="color:var(--slate-400);">None</span>';

    return `
      <tr>
        <td>${idx + 1}</td>
        <td><code><strong>${escHtml(t.employeeId || '—')}</strong></code></td>
        <td>
          <strong style="color:var(--slate-900);">${escHtml(t.name)}</strong>
        </td>
        <td><span class="badge" style="background:var(--slate-100); color:var(--slate-700); font-size:11px;">${escHtml(t.designation || 'Faculty')}</span></td>
        <td style="font-size:12px; color:var(--slate-600);">${escHtml(t.department || 'Centre for CST')}</td>
        <td style="font-size:12px;"><code>${escHtml(t.email || '—')}</code></td>
        <td>${classes}</td>
        <td style="text-align: center;">
          <div style="display:flex; gap:6px; justify-content:center;">
            <button class="btn btn-outline btn-sm" onclick="openEditTeacherModal('${t.id}')">Edit</button>
            <button class="btn btn-sm" style="background:#fee2e2; color:#dc2626; border:1px solid #fecaca;" onclick="deleteTeacherConfirm('${t.id}', '${escHtml(t.name)}')">Delete</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function openAddTeacherModal() {
  showModal(
    'Add New Teacher',
    `
      <form id="addTeacherForm" onsubmit="saveTeacherSubmit(event)">
        <div class="form-row">
          <div class="form-group" style="flex:1;">
            <label class="form-label">Employee ID *</label>
            <input type="text" class="form-control" id="tchEmpId" placeholder="e.g. EMP115" required>
          </div>
          <div class="form-group" style="flex:2;">
            <label class="form-label">Full Name *</label>
            <input type="text" class="form-control" id="tchName" placeholder="e.g. Dr. Ramesh Gupta" required>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group" style="flex:1;">
            <label class="form-label">Designation</label>
            <select class="form-control" id="tchDesig">
              <option value="Professor">Professor</option>
              <option value="Associate Professor">Associate Professor</option>
              <option value="Assistant Professor" selected>Assistant Professor</option>
              <option value="Visiting Faculty">Visiting Faculty</option>
            </select>
          </div>
          <div class="form-group" style="flex:1;">
            <label class="form-label">Department</label>
            <input type="text" class="form-control" id="tchDept" value="Centre for Computer Science and Technology">
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Email Address</label>
          <input type="email" class="form-control" id="tchEmail" placeholder="e.g. name@mitsgwalior.in">
        </div>

        <div class="form-group">
          <label class="form-label">Assigned Classes (Hold Ctrl to select multiple)</label>
          <select multiple class="form-control" id="tchClasses" style="height:70px;">
            <option value="CSBS-A" selected>CSBS-A</option>
            <option value="CSBS-B" selected>CSBS-B</option>
          </select>
        </div>
      </form>
    `,
    `
      <button class="btn btn-outline" onclick="hideModal()">Cancel</button>
      <button class="btn btn-primary" onclick="document.getElementById('addTeacherForm').requestSubmit()">Save Teacher</button>
    `
  );
}

function openEditTeacherModal(id) {
  const t = _allTeachers.find(x => x.id === id);
  if (!t) return;

  showModal(
    'Edit Teacher',
    `
      <form id="editTeacherForm" onsubmit="updateTeacherSubmit(event, '${id}')">
        <div class="form-row">
          <div class="form-group" style="flex:1;">
            <label class="form-label">Employee ID *</label>
            <input type="text" class="form-control" id="editTchEmpId" value="${escHtml(t.employeeId)}" required>
          </div>
          <div class="form-group" style="flex:2;">
            <label class="form-label">Full Name *</label>
            <input type="text" class="form-control" id="editTchName" value="${escHtml(t.name)}" required>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group" style="flex:1;">
            <label class="form-label">Designation</label>
            <select class="form-control" id="editTchDesig">
              <option value="Professor" ${t.designation==='Professor'?'selected':''}>Professor</option>
              <option value="Associate Professor" ${t.designation==='Associate Professor'?'selected':''}>Associate Professor</option>
              <option value="Assistant Professor" ${t.designation==='Assistant Professor'?'selected':''}>Assistant Professor</option>
              <option value="Visiting Faculty" ${t.designation==='Visiting Faculty'?'selected':''}>Visiting Faculty</option>
            </select>
          </div>
          <div class="form-group" style="flex:1;">
            <label class="form-label">Department</label>
            <input type="text" class="form-control" id="editTchDept" value="${escHtml(t.department || 'Centre for Computer Science and Technology')}">
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Email Address</label>
          <input type="email" class="form-control" id="editTchEmail" value="${escHtml(t.email || '')}">
        </div>

        <div class="form-group">
          <label class="form-label">Assigned Classes</label>
          <select multiple class="form-control" id="editTchClasses" style="height:70px;">
            <option value="CSBS-A" ${(t.assignedClasses||[]).includes('CSBS-A')?'selected':''}>CSBS-A</option>
            <option value="CSBS-B" ${(t.assignedClasses||[]).includes('CSBS-B')?'selected':''}>CSBS-B</option>
          </select>
        </div>
      </form>
    `,
    `
      <button class="btn btn-outline" onclick="hideModal()">Cancel</button>
      <button class="btn btn-primary" onclick="document.getElementById('editTeacherForm').requestSubmit()">Save Changes</button>
    `
  );
}

async function saveTeacherSubmit(e) {
  e.preventDefault();
  const employeeId = document.getElementById('tchEmpId').value.trim();
  const name = document.getElementById('tchName').value.trim();
  const designation = document.getElementById('tchDesig').value;
  const department = document.getElementById('tchDept').value.trim();
  const email = document.getElementById('tchEmail').value.trim();
  const classesSel = document.getElementById('tchClasses');
  const assignedClasses = Array.from(classesSel.selectedOptions).map(o => o.value);

  const res = await API.addTeacher({ employeeId, name, designation, department, email, assignedClasses });
  if (res.ok) {
    hideModal();
    showToast(`Teacher ${name} added successfully!`, 'success');
    loadTeachers();
  } else {
    showToast(res.error || 'Failed to add teacher.', 'error');
  }
}

async function updateTeacherSubmit(e, id) {
  e.preventDefault();
  const employeeId = document.getElementById('editTchEmpId').value.trim();
  const name = document.getElementById('editTchName').value.trim();
  const designation = document.getElementById('editTchDesig').value;
  const department = document.getElementById('editTchDept').value.trim();
  const email = document.getElementById('editTchEmail').value.trim();
  const classesSel = document.getElementById('editTchClasses');
  const assignedClasses = Array.from(classesSel.selectedOptions).map(o => o.value);

  const res = await API.updateTeacher(id, { employeeId, name, designation, department, email, assignedClasses });
  if (res.ok) {
    hideModal();
    showToast('Teacher record updated!', 'success');
    loadTeachers();
  } else {
    showToast(res.error || 'Failed to update teacher.', 'error');
  }
}

async function deleteTeacherConfirm(id, name) {
  if (!confirm(`Are you sure you want to remove teacher "${name}"?`)) return;
  const res = await API.deleteTeacher(id);
  if (res.ok) {
    showToast('Teacher removed successfully.', 'info');
    loadTeachers();
  } else {
    showToast(res.error || 'Failed to delete teacher.', 'error');
  }
}
