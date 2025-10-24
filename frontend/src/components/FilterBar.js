import React from 'react';

const FilterBar = ({ currentFilter, onFilterChange, todos }) => {
  const filters = [
    { id: 'all', label: 'All Tasks', icon: 'bi-list-ul', count: todos.length },
    { id: 'active', label: 'Active', icon: 'bi-clock', count: todos.filter(t => !t.completed).length },
    { id: 'completed', label: 'Completed', icon: 'bi-check-circle', count: todos.filter(t => t.completed).length },
  ];

  const priorityFilters = [
    { id: 'high', label: 'High Priority', icon: 'bi-exclamation-triangle', count: todos.filter(t => t.priority === 'high').length, color: 'text-red-600' },
    { id: 'medium', label: 'Medium Priority', icon: 'bi-dash-circle', count: todos.filter(t => t.priority === 'medium').length, color: 'text-yellow-600' },
    { id: 'low', label: 'Low Priority', icon: 'bi-arrow-down-circle', count: todos.filter(t => t.priority === 'low').length, color: 'text-green-600' },
  ];

  const categoryFilters = [
    { id: 'work', label: 'Work', icon: 'bi-briefcase', count: todos.filter(t => t.category === 'work').length },
    { id: 'personal', label: 'Personal', icon: 'bi-person', count: todos.filter(t => t.category === 'personal').length },
    { id: 'shopping', label: 'Shopping', icon: 'bi-cart', count: todos.filter(t => t.category === 'shopping').length },
    { id: 'health', label: 'Health', icon: 'bi-heart-pulse', count: todos.filter(t => t.category === 'health').length },
  ];

  const FilterButton = ({ filter, isActive, onClick }) => (
    <button
      onClick={onClick}
      className={`filter-btn ${isActive ? 'filter-active' : 'filter-inactive'} flex items-center space-x-2`}
    >
      <i className={`${filter.icon} ${filter.color || ''}`}></i>
      <span>{filter.label}</span>
      {filter.count > 0 && (
        <span className={`text-xs px-2 py-0.5 rounded-full ${
          isActive 
            ? 'bg-white bg-opacity-20' 
            : 'bg-gray-300 text-gray-700'
        }`}>
          {filter.count}
        </span>
      )}
    </button>
  );

  return (
    <div className="card p-6">
      <div className="space-y-6">
        {/* Main Filters */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
            <i className="bi bi-funnel mr-2"></i>
            Filter Tasks
          </h3>
          <div className="flex flex-wrap gap-2">
            {filters.map(filter => (
              <FilterButton
                key={filter.id}
                filter={filter}
                isActive={currentFilter === filter.id}
                onClick={() => onFilterChange(filter.id)}
              />
            ))}
          </div>
        </div>

        {/* Priority Filters */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
            <i className="bi bi-flag mr-2"></i>
            By Priority
          </h3>
          <div className="flex flex-wrap gap-2">
            {priorityFilters.map(filter => (
              <FilterButton
                key={filter.id}
                filter={filter}
                isActive={currentFilter === filter.id}
                onClick={() => onFilterChange(filter.id)}
              />
            ))}
          </div>
        </div>

        {/* Category Filters */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
            <i className="bi bi-tags mr-2"></i>
            By Category
          </h3>
          <div className="flex flex-wrap gap-2">
            {categoryFilters.map(filter => (
              <FilterButton
                key={filter.id}
                filter={filter}
                isActive={currentFilter === filter.id}
                onClick={() => onFilterChange(filter.id)}
              />
            ))}
          </div>
        </div>

        {/* Clear Filter */}
        {currentFilter !== 'all' && (
          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={() => onFilterChange('all')}
              className="text-sm text-primary-600 hover:text-primary-700 flex items-center font-medium"
            >
              <i className="bi bi-x-circle mr-1"></i>
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterBar;
