// examinations.js — Examination Sessions & Institutional Approval Workflow
// Full approval lifecycle: DRAFT -> MARKS_ENTERED -> REVIEW_READY -> APPROVED -> PUBLISHED

let _allExaminations = [];
let _examSubjects = [];

async function loadExaminations() {
  const content = document.getElementById('pageContent');
  if (!content) return;

  content.innerHTML = `
    <div class="page-header">
      <div>
        <h1>Examinations &amp; Result Approvals</h1>
        <p>Manage examination sessions, enter marks, review grades, and publish final results</p>
      </div>
      <div class="action-btns">
        <button class="btn btn-primary" onclick="openExamModal()">+ New Examination</button>
      </div>
    </div>

    <!-- Examination Workflow Explainer -->
    <div class="info-alert" style="margin-bottom:20px;">
      <div style="font-weight:700; margin-bottom:4px;">📋 Examination Lifecycle &amp; Approval Process:</div>
      <div style="font-size:12.5px; display:flex; gap:16px; flex-wrap:wrap; align-items:center;">
        <span><strong>1. Draft:</strong> Create Exam</span>
        <span>➔</span>
        <span><strong>2. Marks Entered:</strong> Record Student Scores</span>
        <span>➔</span>
        <span><strong>3. Review Ready:</strong> Relative Grading Calculated</span>
        <span>➔</span>
        <span><strong>4. Approved:</strong> Verified by Department In-Charge</span>
        <span>➔</span>
        <span><strong>5. Published:</strong> Visible to Students</span>
      </div>
    </div>

    <!-- Exam List Card -->
    <div class="card">
      <div class="card-header">
        <div>
          <h2>Examination Sessions</h2>
          <p style="font-size:12px; color:var(--slate-500); margin-top:2px;">Track evaluation and publication status</p>
        </div>
      </div>
      <div id="examTableArea">
        <div style="padding:20px; text-align:center; color:var(--slate-500);">Loading examinations...</div>
      </div>
    </div>
  `;

  const [exRes, subRes] = await Promise.all([
    API.getExaminations(),
    API.getSubjects()
  ]);

  _allExaminations = exRes.ok ? exRes.data : [];
  _examSubjects    = subRes.ok ? subRes.data : [];

  renderExamTable();
}

function renderExamTable() {
  const area = document.getElementById('examTableArea');
  if (!area) return;

  if (_allExaminations.length === 0) {
    area.innerHTML = emptyState(
      '📝',
      'No Examinations Created Yet',
      'Create an examination session to record marks and run relative grading.',
      `<button class="btn btn-primary" style="margin-top:10px;" onclick="openExamModal()">+ Create Examination</button>`
    );
    return;
  }

  area.innerHTML = `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Examination Title</th>
            <th>Type</th>
            <th style="text-align:center;">Semester</th>
            <th>Subject</th>
            <th>Student Group</th>
            <th style="text-align:center;">Approval Status</th>
            <th style="text-align:center;">Actions &amp; Workflow</th>
          </tr>
        </thead>
        <tbody>
          ${_allExaminations.map(ex => {
            const sub = _examSubjects.find(s => s.id === ex.subjectId);
            const subTitle = sub ? `${sub.code} - ${sub.name}` : (ex.subjectId || 'All Semester Subjects');
            const st = ex.approvalStatus || (ex.status === 'FINALIZED' ? 'PUBLISHED' : 'REVIEW_READY');

            let badgeHtml = '';
            if (st === 'PUBLISHED') {
              badgeHtml = `<span class="badge" style="background:#dcfce7; color:#15803d; font-weight:700;">✅ Published</span>`;
            } else if (st === 'APPROVED') {
              badgeHtml = `<span class="badge" style="background:#e0e7ff; color:#3730a3; font-weight:700;">🛡️ Approved</span>`;
            } else if (st === 'REVIEW_READY') {
              badgeHtml = `<span class="badge" style="background:#fef3c7; color:#92400e; font-weight:700;">⏳ Ready for Review</span>`;
            } else if (st === 'MARKS_ENTERED') {
              badgeHtml = `<span class="badge" style="background:#e0f2fe; color:#0369a1; font-weight:700;">✍️ Marks Entered</span>`;
            } else {
              badgeHtml = `<span class="badge" style="background:#f1f5f9; color:#475569; font-weight:700;">Draft</span>`;
            }

            return `
              <tr>
                <td>
                  <strong>${escHtml(ex.name)}</strong>
                  ${ex.approvedBy ? `<div style="font-size:11px; color:var(--slate-500); margin-top:2px;">Approved by: ${escHtml(ex.approvedBy)}</div>` : ''}
                  ${ex.reopenReason ? `<div style="font-size:11px; color:#b91c1c; margin-top:2px;">Reopened: ${escHtml(ex.reopenReason)}</div>` : ''}
                </td>
                <td><span style="font-size:12px; font-weight:700; color:var(--mits-blue);">${escHtml(ex.type)}</span></td>
                <td style="text-align:center;">Sem ${ex.semester}</td>
                <td>${escHtml(subTitle)}</td>
                <td>${escHtml(ex.cohortFilter === 'ALL' ? 'All Sections' : (ex.cohortFilter || 'All Sections'))}</td>
                <td style="text-align:center;">${badgeHtml}</td>
                <td style="text-align:center;">
                  <div style="display:inline-flex; gap:4px; flex-wrap:wrap; justify-content:center;">
                    <button class="btn btn-outline btn-sm" onclick="navigateToGradingForExam('${ex.subjectId}')" title="Set Grading Rules &amp; Calculate">
                      ⚖️ Relative Grading
                    </button>
                    ${st === 'REVIEW_READY' || st === 'MARKS_ENTERED' ? `
                      <button class="btn btn-primary btn-sm" onclick="promptApproveExam('${ex.id}', '${escHtml(ex.name)}')" style="background:#2563eb;">
                        🛡️ Approve
                      </button>
                    ` : ''}
                    ${st === 'APPROVED' ? `
                      <button class="btn btn-primary btn-sm" onclick="publishExamNow('${ex.id}', '${escHtml(ex.name)}')" style="background:#16a34a;">
                        📢 Publish
                      </button>
                    ` : ''}
                    ${st === 'PUBLISHED' || st === 'APPROVED' ? `
                      <button class="btn btn-outline btn-sm" onclick="promptReopenExam('${ex.id}', '${escHtml(ex.name)}')" style="color:#b45309;" title="Reopen for Revaluation">
                        ↺ Reopen
                      </button>
                    ` : ''}
                    <button class="btn btn-outline btn-sm" onclick="deleteExam('${ex.id}')" style="color:var(--danger);" title="Delete Exam">
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function navigateToGradingForExam(subjectId) {
  navigate('grading');
  setTimeout(() => {
    const sel = document.getElementById('rgSubjectSelect');
    if (sel && subjectId) {
      sel.value = subjectId;
      if (typeof generateGradingPreview === 'function') {
        generateGradingPreview();
      }
    }
  }, 100);
}

function promptApproveExam(examId, examTitle) {
  showModal(
    'Approve Examination Results',
    `
      <div style="margin-bottom:14px; font-size:13px; color:var(--slate-700);">
        You are approving results for <strong>${examTitle}</strong>. Once approved, the results can be officially published.
      </div>
      <div class="form-group">
        <label class="form-label">Approving Authority / Faculty In-Charge <span class="required">*</span></label>
        <input type="text" class="form-control" id="modalApprovedBy" value="Centre for CST - Examination Committee">
      </div>
      <div class="form-group">
        <label class="form-label">Approval Notes (Optional)</label>
        <textarea class="form-control" id="modalApprovalNotes" rows="2" placeholder="e.g. Verified relative grading distribution and outlier marks. All clear."></textarea>
      </div>
    `,
    `
      <button class="btn btn-outline" onclick="hideModal()">Cancel</button>
      <button class="btn btn-primary" onclick="confirmApproveExam('${examId}')">Confirm Approval</button>
    `
  );
}

async function confirmApproveExam(examId) {
  const approvedBy = document.getElementById('modalApprovedBy')?.value.trim() || 'Exam Committee';
  const notes = document.getElementById('modalApprovalNotes')?.value.trim() || '';

  const r = await API.approveExam(examId, { approvedBy, notes });
  if (r.ok) {
    hideModal();
    showToast('Examination results approved successfully.', 'success');
    loadExaminations();
  } else {
    showToast(`Error approving exam: ${r.error}`, 'error');
  }
}

async function publishExamNow(examId, examTitle) {
  if (!confirm(`Are you sure you want to officially publish results for "${examTitle}"?\nOnce published, students and faculty can access finalized marksheets.`)) {
    return;
  }

  const r = await API.publishExam(examId);
  if (r.ok) {
    showToast('Examination results published successfully!', 'success');
    loadExaminations();
  } else {
    showToast(`Error publishing exam: ${r.error}`, 'error');
  }
}

function promptReopenExam(examId, examTitle) {
  showModal(
    'Reopen Examination for Revision',
    `
      <div style="margin-bottom:14px; font-size:13px; color:var(--slate-700);">
        Reopening <strong>${examTitle}</strong> allows mark revisions, revaluations, or recalculation of grading rules.
      </div>
      <div class="form-group">
        <label class="form-label">Reason for Reopening <span class="required">*</span></label>
        <input type="text" class="form-control" id="modalReopenReason" placeholder="e.g. Revaluation request for 2 students">
      </div>
    `,
    `
      <button class="btn btn-outline" onclick="hideModal()">Cancel</button>
      <button class="btn btn-primary" style="background:#b45309;" onclick="confirmReopenExam('${examId}')">Confirm Reopen</button>
    `
  );
}

async function confirmReopenExam(examId) {
  const reason = document.getElementById('modalReopenReason')?.value.trim() || 'Revaluation / Revision';
  const r = await API.reopenExam(examId, { reason });
  if (r.ok) {
    hideModal();
    showToast('Examination reopened for revision.', 'info');
    loadExaminations();
  } else {
    showToast(`Error reopening exam: ${r.error}`, 'error');
  }
}

function openExamModal() {
  const subOptions = _examSubjects.map(s => `
    <option value="${s.id}">${escHtml(s.code)} - ${escHtml(s.name)} (Sem ${s.semester})</option>
  `).join('');

  showModal(
    'Create New Examination Session',
    `
      <div class="form-group">
        <label class="form-label">Examination Name <span class="required">*</span></label>
        <input type="text" class="form-control" id="exName" placeholder="e.g. End Semester Examination Dec 2025">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Exam Type</label>
          <select class="form-control" id="exType">
            <option value="ENDSEM">End Semester Theory</option>
            <option value="MIDSEM">Mid Semester Test</option>
            <option value="PRACTICAL">Lab / Practical Exam</option>
            <option value="INTERNAL">Continuous Assessment</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Semester</label>
          <select class="form-control" id="exSem">
            ${[1,2,3,4,5,6,7,8].map(s => `<option value="${s}">Semester ${s}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Associated Subject</label>
        <select class="form-control" id="exSubject">
          <option value="">— Select Subject —</option>
          ${subOptions}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Student Group (Section)</label>
        <select class="form-control" id="exCohort">
          <option value="ALL">All Sections (Entire Cohort)</option>
          <option value="CSBS-A">Section CSBS-A only</option>
          <option value="CSBS-B">Section CSBS-B only</option>
        </select>
      </div>
    `,
    `
      <button class="btn btn-outline" onclick="hideModal()">Cancel</button>
      <button class="btn btn-primary" onclick="saveNewExam()">Save Examination</button>
    `
  );
}

async function saveNewExam() {
  const name = document.getElementById('exName')?.value.trim();
  const type = document.getElementById('exType')?.value;
  const semester = parseInt(document.getElementById('exSem')?.value) || 1;
  const subjectId = document.getElementById('exSubject')?.value;
  const cohortFilter = document.getElementById('exCohort')?.value || 'ALL';

  if (!name) {
    showToast('Please enter an examination name.', 'warning');
    return;
  }

  const r = await API.addExamination({
    name,
    type,
    semester,
    subjectId,
    cohortFilter
  });

  if (r.ok) {
    hideModal();
    showToast('Examination created successfully.', 'success');
    loadExaminations();
  } else {
    showToast(`Error: ${r.error}`, 'error');
  }
}

async function deleteExam(id) {
  if (!confirm('Are you sure you want to delete this examination record?')) return;
  const r = await API.deleteExamination(id);
  if (r.ok) {
    showToast('Examination deleted.', 'info');
    loadExaminations();
  } else {
    showToast(`Error: ${r.error}`, 'error');
  }
}
