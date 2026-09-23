const BASE_URL = 'http://localhost:5000';
const TOKEN_KEY = 'taskmanager_token';

// ----- Token storage (localStorage keeps the user logged in across refreshes) -----
export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}
export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Helper: parses the response and throws a readable Error if the request failed.
// This lets every calling component handle failures the same way, whether it's
// a network failure, a 404, a validation error, a 401, or a 500.
// err.status is attached so callers can specifically detect "session expired".
async function handleResponse(res) {
  let body = null;
  try {
    body = await res.json();
  } catch {
    // response had no JSON body (e.g. network-level failure already thrown before this)
  }

  if (!res.ok) {
    const message = (body && body.error) || `Request failed with status ${res.status}`;
    const error = new Error(message);
    error.status = res.status;
    throw error;
  }

  return body;
}

// ----- Auth -----
export async function register(email, password) {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return handleResponse(res);
}

export async function login(email, password) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await handleResponse(res);
  setToken(data.token);
  return data;
}

export async function getMe() {
  const res = await fetch(`${BASE_URL}/auth/me`, {
    headers: { ...authHeaders() }
  });
  return handleResponse(res);
}

export function logout() {
  clearToken();
}

// ----- Tasks (all routes below require a valid JWT - see backend/server.js) -----
export async function getTasks() {
  const res = await fetch(`${BASE_URL}/tasks`, { headers: { ...authHeaders() } });
  return handleResponse(res);
}

export async function getTask(id) {
  const res = await fetch(`${BASE_URL}/tasks/${id}`, { headers: { ...authHeaders() } });
  return handleResponse(res);
}

export async function createTask(task) {
  const res = await fetch(`${BASE_URL}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(task)
  });
  return handleResponse(res);
}

export async function updateTask(id, updates) {
  const res = await fetch(`${BASE_URL}/tasks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(updates)
  });
  return handleResponse(res);
}

export async function deleteTask(id) {
  const res = await fetch(`${BASE_URL}/tasks/${id}`, {
    method: 'DELETE',
    headers: { ...authHeaders() }
  });
  return handleResponse(res);
}
