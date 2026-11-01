/**
 * MITS Academic Result Analyzer — Universal Full-Stack Client SDK
 * Direct bridge to Node.js Backend & Real-Time SSE Event Stream
 */

(function (window) {
  'use strict';

  const API_BASE = window.location.origin;

  async function apiFetch(endpoint, options = {}) {
    const token = sessionStorage.getItem('mits_token') || localStorage.getItem('mits_token');
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
      });
      const data = await res.json();
      return data;
    } catch (e) {
      console.warn(`API call failed for ${endpoint}:`, e.message);
      return { ok: false, error: e.message };
    }
  }

  const MITS = {
    // ── Authentication ──────────────────────────────────────────────
    async login(email, password) {
      const res = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (res.ok && res.token) {
        sessionStorage.setItem('mits_token', res.token);
        localStorage.setItem('mits_token', res.token);
        sessionStorage.setItem('mits_user', JSON.stringify(res.user));
        localStorage.setItem('mits_user', JSON.stringify(res.user));

        // Legacy compatibility
        sessionStorage.setItem('mits_auth_token', res.token);
        sessionStorage.setItem('mits_auth_user', JSON.stringify(res.user));
        localStorage.setItem('ra_session', JSON.stringify({
          role: res.user.role,
          email: res.user.email,
          name: res.user.fullName,
          studentId: res.user.referenceId,
          rollNo: res.user.rollNo,
        }));
      }
      return res;
    },

    async register(data) {
      const res = await apiFetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (res.ok && res.token) {
        sessionStorage.setItem('mits_token', res.token);
        localStorage.setItem('mits_token', res.token);
        sessionStorage.setItem('mits_user', JSON.stringify(res.user));
        localStorage.setItem('mits_user', JSON.stringify(res.user));
      }
      return res;
    },

    async getSession() {
      try {
        const stored = sessionStorage.getItem('mits_user') || localStorage.getItem('mits_user');
        if (stored) return JSON.parse(stored);
      } catch (e) {}
      const res = await apiFetch('/api/auth/session');
      return res.ok ? res.user : null;
    },

    async logout() {
      await apiFetch('/api/auth/logout', { method: 'POST' });
      sessionStorage.clear();
      localStorage.removeItem('mits_token');
      localStorage.removeItem('mits_user');
      localStorage.removeItem('ra_session');
      window.location.href = window.location.pathname.includes('/student/')
        ? 'login.html'
        : '../../student/login.html';
    },

    // ── Students & Teachers ─────────────────────────────────────────
    async getStudents(q = '') {
      const res = await apiFetch(`/api/students?q=${encodeURIComponent(q)}`);
      return res.ok ? res.data : [];
    },

    async getTeachers() {
      const res = await apiFetch('/api/teachers');
      return res.ok ? res.data : [];
    },

    async getSubjects() {
      const res = await apiFetch('/api/subjects');
      return res.ok ? res.data : [];
    },

    // ── Results & Marks ─────────────────────────────────────────────
    async getResults(studentId) {
      const res = await apiFetch(`/api/results?studentId=${encodeURIComponent(studentId)}`);
      return res.ok ? res.data : [];
    },

    async saveMark(studentId, subjectId, marksObtained, isAbsent = false) {
      return await apiFetch('/api/results', {
        method: 'POST',
        body: JSON.stringify({ studentId, subjectId, marksObtained, isAbsent }),
      });
    },

    async bulkSaveMarks(list) {
      return await apiFetch('/api/results/bulk', {
        method: 'POST',
        body: JSON.stringify({ list }),
      });
    },

    // ── Doubt Sessions ──────────────────────────────────────────────
    async getDoubts(userId, role = 'student') {
      const res = await apiFetch(`/api/doubts?userId=${encodeURIComponent(userId)}&role=${role}`);
      return res.ok ? res.data : [];
    },

    async bookDoubt(data) {
      return await apiFetch('/api/doubts', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    async updateDoubtStatus(doubtId, status, responseNote = '', teacherId = '') {
      return await apiFetch('/api/doubts', {
        method: 'PUT',
        body: JSON.stringify({ doubtId, status, responseNote, teacherId }),
      });
    },

    // ── Messaging ───────────────────────────────────────────────────
    async getMessages(user1, user2) {
      const res = await apiFetch(`/api/messages?u1=${encodeURIComponent(user1)}&u2=${encodeURIComponent(user2)}`);
      return res.ok ? res.data : [];
    },

    async sendMessage(senderId, receiverId, content) {
      return await apiFetch('/api/messages', {
        method: 'POST',
        body: JSON.stringify({ senderId, receiverId, content }),
      });
    },

    // ── Notifications ───────────────────────────────────────────────
    async getNotifications(userId) {
      const res = await apiFetch(`/api/notifications?userId=${encodeURIComponent(userId)}`);
      return res.ok ? res.data : [];
    },

    async markNotificationRead(id) {
      return await apiFetch('/api/notifications', {
        method: 'PUT',
        body: JSON.stringify({ id }),
      });
    },

    async markAllNotificationsRead(userId) {
      return await apiFetch('/api/notifications', {
        method: 'PUT',
        body: JSON.stringify({ all: true, userId }),
      });
    },

    // ── Real-Time Event Stream (SSE) ────────────────────────────────
    initRealtime(onEvent) {
      if (typeof window.EventSource === 'undefined') return;
      try {
        const es = new EventSource('/api/realtime');
        es.onmessage = (e) => {
          try {
            const data = JSON.parse(e.data);
            if (typeof onEvent === 'function') onEvent(data.type, data.data);
          } catch (err) {}
        };
        es.addEventListener('marks_updated', (e) => {
          if (typeof onEvent === 'function') onEvent('marks_updated', JSON.parse(e.data));
          window.dispatchEvent(new CustomEvent('ra_data_sync'));
        });
        es.addEventListener('doubt_booked', (e) => {
          if (typeof onEvent === 'function') onEvent('doubt_booked', JSON.parse(e.data));
        });
        es.addEventListener('doubt_status_changed', (e) => {
          if (typeof onEvent === 'function') onEvent('doubt_status_changed', JSON.parse(e.data));
        });
        es.addEventListener('new_message', (e) => {
          if (typeof onEvent === 'function') onEvent('new_message', JSON.parse(e.data));
        });
        es.addEventListener('new_notification', (e) => {
          if (typeof onEvent === 'function') onEvent('new_notification', JSON.parse(e.data));
        });
        return es;
      } catch (err) {
        console.warn('Realtime SSE could not connect:', err);
      }
    },
  };

  window.MITS = MITS;

  // Auto-connect real-time listener
  if (typeof window !== 'undefined') {
    MITS.initRealtime((type, data) => {
      console.log(`⚡ Real-Time Update received [${type}]`, data);
    });
  }
})(window);
