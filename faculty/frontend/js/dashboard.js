// dashboard.js — Academic Result Analysis & Overview

let dashCharts = {};

async function loadDashboard() {
  const r = await API.dashboard();
  if (!r.ok) {
    document.getElementById('pageContent').innerHTML = `
      <div class="warn-alert">
        <strong>Backend Server Not Connected:</strong> Could not connect to backend server at <code>http://localhost:8080</code>.<br>
        Please run <code>server.exe</code> in the backend folder.
      </div>`;
    return;
  }
  const d = r.data;
  const passPercent = d.totalStudents > 0 ? ((d.passCount / d.totalStudents) * 100.0) : 0;

  document.getElementById('pageContent').innerHTML = `
    <!-- Page Header -->
    <div class="page-header">
      <div>
        <h1>Academic Overview</h1>
        <p>${escHtml(d.collegeName)} · ${escHtml(d.department)} · Session ${escHtml(d.academicYear)}</p>
      </div>
      <div style="display:flex; gap:8px; flex-wrap:wrap;">
        <button class="btn btn-primary" onclick="navigate('marks')">✍️ Enter Marks</button>
        <button class="btn btn-outline" onclick="navigate('grading')">⚖️ Relative Grading</button>
        <button class="btn btn-outline" onclick="navigate('calculator')">🧮 SGPA &amp; CGPA</button>
        <button class="btn btn-outline" onclick="navigate('reports')">📋 College Reports</button>
      </div>
    </div>

    <!-- Relative Grading Banner -->
    <div class="info-alert" style="margin-bottom:20px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
      <div>
        <strong>⚖️ Evaluation Mode: RELATIVE GRADING (CBCS 10-Point System)</strong>
        <div style="font-size:12.5px; margin-top:3px;">
          Grades are assigned based on student group marks distribution (Mean ± Std Dev) rather than fixed percentage bands.
          Relative Grading Batches: <strong>${d.totalBatches || 0}</strong> | Total Exams: <strong>${d.totalExaminations || 0}</strong>
        </div>
      </div>
      <button class="btn btn-outline btn-sm" onclick="navigate('grading')">Set Grading Rules →</button>
    </div>

    <!-- Quick Institutional Metric Cards -->
    <div class="stats-grid" style="grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));">
      <div class="stat-card blue" style="cursor:pointer;" onclick="navigate('students')">
        <div class="stat-label">Total Students</div>
        <div class="stat-value">${d.totalStudents}</div>
        <div class="stat-sub">Enrolled in B.Tech CSBS</div>
      </div>
      <div class="stat-card slate" style="cursor:pointer;" onclick="navigate('teachers')">
        <div class="stat-label">Faculty Members</div>
        <div class="stat-value">${d.totalTeachers || 12}</div>
        <div class="stat-sub">Assigned CST teachers</div>
      </div>
      <div class="stat-card purple" style="cursor:pointer;" onclick="navigate('subjects')">
        <div class="stat-label">Subjects</div>
        <div class="stat-value">${d.totalSubjects}</div>
        <div class="stat-sub">Across 8 Semesters</div>
      </div>
      <div class="stat-card green" style="cursor:pointer;" onclick="navigate('examinations')">
        <div class="stat-label">Exams Created</div>
        <div class="stat-value">${d.totalExaminations || 3}</div>
        <div class="stat-sub">End-Sem &amp; Mid-Sem</div>
      </div>
      <div class="stat-card gold">
        <div class="stat-label">Class Avg CGPA</div>
        <div class="stat-value">${fmt2(d.classAvgCgpa)} <span style="font-size:13px; font-weight:600; color:var(--slate-400);">/ 10</span></div>
        <div class="stat-sub">Cohort performance</div>
      </div>
      <div class="stat-card teal">
        <div class="stat-label">Pass Percentage</div>
        <div class="stat-value">${fmt1(passPercent)}%</div>
        <div class="stat-sub">${d.passCount} cleared / ${d.failCount} backlogs</div>
      </div>
    </div>

    <!-- Exam Approval Workflow Quick Status -->
    <div class="card" style="margin-bottom:20px; padding:16px 20px;">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
        <div style="display:flex; align-items:center; gap:16px; flex-wrap:wrap;">
          <span style="font-size:13px; font-weight:700; color:var(--slate-700); text-transform:uppercase; letter-spacing:0.5px;">Exam Status:</span>
          <span class="badge" style="background:#fef3c7; color:#92400e; font-size:12px; padding:4px 10px;">⏳ Pending Approval: <strong>${d.pendingExamsCount || 1}</strong></span>
          <span class="badge" style="background:#e0e7ff; color:#3730a3; font-size:12px; padding:4px 10px;">🛡️ Approved: <strong>${d.approvedExamsCount || 1}</strong></span>
          <span class="badge" style="background:#dcfce7; color:#15803d; font-size:12px; padding:4px 10px;">✅ Published: <strong>${d.publishedExamsCount || 1}</strong></span>
        </div>
        <button class="btn btn-outline btn-sm" onclick="navigate('examinations')">Manage Exams &amp; Approvals →</button>
      </div>
    </div>

    <!-- Class Topper Spotlight & Extra Support Alert -->
    <div class="two-col" style="margin-bottom:20px;">
      ${d.topperName ? `
      <div class="card" style="background:linear-gradient(135deg, #0a1128, #1e2d5a); color:#fff; border:none; padding:22px; display:flex; flex-direction:column; justify-content:space-between;">
        <div>
          <div style="font-size:11px; text-transform:uppercase; letter-spacing:1px; color:#fbbf24; font-weight:700;">
            🏆 Class Topper (Rank 1)
          </div>
          <div style="font-size:22px; font-weight:800; margin-top:4px;">${escHtml(d.topperName)}</div>
          <div style="font-size:12.5px; opacity:0.85; margin-top:2px;">
            Roll No: <code>${escHtml(d.topperRoll || '—')}</code> · Class: CSBS · Semester ${d.currentSemester || 1}
          </div>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-top:16px;">
          <div>
            <div style="font-size:11px; text-transform:uppercase; opacity:0.8; letter-spacing:0.8px;">Cumulative CGPA</div>
            <div style="font-size:32px; font-weight:900; color:#fbbf24; line-height:1;">${fmt2(d.topperCgpa)} <span style="font-size:15px; color:#fff; font-weight:500;">/ 10</span></div>
          </div>
          <button class="btn btn-outline btn-sm" style="background:rgba(255,255,255,0.12); color:#fff; border-color:rgba(255,255,255,0.25);" onclick="viewStudentReport('${d.topperId}')">
            View Marksheet →
          </button>
        </div>
      </div>` : ''}

      <div class="card" style="display:flex; flex-direction:column; justify-content:space-between; border-left:4px solid ${d.failCount > 0 ? '#dc2626' : '#16a34a'};">
        <div>
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div style="font-size:11px; text-transform:uppercase; letter-spacing:0.8px; font-weight:700; color:${d.failCount > 0 ? '#dc2626' : '#16a34a'};">
              ${d.failCount > 0 ? '⚠️ Academic Support Required' : '✅ Healthy Class Progress'}
            </div>
            <span class="badge ${d.failCount > 0 ? 'badge-fail' : 'badge-pass'}">${d.failCount > 0 ? `${d.failCount} Students` : 'All Clear'}</span>
          </div>
          <div style="font-size:16px; font-weight:700; color:var(--slate-800); margin-top:6px;">
            ${d.failCount > 0 ? `${d.failCount} students currently have 1 or more course backlogs.` : 'No backlogs detected in evaluated courses.'}
          </div>
          <p style="font-size:12.5px; color:var(--slate-500); margin-top:6px; line-height:1.5;">
            These students need remedial classes and academic mentoring before appearing in supplementary or repeat examinations.
          </p>
        </div>
        <div style="margin-top:16px; display:flex; gap:8px;">
          <button class="btn btn-outline btn-sm" onclick="navigateToSupportTab()">View Students Needing Support →</button>
          <button class="btn btn-outline btn-sm" onclick="navigate('analysis')">Subject Difficulty →</button>
        </div>
      </div>
    </div>

    <!-- Quick Action Bar -->
    <div class="card" style="margin-bottom:20px; background:var(--card-bg);">
      <div style="font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; color:var(--slate-500); margin-bottom:10px;">
        ⚡ Quick Actions
      </div>
      <div style="display:flex; gap:10px; flex-wrap:wrap;">
        <button class="btn btn-outline btn-sm" onclick="navigate('students')">👤 Add / View Students</button>
        <button class="btn btn-outline btn-sm" onclick="navigate('teachers')">👨‍🏫 Faculty List</button>
        <button class="btn btn-outline btn-sm" onclick="navigate('examinations')">📝 Exams &amp; Approvals</button>
        <button class="btn btn-outline btn-sm" onclick="navigate('marks')">✍️ Enter Marks</button>
        <button class="btn btn-outline btn-sm" onclick="navigate('grading')">⚖️ Relative Grading</button>
        <button class="btn btn-outline btn-sm" onclick="navigate('calculator')">🧮 SGPA &amp; CGPA</button>
        <button class="btn btn-outline btn-sm" onclick="navigate('analysis')">⭐ Subject Toppers</button>
        <button class="btn btn-outline btn-sm" onclick="navigate('reports')">📋 College Reports</button>
      </div>
    </div>

    <!-- Charts -->
    <div class="two-col">
      <div class="card">
        <div class="card-header">
          <h2>Student Division Breakdown</h2>
        </div>
        <div class="chart-wrap">
          <canvas id="divisionDonutChart"></canvas>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h2>Subject Average Grade Points</h2>
        </div>
        <div class="chart-wrap">
          <canvas id="subjectGPBarChart"></canvas>
        </div>
      </div>
    </div>

    <!-- Student Results Table -->
    <div class="card">
      <div class="card-header">
        <h2>Students Overview (Semester ${d.currentSemester || 1})</h2>
        <div style="display:flex; gap:8px;">
          <button class="btn btn-outline btn-sm" onclick="navigate('students')">View All Students (${d.totalStudents}) →</button>
        </div>
      </div>

      ${d.recentStudents.length === 0 ? emptyState('👨‍🎓', 'No Students Found', 'Add students and enter marks to see results here.') : `
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Roll No</th>
                <th>Student Name</th>
                <th>Class</th>
                <th style="text-align:center;">Credits Earned</th>
                <th style="text-align:center;">SGPA</th>
                <th style="text-align:center;">CGPA</th>
                <th>Division</th>
                <th>Status</th>
                <th style="text-align:center;">Marksheet</th>
              </tr>
            </thead>
            <tbody>
              ${d.recentStudents.map(st => `
                <tr>
                  <td><code><strong>${escHtml(st.rollNo)}</strong></code></td>
                  <td><strong>${escHtml(st.name)}</strong></td>
                  <td>${escHtml(st.className || 'CSBS')}</td>
                  <td style="text-align:center; font-weight:600;">${st.creditsEarned} / ${st.creditsTotal}</td>
                  <td style="text-align:center; font-weight:700; color:var(--mits-navy);">${fmt2(st.sgpa)}</td>
                  <td style="text-align:center; font-weight:800; color:var(--mits-blue); font-size:14px;">${fmt2(st.cgpa)}</td>
                  <td>${divisionBadge(st.academicClass)}</td>
                  <td>${statusBadge(st.status)}</td>
                  <td style="text-align:center;">
                    <button class="btn btn-outline btn-sm" onclick="viewStudentReport('${st.id}')">View</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `}
    </div>
  `;

  renderDashboardCharts(d);
}

function renderDashboardCharts(d) {
  const ctxDiv = document.getElementById('divisionDonutChart');
  if (ctxDiv) {
    if (dashCharts.divChart) dashCharts.divChart.destroy();
    dashCharts.divChart = new Chart(ctxDiv, {
      type: 'doughnut',
      data: {
        labels: ['Distinction (≥ 8.0)', 'First Division (6.5 - 7.99)', 'Second Division (5.0 - 6.49)', 'Failed (Backlog)'],
        datasets: [{
          data: [d.distinctionCount || 0, d.firstClassCount || 0, d.secondClassCount || 0, d.failCount || 0],
          backgroundColor: ['#6d28d9', '#1e40af', '#0284c7', '#dc2626'],
          borderWidth: 2,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } }
        }
      }
    });
  }

  const ctxSub = document.getElementById('subjectGPBarChart');
  if (ctxSub && d.subjectOverview && d.subjectOverview.length > 0) {
    if (dashCharts.subChart) dashCharts.subChart.destroy();
    const sem1Subs = d.subjectOverview.filter(s => s.avgGradePoint > 0);
    dashCharts.subChart = new Chart(ctxSub, {
      type: 'bar',
      data: {
        labels: sem1Subs.map(s => s.code),
        datasets: [{
          label: 'Average Grade Point (0 to 10)',
          data: sem1Subs.map(s => s.avgGradePoint.toFixed(2)),
          backgroundColor: '#1e40af',
          borderRadius: 3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { beginAtZero: true, max: 10.0, ticks: { stepSize: 2 } }
        },
        plugins: {
          legend: { display: false }
        }
      }
    });
  }
}

function viewStudentReport(id) {
  window._preloadReportId = id;
  location.hash = '#results';
}

function navigateToSupportTab() {
  window._initialAnalysisTab = 'support';
  location.hash = '#analysis';
}
