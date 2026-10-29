// analysis.js — Class Performance, Subject Toppers & Academic Support

let analysisCharts = {};

async function loadAnalysis() {
  const initialTab = window._initialAnalysisTab || 'overview';
  window._initialAnalysisTab = null;

  document.getElementById('pageContent').innerHTML = `
    <div class="page-header">
      <div>
        <h1>Class Performance &amp; Analysis</h1>
        <p>Rankings, subject toppers, course difficulty, and students needing academic support</p>
      </div>
      <button class="btn btn-outline" onclick="loadAnalysis()">↺ Refresh Data</button>
    </div>

    <!-- Navigation Tabs -->
    <div class="tabs">
      <button class="tab-btn ${initialTab === 'overview' ? 'active' : ''}" onclick="switchAnalysisTab('overview')">📊 Overview</button>
      <button class="tab-btn ${initialTab === 'toppers' ? 'active' : ''}" onclick="switchAnalysisTab('toppers')">⭐ Subject Toppers</button>
      <button class="tab-btn ${initialTab === 'subjects' ? 'active' : ''}" onclick="switchAnalysisTab('subjects')">📐 Subject Difficulty</button>
      <button class="tab-btn ${initialTab === 'support' ? 'active' : ''}" onclick="switchAnalysisTab('support')">⚠️ Academic Support</button>
      <button class="tab-btn ${initialTab === 'insights' ? 'active' : ''}" onclick="switchAnalysisTab('insights')">💡 Key Findings</button>
    </div>

    <div id="tabContent_overview" class="tab-panel ${initialTab === 'overview' ? 'active' : ''}"></div>
    <div id="tabContent_toppers" class="tab-panel ${initialTab === 'toppers' ? 'active' : ''}"></div>
    <div id="tabContent_subjects" class="tab-panel ${initialTab === 'subjects' ? 'active' : ''}"></div>
    <div id="tabContent_support" class="tab-panel ${initialTab === 'support' ? 'active' : ''}"></div>
    <div id="tabContent_insights" class="tab-panel ${initialTab === 'insights' ? 'active' : ''}"></div>
  `;

  const [cr, sr, tr, str, nsr] = await Promise.all([
    API.classAnalysis(),
    API.subjectAnalysis(),
    API.toppers(),
    API.subjectToppers(),
    API.needsSupport()
  ]);

  window._classData         = cr.ok ? cr.data : null;
  window._subjectData       = sr.ok ? sr.data : [];
  window._topperData        = tr.ok ? tr.data : null;
  window._subjectToppersData= str.ok ? str.data : [];
  window._needsSupportData  = nsr.ok ? nsr.data : [];

  renderOverviewTab();
  renderToppersTab();
  renderSubjectsTab();
  renderSupportTab();
  renderInsightsTab();
}

function switchAnalysisTab(tabName) {
  const tabs = ['overview', 'toppers', 'subjects', 'support', 'insights'];
  document.querySelectorAll('.tabs .tab-btn').forEach((btn, idx) => {
    btn.classList.toggle('active', tabs[idx] === tabName);
  });
  tabs.forEach(t => {
    const el = document.getElementById(`tabContent_${t}`);
    if (el) el.classList.toggle('active', t === tabName);
  });
}

// ── 1. Overview Tab ─────────────────────────────────────────────────────────
function renderOverviewTab() {
  const c = window._classData;
  const container = document.getElementById('tabContent_overview');
  if (!container) return;

  if (!c || c.totalStudents === 0) {
    container.innerHTML = emptyState('📊', 'No Results Available', 'Enter student marks to view class analysis.');
    return;
  }

  const passRate = c.totalStudents > 0 ? ((c.passCount / c.totalStudents) * 100.0) : 0;

  container.innerHTML = `
    <div class="stats-grid">
      <div class="stat-card blue">
        <div class="stat-label">Class Average CGPA</div>
        <div class="stat-value">${fmt2(c.classAvgCgpa)} <span style="font-size:14px; color:var(--slate-400);">/ 10</span></div>
        <div class="stat-sub">Across all enrolled students</div>
      </div>
      <div class="stat-card gold">
        <div class="stat-label">Highest CGPA</div>
        <div class="stat-value">${fmt2(c.highestCgpa)} <span style="font-size:14px; color:var(--slate-400);">/ 10</span></div>
        <div class="stat-sub">Class Rank 1 score</div>
      </div>
      <div class="stat-card red">
        <div class="stat-label">Lowest CGPA</div>
        <div class="stat-value">${fmt2(c.lowestCgpa)} <span style="font-size:14px; color:var(--slate-400);">/ 10</span></div>
        <div class="stat-sub">Lowest score in class</div>
      </div>
      <div class="stat-card green">
        <div class="stat-label">Pass Percentage</div>
        <div class="stat-value">${fmt1(passRate)}%</div>
        <div class="stat-sub">${c.passCount} passed · ${c.failCount} backlogs</div>
      </div>
    </div>

    <!-- 3D Interactive Charts (Student Interface Graph Effects) -->
    <div class="two-col">
      <div class="card chart-card-3d">
        <div class="chart-3d-inner">
          <div class="card-header">
            <h2>📊 Overall Grade Frequency Distribution (Histogram)</h2>
            <span class="badge" style="background:rgba(0,240,255,0.12);color:#00F0FF;border-color:rgba(0,240,255,0.3)">Grade Frequency</span>
          </div>
          <div class="chart-inspector" id="gradeDistInspector">
            <span>💡</span> <span>Hover over any grade bar to pop up student count &amp; share</span>
          </div>
          <div class="card-body" style="padding:10px 18px 18px;height:300px;position:relative">
            <canvas id="gradeDistChart"></canvas>
          </div>
        </div>
      </div>

      <div class="card chart-card-3d">
        <div class="chart-3d-inner">
          <div class="card-header">
            <h2>🏆 Top Cohort CGPA Benchmark (Horizontal Pillar)</h2>
            <span class="badge" style="background:rgba(251,191,36,0.12);color:#fbbf24;border-color:rgba(251,191,36,0.3)">Top Performers</span>
          </div>
          <div class="chart-inspector" id="rankingInspector">
            <span>💡</span> <span>Hover over any student bar to pop up CGPA &amp; standing</span>
          </div>
          <div class="card-body" style="padding:10px 18px 18px;height:300px;position:relative">
            <canvas id="cgpaRankingChart"></canvas>
          </div>
        </div>
      </div>
    </div>

    <!-- Student Rank List -->
    <div class="card">
      <div class="card-header">
        <h2>Class Rank List (Sorted by CGPA)</h2>
        <div style="font-size:12px; color:var(--slate-500);">Total Students: <strong>${c.rankings.length}</strong></div>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th style="width:60px;">Rank</th>
              <th>Roll No</th>
              <th>Student Name</th>
              <th>Class</th>
              <th style="text-align:center;">Credits Cleared</th>
              <th style="text-align:center;">SGPA</th>
              <th style="text-align:center;">CGPA</th>
              <th>Division</th>
              <th>Status</th>
              <th style="text-align:center;">Marksheet</th>
            </tr>
          </thead>
          <tbody>
            ${c.rankings.map((st, idx) => `
              <tr>
                <td>
                  ${idx === 0 ? '<strong style="color:#d97706;">🥇 1</strong>' :
                    idx === 1 ? '<strong style="color:#64748b;">🥈 2</strong>' :
                    idx === 2 ? '<strong style="color:#b45309;">🥉 3</strong>' :
                    `<span style="color:var(--slate-500); font-weight:600;">${idx + 1}</span>`}
                </td>
                <td><code><strong>${escHtml(st.rollNo)}</strong></code></td>
                <td><strong>${escHtml(st.name)}</strong></td>
                <td>${escHtml(st.className || 'CSBS')}</td>
                <td style="text-align:center; font-weight:600;">${st.creditsEarned} / ${st.creditsTotal}</td>
                <td style="text-align:center; font-weight:700;">${fmt2(st.sgpa)}</td>
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
    </div>
  `;

  renderGradeDistChart(c.gradeDist);
  renderCgpaRankingChart(c.rankings);
}

function renderGradeDistChart(dist) {
  const ctx = document.getElementById('gradeDistChart');
  const gradeInspector = document.getElementById('gradeDistInspector');
  if (!ctx || !dist) return;
  if (analysisCharts.gradeDistChart) analysisCharts.gradeDistChart.destroy();

  const labels = Object.keys(dist);
  const data = Object.values(dist);
  const totalGrades = data.reduce((a, b) => a + b, 0) || 1;
  const colors = labels.map(g => {
    if (g === 'O')  return '#a78bfa';
    if (g === 'A+') return '#00F0FF';
    if (g === 'A')  return '#38BDF8';
    if (g === 'B+') return '#4ade80';
    if (g === 'B')  return '#fbbf24';
    if (g === 'C')  return '#f97316';
    return '#f87171';
  });

  analysisCharts.gradeDistChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Number of Grades',
        data: data,
        backgroundColor: colors,
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
        if (!gradeInspector) return;
        if (activeElements.length > 0) {
          const idx = activeElements[0].index;
          const g = labels[idx];
          const count = data[idx];
          const pct = ((count / totalGrades) * 100).toFixed(1);
          gradeInspector.classList.add('active');
          gradeInspector.innerHTML = `<strong>✨ Pop-up Bar: Grade ${g}:</strong> <strong>${count} Grades Awarded</strong> (${pct}% of all grades evaluated)`;
        } else {
          gradeInspector.classList.remove('active');
          gradeInspector.innerHTML = `<span>💡</span> <span>Hover over any grade bar to pop up student count &amp; share</span>`;
        }
      },
      scales: {
        x: {
          ticks: { color: 'rgba(186,230,253,0.85)', font: { family: 'DM Sans', size: 12, weight: 600 } },
          grid: { color: 'rgba(56,189,248,0.08)' }
        },
        y: {
          beginAtZero: true,
          ticks: { color: 'rgba(186,230,253,0.85)', font: { family: 'DM Sans', size: 12 }, precision: 0 },
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
            title: (items) => `🎖️ Relative Grade: ${items[0].label}`,
            label: (ctx) => {
              const count = ctx.raw;
              const pct = ((count / totalGrades) * 100).toFixed(1);
              return ` ${count} Student Grades (${pct}% of cohort)`;
            }
          }
        }
      }
    }
  });
}

function renderCgpaRankingChart(rankings) {
  const ctx = document.getElementById('cgpaRankingChart');
  const rankInspector = document.getElementById('rankingInspector');
  if (!ctx || !rankings) return;
  if (analysisCharts.cgpaRankingChart) analysisCharts.cgpaRankingChart.destroy();

  const topCohort = rankings.slice(0, 8);
  const labels = topCohort.map(s => s.name.split(' ')[0]);
  const data = topCohort.map(s => s.cgpa);

  let barGrad = '#00F0FF';
  if (ctx.getContext) {
    const barCtx = ctx.getContext('2d');
    if (barCtx && barCtx.createLinearGradient) {
      const g = barCtx.createLinearGradient(0, 0, 400, 0);
      g.addColorStop(0, '#00F0FF');
      g.addColorStop(1, '#00A3FF');
      barGrad = g;
    }
  }

  analysisCharts.cgpaRankingChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'CGPA',
        data: data,
        backgroundColor: barGrad,
        borderRadius: 6,
        hoverBackgroundColor: '#ffffff',
        hoverBorderColor: '#00F0FF',
        hoverBorderWidth: 3
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      onHover: (event, activeElements) => {
        if (!rankInspector) return;
        if (activeElements.length > 0) {
          const idx = activeElements[0].index;
          const st = topCohort[idx];
          rankInspector.classList.add('active');
          rankInspector.innerHTML = `<strong>✨ Pop-up Rank: #${idx + 1} ${st.name} (${st.rollNo}):</strong> CGPA: <strong>${st.cgpa.toFixed(2)} / 10.00</strong> · Division: <strong>${st.academicClass || 'First Division'}</strong>`;
        } else {
          rankInspector.classList.remove('active');
          rankInspector.innerHTML = `<span>💡</span> <span>Hover over any student bar to pop up CGPA &amp; standing</span>`;
        }
      },
      scales: {
        x: {
          beginAtZero: true,
          max: 10.0,
          ticks: { color: 'rgba(186,230,253,0.85)', font: { family: 'DM Sans', size: 12 } },
          grid: { color: 'rgba(56,189,248,0.08)' }
        },
        y: {
          ticks: { color: 'rgba(186,230,253,0.85)', font: { family: 'DM Sans', size: 12, weight: 600 } },
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
            title: (items) => {
              const st = topCohort[items[0].dataIndex];
              return `Rank #${items[0].dataIndex + 1}: ${st.name} (${st.rollNo})`;
            },
            label: (ctx) => ` Cumulative CGPA: ${Number(ctx.raw).toFixed(2)} / 10.00`
          }
        }
      }
    }
  });
}

// ── 2. ⭐ Subject Toppers Tab ─────────────────────────────────────────────────
function renderToppersTab() {
  const t = window._topperData;
  const subToppers = window._subjectToppersData || [];
  const container = document.getElementById('tabContent_toppers');
  if (!container) return;

  if (!t || (!t.top3 && subToppers.length === 0)) {
    container.innerHTML = emptyState('🏆', 'No Topper Data', 'Enter marks to see class and subject toppers.');
    return;
  }

  container.innerHTML = `
    <!-- Top 3 Overall Rank Holders -->
    <div style="font-size:13px; font-weight:700; color:var(--slate-800); text-transform:uppercase; letter-spacing:0.5px; margin-bottom:14px;">
      🏆 Overall Class Rank Holders
    </div>

    <div class="three-col" style="margin-bottom:24px;">
      ${(t.top3 || []).map((st, i) => {
        const medal = i === 0 ? '🥇 1st Rank (Class Topper)' : i === 1 ? '🥈 2nd Rank' : '🥉 3rd Rank';
        const borderCol = i === 0 ? '#d97706' : i === 1 ? '#64748b' : '#b45309';
        return `
          <div class="card" style="border-top: 4px solid ${borderCol};">
            <div style="font-size:11px; font-weight:700; color:${borderCol}; text-transform:uppercase; letter-spacing:0.8px;">${medal}</div>
            <div style="font-size:18px; font-weight:800; color:var(--slate-900); margin-top:6px;">${escHtml(st.name)}</div>
            <div style="font-size:12px; color:var(--slate-500); margin-top:2px;">Roll No: <code>${escHtml(st.rollNo)}</code></div>

            <div style="display:flex; justify-content:space-between; margin-top:16px; padding-top:12px; border-top:1px solid var(--slate-100);">
              <div>
                <span style="font-size:10px; text-transform:uppercase; color:var(--slate-400); font-weight:600; display:block;">Semester SGPA</span>
                <strong style="font-size:16px; color:var(--slate-800);">${fmt2(st.sgpa)}</strong>
              </div>
              <div style="text-align:right;">
                <span style="font-size:10px; text-transform:uppercase; color:var(--slate-400); font-weight:600; display:block;">Overall CGPA</span>
                <strong style="font-size:22px; color:var(--mits-blue); font-weight:800;">${fmt2(st.cgpa)}</strong>
              </div>
            </div>

            <div style="margin-top:12px; text-align:right;">
              <button class="btn btn-outline btn-sm" onclick="viewStudentReport('${st.id}')">View Marksheet →</button>
            </div>
          </div>
        `;
      }).join('')}
    </div>

    <!-- Subject-Wise Highest Scorers -->
    <div class="card">
      <div class="card-header">
        <div>
          <h2>⭐ Subject-Wise Highest Scorers &amp; Toppers</h2>
          <p style="font-size:12px; color:var(--slate-500); margin-top:2px;">Subject-level highest scores, topper student name, and roll number</p>
        </div>
        <div style="display:flex; gap:8px;">
          <input type="text" id="topperSearchInput" class="form-control" placeholder="Search subject or student..." style="width:220px; font-size:12px; padding:6px 10px;" oninput="filterSubjectToppers()">
        </div>
      </div>
      <div class="table-wrap">
        <table id="subjectToppersTable">
          <thead>
            <tr>
              <th>Subject Code</th>
              <th>Category</th>
              <th>Subject Name</th>
              <th style="text-align:center;">Sem</th>
              <th style="text-align:center;">Credits</th>
              <th style="text-align:center;">Highest Score</th>
              <th style="text-align:center;">Class Average</th>
              <th>Topper Student</th>
              <th>Roll Number</th>
              <th style="text-align:center;">Difficulty</th>
            </tr>
          </thead>
          <tbody>
            ${subToppers.length === 0 ? `
              <tr><td colspan="10" style="text-align:center; padding:20px; color:var(--slate-400);">No subject toppers calculated yet.</td></tr>
            ` : subToppers.map(st => `
              <tr class="topper-row" data-search="${escHtml((st.subjectCode + ' ' + st.subjectName + ' ' + (st.topperName || '') + ' ' + (st.topperRoll || '')).toLowerCase())}">
                <td><code><strong>${escHtml(st.subjectCode)}</strong></code></td>
                <td><span style="font-size:11px; font-weight:700; color:var(--slate-500);">${escHtml(st.categoryCode || 'DC')}</span></td>
                <td><strong>${escHtml(st.subjectName)}</strong></td>
                <td style="text-align:center;">Sem ${st.semester || 1}</td>
                <td style="text-align:center; font-weight:600;">${st.credits}</td>
                <td style="text-align:center; font-weight:800; color:var(--mits-blue); font-size:13.5px;">
                  ${st.highestMarks} <span style="font-size:11px; font-weight:500; color:var(--slate-400);">/ ${st.maxMarks}</span>
                </td>
                <td style="text-align:center; font-weight:600;">${fmt1(st.averageMarks)}</td>
                <td><strong style="color:var(--slate-900);">${escHtml(st.topperName || '—')}</strong></td>
                <td><code>${escHtml(st.topperRoll || '—')}</code></td>
                <td style="text-align:center;">${diffBadge(st.difficultyLevel)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function filterSubjectToppers() {
  const query = (document.getElementById('topperSearchInput')?.value || '').trim().toLowerCase();
  document.querySelectorAll('#subjectToppersTable .topper-row').forEach(row => {
    const text = row.getAttribute('data-search') || '';
    row.style.display = text.includes(query) ? '' : 'none';
  });
}

// ── 3. Subject Difficulty Tab ───────────────────────────────────────────────
function renderSubjectsTab() {
  const subjects = window._subjectData;
  const container = document.getElementById('tabContent_subjects');
  if (!container) return;

  if (!subjects || subjects.length === 0) {
    container.innerHTML = emptyState('📚', 'No Subjects Found', 'Please add subjects in the Subjects page.');
    return;
  }

  container.innerHTML = `
    <div class="info-alert" style="margin-bottom:16px;">
      💡 <strong>Subject Difficulty Metric:</strong> Calculated by comparing student pass rate, class average marks, and average grade point (GP). Subjects with lower GP and higher backlogs are marked "Difficult" and need extra tutorial classes.
    </div>

    <div class="card">
      <div class="card-header">
        <div>
          <h2>Subject Difficulty &amp; Performance Summary</h2>
          <p style="font-size:12px; color:var(--slate-500); margin-top:2px;">Compare performance across all course offerings</p>
        </div>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Category</th>
              <th>Subject Name</th>
              <th style="text-align:center;">Sem</th>
              <th style="text-align:center;">Credits</th>
              <th style="text-align:center;">Students Evaluated</th>
              <th style="text-align:center;">Avg Marks</th>
              <th style="text-align:center;">Avg Grade Point</th>
              <th style="text-align:center;">Pass Rate</th>
              <th style="text-align:center;">Backlogs</th>
              <th style="text-align:center;">Difficulty</th>
            </tr>
          </thead>
          <tbody>
            ${subjects.map(s => `
              <tr>
                <td><code><strong>${escHtml(s.code)}</strong></code></td>
                <td><span style="font-size:11px; font-weight:700; color:var(--slate-500);">${escHtml(s.categoryCode || 'DC')}</span></td>
                <td><strong>${escHtml(s.name)}</strong></td>
                <td style="text-align:center;">Sem ${s.semester || 1}</td>
                <td style="text-align:center; font-weight:600;">${s.credits}</td>
                <td style="text-align:center;">${s.completedStudents} / ${s.totalStudents}</td>
                <td style="text-align:center; font-weight:600;">${fmt1(s.averageMarks)}</td>
                <td style="text-align:center; font-weight:800; color:var(--mits-blue); font-size:13.5px;">${fmt2(s.averageGradePoint)} <span style="font-size:10px; color:var(--slate-400);">/ 10</span></td>
                <td style="text-align:center; font-weight:600;">${fmt1(s.passPercent)}%</td>
                <td style="text-align:center;">${s.failCount > 0 ? `<span style="color:var(--danger); font-weight:700;">${s.failCount}</span>` : '0'}</td>
                <td style="text-align:center;">${diffBadge(s.difficultyLevel)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ── 4. ⚠️ Academic Support Tab (Students Needing Extra Help) ──────────────────
function renderSupportTab() {
  const supportList = window._needsSupportData || [];
  const container = document.getElementById('tabContent_support');
  if (!container) return;

  container.innerHTML = `
    <div class="card" style="margin-bottom:20px; border-left:4px solid #dc2626;">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
        <div>
          <h2 style="color:#b91c1c; font-size:16px;">⚠️ Students Needing Academic Support (${supportList.length})</h2>
          <p style="font-size:12.5px; color:var(--slate-600); margin-top:3px;">
            These students have backlogs in 1 or more subjects or have an SGPA below passing standards. They are eligible for remedial coaching and counseling.
          </p>
        </div>
        <div style="display:flex; gap:8px;">
          <input type="text" id="supportSearchInput" class="form-control" placeholder="Search student name or roll..." style="width:230px; font-size:12px; padding:6px 10px;" oninput="filterSupportList()">
        </div>
      </div>
    </div>

    <div class="card">
      <div class="table-wrap">
        <table id="supportStudentsTable">
          <thead>
            <tr>
              <th>Roll Number</th>
              <th>Student Name</th>
              <th>Class</th>
              <th style="text-align:center;">Credits Earned</th>
              <th style="text-align:center;">SGPA</th>
              <th style="text-align:center;">CGPA</th>
              <th>Failing Subjects (Backlogs)</th>
              <th style="text-align:center;">Action</th>
            </tr>
          </thead>
          <tbody>
            ${supportList.length === 0 ? `
              <tr>
                <td colspan="8" style="text-align:center; padding:30px; color:var(--slate-400);">
                  🎉 Excellent! No students currently require academic remedial support.
                </td>
              </tr>
            ` : supportList.map(st => `
              <tr class="support-row" data-search="${escHtml((st.rollNo + ' ' + st.name + ' ' + (st.className || '')).toLowerCase())}">
                <td><code><strong>${escHtml(st.rollNo)}</strong></code></td>
                <td><strong>${escHtml(st.name)}</strong></td>
                <td>${escHtml(st.className || 'CSBS')}</td>
                <td style="text-align:center; font-weight:700; color:#dc2626;">${st.creditsEarned} / ${st.creditsRegistered}</td>
                <td style="text-align:center; font-weight:800; color:#dc2626;">${fmt2(st.sgpa)}</td>
                <td style="text-align:center; font-weight:700;">${fmt2(st.cgpa)}</td>
                <td>
                  <div style="display:flex; flex-wrap:wrap; gap:4px; max-width:400px;">
                    ${(st.failingSubjects || []).map(sub => `
                      <span class="badge" style="background:#fee2e2; color:#991b1b; font-size:11px; padding:3px 6px;">${escHtml(sub)}</span>
                    `).join('')}
                  </div>
                </td>
                <td style="text-align:center;">
                  <button class="btn btn-outline btn-sm" onclick="viewStudentReport('${st.studentId}')">View Marksheet</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function filterSupportList() {
  const query = (document.getElementById('supportSearchInput')?.value || '').trim().toLowerCase();
  document.querySelectorAll('#supportStudentsTable .support-row').forEach(row => {
    const text = row.getAttribute('data-search') || '';
    row.style.display = text.includes(query) ? '' : 'none';
  });
}

// ── 5. Key Findings Tab ─────────────────────────────────────────────────────
function renderInsightsTab() {
  const c = window._classData;
  const s = window._subjectData;
  const t = window._topperData;
  const container = document.getElementById('tabContent_insights');
  if (!container) return;

  if (!c || c.totalStudents === 0) {
    container.innerHTML = emptyState('💡', 'No Insights Yet', 'Enter student marks to view key findings.');
    return;
  }

  const items = [];

  // Weakest subject
  if (s && s.length > 0) {
    const active = [...s].filter(x => x.completedStudents > 0).sort((a,b) => a.averageGradePoint - b.averageGradePoint);
    if (active.length > 0) {
      const weakest = active[0];
      const strongest = active[active.length - 1];
      items.push({
        type: 'warn-alert',
        title: 'Subject Needing Extra Attention',
        desc: `<strong>${escHtml(weakest.name)} (${escHtml(weakest.code)})</strong> had the lowest average grade point of <strong>${fmt2(weakest.averageGradePoint)} / 10.0</strong> with ${weakest.failCount} student backlogs.`
      });
      items.push({
        type: 'info-alert',
        title: 'Best Performing Subject',
        desc: `<strong>${escHtml(strongest.name)} (${escHtml(strongest.code)})</strong> had the highest class average grade point of <strong>${fmt2(strongest.averageGradePoint)} / 10.0</strong> with ${fmt1(strongest.passPercent)}% pass rate.`
      });
    }
  }

  // Distinction count
  if (c.distinctionCount > 0) {
    items.push({
      type: 'info-alert',
      title: 'Distinction Students',
      desc: `<strong>${c.distinctionCount} student(s)</strong> scored Distinction with CGPA 8.0 or above.`
    });
  }

  // Backlogs
  if (c.failCount > 0) {
    items.push({
      type: 'warn-alert',
      title: 'Students with Backlogs',
      desc: `<strong>${c.failCount} student(s)</strong> have failed in one or more subjects and need to appear for re-exam.`
    });
  }

  // Class Topper
  if (t && t.top3 && t.top3.length > 0) {
    items.push({
      type: 'info-alert',
      title: 'Class Topper',
      desc: `<strong>${escHtml(t.top3[0].name)}</strong> secured Rank 1 in the class with a CGPA of <strong>${fmt2(t.top3[0].cgpa)}</strong>.`
    });
  }

  container.innerHTML = `
    <div class="card">
      <div class="card-header">
        <h2>Summary &amp; Key Findings</h2>
      </div>
      <div>
        ${items.map(item => `
          <div class="${item.type}">
            <strong>${item.title}:</strong> ${item.desc}
          </div>
        `).join('')}
      </div>
    </div>
  `;
}
