import { useEffect, useState, useCallback } from 'react';
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  getToken,
  getMe,
  logout as apiLogout
} from './api.js';
import TaskForm from './components/TaskForm.jsx';
import TaskList from './components/TaskList.jsx';
import Spinner from './components/Spinner.jsx';
import ErrorMessage from './components/ErrorMessage.jsx';
import ConfirmDialog from './components/ConfirmDialog.jsx';
import { ToastContainer } from './components/Toast.jsx';
import AuthForm from './components/AuthForm.jsx';

let toastIdCounter = 0;

function App() {
  // Whether we currently hold a token. This does NOT guarantee the token is
  // still valid - an expired/tampered token is only caught when the backend
  // middleware rejects the next request with 401 (handled in handleAuthError).
  const [authed, setAuthed] = useState(!!getToken());
  const [currentUser, setCurrentUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  const [tasks, setTasks] = useState([]);

  // Loading/error state for the initial GET (Practical 3 pattern, reused here)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Per-operation state so write failures don't get silently ignored
  const [creating, setCreating] = useState(false);
  const [busyTaskId, setBusyTaskId] = useState(null); // task currently being updated/deleted

  const [toasts, setToasts] = useState([]);
  const [confirmTarget, setConfirmTarget] = useState(null); // task pending delete confirmation

  const pushToast = useCallback((type, message) => {
    const id = ++toastIdCounter;
    setToasts((prev) => [...prev, { id, type, message }]);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ----- Central place to react to an expired/invalid token from ANY API call -----
  // (Supplementary problem: redirect to login if a protected request returns 401.)
  const handleAuthError = useCallback(
    (err) => {
      if (err.status === 401) {
        apiLogout();
        setAuthed(false);
        setCurrentUser(null);
        pushToast('error', 'Session expired. Please log in again.');
        return true;
      }
      return false;
    },
    [pushToast]
  );

  // ----- Initial fetch (GET /tasks on mount / on login) -----
  const loadTasks = useCallback(() => {
    setLoading(true);
    setError(null);
    getTasks()
      .then((data) => setTasks(data))
      .catch((err) => {
        if (!handleAuthError(err)) setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [handleAuthError]);

  useEffect(() => {
    if (!authed) {
      setAuthChecked(true);
      return;
    }
    // /auth/me (supplementary problem): confirms the token is valid and
    // shows who's logged in.
    getMe()
      .then(setCurrentUser)
      .catch((err) => handleAuthError(err))
      .finally(() => setAuthChecked(true));
    loadTasks();
  }, [authed, loadTasks, handleAuthError]);

  // ----- Create (optimistic UI) -----
  const handleCreate = async (taskInput) => {
    setCreating(true);

    // Optimistic placeholder shown immediately, before the server confirms
    const tempId = `temp-${Date.now()}`;
    const optimisticTask = { ...taskInput, _id: tempId, completed: false, __optimistic: true };
    setTasks((prev) => [optimisticTask, ...prev]);

    try {
      const savedTask = await createTask(taskInput);
      // Replace the optimistic placeholder with the real, server-confirmed task
      setTasks((prev) => prev.map((t) => (t._id === tempId ? savedTask : t)));
      pushToast('success', 'Task created');
    } catch (err) {
      // Roll back the optimistic update on failure
      setTasks((prev) => prev.filter((t) => t._id !== tempId));
      if (!handleAuthError(err)) pushToast('error', `Failed to create task: ${err.message}`);
    } finally {
      setCreating(false);
    }
  };

  // ----- Update (used for both "toggle complete" and "edit") -----
  const handleUpdate = async (id, updates) => {
    setBusyTaskId(id);
    try {
      const updatedTask = await updateTask(id, updates);
      setTasks((prev) => prev.map((t) => (t._id === id ? updatedTask : t)));
      pushToast('success', 'Task updated');
    } catch (err) {
      if (!handleAuthError(err)) pushToast('error', `Failed to update task: ${err.message}`);
    } finally {
      setBusyTaskId(null);
    }
  };

  // ----- Delete (with confirmation) -----
  const requestDelete = (task) => setConfirmTarget(task);
  const cancelDelete = () => setConfirmTarget(null);

  const confirmDelete = async () => {
    const task = confirmTarget;
    if (!task) return;
    setConfirmTarget(null);
    setBusyTaskId(task._id);
    try {
      await deleteTask(task._id);
      setTasks((prev) => prev.filter((t) => t._id !== task._id));
      pushToast('success', 'Task deleted');
    } catch (err) {
      if (!handleAuthError(err)) pushToast('error', `Failed to delete task: ${err.message}`);
    } finally {
      setBusyTaskId(null);
    }
  };

  // ----- Logout (clears the token from the client - supplementary problem) -----
  const handleLogout = () => {
    apiLogout();
    setAuthed(false);
    setCurrentUser(null);
    setTasks([]);
    pushToast('success', 'Logged out');
  };

  const handleAuthSuccess = () => {
    setAuthChecked(false);
    setAuthed(true);
  };

  // ----- Logged-out view: login/register -----
  if (!authed) {
    return (
      <div className="app">
        <header>
          <h1>Task Manager</h1>
          <p className="subtitle">Sign in to manage your tasks</p>
        </header>

        <AuthForm onAuthSuccess={handleAuthSuccess} pushToast={pushToast} />

        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </div>
    );
  }

  // ----- Logged-in view: task manager (matches Practical 6, plus auth) -----
  return (
    <div className="app">
      <header>
        <div className="header-row">
          <div>
            <h1>Task Manager</h1>
            <p className="subtitle">
              React (5173) ⇄ Express/MongoDB (5000)
              {currentUser ? ` · ${currentUser.email}` : ''}
            </p>
          </div>
          <button className="btn btn-secondary" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <TaskForm onCreate={handleCreate} creating={creating} />

      {(loading || !authChecked) && <Spinner label="Loading tasks..." />}
      {!loading && authChecked && error && <ErrorMessage message={error} onRetry={loadTasks} />}
      {!loading && authChecked && !error && (
        <TaskList
          tasks={tasks}
          onToggleComplete={handleUpdate}
          onEdit={handleUpdate}
          onDeleteRequest={requestDelete}
          busyTaskId={busyTaskId}
        />
      )}

      <ConfirmDialog
        open={!!confirmTarget}
        title="Delete task?"
        message={confirmTarget ? `Are you sure you want to delete "${confirmTarget.title}"? This cannot be undone.` : ''}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

export default App;
