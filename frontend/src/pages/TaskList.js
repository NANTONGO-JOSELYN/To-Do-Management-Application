import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import TodoItem from '../components/TodoItem';
import SearchBar from '../components/SearchBar';
import FilterBar from '../components/FilterBar';

const TaskList = ({ 
  todos, 
  onToggle, 
  onUpdate, 
  onDelete, 
  reorderTodos,
  bulkOperation,
  isDarkMode
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filter, setFilter] = useState(searchParams.get('filter') || 'all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState('list'); // list or grid
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);

  // Update filter from URL params
  useEffect(() => {
    const urlFilter = searchParams.get('filter');
    if (urlFilter && urlFilter !== filter) {
      setFilter(urlFilter);
    }
  }, [searchParams, filter]);

  // Filter and sort todos
  const filteredAndSortedTodos = todos
    .filter(todo => {
      const matchesFilter = 
        filter === 'all' || 
        (filter === 'active' && !todo.completed) ||
        (filter === 'completed' && todo.completed) ||
        (filter === 'overdue' && todo.deadline && new Date(todo.deadline) < new Date() && !todo.completed) ||
        filter === todo.priority ||
        filter === todo.category;

      const matchesSearch = 
        todo.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (todo.description && todo.description.toLowerCase().includes(searchTerm.toLowerCase()));

      return matchesFilter && matchesSearch;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'text':
          comparison = a.text.localeCompare(b.text);
          break;
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          comparison = priorityOrder[b.priority] - priorityOrder[a.priority];
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
        case 'deadline':
          if (!a.deadline && !b.deadline) return 0;
          if (!a.deadline) return 1;
          if (!b.deadline) return -1;
          comparison = new Date(a.deadline) - new Date(b.deadline);
          break;
        default: // createdAt
          comparison = new Date(a.createdAt) - new Date(b.createdAt);
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  // Drag and drop handlers
  const handleDragStart = (e, todo, index) => {
    setDraggedItem({ todo, index });
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.outerHTML);
    e.target.style.opacity = '0.5';
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1';
    setDraggedItem(null);
    setDragOverIndex(null);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    if (!draggedItem || draggedItem.index === dropIndex) return;

    const items = [...filteredAndSortedTodos];
    const draggedTodo = items[draggedItem.index];
    
    // Remove the dragged item and insert at new position
    items.splice(draggedItem.index, 1);
    items.splice(dropIndex, 0, draggedTodo);

    // Call reorderTodos if available
    if (reorderTodos) {
      reorderTodos(items);
    }
    
    setDraggedItem(null);
    setDragOverIndex(null);
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    if (newFilter === 'all') {
      setSearchParams({});
    } else {
      setSearchParams({ filter: newFilter });
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const SortButton = ({ field, children, icon }) => (
    <button
      onClick={() => handleSort(field)}
      className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
        sortBy === field
          ? 'bg-blue-100 text-blue-700 shadow-md'
          : isDarkMode 
          ? 'text-gray-300 hover:text-white hover:bg-gray-700'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
      }`}
    >
      <i className={icon}></i>
      <span>{children}</span>
      {sortBy === field && (
        <i className={`bi-arrow-${sortOrder === 'asc' ? 'up' : 'down'} text-xs`}></i>
      )}
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`card p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              All Tasks
            </h1>
            <p className={`mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {filteredAndSortedTodos.length} of {todos.length} tasks
              {searchTerm && ` matching "${searchTerm}"`}
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* View Mode Toggle */}
            <div className={`flex items-center p-1 rounded-lg ${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
            }`}>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-all duration-200 ${
                  viewMode === 'list'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
                title="List View"
              >
                <i className="bi-list-ul"></i>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-all duration-200 ${
                  viewMode === 'grid'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
                title="Grid View"
              >
                <i className="bi-grid-3x2-gap"></i>
              </button>
            </div>

            {/* Create Task Button */}
            <Link
              to="/create"
              className="btn-primary flex items-center space-x-2"
            >
              <i className="bi-plus-circle"></i>
              <span className="hidden sm:inline">Create Task</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <SearchBar 
          searchTerm={searchTerm} 
          onSearchChange={setSearchTerm}
          isDarkMode={isDarkMode}
        />
        <FilterBar 
          currentFilter={filter} 
          onFilterChange={handleFilterChange}
          todos={todos}
          isDarkMode={isDarkMode}
        />
        
        {/* Sort Controls */}
        <div className={`card p-4 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Sort by:
            </span>
            <SortButton field="createdAt" icon="bi-calendar3">Date</SortButton>
            <SortButton field="text" icon="bi-sort-alpha-down">Name</SortButton>
            <SortButton field="priority" icon="bi-flag">Priority</SortButton>
            <SortButton field="category" icon="bi-tags">Category</SortButton>
            <SortButton field="deadline" icon="bi-alarm">Deadline</SortButton>
          </div>
        </div>
      </div>

      {/* Tasks Display */}
      <div className={`card p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}>
        {filteredAndSortedTodos.length === 0 ? (
          <div className="text-center py-16">
            <div className="mb-6">
              {searchTerm || filter !== 'all' ? (
                <i className={`bi-search text-6xl ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`}></i>
              ) : (
                <i className={`bi-clipboard-x text-6xl ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`}></i>
              )}
            </div>
            <h3 className={`text-xl font-medium mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {searchTerm || filter !== 'all' 
                ? 'No tasks match your criteria' 
                : 'No tasks yet'}
            </h3>
            <p className={`mb-6 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              {searchTerm || filter !== 'all'
                ? 'Try adjusting your search or filter settings'
                : 'Create your first task to get started!'}
            </p>
            {(!searchTerm && filter === 'all') && (
              <Link to="/create" className="btn-primary inline-flex items-center space-x-2">
                <i className="bi-plus-circle"></i>
                <span>Create Your First Task</span>
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* Task Count and Drag Hint */}
            <div className="flex items-center justify-between mb-6">
              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Showing {filteredAndSortedTodos.length} task{filteredAndSortedTodos.length !== 1 ? 's' : ''}
              </div>
              {filteredAndSortedTodos.length > 1 && (
                <div className={`text-sm flex items-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <i className="bi-arrows-move mr-1"></i>
                  Drag to reorder
                </div>
              )}
            </div>

            {/* Tasks Grid/List */}
            <div className={
              viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'
                : 'space-y-4'
            }>
              {filteredAndSortedTodos.map((todo, index) => (
                <div
                  key={todo.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, todo, index)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={(e) => handleDrop(e, index)}
                  className={`transition-all duration-200 ${
                    dragOverIndex === index ? 'transform scale-105' : ''
                  } ${draggedItem?.todo.id === todo.id ? 'opacity-50' : ''}`}
                >
                  <TodoItem
                    todo={todo}
                    onToggle={onToggle}
                    onUpdate={onUpdate}
                    onDelete={onDelete}
                    isDragging={draggedItem?.todo.id === todo.id}
                    isDarkMode={isDarkMode}
                    viewMode={viewMode}
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Bulk Actions (if any tasks are selected) */}
      {filteredAndSortedTodos.length > 0 && (
        <div className={`card p-4 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}>
          <div className="flex items-center justify-between">
            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Quick Actions
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  const incompleteTasks = filteredAndSortedTodos.filter(t => !t.completed);
                  incompleteTasks.forEach(task => onToggle(task.id));
                }}
                disabled={filteredAndSortedTodos.every(t => t.completed)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  filteredAndSortedTodos.every(t => t.completed)
                    ? 'opacity-50 cursor-not-allowed'
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
              >
                <i className="bi-check-all mr-1"></i>
                Mark As Complete
              </button>
              <Link
                to="/create"
                className="px-4 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg text-sm font-medium transition-all duration-200"
              >
                <i className="bi-plus-circle mr-1"></i>
                Add Task
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskList;
