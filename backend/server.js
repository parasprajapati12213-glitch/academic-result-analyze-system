/**
 * Academic Result Analyzer — Unified Full-Stack Backend & Real-Time Server
 * Serves Static Frontends + REST APIs + Server-Sent Events (SSE) on Port 5500
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const { EventEmitter } = require('events');
const db = require('./database/db.js');

const PORT = process.env.PORT || 5500;
const ROOT_DIR = path.resolve(__dirname, '..');
const realTimeBus = new EventEmitter();

// Real-Time connected SSE clients
const sseClients = new Set();

function broadcastEvent(eventType, payload) {
  const data = JSON.stringify({ type: eventType, data: payload, timestamp: Date.now() });
  for (const client of sseClients) {
    try {
      client.write(`event: ${eventType}\ndata: ${data}\n\n`);
    } catch (e) {
      sseClients.delete(client);
    }
  }
}

// MIME Types
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.pdf':  'application/pdf',
};

function parseBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        resolve({});
      }
    });
  });
}

function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });
  res.end(JSON.stringify(data));
}

// ── HTTP Request Handler ───────────────────────────────────────────────
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method.toUpperCase();

  // CORS preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    });
    return res.end();
  }

  // ═══════════════════════════════════════════════════════════════════
  //  1. REAL-TIME SERVER-SENT EVENTS (SSE)
  // ═══════════════════════════════════════════════════════════════════
  if (pathname === '/api/realtime') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    });
    res.write('event: connected\ndata: {"status":"connected"}\n\n');
    sseClients.add(res);

    req.on('close', () => {
      sseClients.delete(res);
    });
    return;
  }

  // ═══════════════════════════════════════════════════════════════════
  //  2. REST API ROUTES
  // ═══════════════════════════════════════════════════════════════════
  if (pathname.startsWith('/api/')) {
    // 2.1 Auth Login
    if (pathname === '/api/auth/login' && method === 'POST') {
      const body = await parseBody(req);
      const result = db.login(body.email, body.password);
      if (!result.ok) return sendJSON(res, 401, result);
      return sendJSON(res, 200, result);
    }

    // 2.2 Auth Register
    if (pathname === '/api/auth/register' && method === 'POST') {
      const body = await parseBody(req);
      const result = db.register(body);
      if (!result.ok) return sendJSON(res, 400, result);
      return sendJSON(res, 200, result);
    }

    // 2.3 Verify Session
    if (pathname === '/api/auth/session' && method === 'GET') {
      const token = req.headers['authorization'] || parsedUrl.query.token;
      const user = db.verifySession(token);
      if (!user) return sendJSON(res, 401, { ok: false, error: 'Unauthorized' });
      return sendJSON(res, 200, { ok: true, user });
    }

    // 2.4 Auth Logout
    if (pathname === '/api/auth/logout' && method === 'POST') {
      const token = req.headers['authorization'] || parsedUrl.query.token;
      return sendJSON(res, 200, db.logout(token));
    }

    // 2.5 Students List & Search
    if (pathname === '/api/students' && method === 'GET') {
      let list = db.tables.students;
      const q = parsedUrl.query.q ? parsedUrl.query.q.toLowerCase() : '';
      if (q) {
        list = list.filter(s => s.name.toLowerCase().includes(q) || s.rollNo.toLowerCase().includes(q));
      }
      return sendJSON(res, 200, { ok: true, data: list });
    }

    // 2.6 Teachers List (Dynamic with subjects & slots)
    if (pathname === '/api/teachers' && method === 'GET') {
      const teachers = db.tables.teachers.map(t => {
        const assignedSubjects = db.tables.subjects.filter(s => (t.subjectIds || []).includes(s.id) || (t.subjectIds || []).includes(s.code));
        return {
          ...t,
          subjects: assignedSubjects,
        };
      });
      return sendJSON(res, 200, { ok: true, data: teachers });
    }

    // 2.7 Subjects List
    if (pathname === '/api/subjects' && method === 'GET') {
      return sendJSON(res, 200, { ok: true, data: db.tables.subjects });
    }

    // 2.8 Results / Marks API
    if (pathname === '/api/results') {
      if (method === 'GET') {
        const studentId = parsedUrl.query.studentId || parsedUrl.query.sid || parsedUrl.query.roll;
        if (studentId) {
          const semResults = db.getResultsForStudent(studentId);
          return sendJSON(res, 200, { ok: true, data: semResults });
        }
        return sendJSON(res, 200, { ok: true, data: db.tables.results });
      }

      if (method === 'POST') {
        const body = await parseBody(req);
        const saved = db.saveMark(body, 'faculty');
        broadcastEvent('marks_updated', { studentId: body.studentId, subjectId: body.subjectId });
        return sendJSON(res, 200, { ok: true, data: saved });
      }
    }

    if (pathname === '/api/results/bulk' && method === 'POST') {
      const body = await parseBody(req);
      const list = Array.isArray(body) ? body : (body.list || []);
      const savedList = list.map(item => db.saveMark(item, 'faculty'));
      broadcastEvent('marks_updated', { count: savedList.length });
      return sendJSON(res, 200, { ok: true, data: savedList });
    }

    // 2.9 Doubt Sessions API
    if (pathname === '/api/doubts') {
      if (method === 'GET') {
        const userId = parsedUrl.query.userId;
        const role = parsedUrl.query.role || 'student';
        if (!userId) {
          return sendJSON(res, 200, { ok: true, data: db.tables.doubts });
        }
        const doubts = db.getDoubtsForUser(userId, role);
        return sendJSON(res, 200, { ok: true, data: doubts });
      }

      if (method === 'POST') {
        const body = await parseBody(req);
        const doubtSession = db.bookDoubt(body);
        broadcastEvent('doubt_booked', doubtSession);
        return sendJSON(res, 200, { ok: true, data: doubtSession });
      }

      if (method === 'PUT') {
        const body = await parseBody(req);
        const updated = db.updateDoubtStatus(body.doubtId, body.status, body.responseNote, body.teacherId);
        broadcastEvent('doubt_status_changed', updated);
        return sendJSON(res, 200, { ok: true, data: updated });
      }
    }

    // 2.10 Messaging API
    if (pathname === '/api/messages') {
      if (method === 'GET') {
        const u1 = parsedUrl.query.u1;
        const u2 = parsedUrl.query.u2;
        if (!u1 || !u2) {
          return sendJSON(res, 200, { ok: true, data: [] });
        }
        const conversation = db.getConversation(u1, u2);
        return sendJSON(res, 200, { ok: true, data: conversation });
      }

      if (method === 'POST') {
        const body = await parseBody(req);
        const msg = db.sendMessage(body.senderId, body.receiverId, body.content);
        broadcastEvent('new_message', msg);
        return sendJSON(res, 200, { ok: true, data: msg });
      }
    }

    // 2.11 Notifications API
    if (pathname === '/api/notifications') {
      if (method === 'GET') {
        const userId = parsedUrl.query.userId;
        const list = userId ? db.getNotifications(userId) : [];
        return sendJSON(res, 200, { ok: true, data: list });
      }

      if (method === 'PUT') {
        const body = await parseBody(req);
        if (body.all && body.userId) {
          db.markAllNotificationsRead(body.userId);
        } else if (body.id) {
          db.markNotificationRead(body.id);
        }
        return sendJSON(res, 200, { ok: true });
      }
    }

    return sendJSON(res, 404, { ok: false, error: 'Endpoint not found' });
  }

  // ═══════════════════════════════════════════════════════════════════
  //  3. STATIC FILE SERVER (STUDENT & FACULTY INTERFACES)
  // ═══════════════════════════════════════════════════════════════════
  let safePath = path.normalize(decodeURIComponent(pathname)).replace(/^(\.\.[\/\\])+/, '');
  if (safePath === '/' || safePath === '\\') {
    safePath = '/index.html';
  }

  const filePath = path.join(ROOT_DIR, safePath);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      if (pathname.startsWith('/faculty/frontend/')) {
        const fallback = path.join(ROOT_DIR, 'faculty', 'frontend', 'index.html');
        return serveFile(res, fallback);
      }
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      return res.end(`404 Not Found: ${pathname}`);
    }
    serveFile(res, filePath);
  });
});

function serveFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      return res.end('500 Internal Server Error');
    }
    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache',
    });
    res.end(content);
  });
}

// Start Server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Academic Result Analyzer Full-Stack Server listening at http://localhost:${PORT}`);
  console.log(`   Student Interface: http://localhost:${PORT}/student/login.html`);
  console.log(`   Faculty Interface: http://localhost:${PORT}/faculty/frontend/index.html`);
});
