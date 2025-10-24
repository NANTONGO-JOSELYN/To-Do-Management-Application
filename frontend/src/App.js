import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import TaskList from './pages/TaskList';
import CreateTask from './pages/CreateTask';
import Analytics from './pages/Analytics';
import TodoForm from './components/TodoForm';
import TodoItem from './components/TodoItem';
import FilterBar from './components/FilterBar';
import SearchBar from './components/SearchBar';
import Header from './components/Header';
import { NotificationProvider, NotificationContainer, useNotification } from './components/NotificationContext';
import { todoAPI, healthCheck } from './services/api';

// API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const AppContent = () => {
  const [todos, setTodos] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);
  const { showSuccess, showError, showInfo } = useNotification();

  // API helper functions
  const apiCall = async (endpoint, options = {}) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  };

    // Load todos from backend on component mount
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Load todos from backend
        const todosData = await apiCall('/tasks');
        setTodos(todosData.tasks || []);
      } catch (error) {
        console.error('Failed to load todos from backend:', error.message);
        
        // Fallback to localStorage
        const savedTodos = localStorage.getItem('todos');
        if (savedTodos) {
          setTodos(JSON.parse(savedTodos));
        }
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
    
    // Load dark mode preference
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode) {
      setIsDarkMode(JSON.parse(savedDarkMode));
    }
  }, []);



  // Save todos to localStorage when working offline (backup)
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  // Save dark mode preference
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Create a new todo
  const addTodo = async (taskData) => {
    try {
      const response = await apiCall('/todos', {
        method: 'POST',
        body: JSON.stringify({
          title: taskData.text,
          description: taskData.description || ''
        }),
      });
      
      setTodos(prev => [...prev, response.data]);
      return response.data;
    } catch (error) {
      console.error('Failed to add todo:', error);
      
      // Fallback: add to local state
      const newTodo = {
        id: Date.now().toString(),
        text: taskData.text,
        description: taskData.description || '',
        priority: taskData.priority || 'medium',
        category: taskData.category || 'personal',
        deadline: taskData.deadline || null,
        tags: taskData.tags || [],
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        order: todos.length
      };
      
      setTodos(prev => [...prev, newTodo]);
      return newTodo;
    }
  };

  // Legacy support for existing components
  const createTodo = addTodo;

  // Update a todo
  const updateTodo = async (id, updates) => {
    try {
      const response = await apiCall(`/todos/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          title: updates.text || updates.title,
          description: updates.description,
          completed: updates.completed
        }),
      });
      
      setTodos(todos.map(t => t.id === id ? response.data : t));
    } catch (error) {
      console.error('Failed to edit todo:', error);
      
      // Fallback: update local state
      setTodos(todos.map(todo =>
        todo.id === id 
          ? { 
              ...todo, 
              ...updates,
              updatedAt: new Date().toISOString()
            }
          : todo
      ));
    }
  };

  // Legacy alias
  const editTodo = updateTodo;

  // Delete a todo
  const deleteTodo = async (id) => {
    try {
      await apiCall(`/todos/${id}`, { method: 'DELETE' });
      setTodos(todos.filter(todo => todo.id !== id));
    } catch (error) {
      console.error('Failed to delete todo:', error);
      
      // Fallback: remove from local state
      setTodos(todos.filter(todo => todo.id !== id));
    }
  };

  // Toggle todo completion
  const toggleTodo = async (id) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    try {
      const response = await apiCall(`/todos/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ completed: !todo.completed }),
      });
      
      setTodos(todos.map(t => t.id === id ? response.data : t));
    } catch (error) {
      console.error('Failed to update todo:', error);
      
      // Fallback: update local state
      setTodos(todos.map(t =>
        t.id === id 
          ? { 
              ...t, 
              completed: !t.completed,
              updatedAt: new Date().toISOString(),
              completedAt: !t.completed ? new Date().toISOString() : null
            }
          : t
      ));
    }
  };

  // Additional functions for new routes
  const reorderTodos = async (newOrder) => {
    try {
      const taskIds = newOrder.map(task => task.id);
      await apiCall('/tasks/reorder', {
        method: 'PUT',
        body: JSON.stringify({ taskIds }),
      });
      
      setTodos(newOrder);
    } catch (error) {
      console.error('Failed to reorder todos:', error);
      
      // Fallback: update local state
      setTodos(newOrder);
    }
  };

  const bulkOperation = async (action, taskIds) => {
    try {
      await apiCall('/tasks/bulk', {
        method: 'POST',
        body: JSON.stringify({ action, taskIds }),
      });
      
      // Refresh todos after bulk operation
      const response = await apiCall('/tasks');
      setTodos(response.tasks || []);
    } catch (error) {
      console.error('Failed to perform bulk operation:', error);
      
      // Fallback: update local state
      if (action === 'complete') {
        setTodos(todos.map(t => 
          taskIds.includes(t.id) ? { ...t, completed: true, completedAt: new Date().toISOString() } : t
        ));
      } else if (action === 'incomplete') {
        setTodos(todos.map(t => 
          taskIds.includes(t.id) ? { ...t, completed: false, completedAt: null } : t
        ));
      } else if (action === 'delete') {
        setTodos(todos.filter(t => !taskIds.includes(t.id)));
      }
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Drag and drop state
  const [dragOverIndex, setDragOverIndex] = useState(null);

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

    const items = [...filteredTodos];
    const draggedTodo = items[draggedItem.index];
    
    // Remove the dragged item and insert at new position
    items.splice(draggedItem.index, 1);
    items.splice(dropIndex, 0, draggedTodo);

    // Update the main todos array
    const updatedTodos = [...todos];
    const filteredIds = items.map(item => item.id);
    
    // Reorder based on filtered results
    const reorderedTodos = [];
    filteredIds.forEach(id => {
      const todo = updatedTodos.find(t => t.id === id);
      if (todo) reorderedTodos.push(todo);
    });
    
    // Add remaining todos that weren't in the filtered results
    const remainingTodos = updatedTodos.filter(todo => !filteredIds.includes(todo.id));
    setTodos([...reorderedTodos, ...remainingTodos]);
    
    setDraggedItem(null);
    setDragOverIndex(null);
  };

  // Filter todos based on current filter and search term
  const filteredTodos = todos.filter(todo => {
    const matchesFilter = 
      filter === 'all' || 
      (filter === 'active' && !todo.completed) ||
      (filter === 'completed' && todo.completed) ||
      filter === todo.priority ||
      filter === todo.category;

    const matchesSearch = 
      todo.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      todo.description.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  // Get statistics
  const stats = {
    total: todos.length,
    completed: todos.filter(t => t.completed).length,
    active: todos.filter(t => !t.completed).length,
    high: todos.filter(t => t.priority === 'high').length,
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDarkMode 
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
          : 'bg-gradient-to-br from-blue-50 via-white to-indigo-100'
      }`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Loading your tasks...
          </p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className={`min-h-screen transition-all duration-300 ${
        isDarkMode 
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white' 
          : 'bg-gradient-to-br from-blue-50 via-white to-indigo-100 text-gray-900'
      }`}>
        <Navigation 
          isDarkMode={isDarkMode} 
          toggleDarkMode={toggleDarkMode}
          todos={todos}
          stats={stats}
        />
        
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route 
              path="/" 
              element={
                <Dashboard 
                  todos={todos}
                  stats={stats}
                  isDarkMode={isDarkMode}
                />
              } 
            />
            <Route 
              path="/tasks" 
              element={
                <TaskList 
                  todos={todos}
                  onToggle={toggleTodo}
                  onUpdate={editTodo}
                  onDelete={deleteTodo}
                  reorderTodos={reorderTodos}
                  bulkOperation={bulkOperation}
                  isDarkMode={isDarkMode}
                />
              } 
            />
            <Route 
              path="/create" 
              element={
                <CreateTask 
                  onSubmit={addTodo}
                  isDarkMode={isDarkMode}
                />
              } 
            />
            <Route 
              path="/analytics" 
              element={
                <Analytics 
                  todos={todos}
                  isDarkMode={isDarkMode}
                />
              } 
            />
            <Route 
              path="/legacy" 
              element={
                <div className="max-w-4xl mx-auto">
                  <Header stats={stats} />
                  
                  {/* Search and Filter Section */}
                  <div className="mb-8 space-y-4">
                    <SearchBar 
                      searchTerm={searchTerm} 
                      onSearchChange={setSearchTerm} 
                    />
                    <FilterBar 
                      currentFilter={filter} 
                      onFilterChange={setFilter}
                      todos={todos}
                    />
                  </div>

                  {/* Add Todo Form */}
                  <div className="mb-8">
                    <TodoForm onSubmit={createTodo} />
                  </div>

                  {/* Todos List */}
                  <div className="card p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                        <i className="bi bi-list-task text-primary-600 mr-2"></i>
                        Your Tasks
                        {filteredTodos.length > 0 && (
                          <span className="ml-2 bg-primary-100 text-primary-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                            {filteredTodos.length}
                          </span>
                        )}
                      </h2>
                      {filteredTodos.length > 1 && (
                        <div className="text-sm text-gray-500 flex items-center">
                          <i className="bi bi-arrows-move mr-1"></i>
                          Drag to reorder
                        </div>
                      )}
                    </div>

                    {filteredTodos.length === 0 ? (
                      <div className="text-center py-12">
                        <i className="bi bi-clipboard-x text-6xl text-gray-300 mb-4"></i>
                        <h3 className="text-xl font-medium text-gray-500 mb-2">
                          {searchTerm || filter !== 'all' 
                            ? 'No tasks match your criteria' 
                            : 'No tasks yet'}
                        </h3>
                        <p className="text-gray-400">
                          {searchTerm || filter !== 'all'
                            ? 'Try adjusting your search or filter'
                            : 'Create your first task to get started!'}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {filteredTodos.map((todo, index) => (
                          <div
                            key={todo.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, todo, index)}
                            onDragEnd={handleDragEnd}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDrop={(e) => handleDrop(e, index)}
                            className={`transition-all duration-200 ${
                              dragOverIndex === index ? 'bg-blue-50 rounded-lg transform scale-105' : ''
                            } ${draggedItem?.todo.id === todo.id ? 'opacity-50' : ''}`}
                          >
                            <TodoItem
                              todo={todo}
                              onToggle={toggleTodo}
                              onUpdate={updateTodo}
                              onDelete={deleteTodo}
                              isDragging={draggedItem?.todo.id === todo.id}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              } 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

function App() {
  return (
    <NotificationProvider>
      <AppContent />
      <NotificationContainer />
    </NotificationProvider>
  );
}

export default App;
