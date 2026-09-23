const BASE_URL = 'http://localhost:5000';

// Helper: parses the response and throws a readable Error if the request failed.
// This lets every calling component handle failures the same way, whether it's
// a network failure, a 404, a validation error, or a 500.
async function handleResponse(res) {
  let body = null;
  try {
    body = await res.json();
  } catch {
    // response had no JSON body (e.g. network-level failure already thrown before this)
  }

  if (!res.ok) {
    const message = (body && body.error) || `Request failed with status ${res.status}`;
    throw new Error(message);
  }

  return body;
}

export async function getTasks() {
  const res = await fetch(`${BASE_URL}/tasks`);
  return handleResponse(res);
}

export async function getTask(id) {
  const res = await fetch(`${BASE_URL}/tasks/${id}`);
  return handleResponse(res);
}

export async function createTask(task) {
  const res = await fetch(`${BASE_URL}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(task)
  });
  return handleResponse(res);
}

export async function updateTask(id, updates) {
  const res = await fetch(`${BASE_URL}/tasks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  return handleResponse(res);
}

export async function deleteTask(id) {
  const res = await fetch(`${BASE_URL}/tasks/${id}`, {
    method: 'DELETE'
  });
  return handleResponse(res);
}
