// reports.js — Class Reports, Master Marksheets & CSV Export (MITS Gwalior)

let _allReportsData = [];

async function loadReports() {
  const sr = await API.getStudents();
  const students = sr.ok ? sr.data : [];

  document.getElementById('pageContent').innerHTML = `
    <div class="page-header no-print">
      <div>
        <h1>Class Reports &amp; Master Marksheet</h1>
        <p>View master result sheets, class topper lists, backlog lists, and download CSV</p>
      </div>
      <div class="action-btns">
        <button class="btn btn-outline" onclick="exportReportsCSV()">📥 Download CSV</button>
        <button class="btn btn-primary" onclick="window.print()">🖨️ Print Report</button>
      </div>
    </div>

    <!-- Filter Bar -->
    <div class="card no-print" style="margin-bottom:20px;">
      <div class="form-row-3">
        <div class="form-group" style="margin-bottom:0;">
          <label class="form-label">Report Type</label>
          <select class="form-control" id="reportTypeSelect" onchange="renderActiveReport()">
            <option value="master">Master Result Sheet (All Students)</option>
            <option value="toppers">Class Toppers List (Ranked by CGPA)</option>
            <option value="failed">Backlog / Failed Students List</option>
            <option value="course">Subject-wise Performance Report</option>
          </select>
        </div>
        <div class="form-group" style="margin-bottom:0;">
          <label class="form-label">Filter by Semester</label>
          <select class="form-control" id="reportSemesterSelect" onchange="renderActiveReport()">
            <option value="">All Semesters</option>
            ${[1,2,3,4,5,6,7,8].map(s => `<option value="${s}">Semester ${s}</option>`).join('')}
          </select>
        </div>
        <div class="form-group" style="margin-bottom:0;">
          <label class="form-label">Filter by Status</label>
          <select class="form-control" id="reportStatusSelect" onchange="renderActiveReport()">
            <option value="">All Statuses</option>
            <option value="Pass">Pass Only</option>
            <option value="Fail">Backlog / Fail Only</option>
            <option value="Incomplete">Incomplete Only</option>
          </select>
        </div>
      </div>
    </div>

    <div id="reportRenderArea">
      <div class="loading-spinner-wrap" style="text-align:center; padding:40px;">
        <div class="spinner"></div>
        <p style="margin-top:10px; color:var(--slate-500);">Loading reports...</p>
      </div>
    </div>
  `;

  // Fetch student reports in parallel
  const reportResults = await Promise.all(students.map(st => API.studentReport(st.id)));
  _allReportsData = reportResults.filter(r => r.ok).map(r => r.data);

  renderActiveReport();
}

function renderActiveReport() {
  const area = document.getElementById('reportRenderArea');
  if (!area) return;

  const type = document.getElementById('reportTypeSelect')?.value || 'master';
  const sem  = document.getElementById('reportSemesterSelect')?.value || '';
  const stat = document.getElementById('reportStatusSelect')?.value || '';

  let filtered = _allReportsData.filter(r => {
    if (sem && String(r.semester) !== sem) return false;
    if (stat && r.status !== stat) return false;
    return true;
  });

  const collegeName = window._settings?.collegeName || "MADHAV INSTITUTE OF TECHNOLOGY & SCIENCE, GWALIOR";
  const collegeSub  = window._settings?.collegeSub  || "(Deemed to be University) · NAAC Accredited with A++ Grade";
  const department  = window._settings?.department  || "Department of Computer Science and Technology";
  const program     = window._settings?.programName || "B. Tech. (Computer Science and Business Systems)";
  const academicYear= window._settings?.academicYear || "2025-2026";
  const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  if (type === 'master') {
    renderMasterTabulation(filtered, area, collegeName, collegeSub, department, program, academicYear, dateStr);
  } else if (type === 'toppers') {
    renderMeritList(filtered, area, collegeName, collegeSub, department, program, academicYear, dateStr);
  } else if (type === 'failed') {
    renderArrearList(filtered, area, collegeName, collegeSub, department, program, academicYear, dateStr);
  } else if (type === 'course') {
    renderCourseSummary(area, collegeName, collegeSub, department, program, academicYear, dateStr);
  }
}

// ── 1. Master Result Sheet ───────────────────────────────────────────────────
function renderMasterTabulation(data, container, collegeName, collegeSub, department, program, academicYear, dateStr) {
  if (data.length === 0) {
    container.innerHTML = emptyState('📋', 'No Students Found', 'Try changing the filters above.');
    return;
  }

  container.innerHTML = `
    <div class="card" style="padding:28px; background:#fff;">
      <div class="transcript-header" style="justify-content:center; gap:20px; text-align:center;">
        <img src="assets/mits_logo.webp" alt="MITS Gwalior Logo" style="height:72px; width:auto; object-fit:contain;">
        <div class="transcript-inst-text" style="flex:none;">
          <div class="transcript-inst-name">${escHtml(collegeName)}</div>
          <div class="transcript-inst-deemed">${escHtml(collegeSub)}</div>
          <div class="transcript-inst-dept">${escHtml(department)}</div>
          <div style="font-size:12px; font-weight:600; color:var(--slate-700); margin-top:2px;">${escHtml(program)}</div>
          <div class="transcript-title">MASTER RESULT SHEET (TABULATION REGISTER)</div>
          <div style="font-size:11px; color:var(--slate-500); margin-top:3px;">Academic Session: ${escHtml(academicYear)} · Issued: ${dateStr}</div>
          <div style="display:inline-block; margin-top:8px; padding:3px 12px; background:#eff6ff; border:1px solid #bfdbfe; border-radius:12px; font-size:11px; font-weight:700; color:#1e40af;">⚖️ Grading Mode: Cohort Relative Grading (Mean ± k·σ Policy)</div>
        </div>
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th style="width:36px;">#</th>
              <th>Roll Number</th>
              <th>Student Name</th>
              <th>Class</th>
              <th style="text-align:center;">Sem</th>
              <th style="text-align:center;">Total Credits</th>
              <th style="text-align:center;">Earned Credits</th>
              <th style="text-align:center;">SGPA</th>
              <th style="text-align:center;">CGPA</th>
              <th>Division</th>
              <th style="text-align:center;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${data.map((r, idx) => `
              <tr>
                <td>${idx + 1}</td>
                <td><code><strong>${escHtml(r.rollNo)}</strong></code></td>
                <td><strong>${escHtml(r.studentName)}</strong></td>
                <td>${escHtml(r.className || 'CSBS-A')}</td>
                <td style="text-align:center;">Sem ${r.semester}</td>
                <td style="text-align:center;">${r.creditsRegistered}</td>
                <td style="text-align:center; font-weight:700; color:var(--success);">${r.creditsEarned}</td>
                <td style="text-align:center; font-weight:700;">${fmt2(r.sgpa)}</td>
                <td style="text-align:center; font-weight:800; color:var(--mits-blue); font-size:13.5px;">${fmt2(r.cgpa)}</td>
                <td>${divisionBadge(r.academicClass)}</td>
                <td style="text-align:center;">${statusBadge(r.status)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div style="margin-top:20px; display:flex; justify-content:space-between; font-size:12px; color:var(--slate-500);">
        <div>Total Students: <strong>${data.length}</strong></div>
        <div>Passed: <strong>${data.filter(x => x.status==='Pass').length}</strong> | Failed / Backlog: <strong>${data.filter(x => x.status==='Fail').length}</strong> | Incomplete: <strong>${data.filter(x => x.status==='Incomplete').length}</strong></div>
      </div>
    </div>
  `;
}

// ── 2. Class Toppers List (Ranked by CGPA) ──────────────────────────────────
function renderMeritList(data, container, collegeName, collegeSub, department, program, academicYear, dateStr) {
  const sorted = [...data].sort((a,b) => b.cgpa - a.cgpa);

  if (sorted.length === 0) {
    container.innerHTML = emptyState('🏆', 'No Records Found', 'Add students and enter marks to view the toppers list.');
    return;
  }

  container.innerHTML = `
    <div class="card" style="padding:28px; background:#fff;">
      <div class="transcript-header" style="justify-content:center; gap:20px; text-align:center;">
        <img src="assets/mits_logo.webp" alt="MITS Gwalior Logo" style="height:72px; width:auto; object-fit:contain;">
        <div class="transcript-inst-text" style="flex:none;">
          <div class="transcript-inst-name">${escHtml(collegeName)}</div>
          <div class="transcript-inst-deemed">${escHtml(collegeSub)}</div>
          <div class="transcript-inst-dept">${escHtml(department)}</div>
          <div style="font-size:12px; font-weight:600; color:var(--slate-700); margin-top:2px;">${escHtml(program)}</div>
          <div class="transcript-title">CLASS TOPPERS LIST (MERIT LIST)</div>
          <div style="font-size:11px; color:var(--slate-500); margin-top:3px;">Academic Session: ${escHtml(academicYear)} · Ranked by CGPA</div>
          <div style="display:inline-block; margin-top:8px; padding:3px 12px; background:#eff6ff; border:1px solid #bfdbfe; border-radius:12px; font-size:11px; font-weight:700; color:#1e40af;">⚖️ Evaluation: Relative Grading &amp; CBCS System</div>
        </div>
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th style="width:70px;">Rank</th>
              <th>Roll Number</th>
              <th>Student Name</th>
              <th>Class</th>
              <th style="text-align:center;">Credits Earned</th>
              <th style="text-align:center;">SGPA</th>
              <th style="text-align:center;">CGPA</th>
              <th>Division</th>
              <th style="text-align:center;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${sorted.map((r, idx) => `
              <tr>
                <td>
                  ${idx === 0 ? '<strong style="color:#d97706;">🥇 Rank 1</strong>' :
                    idx === 1 ? '<strong style="color:#64748b;">🥈 Rank 2</strong>' :
                    idx === 2 ? '<strong style="color:#b45309;">🥉 Rank 3</strong>' :
                    `<span style="color:var(--slate-500); font-weight:600;">Rank ${idx + 1}</span>`}
                </td>
                <td><code><strong>${escHtml(r.rollNo)}</strong></code></td>
                <td><strong>${escHtml(r.studentName)}</strong></td>
                <td>${escHtml(r.className || 'CSBS-A')}</td>
                <td style="text-align:center; font-weight:600;">${r.creditsEarned} / ${r.creditsRegistered}</td>
                <td style="text-align:center; font-weight:700;">${fmt2(r.sgpa)}</td>
                <td style="text-align:center;"><strong style="font-size:15px; color:var(--mits-blue); font-weight:800;">${fmt2(r.cgpa)}</strong></td>
                <td>${divisionBadge(r.academicClass)}</td>
                <td style="text-align:center;">${statusBadge(r.status)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ── 3. Backlog Students List ────────────────────────────────────────────────
function renderArrearList(data, container, collegeName, collegeSub, department, program, academicYear, dateStr) {
  const failed = data.filter(r => r.status === 'Fail');

  if (failed.length === 0) {
    container.innerHTML = `
      <div class="card" style="padding:36px; text-align:center;">
        <div style="font-size:40px; margin-bottom:10px;">🎉</div>
        <h2 style="color:var(--success); margin-bottom:6px;">No Backlogs Found!</h2>
        <p style="color:var(--slate-500);">All evaluated students have passed all their subjects successfully.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="card" style="padding:28px; background:#fff;">
      <div class="transcript-header" style="justify-content:center; gap:20px; text-align:center;">
        <img src="assets/mits_logo.webp" alt="MITS Gwalior Logo" style="height:72px; width:auto; object-fit:contain;">
        <div class="transcript-inst-text" style="flex:none;">
          <div class="transcript-inst-name">${escHtml(collegeName)}</div>
          <div class="transcript-inst-deemed">${escHtml(collegeSub)}</div>
          <div class="transcript-inst-dept">${escHtml(department)}</div>
          <div style="font-size:12px; font-weight:600; color:var(--danger); margin-top:2px;">${escHtml(program)}</div>
          <div class="transcript-title" style="color:var(--danger);">BACKLOG LIST · STUDENTS WITH FAILED SUBJECTS</div>
          <div style="font-size:11px; color:var(--slate-500); margin-top:3px;">Academic Session: ${escHtml(academicYear)}</div>
        </div>
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th style="width:36px;">#</th>
              <th>Roll Number</th>
              <th>Student Name</th>
              <th>Class</th>
              <th>Failed Subjects</th>
              <th style="text-align:center;">SGPA</th>
              <th style="text-align:center;">CGPA</th>
              <th style="text-align:center;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${failed.map((r, idx) => {
              const failedSubs = r.subjects.filter(s => s.isComplete && !s.passed);
              return `
                <tr>
                  <td>${idx + 1}</td>
                  <td><code><strong>${escHtml(r.rollNo)}</strong></code></td>
                  <td><strong>${escHtml(r.studentName)}</strong></td>
                  <td>${escHtml(r.className || 'CSBS-A')}</td>
                  <td>
                    ${failedSubs.map(s => `
                      <span class="badge badge-fail" style="margin:2px; display:inline-block;">
                        ${escHtml(s.subjectCode)}: ${escHtml(s.subjectName)} (${s.isAbsent ? 'Absent' : s.marksObtained + '/' + s.maxMarks} · ${s.subject.credits} Credits)
                      </span>
                    `).join('')}
                  </td>
                  <td style="text-align:center; font-weight:700;">${fmt2(r.sgpa)}</td>
                  <td style="text-align:center; font-weight:700; color:var(--danger);">${fmt2(r.cgpa)}</td>
                  <td style="text-align:center;"><span class="badge badge-fail">Backlog Pending</span></td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ── 4. Subject-wise Summary ─────────────────────────────────────────────────
async function renderCourseSummary(container, collegeName, collegeSub, department, program, academicYear, dateStr) {
  const [sr, br] = await Promise.all([
    API.subjectAnalysis(),
    API.getBatches()
  ]);
  const list = sr.ok ? sr.data : [];
  const batches = br.ok ? br.data : [];

  const batchMap = {};
  batches.forEach(b => {
    if (b.subjectId) batchMap[b.subjectId] = b;
  });

  if (list.length === 0) {
    container.innerHTML = emptyState('📚', 'No Subjects Found', 'Please add subjects in the Subjects & Credits section.');
    return;
  }

  container.innerHTML = `
    <div class="card" style="padding:28px; background:#fff;">
      <div class="transcript-header" style="justify-content:center; gap:20px; text-align:center;">
        <img src="assets/mits_logo.webp" alt="MITS Gwalior Logo" style="height:72px; width:auto; object-fit:contain;">
        <div class="transcript-inst-text" style="flex:none;">
          <div class="transcript-inst-name">${escHtml(collegeName)}</div>
          <div class="transcript-inst-deemed">${escHtml(collegeSub)}</div>
          <div class="transcript-inst-dept">${escHtml(department)}</div>
          <div style="font-size:12px; font-weight:600; color:var(--slate-700); margin-top:2px;">${escHtml(program)}</div>
          <div class="transcript-title">SUBJECT-WISE STATISTICAL PERFORMANCE REPORT</div>
          <div style="font-size:11px; color:var(--slate-500); margin-top:3px;">Academic Session: ${escHtml(academicYear)} · Relative Grading Cohort Metrics</div>
          <div style="display:inline-block; margin-top:8px; padding:3px 12px; background:#eff6ff; border:1px solid #bfdbfe; border-radius:12px; font-size:11px; font-weight:700; color:#1e40af;">⚖️ Engine: Mean &amp; Std Dev Cohort Relative Grading</div>
        </div>
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th style="width:36px;">#</th>
              <th>Subject Code</th>
              <th>Category</th>
              <th>Subject Name</th>
              <th style="text-align:center;">Sem</th>
              <th style="text-align:center;">Credits</th>
              <th style="text-align:center;">Cohort Mean (μ)</th>
              <th style="text-align:center;">Std Dev (σ)</th>
              <th style="text-align:center;">Avg GP</th>
              <th style="text-align:center;">Pass %</th>
              <th style="text-align:center;">Grading Mode</th>
            </tr>
          </thead>
          <tbody>
            ${list.map((s, idx) => {
              const b = batchMap[s.id];
              const meanStr = b ? fmt2(b.mean) : '—';
              const sdStr   = b ? fmt2(b.stdDev) : '—';
              const modeBadge = b 
                ? '<span class="badge badge-success" style="font-size:11px;">⚖️ Finalized Relative</span>'
                : '<span class="badge" style="background:#f1f5f9; color:#475569; font-size:11px;">Standard</span>';

              return `
                <tr>
                  <td>${idx + 1}</td>
                  <td><code><strong>${escHtml(s.code)}</strong></code></td>
                  <td><span style="font-size:11px; font-weight:700; color:var(--slate-500);">${escHtml(s.categoryCode || 'DC')}</span></td>
                  <td><strong>${escHtml(s.name)}</strong></td>
                  <td style="text-align:center;">Sem ${s.semester}</td>
                  <td style="text-align:center; font-weight:600;">${s.credits}</td>
                  <td style="text-align:center; font-weight:700; color:#1e40af;">${meanStr}</td>
                  <td style="text-align:center; font-weight:600; color:#64748b;">${sdStr}</td>
                  <td style="text-align:center; font-weight:800; color:var(--mits-blue); font-size:13px;">${fmt2(s.averageGradePoint)} <span style="font-size:10px; color:var(--slate-400);">/ 10</span></td>
                  <td style="text-align:center; font-weight:600;">${fmt1(s.passPercent)}%</td>
                  <td style="text-align:center;">${modeBadge}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ── Certified CSV Export (Strict SGPA & CGPA) ────────────────────────────────
function exportReportsCSV() {
  if (!_allReportsData || _allReportsData.length === 0) {
    showToast('No student records available to export.', 'warning');
    return;
  }

  const type = document.getElementById('reportTypeSelect')?.value || 'master';
  const filename = `MITS_CSBS_${type}_report_${new Date().toISOString().slice(0,10)}.csv`;

  const escapeCsv = (val) => {
    let str = String(val ?? '');
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      str = '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
  };

  const rows = [];
  rows.push([
    'Roll Number',
    'Student Name',
    'Class',
    'Semester',
    'Department',
    'Total Credits',
    'Earned Credits',
    'SGPA',
    'CGPA',
    'Division',
    'Status'
  ].map(escapeCsv).join(','));

  _allReportsData.forEach(r => {
    rows.push([
      r.rollNo,
      r.studentName,
      r.className,
      r.semester,
      r.department,
      r.creditsRegistered,
      r.creditsEarned,
      r.sgpa.toFixed(2),
      r.cgpa.toFixed(2),
      r.academicClass,
      r.status
    ].map(escapeCsv).join(','));
  });

  const csvContent = "data:text/csv;charset=utf-8," + rows.join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showToast(`Report downloaded: ${filename}`, 'success');
}
