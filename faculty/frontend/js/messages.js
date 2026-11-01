/**
 * messages.js — Faculty & Student Messaging Center
 * Two-way real-time communication between students and faculty mentors.
 */

let _activeStudentChat = null;
let _allChatStudents = [];

async function loadMessages() {
  const contentEl = document.getElementById('pageContent');
  if (!contentEl) return;

  contentEl.innerHTML = `
    <div class="page-header">
      <div>
        <h1>Student Communication &amp; Messages</h1>
        <p>Direct communication channel with your enrolled students</p>
      </div>
    </div>

    <div class="card" style="padding:0; overflow:hidden; display:flex; height:680px; border-radius:12px;">
      <!-- Left sidebar: Students -->
      <div style="width:320px; border-right:1px solid var(--slate-200); display:flex; flex-direction:column; background:var(--slate-50);">
        <div style="padding:16px; border-bottom:1px solid var(--slate-200);">
          <input type="text" class="form-control" id="chatStudentSearch" placeholder="Search student name or roll..." oninput="filterChatStudents(this.value)">
        </div>
        <div id="chatStudentList" style="flex:1; overflow-y:auto; padding:8px;">
          <div style="text-align:center; padding:20px; color:var(--slate-400); font-size:13px;">Loading student roster...</div>
        </div>
      </div>

      <!-- Right chat panel -->
      <div style="flex:1; display:flex; flex-direction:column; background:#fff;">
        <!-- Header -->
        <div id="chatHeader" style="padding:14px 20px; border-bottom:1px solid var(--slate-200); display:flex; align-items:center; justify-content:space-between; background:var(--slate-50);">
          <div style="font-size:14px; font-weight:700; color:var(--slate-700);">Select a student from the left panel to start messaging</div>
        </div>

        <!-- Messages log -->
        <div id="chatMessageLog" style="flex:1; overflow-y:auto; padding:20px; display:flex; flex-direction:column; gap:12px;">
          <div style="text-align:center; margin:auto; color:var(--slate-400);">
            <div style="font-size:40px; margin-bottom:8px;">💬</div>
            <p>Select any student to view your chat conversation history.</p>
          </div>
        </div>

        <!-- Input box -->
        <div id="chatInputArea" style="padding:16px; border-top:1px solid var(--slate-200); display:none;">
          <form onsubmit="handleSendFacultyMessage(event)" style="display:flex; gap:10px;">
            <input type="text" class="form-control" id="facultyMsgInput" placeholder="Type your message or feedback to student..." style="flex:1;" required autocomplete="off">
            <button type="submit" class="btn btn-primary" style="padding:0 24px;">Send 📤</button>
          </form>
        </div>
      </div>
    </div>
  `;

  await initChatStudents();
}

async function initChatStudents() {
  _allChatStudents = (typeof MITS !== 'undefined' && MITS.getStudents)
    ? await MITS.getStudents()
    : [];
  renderChatStudentList(_allChatStudents);
}

function filterChatStudents(query) {
  const q = String(query || '').trim().toLowerCase();
  const filtered = _allChatStudents.filter(s =>
    (s.name || '').toLowerCase().includes(q) ||
    (s.rollNo || '').toLowerCase().includes(q)
  );
  renderChatStudentList(filtered);
}

function renderChatStudentList(students) {
  const container = document.getElementById('chatStudentList');
  if (!container) return;

  if (!students.length) {
    container.innerHTML = `<div style="text-align:center; padding:20px; color:var(--slate-400); font-size:13px;">No matching students</div>`;
    return;
  }

  container.innerHTML = students.map(s => {
    const isSelected = _activeStudentChat && _activeStudentChat.id === s.id;
    return `
      <div onclick="selectStudentForChat('${s.id}')" style="padding:10px 12px; border-radius:8px; margin-bottom:4px; cursor:pointer; background:${isSelected ? 'rgba(56,189,248,0.15)' : 'transparent'}; border:1px solid ${isSelected ? 'var(--blue)' : 'transparent'}; transition:all 0.15s;">
        <div style="font-size:13.5px; font-weight:700; color:var(--slate-800);">${escHtml(s.name)}</div>
        <div style="font-size:11.5px; color:var(--slate-500); display:flex; justify-content:space-between; margin-top:2px;">
          <span><code>${escHtml(s.rollNo)}</code></span>
          <span>${escHtml(s.className || 'CSBS')}</span>
        </div>
      </div>
    `;
  }).join('');
}

async function selectStudentForChat(studentId) {
  _activeStudentChat = _allChatStudents.find(s => s.id === studentId) || { id: studentId, name: 'Student', rollNo: '' };
  renderChatStudentList(_allChatStudents);

  const header = document.getElementById('chatHeader');
  if (header) {
    header.innerHTML = `
      <div>
        <div style="font-size:14.5px; font-weight:800; color:var(--slate-800);">👨‍🎓 ${escHtml(_activeStudentChat.name)}</div>
        <div style="font-size:11.5px; color:var(--slate-500);">Roll: ${escHtml(_activeStudentChat.rollNo)} · Class: ${escHtml(_activeStudentChat.className || 'CSBS')}</div>
      </div>
      <div>
        <span class="badge" style="background:#dcfce7; color:#166534;">Active Conversation</span>
      </div>
    `;
  }

  document.getElementById('chatInputArea').style.display = 'block';
  await loadChatHistory();
}

async function loadChatHistory() {
  if (!_activeStudentChat) return;
  const log = document.getElementById('chatMessageLog');
  if (!log) return;

  let user = null;
  try {
    user = JSON.parse(sessionStorage.getItem('mits_user') || localStorage.getItem('mits_user') || '{}');
  } catch (e) {}

  const facultyId = (user && user.referenceId) ? user.referenceId : 'faculty';
  const messages = (typeof MITS !== 'undefined' && MITS.getMessages)
    ? await MITS.getMessages(facultyId, _activeStudentChat.id)
    : [];

  if (!messages.length) {
    log.innerHTML = `
      <div style="text-align:center; margin:auto; color:var(--slate-400);">
        <p>No messages exchanged with ${escHtml(_activeStudentChat.name)} yet.</p>
        <small>Send a greeting or consultation note below.</small>
      </div>
    `;
    return;
  }

  log.innerHTML = messages.map(m => {
    const isMe = m.senderId === facultyId || m.senderRole === 'faculty';
    const timeStr = new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return `
      <div style="display:flex; flex-direction:column; align-items:${isMe ? 'flex-end' : 'flex-start'};">
        <div style="max-width:70%; padding:10px 14px; border-radius:${isMe ? '14px 14px 2px 14px' : '14px 14px 14px 2px'}; background:${isMe ? '#0284c7' : '#f1f5f9'}; color:${isMe ? '#fff' : '#1e293b'}; font-size:13.5px; line-height:1.45; box-shadow:0 1px 3px rgba(0,0,0,0.06);">
          ${escHtml(m.content)}
        </div>
        <div style="font-size:10.5px; color:var(--slate-400); margin-top:3px; padding:0 4px;">
          ${isMe ? 'You · ' : escHtml(m.senderName) + ' · '}${timeStr}
        </div>
      </div>
    `;
  }).join('');

  log.scrollTop = log.scrollHeight;
}

async function handleSendFacultyMessage(e) {
  e.preventDefault();
  const input = document.getElementById('facultyMsgInput');
  const text = input ? input.value.trim() : '';
  if (!text || !_activeStudentChat) return;

  let user = null;
  try {
    user = JSON.parse(sessionStorage.getItem('mits_user') || localStorage.getItem('mits_user') || '{}');
  } catch (e) {}

  const facultyId = (user && user.referenceId) ? user.referenceId : 'faculty';
  if (typeof MITS !== 'undefined' && MITS.sendMessage) {
    input.value = '';
    const res = await MITS.sendMessage(facultyId, _activeStudentChat.id, text);
    if (res.ok) {
      await loadChatHistory();
    } else {
      showToast('Failed to deliver message', 'error');
    }
  }
}

// Global real-time listener for incoming student messages
window.addEventListener('new_message', () => {
  const badge = document.getElementById('unreadMessagesBadge');
  if (badge) {
    const current = Number(badge.textContent || 0) + 1;
    badge.textContent = current;
    badge.style.display = 'inline-block';
  }
  showToast('💬 New message received from student', 'info');
  if (window.location.hash === '#messages' && _activeStudentChat) {
    loadChatHistory();
  }
});
