// marks.js — Student Marks Entry Page

async function loadMarks() {
  const [sr, subr] = await Promise.all([API.getStudents(), API.getSubjects()]);
  const students = sr.ok ? sr.data : [];
  const subjects = subr.ok ? subr.data : [];

  document.getElementById('pageContent').innerHTML = `
    <div class="page-header">
      <div>
        <h1>Enter Marks</h1>
        <p>Enter subject-wise marks and grades for each student</p>
      </div>
      <div class="action-btns">
        <button class="btn btn-primary" onclick="navigate('grading')">⚖️ Relative Grading</button>
      </div>
    </div>

    ${students.length === 0 || subjects.length === 0 ? `
    <div class="warn-alert">
      Please add at least one student and one subject before entering marks.
    </div>` : ''}

    <div class="card">
      <div class="card-header">
        <h2>Select Student</h2>
      </div>
      <div class="form-group" style="max-width:440px;">
        <label class="form-label">Student</label>
        <select class="form-control" id="markStudentSel" onchange="loadStudentMarks()">
          <option value="">— Choose a student —</option>
          ${students.map(st => `
            <option value="${st.id}">
              ${escHtml(st.rollNo)} — ${escHtml(st.name)} (Semester ${st.semester} · ${escHtml(st.className)})
            </option>
          `).join('')}
        </select>
      </div>

      <div id="marksFormArea"></div>
    </div>
  `;

  window._marksSubjects = subjects;
  window._marksStudents = students;
}

async function loadStudentMarks() {
  const studentId = document.getElementById('markStudentSel').value;
  const area = document.getElementById('marksFormArea');
  if (!studentId) { area.innerHTML = ''; return; }

  const student = window._marksStudents.find(s => s.id === studentId);
  const subjects = window._marksSubjects.filter(s => s.semester === student.semester);

  if (subjects.length === 0) {
    area.innerHTML = `<div class="warn-alert">No subjects found for Semester ${student.semester}. Please add subjects in the Subjects page.</div>`;
    return;
  }

  const rr = await API.getResults({ studentId });
  const existing = rr.ok ? rr.data : [];
  const resultMap = {};
  existing.forEach(r => { resultMap[r.subjectId] = r; });

  area.innerHTML = `
    <div style="margin:20px 0 12px; padding:12px 16px; background:var(--slate-50); border:1px solid var(--slate-200); border-radius:var(--radius-sm); display:flex; justify-content:space-between; align-items:center;">
      <div>
        <span style="font-size:11px; text-transform:uppercase; color:var(--slate-500); font-weight:700;">Student:</span>
        <strong style="font-size:14px; color:var(--slate-900);">${escHtml(student.name)} (${escHtml(student.rollNo)})</strong>
      </div>
      <div style="font-size:12px; color:var(--slate-600);">
        Semester: <strong>Semester ${student.semester} (${subjects.length} Subjects)</strong>
      </div>
    </div>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Code</th>
            <th>Type</th>
            <th>Subject Name</th>
            <th style="text-align:center;">Credits</th>
            <th style="text-align:center;">Total Marks</th>
            <th style="width:130px;">Marks Scored</th>
            <th style="text-align:center;">Absent</th>
            <th style="text-align:center;">Grade</th>
            <th style="text-align:center;">Grade Point</th>
            <th style="text-align:center;">Action</th>
          </tr>
        </thead>
        <tbody>
          ${subjects.map(sub => {
            const ex = resultMap[sub.id];
            const marksVal = ex ? (ex.isAbsent ? '' : (ex.marksObtained >= 0 ? ex.marksObtained : '')) : '';
            const isAbsent = ex?.isAbsent || false;

            return `
              <tr id="row_${sub.id}">
                <td><code><strong>${escHtml(sub.code)}</strong></code></td>
                <td><span style="font-size:11px; font-weight:700; color:var(--slate-500);">${escHtml(sub.categoryCode || 'DC')}</span></td>
                <td><strong>${escHtml(sub.name)}</strong></td>
                <td style="text-align:center; font-weight:600;">${sub.credits}</td>
                <td style="text-align:center;">${sub.maxMarks}</td>
                <td>
                  <input type="number" class="form-control" style="width:100px; padding:4px 8px; font-weight:700;"
                    id="m_${sub.id}" value="${marksVal}" min="0" max="${sub.maxMarks}" step="0.5"
                    placeholder="Marks" ${isAbsent ? 'disabled' : ''}
                    oninput="previewCourseGrade('${sub.id}', ${sub.maxMarks})">
                </td>
                <td style="text-align:center;">
                  <input type="checkbox" id="abs_${sub.id}" ${isAbsent ? 'checked' : ''}
                    onchange="toggleCourseAbsent('${sub.id}', ${sub.maxMarks})">
                </td>
                <td style="text-align:center;" id="gradeCol_${sub.id}">
                  —
                </td>
                <td style="text-align:center; font-weight:700;" id="gpCol_${sub.id}">
                  —
                </td>
                <td style="text-align:center;">
                  <button class="btn btn-outline btn-sm" onclick="saveSingleCourseMark('${studentId}', '${sub.id}', ${sub.maxMarks})">
                    Save
                  </button>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>

    <div style="margin-top:20px; display:flex; justify-content:space-between; align-items:center;">
      <div style="font-size:12px; color:var(--slate-500);">
        Minimum passing marks: 40% (Grade C, Grade Point 5.0).
      </div>
      <div style="display:flex; gap:8px;">
        <button class="btn btn-outline" onclick="loadStudentMarks()">↺ Reset</button>
        <button class="btn btn-primary" onclick="saveAllCohortMarks('${studentId}')">💾 Save All Marks</button>
      </div>
    </div>
  `;

  // Populate grade previews
  subjects.forEach(sub => {
    const ex = resultMap[sub.id];
    if (ex) {
      if (ex.isAbsent) {
        document.getElementById(`gradeCol_${sub.id}`).innerHTML = gradeBadge('AB');
        document.getElementById(`gpCol_${sub.id}`).textContent = '0.0';
      } else if (ex.finalGrade) {
        document.getElementById(`gradeCol_${sub.id}`).innerHTML = `
          ${gradeBadge(ex.finalGrade)}
          <div style="font-size:10px; color:#1e40af; font-weight:700; margin-top:2px;">⚖️ Relative</div>
        `;
        document.getElementById(`gpCol_${sub.id}`).textContent = Number(ex.finalGradePoint).toFixed(1);
      } else if (ex.marksObtained >= 0) {
        previewCourseGrade(sub.id, sub.maxMarks);
      }
    }
  });
}

function toggleCourseAbsent(subId, maxMarks) {
  const cb = document.getElementById('abs_' + subId);
  const inp = document.getElementById('m_' + subId);
  inp.disabled = cb.checked;
  if (cb.checked) {
    inp.value = '';
    document.getElementById(`gradeCol_${subId}`).innerHTML = gradeBadge('AB');
    document.getElementById(`gpCol_${subId}`).textContent = '0.0';
  } else {
    previewCourseGrade(subId, maxMarks);
  }
}

function previewCourseGrade(subId, maxMarks) {
  const inp = document.getElementById('m_' + subId);
  const gradeCol = document.getElementById('gradeCol_' + subId);
  const gpCol = document.getElementById('gpCol_' + subId);
  if (!inp || !gradeCol || !gpCol) return;

  const val = parseFloat(inp.value);
  if (isNaN(val) || inp.value === '') {
    gradeCol.textContent = '—';
    gpCol.textContent = '—';
    return;
  }

  if (val < 0 || val > maxMarks) {
    gradeCol.innerHTML = '<span style="color:var(--danger); font-size:10px;">Invalid</span>';
    gpCol.textContent = '—';
    return;
  }

  const pct = (val / maxMarks) * 100.0;
  const rules = window._settings?.gradeRules || [];
  let grade = 'F', gp = 0.0;
  for (const r of rules) {
    if (pct >= r.minPercent && pct <= r.maxPercent) {
      grade = r.grade;
      gp = r.gradePoint;
      break;
    }
  }

  gradeCol.innerHTML = gradeBadge(grade);
  gpCol.textContent = gp.toFixed(1);
}

async function saveSingleCourseMark(studentId, subjectId, maxMarks) {
  const inp = document.getElementById('m_' + subjectId);
  const absCb = document.getElementById('abs_' + subjectId);
  const isAbsent = absCb?.checked || false;
  const rawMarks = isAbsent ? 0.0 : parseFloat(inp?.value);

  if (!isAbsent) {
    if (isNaN(rawMarks) && inp?.value !== '') {
      showToast('Please enter a valid number.', 'error');
      return;
    }
    if (rawMarks < 0 || rawMarks > maxMarks) {
      showToast(`Marks must be between 0 and ${maxMarks}.`, 'error');
      return;
    }
  }

  const marksObtained = isAbsent ? 0.0 : (isNaN(rawMarks) ? -1.0 : rawMarks);

  const rr = await API.getResults({ studentId, subjectId });
  const existing = rr.ok && rr.data.length > 0 ? rr.data[0] : null;

  let res;
  if (existing) {
    res = await API.updateResult(existing.id, { marksObtained, isAbsent });
  } else {
    res = await API.addResult({ studentId, subjectId, marksObtained, isAbsent });
  }

  if (res.ok) {
    showToast('Mark saved successfully!', 'success');
  } else {
    showToast(res.error, 'error');
  }
}

async function saveAllCohortMarks(studentId) {
  const student = window._marksStudents.find(s => s.id === studentId);
  const subjects = window._marksSubjects.filter(s => s.semester === student.semester);
  let savedCount = 0;

  for (const sub of subjects) {
    const inp = document.getElementById('m_' + sub.id);
    const absCb = document.getElementById('abs_' + sub.id);
    if (!inp) continue;

    const isAbsent = absCb?.checked || false;
    const val = inp.value;
    if (!isAbsent && val === '') continue;

    const rawMarks = isAbsent ? 0.0 : parseFloat(val);
    if (!isAbsent && (isNaN(rawMarks) || rawMarks < 0 || rawMarks > sub.maxMarks)) continue;

    const marksObtained = isAbsent ? 0.0 : rawMarks;
    const rr = await API.getResults({ studentId, subjectId: sub.id });
    const existing = rr.ok && rr.data.length > 0 ? rr.data[0] : null;

    let res;
    if (existing) res = await API.updateResult(existing.id, { marksObtained, isAbsent });
    else          res = await API.addResult({ studentId, subjectId: sub.id, marksObtained, isAbsent });

    if (res.ok) savedCount++;
  }

  showToast(`Saved marks for ${savedCount} subjects! You can now calculate relative grades.`, 'success');
  loadStudentMarks();
}
