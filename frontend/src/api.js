/**
 * api.js — Centralised API client
 * Connects to FastAPI backend if available, with intelligent demo fallback for GitHub Pages static hosting.
 */

const BASE_URL = import.meta.env.VITE_API_URL || 
  (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:8000'
    : '');

function getToken() {
  return localStorage.getItem('hqms_token');
}

function authHeaders() {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse(res) {
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || `HTTP ${res.status}`);
  }
  return res.json();
}

// ── Demo Fallback Storage (for GitHub Pages when backend server is offline) ───

const DEMO_STORAGE_KEY = 'hqms_demo_users';

function getDemoUsers() {
  try {
    const data = localStorage.getItem(DEMO_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveDemoUsers(users) {
  localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(users));
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export async function apiLogin(userId, password) {
  if (BASE_URL) {
    try {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, password }),
      });
      return await handleResponse(res);
    } catch (err) {
      // If network error (e.g. backend down or blocked on static host), fallback to prototype demo auth
      if (err.message && err.message.includes('Invalid User ID')) throw err;
      console.warn('Backend unavailable, using prototype demo mode:', err.message);
    }
  }

  // Standalone prototype demo credentials
  if (userId === 'admin' && password === 'abc@123') {
    return {
      access_token: 'demo-token-' + Date.now(),
      token_type: 'bearer',
      role: 'Admin',
      user_id: 'admin',
    };
  }
  throw new Error('Invalid User ID or Password');
}

export async function apiLogout() {
  const token = getToken();
  if (!token) return;
  if (BASE_URL) {
    await fetch(`${BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: authHeaders(),
    }).catch(() => {});
  }
}

// ── Users ─────────────────────────────────────────────────────────────────────

export async function apiGetUsers() {
  if (BASE_URL) {
    try {
      const res = await fetch(`${BASE_URL}/api/users`, { headers: authHeaders() });
      return await handleResponse(res);
    } catch (err) {
      console.warn('Backend unavailable, using demo storage:', err.message);
    }
  }
  return getDemoUsers();
}

export async function apiCreateUser(data) {
  if (BASE_URL) {
    try {
      const res = await fetch(`${BASE_URL}/api/users`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(data),
      });
      return await handleResponse(res);
    } catch (err) {
      if (err.message && !err.message.includes('Failed to fetch') && !err.message.includes('NetworkError')) {
        throw err;
      }
      console.warn('Backend unavailable, saving to demo storage:', err.message);
    }
  }

  const userId = data.user_id?.trim();
  if (userId.toLowerCase() === 'admin') {
    throw new Error("User ID 'admin' is reserved");
  }
  const users = getDemoUsers();
  if (users.some((u) => u.user_id.toLowerCase() === userId.toLowerCase())) {
    throw new Error(`User ID '${userId}' already exists`);
  }

  const newUser = {
    user_id: userId,
    full_name: data.full_name?.trim(),
    role: data.role,
    created_at: new Date().toISOString(),
  };
  users.push(newUser);
  saveDemoUsers(users);
  return newUser;
}

export async function apiDeleteUser(userId) {
  if (BASE_URL) {
    try {
      const res = await fetch(`${BASE_URL}/api/users/${encodeURIComponent(userId)}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      return await handleResponse(res);
    } catch (err) {
      if (err.message && !err.message.includes('Failed to fetch') && !err.message.includes('NetworkError')) {
        throw err;
      }
      console.warn('Backend unavailable, deleting from demo storage:', err.message);
    }
  }

  const users = getDemoUsers();
  const filtered = users.filter((u) => u.user_id !== userId);
  saveDemoUsers(filtered);
  return { message: 'User deleted' };
}

