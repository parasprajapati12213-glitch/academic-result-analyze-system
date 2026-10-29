// calculator.js — Dedicated SGPA & CGPA Calculator & Credit Audit Page
// Simple college words: "SGPA & CGPA Calculator", "Credits Earned", "Calculation Breakdown"

let _calcStudents = [];
let _calcReports = [];

async function loadCalculator() {
  const contentEl = document.getElementById('pageContent');
  if (!contentEl) return;

  contentEl.innerHTML = `
    <div class="page-header">
      <div>
        <h1>SGPA &amp; CGPA Calculator</h1>
        <p>Credit-weighted grade point calculation and student degree progression</p>
      </div>
      <div class="action-btns">
        <button class="btn btn-outline" onclick="exportCalculatorCSV()">📥 Export CSV</button>
        <button class="btn btn-primary" onclick="loadCalculator()">↺ Recalculate</button>
      </div>
    </div>

    <!-- Formula Explanation Card -->
    <div class="card" style="margin-bottom: 20px; background: linear-gradient(135deg, #eff6ff, #f8fafc); border: 1px solid #bfdbfe;">
      <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:16px;">
        <div>
          <div style="font-size:12px; font-weight:700; color:#1e40af; text-transform:uppercase; letter-spacing:0.5px;">
            🎓 Choice Based Credit System (CBCS) Formula
          </div>
          <div style="font-size:16px; font-weight:800; color:#0f172a; margin-top:4px;">
            SGPA = Sum of (Course Credits × Grade Points) ÷ Total Registered Credits
          </div>
          <div style="font-size:12.5px; color:#475569; margin-top:4px; max-width:700px;">
            Grade Points: <strong>O = 10.0, A+ = 9.0, A = 8.0, B+ = 7.0, B = 6.0, C = 5.0 (Pass Minimum), F = 0.0</strong>.
            Grades are evaluated via relative cohort performance. Degree results strictly omit percentages.
          </div>
        </div>
        <div style="display:flex; gap:10px; align-items:center;">
          <div class="stat-card" style="padding:10px 16px; text-align:center; min-width:120px; background:#fff;">
            <div class="stat-label">Scale</div>
            <div class="stat-value" style="font-size:18px; color:#1e40af;">10.0</div>
            <div class="stat-sub">UGC Standard</div>
          </div>
          <div class="stat-card" style="padding:10px 16px; text-align:center; min-width:120px; background:#fff;">
            <div class="stat-label">Min Passing GP</div>
            <div class="stat-value" style="font-size:18px; color:#059669;">5.0</div>
            <div class="stat-sub">Grade C</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filter & Search Controls -->
    <div class="card" style="margin-bottom: 20px;">
      <div class="form-row-3" style="align-items: flex-end;">
        <div class="form-group" style="margin-bottom: 0;">
          <label class="form-label">Search Student</label>
          <input type="text" class="form-control" id="calcSearchInput" placeholder="Search by name or roll number..." oninput="renderCalculatorTable()">
        </div>
        <div class="form-group" style="margin-bottom: 0;">
          <label class="form-label">Filter by Class / Section</label>
          <select class="form-control" id="calcClassFilter" onchange="renderCalculatorTable()">
            <option value="">All Classes (CSBS-A &amp; CSBS-B)</option>
            <option value="CSBS-A">CSBS-A Only</option>
            <option value="CSBS-B">CSBS-B Only</option>
          </select>
        </div>
        <div class="form-group" style="margin-bottom: 0;">
          <label class="form-label">Filter by Status</label>
          <select class="form-control" id="calcStatusFilter" onchange="renderCalculatorTable()">
            <option value="">All Statuses</option>
            <option value="Pass">Pass Only</option>
            <option value="Fail">Backlogs Only</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Table of Student CGPA/SGPA -->
    <div class="card">
      <div class="card-header">
        <h2>Student SGPA &amp; CGPA Results (<span id="calcCount">0</span> Students)</h2>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th style="width: 40px;">#</th>
              <th>Roll Number</th>
              <th>Student Name</th>
              <th>Class</th>
              <th style="text-align:center;">Sem</th>
              <th style="text-align:center;">Registered Credits</th>
              <th style="text-align:center;">Earned Credits</th>
              <th style="text-align:center;">SGPA</th>
              <th style="text-align:center;">CGPA</th>
              <th>Division</th>
              <th style="text-align:center;">Status</th>
              <th style="text-align:center;">Calculation</th>
            </tr>
          </thead>
          <tbody id="calcTableBody">
            <tr><td colspan="12" style="text-align:center; padding:40px;">Loading student grade calculations...</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;

  const sr = await API.getStudents();
  _calcStudents = sr.ok ? sr.data : [];

  // Fetch student reports in parallel
  const reportResults = await Promise.all(_calcStudents.map(st => API.studentReport(st.id)));
  _calcReports = reportResults.filter(res => res.ok).map(res => res.data);

  renderCalculatorTable();
}

function renderCalculatorTable() {
  const tbody = document.getElementById('calcTableBody');
  const countEl = document.getElementById('calcCount');
  if (!tbody) return;

  const query = (document.getElementById('calcSearchInput')?.value || '').toLowerCase().trim();
  const cls   = document.getElementById('calcClassFilter')?.value || '';
  const stat  = document.getElementById('calcStatusFilter')?.value || '';

  const filtered = _calcReports.filter(r => {
    if (query && !r.studentName.toLowerCase().includes(query) && !r.rollNo.toLowerCase().includes(query)) return false;
    if (cls && r.className !== cls) return false;
    if (stat && r.status !== stat) return false;
    return true;
  });

  if (countEl) countEl.textContent = filtered.length;

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="12" style="text-align:center; padding:40px; color:var(--slate-500);">
          No students found matching your filters.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map((r, idx) => `
    <tr>
      <td>${idx + 1}</td>
      <td><code><strong>${escHtml(r.rollNo)}</strong></code></td>
      <td><strong style="color:var(--slate-900);">${escHtml(r.studentName)}</strong></td>
      <td>${escHtml(r.className || 'CSBS-B')}</td>
      <td style="text-align:center;">Sem ${r.semester}</td>
      <td style="text-align:center; font-weight:600;">${r.creditsRegistered}</td>
      <td style="text-align:center; font-weight:700; color:var(--success);">${r.creditsEarned}</td>
      <td style="text-align:center; font-weight:700;">${fmt2(r.sgpa)}</td>
      <td style="text-align:center; font-weight:800; color:var(--mits-blue); font-size:14px;">${fmt2(r.cgpa)}</td>
      <td>${divisionBadge(r.academicClass)}</td>
      <td style="text-align:center;">${statusBadge(r.status)}</td>
      <td style="text-align:center;">
        <button class="btn btn-outline btn-sm" onclick="showCalculationBreakdown('${r.studentId}')">
          🔍 Breakdown
        </button>
      </td>
    </tr>
  `).join('');
}

function showCalculationBreakdown(studentId) {
  const r = _calcReports.find(x => x.studentId === studentId);
  if (!r) return;

  let totalWeightedGP = 0;
  let calculationRows = (r.subjects || []).map(s => {
    const gp = Number(s.gradePoint) || 0;
    const cr = Number(s.credits) || 0;
    const weighted = gp * cr;
    if (s.passed) totalWeightedGP += weighted;

    return `
      <tr>
        <td><code>${escHtml(s.subjectCode)}</code></td>
        <td>${escHtml(s.subjectName)}</td>
        <td style="text-align:center; font-weight:600;">${cr.toFixed(1)}</td>
        <td style="text-align:center;">${gradeBadge(s.grade)}</td>
        <td style="text-align:center; font-weight:700;">${gp.toFixed(1)}</td>
        <td style="text-align:center; font-weight:700; color:#1e40af;">${weighted.toFixed(2)}</td>
      </tr>
    `;
  }).join('');

  showModal(
    `Calculation Breakdown — ${escHtml(r.studentName)} (${escHtml(r.rollNo)})`,
    `
      <div class="card" style="margin-bottom:14px; background:var(--slate-50); border:1px solid var(--slate-200);">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div>
            <strong>Class:</strong> ${escHtml(r.className)} · <strong>Semester:</strong> ${r.semester} · <strong>Session:</strong> ${escHtml(r.academicYear || '2025-2026')}
          </div>
          <div>
            ${statusBadge(r.status)}
          </div>
        </div>
      </div>

      <div class="table-wrap" style="margin-bottom:14px;">
        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Subject Title</th>
              <th style="text-align:center;">Credits (C)</th>
              <th style="text-align:center;">Grade</th>
              <th style="text-align:center;">Grade Point (GP)</th>
              <th style="text-align:center;">Credit Points (C × GP)</th>
            </tr>
          </thead>
          <tbody>
            ${calculationRows}
          </tbody>
        </table>
      </div>

      <div class="card" style="background:#eff6ff; border:1px solid #bfdbfe; padding:14px;">
        <div style="font-size:12px; font-weight:700; color:#1e40af;">MATHEMATICAL CALCULATION SUMMARY:</div>
        <div style="font-size:14px; font-weight:800; color:#0f172a; margin-top:6px;">
          SGPA = Total Credit Points (${totalWeightedGP.toFixed(2)}) ÷ Registered Credits (${r.creditsRegistered}) = ${fmt2(r.sgpa)} / 10.0
        </div>
        <div style="font-size:12px; color:#475569; margin-top:4px;">
          Cumulative CGPA: <strong>${fmt2(r.cgpa)}</strong> · Division: <strong>${escHtml(r.academicClass)}</strong>
        </div>
      </div>
    `,
    `<button class="btn btn-primary" onclick="hideModal()">Close</button>`
  );
}

function exportCalculatorCSV() {
  if (!_calcReports || _calcReports.length === 0) {
    showToast('No records available to export.', 'warning');
    return;
  }

  const rows = [
    ['Roll Number', 'Student Name', 'Class', 'Semester', 'Registered Credits', 'Earned Credits', 'SGPA', 'CGPA', 'Division', 'Status']
  ];

  _calcReports.forEach(r => {
    rows.push([
      r.rollNo,
      r.studentName,
      r.className,
      r.semester,
      r.creditsRegistered,
      r.creditsEarned,
      r.sgpa.toFixed(2),
      r.cgpa.toFixed(2),
      r.academicClass,
      r.status
    ]);
  });

  const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.map(x => `"${x}"`).join(",")).join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `MITS_SGPA_CGPA_Report_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast('SGPA & CGPA CSV exported successfully!', 'success');
}
