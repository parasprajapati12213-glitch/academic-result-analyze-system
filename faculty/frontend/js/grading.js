// grading.js — Relative Grading Engine Interface
// Calculate and finalize relative grades based on class performance.

let _activeGradingBatch = null;
let _gradingSubjects = [];
let _gradingPolicies = [];
let _gradingExams = [];

async function loadGrading() {
  const content = document.getElementById('pageContent');
  if (!content) return;

  content.innerHTML = `
    <div class="page-header">
      <div>
        <h1>Relative Grading</h1>
        <p>Calculate and assign student grades based on class performance</p>
      </div>
      <div class="action-btns">
        <button class="btn btn-outline" onclick="loadGrading()">↺ Refresh</button>
      </div>
    </div>

    <!-- Configuration & Selection Card -->
    <div class="card" style="margin-bottom:20px;">
      <div class="card-header">
        <h2>1. Select Subject &amp; Grading Rules</h2>
      </div>
      <div class="form-row-3">
        <div class="form-group" style="margin-bottom:0;">
          <label class="form-label">Subject <span class="required">*</span></label>
          <select class="form-control" id="rgSubjectSelect" onchange="onGradingSubjectChange()">
            <option value="">Loading subjects...</option>
          </select>
        </div>
        <div class="form-group" style="margin-bottom:0;">
          <label class="form-label">Grading Method / Policy</label>
          <select class="form-control" id="rgPolicySelect">
            <option value="">Loading policies...</option>
          </select>
        </div>
        <div class="form-group" style="margin-bottom:0;">
          <label class="form-label">Student Group (Section)</label>
          <select class="form-control" id="rgCohortSelect">
            <option value="ALL">All Sections (Entire Cohort)</option>
            <option value="CSBS-A">Section CSBS-A only</option>
            <option value="CSBS-B">Section CSBS-B only</option>
          </select>
        </div>
      </div>

      <div style="margin-top:16px; display:flex; gap:12px; align-items:center; flex-wrap:wrap;">
        <button class="btn btn-primary" onclick="generateGradingPreview()">
          📊 Calculate &amp; Preview Relative Grades
        </button>
        <span style="font-size:12px; color:var(--slate-500);">
          Preview shows marks spread and grade distribution before grades are finalized.
        </span>
      </div>
    </div>

    <!-- Preview & Statistics Area -->
    <div id="rgPreviewArea">
      <div class="empty-state">
        <div class="empty-icon">⚖️</div>
        <h3>Select a Subject Above</h3>
        <p>Choose a subject and click "Calculate &amp; Preview Relative Grades" to view class statistics and proposed grades.</p>
      </div>
    </div>

    <!-- Finalized Batches History -->
    <div class="card" style="margin-top:24px;">
      <div class="card-header">
        <h2>Saved Relative Grading Batches</h2>
      </div>
      <div id="rgBatchesArea">
        <div style="color:var(--slate-500); font-size:13px;">Loading grading history...</div>
      </div>
    </div>
  `;

  // Fetch subjects, policies, and exams
  const [subRes, polRes, examRes, batchRes] = await Promise.all([
    API.getSubjects(),
    API.getPolicies(),
    API.getExaminations(),
    API.getBatches()
  ]);

  _gradingSubjects = subRes.ok ? subRes.data : [];
  _gradingPolicies = polRes.ok ? polRes.data : [];
  _gradingExams    = examRes.ok ? examRes.data : [];

  // Populate Subject Select
  const subSelect = document.getElementById('rgSubjectSelect');
  if (subSelect) {
    if (_gradingSubjects.length === 0) {
      subSelect.innerHTML = `<option value="">No subjects found</option>`;
    } else {
      subSelect.innerHTML = `
        <option value="">— Choose a Subject —</option>
        ${_gradingSubjects.map(s => `
          <option value="${s.id}">${escHtml(s.code)} - ${escHtml(s.name)} (Sem ${s.semester})</option>
        `).join('')}
      `;
    }
  }

  // Populate Policy Select
  const polSelect = document.getElementById('rgPolicySelect');
  if (polSelect) {
    polSelect.innerHTML = _gradingPolicies.map(p => `
      <option value="${p.id}" ${p.method === 'MEAN_STD_DEV' ? 'selected' : ''}>
        ${escHtml(p.name)} (${p.method})
      </option>
    `).join('');
  }

  renderFinalizedBatches(batchRes.ok ? batchRes.data : []);
}

function onGradingSubjectChange() {
  const subId = document.getElementById('rgSubjectSelect').value;
  if (!subId) {
    document.getElementById('rgPreviewArea').innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">⚖️</div>
        <h3>Select a Subject Above</h3>
        <p>Choose a subject and click "Calculate &amp; Preview Relative Grades".</p>
      </div>
    `;
  }
}

async function generateGradingPreview() {
  const subId = document.getElementById('rgSubjectSelect')?.value;
  const polId = document.getElementById('rgPolicySelect')?.value;
  const cohort = document.getElementById('rgCohortSelect')?.value || 'ALL';

  if (!subId) {
    showToast('Please select a subject first.', 'warning');
    return;
  }

  const previewArea = document.getElementById('rgPreviewArea');
  previewArea.innerHTML = `
    <div style="text-align:center; padding:40px; color:var(--slate-500);">
      <div class="spinner"></div>
      <p style="margin-top:10px;">Computing class average, marks spread, and relative grades...</p>
    </div>
  `;

  const r = await API.previewGrading({
    subjectId: subId,
    cohortFilter: cohort,
    policyId: polId
  });

  if (!r.ok) {
    previewArea.innerHTML = `<div class="warn-alert">Calculation error: ${escHtml(r.error)}</div>`;
    return;
  }

  _activeGradingBatch = r.data;
  renderGradingPreview(r.data);
}

function renderGradingPreview(b) {
  const previewArea = document.getElementById('rgPreviewArea');
  if (!previewArea) return;

  if (b.status === 'ERROR' || b.eligibleCount === 0) {
    previewArea.innerHTML = `
      <div class="warn-alert">
        <strong>Cannot Calculate Relative Grades:</strong>
        ${escHtml(b.entries?.[0]?.explanation || 'No student marks entered for this subject yet.')}
      </div>
    `;
    return;
  }

  // Count passes and fails in batch
  let passCount = 0;
  let failCount = 0;
  b.entries.forEach(e => {
    if (e.isEligible) {
      if (e.passed) passCount++;
      else failCount++;
    }
  });

  previewArea.innerHTML = `
    <!-- Class Marks Summary Cards -->
    <div class="stats-grid" style="margin-bottom:16px;">
      <div class="stat-card blue">
        <div class="stat-label">Class Average Marks</div>
        <div class="stat-value">${fmt2(b.mean)} <span style="font-size:13px; color:var(--slate-400);">marks</span></div>
        <div class="stat-sub">Average score of ${b.eligibleCount} students</div>
      </div>
      <div class="stat-card gold">
        <div class="stat-label">Marks Spread (Std Dev)</div>
        <div class="stat-value">${fmt2(b.stdDev)}</div>
        <div class="stat-sub">Variation across students</div>
      </div>
      <div class="stat-card green">
        <div class="stat-label">Class Middle Score</div>
        <div class="stat-value">${fmt2(b.median)}</div>
        <div class="stat-sub">Median score</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Highest &amp; Lowest</div>
        <div class="stat-value" style="font-size:18px;">${fmt2(b.highest)} / ${fmt2(b.lowest)}</div>
        <div class="stat-sub">Pass: ${passCount} | Backlog: ${failCount}</div>
      </div>
    </div>

    <!-- Grade Distribution Summary -->
    <div class="card" style="margin-bottom:20px;">
      <div class="card-header" style="border:none; padding-bottom:0;">
        <h2>Marks &amp; Grade Distribution</h2>
        <div style="font-size:12px; color:var(--slate-500);">
          Grading Rule: <strong>${escHtml(b.policyId)}</strong> · Version ${escHtml(b.policyVersion)}
        </div>
      </div>
      <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:12px;">
        ${Object.entries(b.gradeDistribution || {}).map(([grade, count]) => `
          <div style="padding:10px 18px; background:var(--slate-50); border:1px solid var(--slate-200); border-radius:6px; text-align:center;">
            <div style="font-size:11px; color:var(--slate-500); font-weight:700;">Grade</div>
            <div style="font-size:18px; font-weight:800; color:var(--mits-blue);">${escHtml(grade)}</div>
            <div style="font-size:12px; font-weight:600; color:var(--slate-700); margin-top:2px;">${count} student(s)</div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Student Grades Table -->
    <div class="card">
      <div class="card-header">
        <h2>Proposed Relative Grades for Candidates</h2>
        <button class="btn btn-primary" onclick="confirmFinalizeGrading()">
          🔒 Finalize &amp; Save Relative Grades
        </button>
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th style="width:40px;">Rank</th>
              <th>Roll Number</th>
              <th>Student Name</th>
              <th style="text-align:center;">Marks Scored</th>
              <th style="text-align:center;">Score Level (Z-Score)</th>
              <th style="text-align:center;">Class Standing (%)</th>
              <th style="text-align:center;">Proposed Grade</th>
              <th style="text-align:center;">Grade Point</th>
              <th style="text-align:center;">Status</th>
              <th>How Grade Was Determined</th>
            </tr>
          </thead>
          <tbody>
            ${b.entries.map((e, idx) => `
              <tr style="${e.passed ? '' : 'background:#fff1f2;'}">
                <td><strong>#${e.rank || (idx + 1)}</strong></td>
                <td><code><strong>${escHtml(e.rollNo)}</strong></code></td>
                <td><strong>${escHtml(e.studentName)}</strong></td>
                <td style="text-align:center; font-weight:700;">
                  ${e.isAbsent ? '<span class="badge badge-fail">Absent</span>' :
                    e.isWithheld ? '<span class="badge badge-warn">Withheld</span>' :
                    fmt2(e.marksObtained) + ' / ' + fmt1(e.maxMarks)}
                </td>
                <td style="text-align:center; font-family:monospace; font-weight:700;">
                  ${e.isEligible ? (e.zScore >= 0 ? '+' : '') + fmt2(e.zScore) : '—'}
                </td>
                <td style="text-align:center;">
                  ${e.isEligible ? fmt1(e.percentileRank) + '%' : '—'}
                </td>
                <td style="text-align:center;">
                  ${gradeBadge(e.assignedGrade)}
                </td>
                <td style="text-align:center; font-weight:800; font-size:14px; color:var(--mits-blue);">
                  ${fmt1(e.assignedGradePoint)}
                </td>
                <td style="text-align:center;">
                  ${e.passed ? '<span class="badge badge-pass">Pass</span>' : '<span class="badge badge-fail">Fail</span>'}
                </td>
                <td style="font-size:11.5px; color:var(--slate-600); max-width:280px;">
                  ${escHtml(e.explanation)}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div style="margin-top:18px; padding-top:14px; border-top:1px solid var(--slate-100); display:flex; justify-content:space-between; align-items:center;">
        <span style="font-size:12px; color:var(--slate-500);">
          Finalizing applies these grades to student marksheets and official transcripts.
        </span>
        <button class="btn btn-primary" onclick="confirmFinalizeGrading()">
          🔒 Finalize &amp; Save Relative Grades
        </button>
      </div>
    </div>
  `;
}

async function confirmFinalizeGrading() {
  if (!_activeGradingBatch || !_activeGradingBatch.subjectId) {
    showToast('No active grading preview to finalize.', 'error');
    return;
  }

  showModal(
    'Confirm Finalizing Relative Grades',
    `
      <p>Are you sure you want to finalize relative grades for this subject?</p>
      <div class="info-alert" style="margin-top:12px;">
        ℹ️ This will lock the calculated grades (O, A+, A, B+, B, C, F) for all ${ _activeGradingBatch.eligibleCount } eligible students into the permanent marksheet record.
      </div>
    `,
    `
      <button class="btn btn-outline" onclick="hideModal()">Cancel</button>
      <button class="btn btn-primary" onclick="executeFinalizeGrading()">Yes, Finalize &amp; Save</button>
    `
  );
}

async function executeFinalizeGrading() {
  hideModal();
  showToast('Finalizing relative grades...', 'info');

  const r = await API.finalizeGrading({
    subjectId: _activeGradingBatch.subjectId,
    policyId: _activeGradingBatch.policyId,
    examinationId: _activeGradingBatch.examinationId,
    cohortFilter: _activeGradingBatch.cohortFilter
  });

  if (r.ok) {
    showToast('Relative grades finalized successfully! Marksheets updated.', 'success');
    _activeGradingBatch = r.data;
    renderGradingPreview(r.data);
    const bRes = await API.getBatches();
    renderFinalizedBatches(bRes.ok ? bRes.data : []);
  } else {
    showToast(`Error: ${r.error}`, 'error');
  }
}

function renderFinalizedBatches(batches) {
  const area = document.getElementById('rgBatchesArea');
  if (!area) return;

  if (batches.length === 0) {
    area.innerHTML = `
      <div style="color:var(--slate-500); font-size:13px; padding:12px 0;">
        No finalized relative grading batches yet. Run a preview above and click "Finalize &amp; Save".
      </div>
    `;
    return;
  }

  area.innerHTML = `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Subject</th>
            <th style="text-align:center;">Class Size</th>
            <th style="text-align:center;">Class Mean</th>
            <th style="text-align:center;">Marks Spread (σ)</th>
            <th>Grading Rule Version</th>
            <th>Finalized Date</th>
            <th style="text-align:center;">Actions</th>
          </tr>
        </thead>
        <tbody>
          ${batches.map(b => {
            const sub = _gradingSubjects.find(s => s.id === b.subjectId);
            const subTitle = sub ? `${sub.code} - ${sub.name}` : b.subjectId;
            return `
              <tr>
                <td><strong>${escHtml(subTitle)}</strong></td>
                <td style="text-align:center;"><strong>${b.eligibleCount}</strong> / ${b.cohortSize}</td>
                <td style="text-align:center; font-weight:700;">${fmt2(b.mean)}</td>
                <td style="text-align:center;">${fmt2(b.stdDev)}</td>
                <td><code>${escHtml(b.policyId || 'Relative-v1')}</code></td>
                <td><small>${escHtml(b.finalizedAt || b.createdAt)}</small></td>
                <td style="text-align:center;">
                  <button class="btn btn-outline btn-sm" onclick="revertBatch('${b.id}')" style="color:var(--danger);">
                    Unfinalize
                  </button>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;
}

async function revertBatch(batchId) {
  if (!confirm('Are you sure you want to unfinalize this batch? Grades will be unlocked.')) return;
  const r = await API.deleteBatch(batchId);
  if (r.ok) {
    showToast('Batch unfinalized.', 'info');
    loadGrading();
  } else {
    showToast(`Error: ${r.error}`, 'error');
  }
}
