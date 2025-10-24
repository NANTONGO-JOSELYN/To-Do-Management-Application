import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navigation = ({ stats, isDarkMode, toggleDarkMode, todos }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Fallback stats calculation if not provided
  const safeStats = stats || {
    total: todos ? todos.length : 0,
    completed: todos ? todos.filter(t => t.completed).length : 0,
    active: todos ? todos.filter(t => !t.completed).length : 0,
    high: todos ? todos.filter(t => t.priority === 'high').length : 0,
  };

  const navItems = [
    {
      path: '/',
      label: 'Dashboard',
      icon: 'bi-speedometer2',
      description: 'Overview & Stats'
    },
    {
      path: '/tasks',
      label: 'Tasks',
      icon: 'bi-list-task',
      description: 'View All Tasks'
    },
    {
      path: '/create',
      label: 'Create Task',
      icon: 'bi-plus-circle',
      description: 'Add New Task'
    },
    {
      path: '/analytics',
      label: 'Analytics',
      icon: 'bi-graph-up',
      description: 'Performance Metrics'
    }
  ];

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className={`sticky top-0 z-40 transition-all duration-300 ${
      isDarkMode 
        ? 'bg-gray-900 border-gray-700' 
        : 'bg-white/95 backdrop-blur-md border-gray-200'
    } border-b shadow-lg`}>
      <div className="container mx-auto px-4">
        {/* Main Navigation */}
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                  <i className="bi-check2-square text-white text-xl"></i>
                </div>
              </div>
              <div className="hidden sm:block">
                <h1 className={`text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent`}>
                  Task Management App
                </h1>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Smart Task Management
                </p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`group relative px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 ${
                  isActive(item.path)
                    ? 'bg-blue-100 text-blue-700 shadow-md'
                    : isDarkMode
                    ? 'text-gray-300 hover:text-white hover:bg-gray-800'
                    : 'text-gray-600 hover:text-blue-700 hover:bg-blue-50'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <i className={`${item.icon} text-base`}></i>
                  <span>{item.label}</span>
                </div>
                
                {/* Tooltip */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                  {item.description}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900"></div>
                </div>
              </Link>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-3">
            {/* Quick Stats */}
            <div className="hidden lg:flex items-center space-x-4 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">{safeStats.total}</div>
                <div className="text-xs text-blue-500">Total</div>
              </div>
              <div className="w-px h-8 bg-blue-200"></div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">{safeStats.completed}</div>
                <div className="text-xs text-green-500">Done</div>
              </div>
              <div className="w-px h-8 bg-blue-200"></div>
              <div className="text-center">
                <div className="text-lg font-bold text-orange-600">{safeStats.active}</div>
                <div className="text-xs text-orange-500">Active</div>
              </div>
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-xl transition-all duration-200 ${
                isDarkMode 
                  ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              <i className={`text-lg ${isDarkMode ? 'bi-sun-fill' : 'bi-moon-fill'}`}></i>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`md:hidden p-2 rounded-xl transition-all duration-200 ${
                isDarkMode 
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <i className={`text-lg ${isMobileMenuOpen ? 'bi-x' : 'bi-list'}`}></i>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className={`md:hidden border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} py-4`}>
            <div className="space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                    isActive(item.path)
                      ? 'bg-blue-100 text-blue-700'
                      : isDarkMode
                      ? 'text-gray-300 hover:text-white hover:bg-gray-800'
                      : 'text-gray-600 hover:text-blue-700 hover:bg-blue-50'
                  }`}
                >
                  <i className={`${item.icon} text-lg`}></i>
                  <div>
                    <div>{item.label}</div>
                    <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {item.description}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            
            {/* Mobile Stats */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-xl">
                  <div className="text-xl font-bold text-blue-600">{safeStats.total}</div>
                  <div className="text-xs text-blue-500">Total Tasks</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-xl">
                  <div className="text-xl font-bold text-green-600">{safeStats.completed}</div>
                  <div className="text-xs text-green-500">Completed</div>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-xl">
                  <div className="text-xl font-bold text-orange-600">{safeStats.active}</div>
                  <div className="text-xs text-orange-500">Active</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
