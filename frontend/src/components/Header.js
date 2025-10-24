import React from 'react';

const Header = ({ stats }) => {
  return (
    <header className="text-center mb-12">
      <div className="mb-8">
        <div className="flex items-center justify-center mb-4">
          <h1 className="text-5xl font-bold text-gradient">
            <i className="bi bi-check2-square text-primary-600 mr-3"></i>
            Task Management App
          </h1>
        </div>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Organize your life with beautiful, intuitive task management
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
        <div className="card p-4 text-center hover:scale-105 transition-all duration-200">
          <div className="text-3xl font-bold text-primary-600 mb-1">
            {stats.total}
          </div>
          <div className="text-sm text-gray-600 flex items-center justify-center">
            <i className="bi bi-list-ul mr-1"></i>
            Total Tasks
          </div>
        </div>

        <div className="card p-4 text-center hover:scale-105 transition-all duration-200">
          <div className="text-3xl font-bold text-green-600 mb-1">
            {stats.completed}
          </div>
          <div className="text-sm text-gray-600 flex items-center justify-center">
            <i className="bi bi-check-circle mr-1"></i>
            Completed
          </div>
        </div>

        <div className="card p-4 text-center hover:scale-105 transition-all duration-200">
          <div className="text-3xl font-bold text-orange-600 mb-1">
            {stats.active}
          </div>
          <div className="text-sm text-gray-600 flex items-center justify-center">
            <i className="bi bi-clock mr-1"></i>
            In Progress
          </div>
        </div>

        <div className="card p-4 text-center hover:scale-105 transition-all duration-200">
          <div className="text-3xl font-bold text-red-600 mb-1">
            {stats.high}
          </div>
          <div className="text-sm text-gray-600 flex items-center justify-center">
            <i className="bi bi-exclamation-triangle mr-1"></i>
            High Priority
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      {stats.total > 0 && (
        <div className="mt-6 max-w-md mx-auto">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{Math.round((stats.completed / stats.total) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${(stats.completed / stats.total) * 100}%` }}
            ></div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
