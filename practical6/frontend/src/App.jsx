import { useEffect, useState, useCallback } from 'react';
import { getTasks, createTask, updateTask, deleteTask } from './api.js';
import TaskForm from './components/TaskForm.jsx';
import TaskList from './components/TaskList.jsx';
import Spinner from './components/Spinner.jsx';
import ErrorMessage from './components/ErrorMessage.jsx';
import ConfirmDialog from './components/ConfirmDialog.jsx';
import { ToastContainer } from './components/Toast.jsx';

let toastIdCounter = 0;

function App() {
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

  // ----- Initial fetch (GET /tasks on mount) -----
  const loadTasks = useCallback(() => {
    setLoading(true);
    setError(null);
    getTasks()
      .then((data) => setTasks(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

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
      pushToast('error', `Failed to create task: ${err.message}`);
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
      pushToast('error', `Failed to update task: ${err.message}`);
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
      pushToast('error', `Failed to delete task: ${err.message}`);
    } finally {
      setBusyTaskId(null);
    }
  };

  return (
    <div className="app">
      <header>
        <h1>Task Manager</h1>
        <p className="subtitle">React (5173) ⇄ Express/MongoDB (5000)</p>
      </header>

      <TaskForm onCreate={handleCreate} creating={creating} />

      {loading && <Spinner label="Loading tasks..." />}
      {!loading && error && <ErrorMessage message={error} onRetry={loadTasks} />}
      {!loading && !error && (
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
