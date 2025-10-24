import React, { useState } from 'react';

const TodoItem = ({ todo, onToggle, onUpdate, onDelete, isDragging }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    text: todo.text,
    description: todo.description || '',
    priority: todo.priority,
    category: todo.category
  });

  const handleSave = () => {
    if (!editData.text.trim()) return;
    onUpdate(todo.id, editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({
      text: todo.text,
      description: todo.description || '',
      priority: todo.priority,
      category: todo.category
    });
    setIsEditing(false);
  };

  const getPriorityConfig = (priority) => {
    const configs = {
      high: { color: 'text-red-600', bg: 'bg-red-100', icon: 'bi-exclamation-triangle', label: 'High' },
      medium: { color: 'text-yellow-600', bg: 'bg-yellow-100', icon: 'bi-dash-circle', label: 'Medium' },
      low: { color: 'text-green-600', bg: 'bg-green-100', icon: 'bi-arrow-down-circle', label: 'Low' }
    };
    return configs[priority] || configs.medium;
  };

  const getCategoryConfig = (category) => {
    const configs = {
      work: { icon: 'bi-briefcase', label: 'Work', emoji: '💼' },
      personal: { icon: 'bi-person', label: 'Personal', emoji: '👤' },
      shopping: { icon: 'bi-cart', label: 'Shopping', emoji: '🛒' },
      health: { icon: 'bi-heart-pulse', label: 'Health', emoji: '❤️' }
    };
    return configs[category] || configs.personal;
  };

  const priorityConfig = getPriorityConfig(todo.priority);
  const categoryConfig = getCategoryConfig(todo.category);
  const createdDate = new Date(todo.createdAt).toLocaleDateString();
  const updatedDate = new Date(todo.updatedAt).toLocaleDateString();

  return (
    <div className={`todo-item ${todo.completed ? 'todo-completed' : ''} ${isDragging ? 'shadow-2xl scale-105' : ''}`}>
      {isEditing ? (
        // Edit Mode
        <div className="space-y-4">
          <input
            type="text"
            value={editData.text}
            onChange={(e) => setEditData(prev => ({ ...prev, text: e.target.value }))}
            className="input-field text-lg font-medium"
            placeholder="Task title..."
          />
          
          <textarea
            value={editData.description}
            onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
            className="input-field resize-none h-20"
            placeholder="Description (optional)..."
            rows="3"
          />

          <div className="grid grid-cols-2 gap-4">
            <select
              value={editData.priority}
              onChange={(e) => setEditData(prev => ({ ...prev, priority: e.target.value }))}
              className="input-field"
            >
              <option value="low">🟢 Low Priority</option>
              <option value="medium">🟡 Medium Priority</option>
              <option value="high">🔴 High Priority</option>
            </select>

            <select
              value={editData.category}
              onChange={(e) => setEditData(prev => ({ ...prev, category: e.target.value }))}
              className="input-field"
            >
              <option value="personal">👤 Personal</option>
              <option value="work">💼 Work</option>
              <option value="shopping">🛒 Shopping</option>
              <option value="health">❤️ Health</option>
            </select>
          </div>

          <div className="flex justify-end space-x-2">
            <button onClick={handleCancel} className="btn-secondary text-sm">
              <i className="bi bi-x mr-1"></i>
              Cancel
            </button>
            <button onClick={handleSave} className="btn-primary text-sm">
              <i className="bi bi-check mr-1"></i>
              Save
            </button>
          </div>
        </div>
      ) : (
        // View Mode
        <div className="flex items-start space-x-4">
          {/* Drag Handle */}
          <div className="flex-shrink-0 mt-1 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing">
            <i className="bi bi-grip-vertical text-lg"></i>
          </div>

          {/* Checkbox */}
          <button
            onClick={() => onToggle(todo.id)}
            className={`flex-shrink-0 mt-1.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
              todo.completed
                ? 'bg-primary-600 border-primary-600 text-white'
                : 'border-gray-300 hover:border-primary-500'
            }`}
          >
            {todo.completed && <i className="bi bi-check text-xs"></i>}
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className={`text-lg font-medium leading-tight ${
                  todo.completed ? 'line-through text-gray-500' : 'text-gray-900'
                }`}>
                  {todo.text}
                </h3>
                
                {todo.description && (
                  <p className={`mt-1 text-sm leading-relaxed ${
                    todo.completed ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {todo.description}
                  </p>
                )}

                {/* Meta Information */}
                <div className="flex items-center space-x-4 mt-3">
                  {/* Priority Badge */}
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityConfig.bg} ${priorityConfig.color}`}>
                    <i className={`${priorityConfig.icon} mr-1`}></i>
                    {priorityConfig.label}
                  </span>

                  {/* Category Badge */}
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    <span className="mr-1">{categoryConfig.emoji}</span>
                    {categoryConfig.label}
                  </span>

                  {/* Dates */}
                  <span className="text-xs text-gray-400">
                    <i className="bi bi-calendar3 mr-1"></i>
                    {createdDate}
                    {updatedDate !== createdDate && (
                      <span className="ml-2">
                        <i className="bi bi-pencil mr-1"></i>
                        {updatedDate}
                      </span>
                    )}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-1 ml-4">
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                  title="Edit task"
                >
                  <i className="bi bi-pencil"></i>
                </button>
                
                <button
                  onClick={() => onDelete(todo.id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                  title="Delete task"
                >
                  <i className="bi bi-trash"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TodoItem;
