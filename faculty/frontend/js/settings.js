// settings.js — College Settings & Relative Grading Policies

let _currentSettings = {};
let _availablePolicies = [];

async function loadSettings() {
  const [sRes, pRes] = await Promise.all([
    API.getSettings(),
    API.getPolicies()
  ]);

  if (!sRes.ok) {
    document.getElementById('pageContent').innerHTML = `
      <div class="warn-alert">Unable to load settings: ${escHtml(sRes.error)}</div>
    `;
    return;
  }

  _currentSettings   = sRes.data;
  _availablePolicies = pRes.ok ? pRes.data : [];
  window._settings   = sRes.data;

  const activePol = _availablePolicies.find(p => p.id === _currentSettings.activeGradingPolicyId) || _availablePolicies[0] || {};

  document.getElementById('pageContent').innerHTML = `
    <div class="page-header">
      <div>
        <h1>College &amp; Grading Settings</h1>
        <p>Configure Relative Grading policies, MITS 10-point scale, and institution details</p>
      </div>
      <div class="action-btns">
        <button class="btn btn-outline" onclick="exportDatabaseBackup()">💾 Backup Data</button>
        <button class="btn btn-primary" onclick="saveAllSettings()">💾 Save Settings</button>
      </div>
    </div>

    <!-- Relative Grading Configuration Card -->
    <div class="card" style="margin-bottom:24px; border-left:4px solid var(--mits-blue);">
      <div class="card-header">
        <h2>1. Relative Grading Engine Configuration</h2>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Primary Evaluation Mode</label>
          <select class="form-control" id="cfgRelMode" onchange="toggleGradingModeDisplay()">
            <option value="relative" ${_currentSettings.relativeGradingEnabled ? 'selected' : ''}>
              ⚖️ RELATIVE GRADING (Default — Cohort Mean &amp; Std Dev)
            </option>
            <option value="absolute" ${!_currentSettings.relativeGradingEnabled ? 'selected' : ''}>
              📊 Absolute Percentage Grading (Legacy Fallback)
            </option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Active Relative Grading Policy</label>
          <select class="form-control" id="cfgActivePolicy">
            ${_availablePolicies.map(p => `
              <option value="${p.id}" ${p.id === _currentSettings.activeGradingPolicyId ? 'selected' : ''}>
                ${escHtml(p.name)} (${p.method})
              </option>
            `).join('')}
          </select>
        </div>
      </div>

      <div class="form-row-3">
        <div class="form-group">
          <label class="form-label">Minimum Cohort Size for Relative Grading</label>
          <input type="number" class="form-control" id="cfgMinCohort" value="${activePol.minCohortSize || 5}" min="1" max="200">
        </div>
        <div class="form-group">
          <label class="form-label">Small Cohort Action</label>
          <select class="form-control" id="cfgSmallAction">
            <option value="ABSOLUTE" ${activePol.smallCohortAction === 'ABSOLUTE' ? 'selected' : ''}>
              Fallback to Absolute Scale (Safe)
            </option>
            <option value="FAIL" ${activePol.smallCohortAction === 'FAIL' ? 'selected' : ''}>
              Block Grading Batch
            </option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Standard Deviation Method</label>
          <select class="form-control" id="cfgStdDevMethod">
            <option value="sample" ${activePol.useSampleStdDev !== false ? 'selected' : ''}>Sample Std Dev (n - 1) — Recommended</option>
            <option value="population" ${activePol.useSampleStdDev === false ? 'selected' : ''}>Population Std Dev (N)</option>
          </select>
        </div>
      </div>

      <div class="info-alert" style="margin-top:10px;">
        ℹ️ <strong>Relative Grading Principle:</strong>
        Final student grades are calculated by comparing each candidate against the cohort mean (&mu;) and standard deviation (&sigma;).
        A student's Z-score determines their letter grade on the 10-point scale.
      </div>
    </div>

    <!-- College Information Card -->
    <div class="card" style="margin-bottom:24px;">
      <div class="card-header">
        <h2>2. College Information</h2>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">College / Institute Name <span class="required">*</span></label>
          <input type="text" class="form-control" id="cfgCollege" value="${escHtml(_currentSettings.collegeName || '')}">
        </div>
        <div class="form-group">
          <label class="form-label">University Status / Subtitle</label>
          <input type="text" class="form-control" id="cfgSub" value="${escHtml(_currentSettings.collegeSub || '')}">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Department</label>
          <input type="text" class="form-control" id="cfgDept" value="${escHtml(_currentSettings.department || '')}">
        </div>
        <div class="form-group">
          <label class="form-label">Degree / Branch</label>
          <input type="text" class="form-control" id="cfgProgram" value="${escHtml(_currentSettings.programName || '')}">
        </div>
      </div>
      <div class="form-row-3">
        <div class="form-group">
          <label class="form-label">Academic Year / Session</label>
          <input type="text" class="form-control" id="cfgYear" value="${escHtml(_currentSettings.academicYear || '')}">
        </div>
        <div class="form-group">
          <label class="form-label">Current Semester</label>
          <select class="form-control" id="cfgSem">
            ${[1,2,3,4,5,6,7,8].map(s => `<option value="${s}" ${s === _currentSettings.currentSemester ? 'selected' : ''}>Semester ${s}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Minimum Passing Marks (%)</label>
          <input type="number" class="form-control" id="cfgPass" value="${_currentSettings.passingPercent || 40}" min="1" max="100">
        </div>
      </div>
    </div>

    <!-- MITS 10-Point Absolute Scale Card -->
    <div class="card">
      <div class="card-header">
        <h2>3. MITS 10-Point Grading Scale (Fallback &amp; Reference)</h2>
        <div style="display:flex; gap:6px;">
          <button class="btn btn-outline btn-sm" onclick="resetDefaultMITSGrading()">↺ Reset MITS Scale</button>
          <button class="btn btn-outline btn-sm" onclick="addGradeRuleRow()">+ Add Row</button>
        </div>
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Marks Min (%)</th>
              <th>Marks Max (%)</th>
              <th>Letter Grade</th>
              <th>Grade Point (0.0 to 10.0)</th>
              <th style="text-align:center;">Action</th>
            </tr>
          </thead>
          <tbody id="gradeRulesTableBody">
            <!-- Populated via script -->
          </tbody>
        </table>
      </div>
    </div>
  `;

  renderGradeRulesTable(_currentSettings.gradeRules || []);
}

function toggleGradingModeDisplay() {
  const mode = document.getElementById('cfgRelMode').value;
  if (mode === 'relative') {
    showToast('Relative grading selected as default evaluation mode.', 'info');
  } else {
    showToast('Switched to absolute percentage fallback.', 'warning');
  }
}

function renderGradeRulesTable(rules) {
  const tbody = document.getElementById('gradeRulesTableBody');
  if (!tbody) return;

  tbody.innerHTML = rules.map((r, i) => `
    <tr id="rule_row_${i}">
      <td><input type="number" class="form-control" style="width:110px;" id="gr_min_${i}" value="${r.minPercent}" min="0" max="100" step="0.01"></td>
      <td><input type="number" class="form-control" style="width:110px;" id="gr_max_${i}" value="${r.maxPercent}" min="0" max="100" step="0.01"></td>
      <td><input type="text" class="form-control" style="width:90px; font-weight:800;" id="gr_grade_${i}" value="${escHtml(r.grade)}"></td>
      <td><input type="number" class="form-control" style="width:100px; font-weight:700;" id="gr_gp_${i}" value="${r.gradePoint}" min="0" max="10" step="0.1"></td>
      <td style="text-align:center;">
        <button class="btn btn-outline btn-sm" style="color:var(--danger);" onclick="removeGradeRuleRow(${i})">Remove</button>
      </td>
    </tr>
  `).join('');
}

function addGradeRuleRow() {
  const current = collectGradeRulesFromDom();
  current.push({ minPercent: 0, maxPercent: 0, grade: 'NEW', gradePoint: 0 });
  renderGradeRulesTable(current);
}

function removeGradeRuleRow(index) {
  const current = collectGradeRulesFromDom();
  current.splice(index, 1);
  renderGradeRulesTable(current);
}

function collectGradeRulesFromDom() {
  const tbody = document.getElementById('gradeRulesTableBody');
  if (!tbody) return [];

  const rows = tbody.querySelectorAll('tr');
  const rules = [];

  rows.forEach((row, i) => {
    const minEl = document.getElementById(`gr_min_${i}`);
    const maxEl = document.getElementById(`gr_max_${i}`);
    const grEl  = document.getElementById(`gr_grade_${i}`);
    const gpEl  = document.getElementById(`gr_gp_${i}`);

    if (minEl && maxEl && grEl && gpEl) {
      rules.push({
        minPercent: parseFloat(minEl.value) || 0,
        maxPercent: parseFloat(maxEl.value) || 0,
        grade: grEl.value.trim().toUpperCase() || 'F',
        gradePoint: parseFloat(gpEl.value) || 0,
        isPassing: (parseFloat(gpEl.value) >= 5.0)
      });
    }
  });

  return rules;
}

function resetDefaultMITSGrading() {
  const defaultRules = [
    { minPercent: 90.0, maxPercent: 100.0, grade: "O",  gradePoint: 10.0, isPassing: true },
    { minPercent: 80.0, maxPercent: 89.99, grade: "A+", gradePoint: 9.0,  isPassing: true },
    { minPercent: 70.0, maxPercent: 79.99, grade: "A",  gradePoint: 8.0,  isPassing: true },
    { minPercent: 60.0, maxPercent: 69.99, grade: "B+", gradePoint: 7.0,  isPassing: true },
    { minPercent: 50.0, maxPercent: 59.99, grade: "B",  gradePoint: 6.0,  isPassing: true },
    { minPercent: 40.0, maxPercent: 49.99, grade: "C",  gradePoint: 5.0,  isPassing: true },
    { minPercent: 0.0,  maxPercent: 39.99, grade: "F",  gradePoint: 0.0,  isPassing: false }
  ];
  renderGradeRulesTable(defaultRules);
  showToast('Reset to official MITS Gwalior 10-point scale.', 'info');
}

async function saveAllSettings() {
  const collegeName = document.getElementById('cfgCollege')?.value.trim();
  const collegeSub  = document.getElementById('cfgSub')?.value.trim();
  const department  = document.getElementById('cfgDept')?.value.trim();
  const programName = document.getElementById('cfgProgram')?.value.trim();
  const academicYear= document.getElementById('cfgYear')?.value.trim();
  const currentSemester = parseInt(document.getElementById('cfgSem')?.value) || 1;
  const passingPercent  = parseFloat(document.getElementById('cfgPass')?.value) || 40.0;
  const relativeGradingEnabled = (document.getElementById('cfgRelMode')?.value === 'relative');
  const activeGradingPolicyId  = document.getElementById('cfgActivePolicy')?.value;
  const gradeRules  = collectGradeRulesFromDom();

  gradeRules.sort((a,b) => b.minPercent - a.minPercent);

  const payload = {
    collegeName,
    collegeSub,
    department,
    programName,
    academicYear,
    currentSemester,
    passingPercent,
    difficultThreshold: 55.0,
    relativeGradingEnabled,
    activeGradingPolicyId,
    gradeRules
  };

  const r = await API.saveSettings(payload);
  if (r.ok) {
    window._settings = payload;
    showToast('Settings saved successfully.', 'success');
  } else {
    showToast(`Error: ${r.error}`, 'error');
  }
}

async function exportDatabaseBackup() {
  const r = await API.backup();
  if (!r.ok) {
    showToast('Failed to export backup.', 'error');
    return;
  }
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(r.data, null, 2));
  const dlAnchorElem = document.createElement('a');
  dlAnchorElem.setAttribute("href", dataStr);
  dlAnchorElem.setAttribute("download", `mits_academic_backup_${new Date().toISOString().slice(0,10)}.json`);
  dlAnchorElem.click();
  showToast('Database backup downloaded.', 'success');
}
