import { useState } from 'react';

function TaskItem({ task, onToggleComplete, onEdit, onDeleteRequest, busy }) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');

  const saveEdit = () => {
    if (!title.trim()) return;
    onEdit(task._id, { title, description, completed: task.completed, priority: task.priority });
    setIsEditing(false);
  };

  const cancelEdit = () => {
    setTitle(task.title);
    setDescription(task.description || '');
    setIsEditing(false);
  };

  return (
    <li className={`task-item priority-${task.priority} ${task.completed ? 'completed' : ''}`}>
      {isEditing ? (
        <div className="task-edit-form">
          <input value={title} onChange={(e) => setTitle(e.target.value)} />
          <input value={description} onChange={(e) => setDescription(e.target.value)} />
          <div className="task-actions">
            <button className="btn btn-primary" disabled={busy} onClick={saveEdit}>
              Save
            </button>
            <button className="btn btn-secondary" disabled={busy} onClick={cancelEdit}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <label className="task-main">
            <input
              type="checkbox"
              checked={task.completed}
              disabled={busy}
              onChange={() =>
                onToggleComplete(task._id, {
                  title: task.title,
                  description: task.description,
                  completed: !task.completed,
                  priority: task.priority
                })
              }
            />
            <div>
              <div className="task-title">{task.title}</div>
              {task.description && <div className="task-desc">{task.description}</div>}
              <span className="task-priority-badge">{task.priority}</span>
            </div>
          </label>
          <div className="task-actions">
            <button className="btn btn-secondary" disabled={busy} onClick={() => setIsEditing(true)}>
              Edit
            </button>
            <button className="btn btn-danger" disabled={busy} onClick={() => onDeleteRequest(task)}>
              Delete
            </button>
          </div>
        </>
      )}
    </li>
  );
}

export default TaskItem;
