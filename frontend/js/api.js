/**
 * js/api.js — Centralized API utility
 * All backend calls go through here. JWT is managed in localStorage.
 */
const API_BASE = 'http://localhost:5000/api';

const api = {
  // ── Token helpers ──────────────────────────────────────────────────────────
  getToken: () => localStorage.getItem('initium_token'),
  setToken: (t) => localStorage.setItem('initium_token', t),
  getUser:  () => JSON.parse(localStorage.getItem('initium_user') || 'null'),
  setUser:  (u) => localStorage.setItem('initium_user', JSON.stringify(u)),
  logout: () => {
    localStorage.removeItem('initium_token');
    localStorage.removeItem('initium_user');
    window.location.href = 'index.html';
  },

  // ── Core fetch wrapper ─────────────────────────────────────────────────────
  async request(path, options = {}) {
    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
    const token = this.getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
    const data = await res.json();

    if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
    return data;
  },

  get:    (path)         => api.request(path, { method: 'GET' }),
  post:   (path, body)   => api.request(path, { method: 'POST',   body: JSON.stringify(body) }),
  put:    (path, body)   => api.request(path, { method: 'PUT',    body: JSON.stringify(body) }),
  delete: (path)         => api.request(path, { method: 'DELETE' }),
};

// Guard: redirect to login if no token (call on protected pages)
function requireAuth(allowedRole = null) {
  const token = api.getToken();
  const user  = api.getUser();
  if (!token || !user) { window.location.href = 'index.html'; return false; }
  if (allowedRole && user.role !== allowedRole) {
    window.location.href = user.role === 'admin' ? 'admin.html' : 'profile.html';
    return false;
  }
  return true;
}
