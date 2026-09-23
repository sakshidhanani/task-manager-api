import TaskItem from './TaskItem.jsx';

function TaskList({ tasks, onToggleComplete, onEdit, onDeleteRequest, busyTaskId }) {
  if (tasks.length === 0) {
    return <p className="empty-state">No tasks yet. Add one above to get started.</p>;
  }

  return (
    <ul className="task-list">
      {tasks.map((task) => (
        <TaskItem
          key={task._id}
          task={task}
          onToggleComplete={onToggleComplete}
          onEdit={onEdit}
          onDeleteRequest={onDeleteRequest}
          busy={busyTaskId === task._id}
        />
      ))}
    </ul>
  );
}

export default TaskList;
