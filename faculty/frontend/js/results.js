// results.js — Student Result & Marksheet (MITS Gwalior Scheme)

async function loadResults() {
  const sr = await API.getStudents();
  const students = sr.ok ? sr.data : [];

  document.getElementById('pageContent').innerHTML = `
    <div class="page-header no-print">
      <div>
        <h1>Student Result &amp; Marksheet</h1>
        <p>View student semester marksheet and generate printable grade sheet</p>
      </div>
      <div class="action-btns" id="resultTopActions" style="display:none;">
        <button class="btn btn-primary" onclick="window.print()">🖨️ Print Marksheet</button>
      </div>
    </div>

    <!-- Student Dropdown -->
    <div class="card no-print" style="margin-bottom:20px;">
      <div class="form-row" style="align-items:flex-end;">
        <div class="form-group" style="flex:1; margin-bottom:0;">
          <label class="form-label">Select Student</label>
          <select class="form-control" id="resultsStudentSelect" onchange="onStudentResultSelect()">
            <option value="">— Select a student to view marksheet —</option>
            ${students.map(st => `
              <option value="${st.id}">
                ${escHtml(st.rollNo)} — ${escHtml(st.name)} (Semester ${st.semester})
              </option>
            `).join('')}
          </select>
        </div>
      </div>
    </div>

    <!-- Marksheet Container -->
    <div id="resultReportContainer">
      ${students.length === 0 
        ? emptyState('👨‍🎓', 'No Students Added', 'Please add students first in the Students List page.', `<button class="btn btn-primary" onclick="navigate('students')">Go to Students List</button>`)
        : emptyState('📜', 'Select a Student', 'Select a student from the dropdown above to view their official marksheet.')
      }
    </div>
  `;

  if (window._preloadReportId) {
    const sel = document.getElementById('resultsStudentSelect');
    if (sel) {
      sel.value = window._preloadReportId;
      window._preloadReportId = null;
      onStudentResultSelect();
    }
  }
}

async function onStudentResultSelect() {
  const studentId = document.getElementById('resultsStudentSelect').value;
  const container = document.getElementById('resultReportContainer');
  const topActions = document.getElementById('resultTopActions');

  if (!studentId) {
    if (topActions) topActions.style.display = 'none';
    container.innerHTML = emptyState('📜', 'Select a Student', 'Select a student to view their marksheet.');
    return;
  }

  container.innerHTML = `
    <div class="loading-spinner-wrap" style="text-align:center; padding:40px;">
      <div class="spinner"></div>
      <p style="margin-top:10px; color:var(--slate-500);">Loading marksheet...</p>
    </div>
  `;

  const r = await API.studentReport(studentId);
  if (!r.ok) {
    if (topActions) topActions.style.display = 'none';
    container.innerHTML = `<div class="warn-alert">Failed to load marksheet: ${escHtml(r.error)}</div>`;
    return;
  }

  const rpt = r.data;
  if (topActions) topActions.style.display = 'flex';
  renderOfficialTranscript(rpt, container);
}

function renderOfficialTranscript(rpt, container) {
  const collegeName = window._settings?.collegeName || "MADHAV INSTITUTE OF TECHNOLOGY & SCIENCE, GWALIOR";
  const collegeSub  = window._settings?.collegeSub  || "(Deemed to be University) · NAAC Accredited with A++ Grade";
  const department  = rpt.department || window._settings?.department || "Department of Computer Science and Technology";
  const program     = window._settings?.programName || "B. Tech. (Computer Science and Business Systems)";
  const academicYear= rpt.academicYear || window._settings?.academicYear || "2025-2026";
  const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  container.innerHTML = `
    <div class="transcript-card" id="printableCard">
      <!-- Institutional Header with EXACT User-Provided MITS Logo -->
      <div class="transcript-header" style="justify-content:center; gap:20px; text-align:center;">
        <img src="assets/mits_logo.webp" alt="MITS Gwalior Logo" style="height:76px; width:auto; object-fit:contain;">
        <div class="transcript-inst-text" style="flex:none;">
          <div class="transcript-inst-name">${escHtml(collegeName)}</div>
          <div class="transcript-inst-deemed">${escHtml(collegeSub)}</div>
          <div class="transcript-inst-dept">${escHtml(department)}</div>
          <div style="font-size:12px; font-weight:600; color:var(--slate-700); margin-top:2px;">${escHtml(program)}</div>
          <div class="transcript-title">SEMESTER ${rpt.semester} GRADE CARD / MARKSHEET</div>
        </div>
      </div>

      <!-- Student Details -->
      <div class="transcript-meta-grid">
        <div class="transcript-meta-row">
          <span class="transcript-meta-label">Student Name:</span>
          <span class="transcript-meta-val">${escHtml(rpt.studentName)}</span>
        </div>
        <div class="transcript-meta-row">
          <span class="transcript-meta-label">Roll No / Enrollment:</span>
          <span class="transcript-meta-val"><code>${escHtml(rpt.rollNo)}</code></span>
        </div>
        <div class="transcript-meta-row">
          <span class="transcript-meta-label">Class &amp; Section:</span>
          <span class="transcript-meta-val">${escHtml(rpt.className || 'CSBS-A')}</span>
        </div>
        <div class="transcript-meta-row">
          <span class="transcript-meta-label">Academic Session:</span>
          <span class="transcript-meta-val">${escHtml(academicYear)}</span>
        </div>
        <div class="transcript-meta-row">
          <span class="transcript-meta-label">Current Semester:</span>
          <span class="transcript-meta-val">Semester ${rpt.semester}</span>
        </div>
        <div class="transcript-meta-row">
          <span class="transcript-meta-label">Grading System:</span>
          <span class="transcript-meta-val">Relative Grading (CBCS SGPA / CGPA)</span>
        </div>
      </div>

      <!-- Subject Marks & Grades Table -->
      <div class="table-wrap" style="margin-bottom:20px;">
        <table>
          <thead>
            <tr>
              <th style="width:36px;">#</th>
              <th>Subject Code</th>
              <th>Type</th>
              <th>Subject Name</th>
              <th style="text-align:center;">Credits</th>
              <th style="text-align:center;">Marks Scored</th>
              <th style="text-align:center;">Total Marks</th>
              <th style="text-align:center;">Grade</th>
              <th style="text-align:center;">Grade Point</th>
              <th style="text-align:center;">Credits Earned</th>
              <th style="text-align:center;">Result</th>
              <th style="text-align:center;">Audit</th>
            </tr>
          </thead>
          <tbody>
            ${rpt.subjects.length === 0 ? `
              <tr><td colspan="12" style="text-align:center; padding:20px; color:var(--slate-400);">No subjects added for Semester ${rpt.semester}.</td></tr>
            ` : rpt.subjects.map((sub, idx) => {
              const scoredText = sub.isAbsent ? '<span style="color:var(--danger); font-weight:700;">Absent</span>' :
                                 sub.isWithheld ? '<span style="color:var(--warning); font-weight:700;">Withheld</span>' :
                                 (sub.isComplete ? sub.marksObtained : '<span style="color:var(--slate-400);">—</span>');
              const statusTag = !sub.isComplete ? '<span class="badge badge-incomplete">Pending</span>' : (sub.passed ? '<span class="badge badge-pass">Pass</span>' : '<span class="badge badge-fail">Backlog</span>');
              const auditBtn = sub.isComplete ? `
                <button class="btn btn-outline btn-sm" onclick="showAuditExplanation('${rpt.studentId}', '${sub.subjectId}')" title="View Relative Grading Reason" style="font-size:11px; padding:3px 8px;">
                  ⚖️ Reason
                </button>
              ` : '—';
              return `
                <tr>
                  <td>${idx + 1}</td>
                  <td><code><strong>${escHtml(sub.subjectCode)}</strong></code></td>
                  <td><span style="font-size:11px; font-weight:700; color:var(--slate-500);">${escHtml(sub.categoryCode || 'DC')}</span></td>
                  <td><strong>${escHtml(sub.subjectName)}</strong></td>
                  <td style="text-align:center; font-weight:700;">${sub.credits}</td>
                  <td style="text-align:center; font-weight:600;">${scoredText}</td>
                  <td style="text-align:center;">${sub.maxMarks}</td>
                  <td style="text-align:center;">${gradeBadge(sub.grade)}</td>
                  <td style="text-align:center; font-weight:700; color:var(--mits-navy);">${sub.isComplete ? fmt1(sub.gradePoint) : '—'}</td>
                  <td style="text-align:center; font-weight:700;">${sub.earnedCredits}</td>
                  <td style="text-align:center;">${statusTag}</td>
                  <td style="text-align:center;">${auditBtn}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

      <!-- SGPA & CGPA Summary Strip -->
      <div class="transcript-summary-strip">
        <div>
          <div class="summary-block-label">Registered Credits</div>
          <div class="summary-block-val">${rpt.creditsRegistered}</div>
        </div>
        <div>
          <div class="summary-block-label">Earned Credits</div>
          <div class="summary-block-val" style="color:var(--success);">${rpt.creditsEarned}</div>
        </div>
        <div>
          <div class="summary-block-label">Semester SGPA</div>
          <div class="summary-block-val highlight">${fmt2(rpt.sgpa)} <span style="font-size:12px; color:var(--slate-400);">/ 10</span></div>
        </div>
        <div>
          <div class="summary-block-label">Cumulative CGPA</div>
          <div class="summary-block-val highlight" style="color:var(--distinction);">${fmt2(rpt.cgpa)} <span style="font-size:12px; color:var(--slate-400);">/ 10</span></div>
        </div>
      </div>

      <!-- Result Banner -->
      <div style="margin-top:16px; padding:12px 18px; background:var(--slate-50); border:1px solid var(--slate-200); border-radius:var(--radius-sm); display:flex; justify-content:space-between; align-items:center;">
        <div>
          <span style="font-size:11px; text-transform:uppercase; color:var(--slate-500); font-weight:600; display:block;">Academic Division:</span>
          <span style="font-size:14px; font-weight:800; color:var(--slate-900);">${escHtml(rpt.academicClass)}</span>
        </div>
        <div>
          <span style="font-size:11px; text-transform:uppercase; color:var(--slate-500); font-weight:600; display:block; text-align:right;">Final Result:</span>
          ${statusBadge(rpt.status)}
        </div>
      </div>

      <!-- Footer Notes -->
      <div style="margin-top:20px; padding-top:12px; border-top:1px dashed var(--slate-300); font-size:11.5px; color:var(--slate-500); line-height:1.5;">
        <p>1. SGPA = Total (Grade Point × Credits) / Total Registered Credits.</p>
        <p>2. CGPA = Cumulative Grade Point Average calculated across semesters.</p>
        <p>3. Minimum passing grade is Grade C (Grade Point 5.0) in each subject.</p>
        <p>Date of Issue: ${dateStr}</p>
      </div>

      <!-- Signature Blocks -->
      <div class="transcript-sign-row">
        <div class="sign-box">
          <div class="sign-line"></div>
          <div class="sign-title">Faculty In-Charge</div>
        </div>
        <div class="sign-box">
          <div class="sign-line"></div>
          <div class="sign-title">Head of Department (HOD)</div>
        </div>
        <div class="sign-box">
          <div class="sign-line"></div>
          <div class="sign-title">Controller of Examinations</div>
        </div>
      </div>
    </div>
  `;
}

async function showAuditExplanation(studentId, subjectId) {
  const r = await API.getExplanation(studentId, subjectId);
  if (!r.ok) {
    showToast('Explanation not yet generated. Please finalize relative grading batch for this subject.', 'info');
    return;
  }
  const d = r.data;
  showModal(
    'Relative Grading Audit & Explanation',
    `
      <div class="card" style="margin-bottom:12px; background:var(--slate-50); border:1px solid var(--slate-200);">
        <div style="font-size:14px; font-weight:700; color:var(--slate-900);">${escHtml(d.studentName)} (<code>${escHtml(d.rollNo)}</code>)</div>
        <div style="font-size:12px; color:var(--slate-500); margin-top:2px;">Subject: <strong>${escHtml(d.subjectCode || d.subjectId)}</strong> ${d.subjectName ? `— ${escHtml(d.subjectName)}` : ''}</div>
      </div>

      <div class="stats-grid" style="grid-template-columns:repeat(2, 1fr); margin-bottom:14px;">
        <div class="stat-card">
          <div class="stat-label">Student Score</div>
          <div class="stat-value" style="font-size:20px;">${fmt2(d.marksObtained)} / ${fmt1(d.maxMarks)}</div>
          <div class="stat-sub">Percentage: ${fmt1(d.percentage)}%</div>
        </div>
        <div class="stat-card blue">
          <div class="stat-label">Cohort Average (Mean)</div>
          <div class="stat-value" style="font-size:20px;">${fmt2(d.cohortMean)}</div>
          <div class="stat-sub">Class Size: ${d.eligibleCount} candidates</div>
        </div>
        <div class="stat-card gold">
          <div class="stat-label">Cohort Std Dev (σ)</div>
          <div class="stat-value" style="font-size:20px;">${fmt2(d.cohortStdDev)}</div>
          <div class="stat-sub">Z-Score: <strong>${(d.zScore >= 0 ? '+' : '') + fmt2(d.zScore)}</strong></div>
        </div>
        <div class="stat-card green">
          <div class="stat-label">Assigned Grade</div>
          <div class="stat-value" style="font-size:22px; color:var(--mits-blue); font-weight:800;">${escHtml(d.assignedGrade)}</div>
          <div class="stat-sub">Grade Point: <strong>${fmt1(d.assignedGradePoint)}</strong></div>
        </div>
      </div>

      <div class="info-alert" style="margin-bottom:0;">
        <strong>Audit Explanation:</strong><br>
        ${escHtml(d.explanation)}
        <div style="font-size:11px; color:var(--slate-500); margin-top:6px;">
          Finalized under Policy: <code>${escHtml(d.policyId || 'Relative-v1')}</code> at ${escHtml(d.finalizedAt)}
        </div>
      </div>
    `,
    `<button class="btn btn-primary" onclick="hideModal()">Close</button>`
  );
}

