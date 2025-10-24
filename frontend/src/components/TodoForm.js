import React, { useState } from 'react';

const TodoForm = ({ onSubmit }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [formData, setFormData] = useState({
    text: '',
    description: '',
    priority: 'medium',
    category: 'personal'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.text.trim()) return;
    
    onSubmit(formData);
    setFormData({
      text: '',
      description: '',
      priority: 'medium',
      category: 'personal'
    });
    setIsExpanded(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="card p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Main Input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <i className="bi bi-plus-circle text-primary-500 text-lg"></i>
          </div>
          <input
            type="text"
            name="text"
            value={formData.text}
            onChange={handleChange}
            onFocus={() => setIsExpanded(true)}
            placeholder="Add a new task..."
            className="input-field pl-12 pr-4 py-4 text-lg"
            required
          />
        </div>

        {/* Expanded Form */}
        {isExpanded && (
          <div className="space-y-4 animate-slide-up">
            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <i className="bi bi-text-paragraph mr-1"></i>
                Description (Optional)
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Add more details about this task..."
                className="input-field resize-none h-20"
                rows="3"
              />
            </div>

            {/* Priority and Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <i className="bi bi-flag mr-1"></i>
                  Priority
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="low">
                    🟢 Low Priority
                  </option>
                  <option value="medium">
                    🟡 Medium Priority
                  </option>
                  <option value="high">
                    🔴 High Priority
                  </option>
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <i className="bi bi-tags mr-1"></i>
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="personal">
                    👤 Personal
                  </option>
                  <option value="work">
                    💼 Work
                  </option>
                  <option value="shopping">
                    🛒 Shopping
                  </option>
                  <option value="health">
                    ❤️ Health
                  </option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => {
                  setIsExpanded(false);
                  setFormData({
                    text: '',
                    description: '',
                    priority: 'medium',
                    category: 'personal'
                  });
                }}
                className="btn-secondary"
              >
                <i className="bi bi-x mr-1"></i>
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={!formData.text.trim()}
              >
                <i className="bi bi-plus mr-1"></i>
                Add Task
              </button>
            </div>
          </div>
        )}
      </form>

      {/* Quick Add Hints */}
      {!isExpanded && (
        <div className="mt-4 flex flex-wrap gap-2">
          <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            💡 Click above to add detailed tasks
          </div>
          <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            🎯 Set priorities and categories
          </div>
          <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            🔄 Drag to reorder tasks
          </div>
        </div>
      )}
    </div>
  );
};

export default TodoForm;
