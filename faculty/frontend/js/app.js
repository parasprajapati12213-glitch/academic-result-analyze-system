// app.js — Main application routing and simple utilities

const PAGE_TITLES = {
  dashboard:    'Overview',
  students:     'Students',
  teachers:     'Teachers',
  subjects:     'Subjects & Credits',
  examinations: 'Exams',
  marks:        'Enter Marks',
  grading:      'Relative Grading',
  calculator:   'SGPA & CGPA Calculator',
  results:      'Student Marksheet',
  analysis:     'Class Performance',
  reports:      'College Reports',
  settings:     'Settings',
  doubts:       'Student Doubt Consultations',
  messages:     'Student Communication & Messages',
};

const PAGE_LOADERS = {
  dashboard:    () => typeof loadDashboard    === 'function' && loadDashboard(),
  students:     () => typeof loadStudents     === 'function' && loadStudents(),
  teachers:     () => typeof loadTeachers     === 'function' && loadTeachers(),
  subjects:     () => typeof loadSubjects     === 'function' && loadSubjects(),
  examinations: () => typeof loadExaminations === 'function' && loadExaminations(),
  marks:        () => typeof loadMarks        === 'function' && loadMarks(),
  grading:      () => typeof loadGrading      === 'function' && loadGrading(),
  calculator:   () => typeof loadCalculator   === 'function' && loadCalculator(),
  results:      () => typeof loadResults      === 'function' && loadResults(),
  analysis:     () => typeof loadAnalysis     === 'function' && loadAnalysis(),
  reports:      () => typeof loadReports      === 'function' && loadReports(),
  settings:     () => typeof loadSettings     === 'function' && loadSettings(),
  doubts:       () => typeof loadDoubts       === 'function' && loadDoubts(),
  messages:     () => typeof loadMessages     === 'function' && loadMessages(),
};

// ── Theme management (Light & Dark Mode) ───────────────────────────────────
function initTheme() {
  const saved = localStorage.getItem('mits_theme') || 'dark';
  if (saved === 'dark') {
    document.body.classList.add('dark-mode');
  } else {
    document.body.classList.remove('dark-mode');
  }
  updateThemeButton();
}

function toggleTheme() {
  const isDark = document.body.classList.toggle('dark-mode');
  localStorage.setItem('mits_theme', isDark ? 'dark' : 'light');
  updateThemeButton();
  showToast(isDark ? 'Dark theme enabled' : 'Light theme enabled', 'info');
}

function updateThemeButton() {
  const isDark = document.body.classList.contains('dark-mode');
  const iconEl = document.getElementById('themeToggleIcon');
  const textEl = document.getElementById('themeToggleText');
  if (iconEl) iconEl.textContent = isDark ? '☀️' : '🌙';
  if (textEl) textEl.textContent = isDark ? 'Light' : 'Dark';
}

// ── Login modal controls (optional login, not blocking) ─────────────────────
function openLoginModal() {
  const overlay = document.getElementById('authOverlay');
  if (overlay) overlay.style.display = 'flex';
}

function closeLoginModal() {
  const overlay = document.getElementById('authOverlay');
  if (overlay) overlay.style.display = 'none';
}

async function handlePortalLogin(e) {
  if (e) e.preventDefault();
  const alertEl = document.getElementById('authAlert');
  if (alertEl) alertEl.style.display = 'none';

  const username = document.getElementById('loginUser').value.trim().toLowerCase();
  const password = document.getElementById('loginPass').value.trim();

  if (!username.endsWith('@mitsgwalior.in') && username !== 'admin') {
    if (alertEl) {
      alertEl.textContent = 'Faculty login requires an institutional email ending with @mitsgwalior.in';
      alertEl.style.display = 'block';
    }
    return;
  }

  const r = await API.login({ username, password });
  if (r.ok && r.data.success) {
    sessionStorage.setItem('mits_auth_token', r.data.token);
    sessionStorage.setItem('mits_auth_user', JSON.stringify(r.data.user));
    closeLoginModal();
    showToast(`Logged in as ${r.data.user.name}`, 'success');
    updateUserBadge();
  } else {
    if (alertEl) {
      alertEl.textContent = r.error || 'Invalid username or password.';
      alertEl.style.display = 'block';
    }
  }
}

function quickEvaluationLogin() {
  sessionStorage.setItem('mits_auth_token', 'mits_quick_token');
  sessionStorage.setItem('mits_auth_user', JSON.stringify({
    username: 'admin',
    name: 'Faculty In-Charge',
    role: 'Teacher / Admin'
  }));
  closeLoginModal();
  showToast('Logged in successfully', 'success');
  updateUserBadge();
}

function portalLogout() {
  sessionStorage.removeItem('mits_auth_token');
  sessionStorage.removeItem('mits_auth_user');
  try {
    const s = JSON.parse(localStorage.getItem('ra_session') || '{}');
    if (s.role === 'faculty') localStorage.removeItem('ra_session');
  } catch(e) {}
  updateUserBadge();
  showToast('Logged out. Returning to login portal...', 'info');
  setTimeout(() => {
    window.location.href = '../../student/login.html';
  }, 400);
}

function updateUserBadge() {
  try {
    let user = JSON.parse(sessionStorage.getItem('mits_auth_user') || 'null');
    if (!user) {
      const raSession = JSON.parse(localStorage.getItem('ra_session') || '{}');
      if (raSession.role === 'faculty') {
        user = {
          username: raSession.email || 'faculty',
          name: raSession.name || 'Faculty In-Charge',
          role: 'Faculty / Teacher'
        };
        sessionStorage.setItem('mits_auth_user', JSON.stringify(user));
        sessionStorage.setItem('mits_auth_token', 'mits_faculty_session_token');
      }
    }
    user = user || {};
    const nameEl = document.getElementById('userName');
    const roleEl = document.getElementById('userRole');
    const btn = document.getElementById('authActionBtn');
    if (user.name) {
      if (nameEl) nameEl.textContent = user.name;
      if (roleEl) roleEl.textContent = user.role || 'Teacher';
      if (btn) {
        btn.textContent = 'Logout';
        btn.onclick = portalLogout;
      }
    } else {
      if (nameEl) nameEl.textContent = 'Guest User';
      if (roleEl) roleEl.textContent = 'Viewer';
      if (btn) {
        btn.textContent = 'Login';
        btn.onclick = openLoginModal;
      }
    }
  } catch (e) {}
}

// ── Simple Router ───────────────────────────────────────────────────────────
let currentPage = '';

function navigate(page) {
  if (!PAGE_LOADERS[page]) page = 'dashboard';
  currentPage = page;

  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.page === page);
  });

  const contentEl = document.getElementById('pageContent');
  if (contentEl) {
    contentEl.innerHTML = `
      <div style="text-align:center; padding:40px; color:var(--slate-500);">
        <div class="spinner"></div>
        <p style="margin-top:10px;">Loading...</p>
      </div>`;
  }

  // Load the page
  setTimeout(async () => {
    try {
      await PAGE_LOADERS[page]();
    } catch (err) {
      console.error('Page load error:', err);
      if (contentEl) {
        contentEl.innerHTML = `<div class="warn-alert">Error loading page: ${err.message}</div>`;
      }
    }
  }, 10);
}

function handleRoute() {
  const hash = location.hash.replace('#', '') || 'dashboard';
  navigate(hash);
}

// ── Toast notifications ─────────────────────────────────────────────────────
function showToast(message, type = 'info', duration = 3000) {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ── Simple Modal ────────────────────────────────────────────────────────────
function showModal(title, bodyHTML, footerHTML) {
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalBody').innerHTML    = bodyHTML;
  document.getElementById('modalFooter').innerHTML  = footerHTML || '';
  document.getElementById('modalOverlay').style.display = 'flex';
}

function hideModal() {
  document.getElementById('modalOverlay').style.display = 'none';
}

// ── Simple text & badge helpers (Plain English) ─────────────────────────────
function escHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function fmt2(n) {
  const num = Number(n);
  return isNaN(num) ? '0.00' : num.toFixed(2);
}

function fmt1(n) {
  const num = Number(n);
  return isNaN(num) ? '0.0' : num.toFixed(1);
}

function gradeBadge(grade) {
  const g = String(grade).toUpperCase();
  if (g === 'O')   return `<span class="grade-pill grade-o">O</span>`;
  if (g === 'A+')  return `<span class="grade-pill grade-ap">A+</span>`;
  if (g === 'A')   return `<span class="grade-pill grade-a">A</span>`;
  if (g === 'B+')  return `<span class="grade-pill grade-bp">B+</span>`;
  if (g === 'B')   return `<span class="grade-pill grade-b">B</span>`;
  if (g === 'C')   return `<span class="grade-pill grade-c">C</span>`;
  if (g === 'F')   return `<span class="grade-pill grade-f">F</span>`;
  if (g === 'AB')  return `<span class="grade-pill grade-ab">Absent</span>`;
  return `<span class="grade-pill grade-c">${escHtml(grade)}</span>`;
}

function statusBadge(status) {
  if (status === 'Pass')       return `<span class="badge badge-pass">Pass</span>`;
  if (status === 'Fail')       return `<span class="badge badge-fail">Fail</span>`;
  return `<span class="badge badge-incomplete">Incomplete</span>`;
}

function divisionBadge(div) {
  if (!div || div === '—') return '—';
  if (div.includes('Distinction')) return `<span class="badge badge-distinction">Distinction</span>`;
  if (div.includes('First'))       return `<span class="badge badge-pass">First Class</span>`;
  if (div.includes('Second'))      return `<span class="badge badge-incomplete">Second Class</span>`;
  if (div.includes('Arrear'))      return `<span class="badge badge-fail">Backlog</span>`;
  return `<span class="badge badge-incomplete">${escHtml(div)}</span>`;
}

function diffBadge(level) {
  if (level === 'Easy')            return `<span class="badge badge-pass">Easy</span>`;
  if (level === 'Needs Attention') return `<span class="badge badge-fail">Difficult</span>`;
  if (level === 'No Data')         return `<span class="badge badge-incomplete">No Data</span>`;
  return `<span class="badge badge-distinction">Medium</span>`;
}

function emptyState(icon, title, msg, action = '') {
  return `
    <div style="text-align:center; padding:40px 20px; color:var(--slate-500); background:#fff; border:1px dashed var(--slate-300); border-radius:var(--radius);">
      <div style="font-size:32px; margin-bottom:10px;">${icon}</div>
      <h3 style="font-size:15px; font-weight:700; color:var(--slate-800); margin-bottom:4px;">${title}</h3>
      <p style="font-size:13px; max-width:400px; margin:0 auto 14px;">${msg}</p>
      ${action}
    </div>
  `;
}

// ── Startup ─────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Initialize light/dark theme
  initTheme();

  // Modal close handlers
  const closeBtn = document.getElementById('modalClose');
  const overlay = document.getElementById('modalOverlay');
  if (closeBtn) closeBtn.onclick = hideModal;
  if (overlay) overlay.onclick = (e) => { if (e.target.id === 'modalOverlay') hideModal(); };

  // Sidebar toggle
  const toggleBtn = document.getElementById('sidebarToggle');
  const sidebar = document.getElementById('sidebar');
  if (toggleBtn && sidebar) {
    toggleBtn.onclick = () => sidebar.classList.toggle('collapsed');
  }

  // Update user badge
  updateUserBadge();

  // Status badge update
  if (typeof API !== 'undefined' && API.health) {
    API.health().then(hr => {
      const liveTag = document.getElementById('serverLiveTag');
      if (liveTag && hr && hr.data) {
        if (hr.data.status === 'standalone_ready') {
          liveTag.textContent = 'Frontend Sync Active';
        } else {
          liveTag.textContent = 'C++ Backend Running';
        }
      }
    });
  }

  // Load settings in background (do not block router!)
  API.getSettings().then(sr => {
    if (sr.ok) {
      window._settings = sr.data;
      const instEl = document.getElementById('topbarInstName');
      const subEl  = document.getElementById('topbarInstSub');
      if (instEl && sr.data.collegeName) instEl.textContent = sr.data.collegeName;
      if (subEl && sr.data.programName) subEl.textContent = `B. Tech. CSBS · ${sr.data.programName}`;
    }
  });

  // Listen for hash changes and load initial page immediately
  window.addEventListener('hashchange', handleRoute);
  handleRoute();

  // Navigation clicks
  document.querySelectorAll('.nav-item').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      location.hash = '#' + el.dataset.page;
    });
  });
});
