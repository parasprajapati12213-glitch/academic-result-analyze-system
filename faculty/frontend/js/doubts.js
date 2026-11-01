/**
 * doubts.js — Faculty Doubt Sessions Management
 * Allows faculty mentors to review, accept, and reject student doubt booking requests.
 */

let _currentDoubtFilter = 'all';

async function loadDoubts() {
  const contentEl = document.getElementById('pageContent');
  if (!contentEl) return;

  contentEl.innerHTML = `
    <div class="page-header">
      <div>
        <h1>Student Doubt Consultations</h1>
        <p>Review incoming student doubt booking requests, accept slots, or propose reschedules</p>
      </div>
      <div class="action-btns">
        <button class="btn btn-outline" onclick="loadDoubts()">🔄 Refresh Requests</button>
      </div>
    </div>

    <!-- Filter Bar -->
    <div class="card" style="margin-bottom: 20px;">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
        <div style="display:flex; gap:8px;">
          <button class="btn btn-sm ${_currentDoubtFilter === 'all' ? 'btn-primary' : 'btn-outline'}" onclick="setDoubtFilter('all')">All Requests</button>
          <button class="btn btn-sm ${_currentDoubtFilter === 'pending' ? 'btn-primary' : 'btn-outline'}" onclick="setDoubtFilter('pending')">Pending Action ⏳</button>
          <button class="btn btn-sm ${_currentDoubtFilter === 'accepted' ? 'btn-primary' : 'btn-outline'}" onclick="setDoubtFilter('accepted')">Accepted ✅</button>
          <button class="btn btn-sm ${_currentDoubtFilter === 'rejected' ? 'btn-primary' : 'btn-outline'}" onclick="setDoubtFilter('rejected')">Rejected ❌</button>
        </div>
        <div id="doubtsCounterTag" style="font-size:13px; color:var(--slate-500); font-weight:600;">Loading requests...</div>
      </div>
    </div>

    <div id="doubtsContainer">
      <div style="text-align:center; padding:40px; color:var(--slate-400);">Loading doubt requests from database...</div>
    </div>
  `;

  await fetchAndRenderDoubts();
}

function setDoubtFilter(filter) {
  _currentDoubtFilter = filter;
  loadDoubts();
}

async function fetchAndRenderDoubts() {
  const container = document.getElementById('doubtsContainer');
  if (!container) return;

  let user = null;
  try {
    user = JSON.parse(sessionStorage.getItem('mits_user') || localStorage.getItem('mits_user') || '{}');
  } catch (e) {}

  const facultyId = (user && user.referenceId) ? user.referenceId : '';
  const list = (typeof MITS !== 'undefined' && MITS.getDoubts)
    ? await MITS.getDoubts(facultyId, 'faculty')
    : [];

  const countTag = document.getElementById('doubtsCounterTag');
  if (countTag) {
    const pendingCount = list.filter(d => d.status === 'pending').length;
    countTag.textContent = `${list.length} total request(s) · ${pendingCount} pending`;
  }

  const filtered = _currentDoubtFilter === 'all'
    ? list
    : list.filter(d => d.status === _currentDoubtFilter);

  if (!filtered.length) {
    container.innerHTML = `
      <div class="card" style="text-align:center; padding:48px 24px;">
        <div style="font-size:44px; margin-bottom:12px;">📭</div>
        <h3 style="font-size:16px; margin-bottom:6px; color:var(--slate-700);">No Doubt Requests Found</h3>
        <p style="font-size:13px; color:var(--slate-500);">There are no student doubt sessions matching the "${_currentDoubtFilter}" filter.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(360px, 1fr)); gap:16px;">
      ${filtered.map(d => {
        let statusBadge = '<span class="badge" style="background:#fef3c7; color:#92400e; border:1px solid #fde68a;">Pending Review ⏳</span>';
        if (d.status === 'accepted') {
          statusBadge = '<span class="badge" style="background:#dcfce7; color:#166534; border:1px solid #bbf7d0;">Accepted &amp; Confirmed ✅</span>';
        } else if (d.status === 'rejected') {
          statusBadge = '<span class="badge" style="background:#fee2e2; color:#991b1b; border:1px solid #fecaca;">Rejected / Reschedule ❌</span>';
        }

        return `
          <div class="card" style="border-top:3px solid ${d.status === 'accepted' ? '#22c55e' : (d.status === 'rejected' ? '#ef4444' : '#f59e0b')};">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px;">
              <div>
                <h3 style="font-size:15px; font-weight:700; color:var(--slate-800); margin-bottom:2px;">
                  ${escHtml(d.topic)}
                </h3>
                <div style="font-size:12px; color:var(--slate-500); font-weight:600;">
                  📚 ${escHtml(d.subjectName || d.subjectId || 'General Concept')}
                </div>
              </div>
              ${statusBadge}
            </div>

            <!-- Student details -->
            <div style="background:var(--slate-50); border-radius:8px; padding:10px 12px; margin-bottom:12px; font-size:12.5px;">
              <div style="color:var(--slate-700); font-weight:600; margin-bottom:2px;">
                👨‍🎓 ${escHtml(d.studentName)} (${escHtml(d.studentRoll)})
              </div>
              <div style="color:var(--slate-500);">
                📅 Scheduled: <strong>${escHtml(d.slotDate)}</strong> · ⏰ ${escHtml(d.slotTime)}
              </div>
            </div>

            <!-- Description -->
            <div style="font-size:13px; color:var(--slate-600); line-height:1.5; margin-bottom:14px; min-height:36px;">
              "${escHtml(d.description || 'No additional note provided by student.')}"
            </div>

            ${d.responseNote ? `
              <div style="font-size:12px; background:rgba(56,189,248,0.08); border-left:3px solid #00F0FF; padding:8px 10px; margin-bottom:12px; color:var(--slate-700);">
                <strong>Faculty Note:</strong> ${escHtml(d.responseNote)}
              </div>
            ` : ''}

            <!-- Action buttons -->
            <div style="display:flex; gap:8px; margin-top:auto; padding-top:10px; border-top:1px solid var(--slate-100);">
              ${d.status === 'pending' ? `
                <button class="btn btn-primary btn-sm" style="flex:1" onclick="handleDoubtAction('${d.id}', 'accepted')">
                  ✓ Accept Session
                </button>
                <button class="btn btn-outline btn-sm" style="color:#ef4444; border-color:#fca5a5" onclick="promptDoubtReject('${d.id}')">
                  ✕ Decline / Note
                </button>
              ` : `
                <button class="btn btn-outline btn-sm" style="flex:1" onclick="promptDoubtReject('${d.id}')">
                  ✏️ Edit Status / Note
                </button>
              `}
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

async function handleDoubtAction(doubtId, status, note = '') {
  if (typeof MITS !== 'undefined' && MITS.updateDoubtStatus) {
    const res = await MITS.updateDoubtStatus(doubtId, status, note);
    if (res.ok) {
      showToast(`Doubt request successfully ${status}!`, 'success');
      fetchAndRenderDoubts();
    } else {
      showToast(res.error || 'Failed to update doubt request', 'error');
    }
  }
}

function promptDoubtReject(doubtId) {
  const note = prompt('Enter a response or reschedule note for the student (e.g. "Please attend tomorrow at 4 PM" or "Slot conflict"):');
  if (note !== null) {
    handleDoubtAction(doubtId, 'rejected', note);
  }
}

// Global real-time listener for incoming doubt requests
window.addEventListener('doubt_booked', () => {
  const badge = document.getElementById('pendingDoubtsBadge');
  if (badge) {
    const current = Number(badge.textContent || 0) + 1;
    badge.textContent = current;
    badge.style.display = 'inline-block';
  }
  showToast('🔔 New student doubt request received!', 'info');
  if (window.location.hash === '#doubts') {
    fetchAndRenderDoubts();
  }
});
