import React from 'react';

const SearchBar = ({ searchTerm, onSearchChange }) => {
  return (
    <div className="card p-4">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <i className="bi bi-search text-gray-400 text-lg"></i>
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search tasks by title or description..."
          className="input-field pl-12 pr-12 py-4 text-lg"
        />
        {searchTerm && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
          >
            <i className="bi bi-x-circle text-lg"></i>
          </button>
        )}
      </div>
      
      {searchTerm && (
        <div className="mt-2 text-sm text-gray-600 flex items-center">
          <i className="bi bi-info-circle mr-1"></i>
          Searching for: <span className="font-medium ml-1">"{searchTerm}"</span>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
