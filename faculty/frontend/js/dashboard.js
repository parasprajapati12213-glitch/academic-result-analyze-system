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

    <!-- 3D Interactive Charts (Student Interface Graph Effects) -->
    <div class="two-col">
      <div class="card chart-card-3d">
        <div class="chart-3d-inner">
          <div class="card-header">
            <h2>🥧 Student Division Breakdown (3D Doughnut)</h2>
            <span class="badge" style="background:rgba(0,240,255,0.12);color:#00F0FF;border-color:rgba(0,240,255,0.3)">3D Pop-up Slices</span>
          </div>
          <div class="chart-inspector" id="divInspector">
            <span>💡</span> <span>Hover over any division slice to pop up student share &amp; count details</span>
          </div>
          <div class="card-body" style="padding:10px 18px 18px;height:300px;position:relative">
            <canvas id="divisionDonutChart"></canvas>
          </div>
        </div>
      </div>

      <div class="card chart-card-3d">
        <div class="chart-3d-inner">
          <div class="card-header">
            <h2>📊 Subject Average Grade Points (Histogram)</h2>
            <span class="badge" style="background:rgba(56,189,248,0.12);color:#38BDF8;border-color:rgba(56,189,248,0.3)">Course Benchmark</span>
          </div>
          <div class="chart-inspector" id="subGPInspector">
            <span>💡</span> <span>Hover over any subject bar to pop up average grade points</span>
          </div>
          <div class="card-body" style="padding:10px 18px 18px;height:300px;position:relative">
            <canvas id="subjectGPBarChart"></canvas>
          </div>
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
  const divInspector = document.getElementById('divInspector');
  if (ctxDiv) {
    if (dashCharts.divChart) dashCharts.divChart.destroy();
    const divLabels = ['Distinction (≥ 8.0)', 'First Division (6.5 - 7.99)', 'Second Division (5.0 - 6.49)', 'Failed (Backlog)'];
    const divData = [d.distinctionCount || 0, d.firstClassCount || 0, d.secondClassCount || 0, d.failCount || 0];
    const totalDivStudents = divData.reduce((a, b) => a + b, 0) || 1;

    dashCharts.divChart = new Chart(ctxDiv, {
      type: 'doughnut',
      data: {
        labels: divLabels,
        datasets: [{
          data: divData,
          backgroundColor: ['#00F0FF', '#38BDF8', '#fbbf24', '#f87171'],
          borderWidth: 3,
          borderColor: '#030712',
          hoverOffset: 28,
          hoverBorderColor: '#ffffff',
          hoverBorderWidth: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        onHover: (event, activeElements) => {
          if (!divInspector) return;
          if (activeElements.length > 0) {
            const idx = activeElements[0].index;
            const label = divLabels[idx];
            const count = divData[idx];
            const pct = ((count / totalDivStudents) * 100).toFixed(1);
            divInspector.classList.add('active');
            divInspector.innerHTML = `<strong>✨ Pop-up Slice: ${label}:</strong> <strong>${count} Student(s)</strong> (${pct}% of cohort)`;
          } else {
            divInspector.classList.remove('active');
            divInspector.innerHTML = `<span>💡</span> <span>Hover over any division slice to pop up student share &amp; count details</span>`;
          }
        },
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: 'rgba(186,230,253,0.85)',
              font: { family: 'DM Sans', size: 12, weight: 600 },
              boxWidth: 14,
              padding: 14
            }
          },
          tooltip: {
            padding: 14,
            backgroundColor: 'rgba(3, 7, 18, 0.95)',
            titleColor: '#00F0FF',
            titleFont: { family: 'DM Sans', size: 13, weight: 700 },
            bodyColor: '#ffffff',
            bodyFont: { family: 'DM Sans', size: 12 },
            borderColor: '#00F0FF',
            borderWidth: 2,
            cornerRadius: 10,
            callbacks: {
              label: (ctx) => {
                const count = ctx.raw;
                const pct = ((count / totalDivStudents) * 100).toFixed(1);
                return ` ${count} Students (${pct}% of cohort)`;
              }
            }
          }
        }
      }
    });
  }

  const ctxSub = document.getElementById('subjectGPBarChart');
  const subInspector = document.getElementById('subGPInspector');
  if (ctxSub && d.subjectOverview && d.subjectOverview.length > 0) {
    if (dashCharts.subChart) dashCharts.subChart.destroy();
    const sem1Subs = d.subjectOverview.filter(s => s.avgGradePoint > 0);
    const subLabels = sem1Subs.map(s => s.code);
    const subData = sem1Subs.map(s => s.avgGradePoint);
    const subNames = sem1Subs.map(s => s.name || s.code);

    let barGrad = '#00F0FF';
    if (ctxSub.getContext) {
      const barCtx = ctxSub.getContext('2d');
      if (barCtx && barCtx.createLinearGradient) {
        const g = barCtx.createLinearGradient(0, 0, 0, 260);
        g.addColorStop(0, '#00F0FF');
        g.addColorStop(1, '#00A3FF');
        barGrad = g;
      }
    }

    dashCharts.subChart = new Chart(ctxSub, {
      type: 'bar',
      data: {
        labels: subLabels,
        datasets: [{
          label: 'Average Grade Point (0 to 10)',
          data: subData,
          backgroundColor: barGrad,
          borderRadius: 6,
          hoverBackgroundColor: '#ffffff',
          hoverBorderColor: '#00F0FF',
          hoverBorderWidth: 3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        onHover: (event, activeElements) => {
          if (!subInspector) return;
          if (activeElements.length > 0) {
            const idx = activeElements[0].index;
            const code = subLabels[idx];
            const name = subNames[idx];
            const gp = subData[idx];
            subInspector.classList.add('active');
            subInspector.innerHTML = `<strong>✨ Pop-up Bar: ${code} (${name}):</strong> Average Grade Point: <strong>${gp.toFixed(2)} / 10.00</strong>`;
          } else {
            subInspector.classList.remove('active');
            subInspector.innerHTML = `<span>💡</span> <span>Hover over any subject bar to pop up average grade points</span>`;
          }
        },
        scales: {
          x: {
            ticks: { color: 'rgba(186,230,253,0.85)', font: { family: 'DM Sans', size: 12, weight: 600 } },
            grid: { color: 'rgba(56,189,248,0.08)' }
          },
          y: {
            beginAtZero: true,
            max: 10.0,
            ticks: { color: 'rgba(186,230,253,0.85)', font: { family: 'DM Sans', size: 12 }, stepSize: 2 },
            grid: { color: 'rgba(56,189,248,0.08)' }
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            padding: 14,
            backgroundColor: 'rgba(3, 7, 18, 0.95)',
            titleColor: '#00F0FF',
            titleFont: { family: 'DM Sans', size: 13, weight: 700 },
            bodyColor: '#ffffff',
            bodyFont: { family: 'DM Sans', size: 12 },
            borderColor: '#00F0FF',
            borderWidth: 2,
            cornerRadius: 10,
            callbacks: {
              title: (items) => `${subLabels[items[0].dataIndex]} — ${subNames[items[0].dataIndex]}`,
              label: (ctx) => ` Class Avg Grade Point: ${Number(ctx.raw).toFixed(2)} / 10.00`
            }
          }
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
