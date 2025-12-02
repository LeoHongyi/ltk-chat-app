import React from 'react';

function TodoList({ todos, onToggle, onAdd }) {
  const handleAdd = () => {
    const text = prompt('Add new task:');
    if (text) onAdd(text);
  };

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-icon todo">📋</div>
        <div>
          <div className="card-title">To-do list</div>
        </div>
        <button className="card-add" onClick={handleAdd}>+</button>
      </div>
      {todos.map(todo => (
        <div key={todo.id} className="todo-item">
          <div
            className={`todo-checkbox ${todo.completed ? 'completed' : ''}`}
            onClick={() => onToggle(todo.id)}
          >
            {todo.completed && '✓'}
          </div>
          <span className={`todo-text ${todo.completed ? 'completed' : ''}`}>
            {todo.text}
          </span>
        </div>
      ))}
    </div>
  );
}

export default TodoList;
