// Simple in-memory "database" for tasks (no real DB in this practical)
let tasks = [
  { id: 1, title: 'Learn Express basics', completed: false },
  { id: 2, title: 'Build middleware pipeline', completed: false }
];

let nextId = 3;

module.exports = {
  tasks,
  getNextId: () => nextId++,
};
