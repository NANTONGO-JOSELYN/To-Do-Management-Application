import React, { useState, useMemo } from 'react';

const Analytics = ({ todos, isDarkMode }) => {
  const [timeRange, setTimeRange] = useState('7days');

  // Calculate analytics data
  const analytics = useMemo(() => {
    if (!todos || todos.length === 0) {
      return {
        overview: { total: 0, completed: 0, active: 0, completionRate: 0 },
        priorityBreakdown: { high: 0, medium: 0, low: 0 },
        categoryBreakdown: { work: 0, personal: 0, shopping: 0, health: 0 },
        timeAnalytics: { averageCompletionTime: 0, tasksThisWeek: 0, tasksLastWeek: 0 },
        trends: []
      };
    }

    const now = new Date();
    const timeRanges = {
      '7days': 7,
      '30days': 30,
      '3months': 90,
      '6months': 180
    };

    const daysBack = timeRanges[timeRange] || 7;
    const startDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));

    // Filter todos within time range
    const filteredTodos = todos.filter(todo => {
      const createdDate = new Date(todo.createdAt);
      return createdDate >= startDate;
    });

    // Overview statistics
    const completed = todos.filter(t => t.completed).length;
    const total = todos.length;
    const active = total - completed;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Priority breakdown
    const priorityBreakdown = {
      high: todos.filter(t => t.priority === 'high').length,
      medium: todos.filter(t => t.priority === 'medium').length,
      low: todos.filter(t => t.priority === 'low').length
    };

    // Category breakdown
    const categoryBreakdown = {
      work: todos.filter(t => t.category === 'work').length,
      personal: todos.filter(t => t.category === 'personal').length,
      shopping: todos.filter(t => t.category === 'shopping').length,
      health: todos.filter(t => t.category === 'health').length
    };

    // Time analytics
    const completedTodos = todos.filter(t => t.completed && t.completedAt);
    let averageCompletionTime = 0;
    
    if (completedTodos.length > 0) {
      const totalTime = completedTodos.reduce((acc, todo) => {
        const created = new Date(todo.createdAt);
        const completed = new Date(todo.completedAt);
        return acc + (completed - created);
      }, 0);
      averageCompletionTime = Math.round(totalTime / completedTodos.length / (1000 * 60 * 60 * 24)); // Convert to days
    }

    const oneWeekAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
    const twoWeeksAgo = new Date(now.getTime() - (14 * 24 * 60 * 60 * 1000));
    
    const tasksThisWeek = todos.filter(t => new Date(t.createdAt) >= oneWeekAgo).length;
    const tasksLastWeek = todos.filter(t => {
      const created = new Date(t.createdAt);
      return created >= twoWeeksAgo && created < oneWeekAgo;
    }).length;

    // Daily trends for the selected time range
    const trends = [];
    for (let i = daysBack - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dayEnd = new Date(dayStart.getTime() + (24 * 60 * 60 * 1000));

      const created = todos.filter(t => {
        const createdDate = new Date(t.createdAt);
        return createdDate >= dayStart && createdDate < dayEnd;
      }).length;

      const completed = todos.filter(t => {
        const completedDate = t.completedAt ? new Date(t.completedAt) : null;
        return completedDate && completedDate >= dayStart && completedDate < dayEnd;
      }).length;

      trends.push({
        date: date.toISOString().split('T')[0],
        created,
        completed,
        day: date.toLocaleDateString('en-US', { weekday: 'short' })
      });
    }

    return {
      overview: { total, completed, active, completionRate },
      priorityBreakdown,
      categoryBreakdown,
      timeAnalytics: { averageCompletionTime, tasksThisWeek, tasksLastWeek },
      trends
    };
  }, [todos, timeRange]);

  // Chart component for simple bar charts
  const BarChart = ({ data, colors, title, isDarkMode }) => {
    const maxValue = Math.max(...Object.values(data));
    
    return (
      <div className="space-y-4">
        <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {title}
        </h3>
        <div className="space-y-3">
          {Object.entries(data).map(([key, value], index) => (
            <div key={key} className="space-y-1">
              <div className="flex justify-between items-center">
                <span className={`capitalize text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {key}
                </span>
                <span className={`text-sm font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                  {value}
                </span>
              </div>
              <div className={`h-2 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                <div
                  className={`h-full rounded-full transition-all duration-500 ${colors[index % colors.length]}`}
                  style={{ width: `${maxValue > 0 ? (value / maxValue) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Trend chart component
  const TrendChart = ({ trends, isDarkMode }) => {
    const maxValue = Math.max(...trends.map(t => Math.max(t.created, t.completed)));
    
    return (
      <div className="space-y-4">
        <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Daily Activity Trends
        </h3>
        <div className="flex items-end space-x-2 h-32">
          {trends.map((trend, index) => (
            <div key={index} className="flex-1 flex flex-col items-center space-y-1">
              <div className="flex flex-col items-center space-y-1 h-24 justify-end">
                {/* Completed bar */}
                <div
                  className="w-full bg-green-500 rounded-t transition-all duration-500"
                  style={{ 
                    height: `${maxValue > 0 ? (trend.completed / maxValue) * 60 : 2}px`,
                    minHeight: trend.completed > 0 ? '2px' : '0px'
                  }}
                  title={`Completed: ${trend.completed}`}
                ></div>
                {/* Created bar */}
                <div
                  className="w-full bg-blue-500 rounded-b transition-all duration-500"
                  style={{ 
                    height: `${maxValue > 0 ? (trend.created / maxValue) * 60 : 2}px`,
                    minHeight: trend.created > 0 ? '2px' : '0px'
                  }}
                  title={`Created: ${trend.created}`}
                ></div>
              </div>
              <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {trend.day}
              </span>
            </div>
          ))}
        </div>
        <div className="flex justify-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Created</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Completed</span>
          </div>
        </div>
      </div>
    );
  };

  if (!todos || todos.length === 0) {
    return (
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className={`card p-8 text-center ${isDarkMode ? 'bg-gradient-to-r from-gray-800 to-gray-900' : 'bg-gradient-to-r from-blue-50 to-indigo-100'} border-0`}>
          <div className="text-6xl mb-4">📊</div>
          <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Analytics Dashboard
          </h1>
          <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Insights into your productivity and task management
          </p>
        </div>

        {/* No Data State */}
        <div className={`card p-12 text-center ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}>
          <div className="text-8xl mb-6">📈</div>
          <h3 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            No Analytics Available
          </h3>
          <p className={`text-lg mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Create some tasks to start seeing insights about your productivity patterns
          </p>
          <a
            href="/create"
            className="btn-primary inline-flex items-center space-x-2"
          >
            <i className="bi-plus-circle"></i>
            <span>Create Your First Task</span>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className={`card p-8 text-center ${isDarkMode ? 'bg-gradient-to-r from-gray-800 to-gray-900' : 'bg-gradient-to-r from-blue-50 to-indigo-100'} border-0`}>
        <div className="text-6xl mb-4">📊</div>
        <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Analytics Dashboard
        </h1>
        <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Insights into your productivity and task management
        </p>
      </div>

      {/* Time Range Selector */}
      <div className={`card p-4 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Time Range Analysis
          </h2>
          <div className="flex space-x-2">
            {[
              { key: '7days', label: '7 Days' },
              { key: '30days', label: '30 Days' },
              { key: '3months', label: '3 Months' },
              { key: '6months', label: '6 Months' }
            ].map((range) => (
              <button
                key={range.key}
                onClick={() => setTimeRange(range.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  timeRange === range.key
                    ? 'bg-blue-600 text-white shadow-md'
                    : isDarkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className={`card p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Tasks
              </p>
              <p className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {analytics.overview.total}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <i className="bi-list-task text-2xl text-blue-600"></i>
            </div>
          </div>
        </div>

        <div className={`card p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Completed
              </p>
              <p className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {analytics.overview.completed}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <i className="bi-check-circle text-2xl text-green-600"></i>
            </div>
          </div>
        </div>

        <div className={`card p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Completion Rate
              </p>
              <p className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {analytics.overview.completionRate}%
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <i className="bi-graph-up text-2xl text-purple-600"></i>
            </div>
          </div>
        </div>

        <div className={`card p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Active Tasks
              </p>
              <p className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {analytics.overview.active}
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <i className="bi-clock text-2xl text-orange-600"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Priority Breakdown */}
        <div className={`card p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}>
          <BarChart
            data={analytics.priorityBreakdown}
            colors={['bg-red-500', 'bg-yellow-500', 'bg-green-500']}
            title="Tasks by Priority"
            isDarkMode={isDarkMode}
          />
        </div>

        {/* Category Breakdown */}
        <div className={`card p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}>
          <BarChart
            data={analytics.categoryBreakdown}
            colors={['bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500']}
            title="Tasks by Category"
            isDarkMode={isDarkMode}
          />
        </div>
      </div>

      {/* Trend Analysis */}
      <div className={`card p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}>
        <TrendChart trends={analytics.trends} isDarkMode={isDarkMode} />
      </div>

      {/* Performance Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`card p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}>
          <div className="text-center">
            <div className="p-4 bg-blue-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <i className="bi-speedometer2 text-2xl text-blue-600"></i>
            </div>
            <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Avg. Completion Time
            </h3>
            <p className={`text-2xl font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
              {analytics.timeAnalytics.averageCompletionTime} days
            </p>
          </div>
        </div>

        <div className={`card p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}>
          <div className="text-center">
            <div className="p-4 bg-green-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <i className="bi-calendar-week text-2xl text-green-600"></i>
            </div>
            <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              This Week
            </h3>
            <p className={`text-2xl font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
              {analytics.timeAnalytics.tasksThisWeek} tasks
            </p>
          </div>
        </div>

        <div className={`card p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}>
          <div className="text-center">
            <div className="p-4 bg-purple-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <i className="bi-trending-up text-2xl text-purple-600"></i>
            </div>
            <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Weekly Change
            </h3>
            <p className={`text-2xl font-bold ${
              analytics.timeAnalytics.tasksThisWeek >= analytics.timeAnalytics.tasksLastWeek
                ? isDarkMode ? 'text-green-400' : 'text-green-600'
                : isDarkMode ? 'text-red-400' : 'text-red-600'
            }`}>
              {analytics.timeAnalytics.tasksThisWeek >= analytics.timeAnalytics.tasksLastWeek ? '+' : ''}
              {analytics.timeAnalytics.tasksThisWeek - analytics.timeAnalytics.tasksLastWeek}
            </p>
          </div>
        </div>
      </div>

      {/* Productivity Tips */}
      <div className={`card p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}>
        <h3 className={`text-lg font-semibold mb-4 flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          <i className="bi-lightbulb mr-2 text-yellow-500"></i>
          Productivity Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {analytics.overview.completionRate >= 80 && (
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-green-900/20 border border-green-700' : 'bg-green-50 border border-green-200'}`}>
              <div className={`font-medium text-sm mb-1 ${isDarkMode ? 'text-green-400' : 'text-green-700'}`}>
                🎉 Excellent Completion Rate!
              </div>
              <div className={`text-xs ${isDarkMode ? 'text-green-300' : 'text-green-600'}`}>
                You're completing {analytics.overview.completionRate}% of your tasks. Keep up the great work!
              </div>
            </div>
          )}
          {analytics.priorityBreakdown.high > analytics.overview.total * 0.3 && (
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-orange-900/20 border border-orange-700' : 'bg-orange-50 border border-orange-200'}`}>
              <div className={`font-medium text-sm mb-1 ${isDarkMode ? 'text-orange-400' : 'text-orange-700'}`}>
                ⚠️ High Priority Overload
              </div>
              <div className={`text-xs ${isDarkMode ? 'text-orange-300' : 'text-orange-600'}`}>
                Consider reducing high-priority tasks to avoid burnout.
              </div>
            </div>
          )}
          {analytics.timeAnalytics.averageCompletionTime <= 1 && (
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-blue-900/20 border border-blue-700' : 'bg-blue-50 border border-blue-200'}`}>
              <div className={`font-medium text-sm mb-1 ${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`}>
                ⚡ Quick Completor!
              </div>
              <div className={`text-xs ${isDarkMode ? 'text-blue-300' : 'text-blue-600'}`}>
                You complete tasks quickly. Consider taking on more challenging goals.
              </div>
            </div>
          )}
          {analytics.timeAnalytics.tasksThisWeek > analytics.timeAnalytics.tasksLastWeek && (
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-purple-900/20 border border-purple-700' : 'bg-purple-50 border border-purple-200'}`}>
              <div className={`font-medium text-sm mb-1 ${isDarkMode ? 'text-purple-400' : 'text-purple-700'}`}>
                📈 Productivity Trend Up!
              </div>
              <div className={`text-xs ${isDarkMode ? 'text-purple-300' : 'text-purple-600'}`}>
                You're creating more tasks this week. Great momentum!
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
