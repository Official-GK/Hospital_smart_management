/**
 * api.js — Centralised API client
 * All backend calls go through here. Update BASE_URL if backend port changes.
 */

const BASE_URL = 'http://localhost:8000';

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

// ── Auth ──────────────────────────────────────────────────────────────────────

export async function apiLogin(userId, password) {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, password }),
  });
  return handleResponse(res);
}

export async function apiLogout() {
  const token = getToken();
  if (!token) return;
  await fetch(`${BASE_URL}/api/auth/logout`, {
    method: 'POST',
    headers: authHeaders(),
  }).catch(() => {});
}

// ── Users ─────────────────────────────────────────────────────────────────────

export async function apiGetUsers() {
  const res = await fetch(`${BASE_URL}/api/users`, { headers: authHeaders() });
  return handleResponse(res);
}

export async function apiCreateUser(data) {
  const res = await fetch(`${BASE_URL}/api/users`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function apiDeleteUser(userId) {
  const res = await fetch(`${BASE_URL}/api/users/${encodeURIComponent(userId)}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  return handleResponse(res);
}
