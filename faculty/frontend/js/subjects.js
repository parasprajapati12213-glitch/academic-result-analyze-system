// subjects.js — Subjects & Credits Management

let _subjectsPage = [];

async function loadSubjects() {
  const r = await API.getSubjects();
  _subjectsPage = r.ok ? r.data : [];

  document.getElementById('pageContent').innerHTML = `
    <div class="page-header">
      <div>
        <h1>Subjects &amp; Credits</h1>
        <p>B. Tech. Computer Science and Business Systems (CSBS) · Course Scheme</p>
      </div>
      <button class="btn btn-primary" onclick="openAddSubjectModal()">+ Add Subject</button>
    </div>

    <div class="card">
      <div class="filter-bar">
        <input type="text" class="search-input" id="subSearch"
          placeholder="Search by code, category, or subject name..." oninput="filterSubjects()">
        <select class="form-control" style="width:auto" id="subSemFilter" onchange="filterSubjects()">
          <option value="">All Semesters</option>
          ${[1,2,3,4,5,6,7,8].map(s=>`<option value="${s}">Semester ${s}</option>`).join('')}
        </select>
      </div>
      <div id="subjectsTable"></div>
    </div>

    <div class="info-alert">
      💡 <strong>Subject Categories:</strong> 
      <strong>DC:</strong> Core Theory · 
      <strong>ESC:</strong> Engineering Science · 
      <strong>BSC:</strong> Basic Science · 
      <strong>DLC:</strong> Practical Lab · 
      <strong>PBL:</strong> Project · 
      <strong>SP:</strong> Semester Proficiency · 
      <strong>NEC:</strong> Novel Engaging Course · 
      <strong>HSMC:</strong> Humanities &amp; Language.
    </div>
  `;

  filterSubjects();
}

function filterSubjects() {
  const q   = (document.getElementById('subSearch')?.value || '').toLowerCase();
  const sem = document.getElementById('subSemFilter')?.value || '';
  const filtered = _subjectsPage.filter(s =>
    (!q || s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q) || (s.categoryCode && s.categoryCode.toLowerCase().includes(q))) &&
    (!sem || String(s.semester) === sem)
  );
  renderSubjectsTable(filtered);
}

function renderSubjectsTable(subjects) {
  const el = document.getElementById('subjectsTable');
  if (!el) return;
  if (subjects.length === 0) {
    el.innerHTML = emptyState('📚', 'No Subjects Found',
      _subjectsPage.length === 0 ? 'Click below to add a subject.' : 'No subjects match your filter.',
      _subjectsPage.length === 0 ? `<button class="btn btn-primary" onclick="openAddSubjectModal()">Add Subject</button>` : '');
    return;
  }

  el.innerHTML = `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th style="width:36px;">#</th>
            <th>Subject Code</th>
            <th>Category</th>
            <th>Subject Name</th>
            <th style="text-align:center;">Credits</th>
            <th style="text-align:center;">Max Marks</th>
            <th style="text-align:center;">Pass Marks</th>
            <th style="text-align:center;">Semester</th>
            <th style="text-align:center;">Actions</th>
          </tr>
        </thead>
        <tbody>
          ${subjects.map((s, i) => `
            <tr>
              <td>${i + 1}</td>
              <td><code><strong>${escHtml(s.code)}</strong></code></td>
              <td><span style="font-size:11px; font-weight:700; color:var(--slate-500);">${escHtml(s.categoryCode || 'DC')}</span></td>
              <td><strong>${escHtml(s.name)}</strong></td>
              <td style="text-align:center; font-weight:700; color:var(--mits-blue); font-size:14px;">${s.credits}</td>
              <td style="text-align:center;">${s.maxMarks}</td>
              <td style="text-align:center;">${s.passingMarks}</td>
              <td style="text-align:center;">Sem ${s.semester}</td>
              <td style="text-align:center;">
                <div style="display:inline-flex; gap:6px;">
                  <button class="btn btn-outline btn-sm" onclick="openEditSubjectModal('${s.id}')">Edit</button>
                  <button class="btn btn-outline btn-sm" style="color:var(--danger);" onclick="deleteSubject('${s.id}','${escHtml(s.name)}')">Delete</button>
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function subjectModalForm(s = {}) {
  return `
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Subject Name <span class="required">*</span></label>
        <input type="text" class="form-control" id="subName" value="${escHtml(s.name||'')}" placeholder="e.g. Data Structures">
      </div>
      <div class="form-group">
        <label class="form-label">Subject Code <span class="required">*</span></label>
        <input type="text" class="form-control" id="subCode" value="${escHtml(s.code||'')}" placeholder="e.g. 30251101">
      </div>
    </div>
    <div class="form-row-3">
      <div class="form-group">
        <label class="form-label">Category</label>
        <select class="form-control" id="subCat">
          ${['DC', 'ESC', 'BSC', 'DLC', 'PBL', 'HSMC', 'SP', 'NEC', 'SIP', 'SLP', 'MAC', 'MWS'].map(cat => `
            <option value="${cat}" ${cat === (s.categoryCode || 'DC') ? 'selected' : ''}>${cat}</option>
          `).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Credits <span class="required">*</span></label>
        <input type="number" class="form-control" id="subCred" value="${s.credits !== undefined ? s.credits : 3.0}" min="0" step="0.5">
        <span class="form-hint">Used for SGPA &amp; CGPA</span>
      </div>
      <div class="form-group">
        <label class="form-label">Semester</label>
        <select class="form-control" id="subSem">
          ${[1,2,3,4,5,6,7,8].map(n=>`<option value="${n}" ${n===(s.semester||(window._settings?.currentSemester||1))?'selected':''}>Semester ${n}</option>`).join('')}
        </select>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Total Marks <span class="required">*</span></label>
        <input type="number" class="form-control" id="subMax" value="${s.maxMarks||100}" min="1" step="1">
      </div>
      <div class="form-group">
        <label class="form-label">Passing Marks <span class="required">*</span></label>
        <input type="number" class="form-control" id="subPass" value="${s.passingMarks||40}" min="0" step="1">
      </div>
    </div>
  `;
}

function getSubjectFormData() {
  const name = document.getElementById('subName').value.trim();
  const code = document.getElementById('subCode').value.trim();
  const categoryCode = document.getElementById('subCat').value.trim();
  const maxMarks     = parseFloat(document.getElementById('subMax').value);
  const passingMarks = parseFloat(document.getElementById('subPass').value);
  const credits      = parseFloat(document.getElementById('subCred').value);
  const semester     = parseInt(document.getElementById('subSem').value);

  if (!name) { showToast('Please enter subject name.', 'error'); return null; }
  if (!code) { showToast('Please enter subject code.', 'error'); return null; }
  if (!maxMarks || maxMarks <= 0) { showToast('Total marks must be greater than 0.', 'error'); return null; }
  if (isNaN(passingMarks) || passingMarks < 0 || passingMarks > maxMarks) {
    showToast('Passing marks must be between 0 and total marks.', 'error'); return null;
  }
  if (isNaN(credits) || credits < 0) { showToast('Credits cannot be negative.', 'error'); return null; }

  return { name, code, categoryCode, maxMarks, passingMarks, credits, semester };
}

function openAddSubjectModal() {
  showModal('Add New Subject', subjectModalForm(),
    `<button class="btn btn-outline" onclick="hideModal()">Cancel</button>
     <button class="btn btn-primary" onclick="submitAddSubject()">Add Subject</button>`);
}

async function submitAddSubject() {
  const body = getSubjectFormData();
  if (!body) return;
  const r = await API.addSubject(body);
  if (r.ok) { hideModal(); showToast(`Subject "${body.name}" added!`, 'success'); loadSubjects(); }
  else showToast(r.error, 'error');
}

function openEditSubjectModal(id) {
  const s = _subjectsPage.find(x => x.id === id);
  if (!s) return;
  showModal('Edit Subject', subjectModalForm(s),
    `<button class="btn btn-outline" onclick="hideModal()">Cancel</button>
     <button class="btn btn-primary" onclick="submitEditSubject('${id}')">Save Changes</button>`);
}

async function submitEditSubject(id) {
  const body = getSubjectFormData();
  if (!body) return;
  const r = await API.updateSubject(id, body);
  if (r.ok) { hideModal(); showToast('Subject updated!', 'success'); loadSubjects(); }
  else showToast(r.error, 'error');
}

async function deleteSubject(id, name) {
  showModal('Delete Subject',
    `<div class="warn-alert">Delete subject <strong>${escHtml(name)}</strong>?<br>All marks entered for this subject will also be deleted.</div>`,
    `<button class="btn btn-outline" onclick="hideModal()">Cancel</button>
     <button class="btn btn-danger" id="subDelBtn">Delete</button>`);
  document.getElementById('subDelBtn').onclick = async () => {
    const r = await API.deleteSubject(id);
    if (r.ok) {
      hideModal();
      showToast(`Subject "${name}" deleted.`, 'success');
      loadSubjects();
    } else showToast(r.error, 'error');
  };
}
