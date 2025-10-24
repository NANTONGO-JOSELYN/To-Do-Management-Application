import React from 'react';
import { Link } from 'react-router-dom';

const Dashboard = ({ todos = [], stats, isDarkMode }) => {
  // Provide fallback for stats if undefined
  const safeStats = stats || {
    total: todos.length,
    completed: todos.filter(t => t.completed).length,
    active: todos.filter(t => !t.completed).length,
    high: todos.filter(t => t.priority === 'high').length
  };

  // Get recent tasks (last 5)
  const recentTasks = todos.slice(0, 5);
  
  // Get high priority tasks (with fallback for priority)
  const highPriorityTasks = todos.filter(todo => 
    (todo.priority || 'medium') === 'high' && !todo.completed
  );
  
  // Get overdue tasks (if they have deadlines)
  const overdueTasks = todos.filter(todo => {
    if (!todo.deadline || todo.completed) return false;
    try {
      return new Date(todo.deadline) < new Date();
    } catch (error) {
      return false;
    }
  });

  // Calculate completion rate
  const completionRate = safeStats.total > 0 ? Math.round((safeStats.completed / safeStats.total) * 100) : 0;

  // Get tasks by category
  const tasksByCategory = todos.reduce((acc, todo) => {
    const category = todo.category || 'personal';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});

  const StatCard = ({ title, value, icon, color, description, trend }) => (
    <div className={`card p-6 hover:scale-105 transition-all duration-300 ${
      isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    } border`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
          <i className={`${icon} text-2xl ${color.replace('bg-', 'text-')}`}></i>
        </div>
        {trend && (
          <div className={`flex items-center text-sm ${
            trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-500'
          }`}>
            <i className={`bi-arrow-${trend > 0 ? 'up' : trend < 0 ? 'down' : 'right'} mr-1`}></i>
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div className="space-y-1">
        <div className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {value}
        </div>
        <div className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
          {title}
        </div>
        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          {description}
        </div>
      </div>
    </div>
  );

  const QuickActionCard = ({ title, description, icon, color, path, badge }) => (
    <Link to={path} className="block group">
      <div className={`card p-6 group-hover:scale-105 transition-all duration-300 ${
        isDarkMode ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' : 'bg-white border-gray-200 hover:bg-gray-50'
      } border group-hover:shadow-xl`}>
        <div className="flex items-center space-x-4">
          <div className={`p-3 rounded-xl ${color} bg-opacity-10 group-hover:bg-opacity-20 transition-all duration-300`}>
            <i className={`${icon} text-xl ${color.replace('bg-', 'text-')}`}></i>
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {title}
              </h3>
              {badge && (
                <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                  {badge}
                </span>
              )}
            </div>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {description}
            </p>
          </div>
          <i className={`bi-arrow-right text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-400'} group-hover:text-blue-500 transition-colors`}></i>
        </div>
      </div>
    </Link>
  );

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className={`card p-8 ${isDarkMode ? 'bg-gradient-to-r from-gray-800 to-gray-900' : 'bg-gradient-to-r from-blue-50 to-indigo-100'} border-0`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Welcome back! 
            </h1>
            <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {safeStats.active > 0 
                ? `You have ${safeStats.active} active task${safeStats.active > 1 ? 's' : ''} to complete`
                : ''
              }
            </p>
            {completionRate > 0 && (
              <div className="mt-4">
                <div className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Overall Progress: {completionRate}%
                </div>
                <div className={`w-64 h-3 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full overflow-hidden`}>
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500"
                    style={{ width: `${completionRate}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
          <div className="hidden md:block">
            <div className="text-6xl opacity-20">📊</div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Tasks"
          value={safeStats.total}
          icon="bi-list-ul"
          color="bg-blue-500"
          description="All your tasks"
          trend={safeStats.total > 0 ? 5 : 0}
        />
        <StatCard
          title="Completed"
          value={safeStats.completed}
          icon="bi-check-circle"
          color="bg-green-500"
          description="Tasks finished"
          trend={completionRate}
        />
        <StatCard
          title="In Progress"
          value={safeStats.active}
          icon="bi-clock"
          color="bg-orange-500"
          description="Currently working"
          trend={safeStats.active > 0 ? -2 : 0}
        />
        <StatCard
          title="High Priority"
          value={highPriorityTasks.length}
          icon="bi-exclamation-triangle"
          color="bg-red-500"
          description="Urgent tasks"
          trend={highPriorityTasks.length > 0 ? 10 : 0}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className={`card p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}>
          <h2 className={`text-xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Quick Actions
          </h2>
          <div className="space-y-4">
            <QuickActionCard
              title="Create New Task"
              description="Add a new task to your list"
              icon="bi-plus-circle"
              color="bg-blue-500"
              path="/create"
            />
            <QuickActionCard
              title="View All Tasks"
              description="See all your tasks in one place"
              icon="bi-list-task"
              color="bg-green-500"
              path="/tasks"
            />
            <QuickActionCard
              title="High Priority"
              description="Focus on urgent tasks first"
              icon="bi-exclamation-triangle"
              color="bg-red-500"
              path="/tasks?filter=high"
              badge={highPriorityTasks.length > 0 ? highPriorityTasks.length : null}
            />
            {overdueTasks.length > 0 && (
              <QuickActionCard
                title="Overdue Tasks"
                description="Tasks that need immediate attention"
                icon="bi-alarm"
                color="bg-red-500"
                path="/tasks?filter=overdue"
                badge={overdueTasks.length}
              />
            )}
          </div>
        </div>

        {/* Recent Tasks */}
        <div className={`card p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}>
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Recent Tasks
            </h2>
            <Link 
              to="/tasks" 
              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
            >
              View all <i className="bi-arrow-right ml-1"></i>
            </Link>
          </div>
          {recentTasks.length > 0 ? (
            <div className="space-y-3">
              {recentTasks.map((task) => (
                <div 
                  key={task.id} 
                  className={`p-3 rounded-lg border ${
                    isDarkMode 
                      ? 'bg-gray-750 border-gray-600 hover:bg-gray-700' 
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  } transition-colors cursor-pointer`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      task.completed ? 'bg-green-500' : 
                      task.priority === 'high' ? 'bg-red-500' :
                      task.priority === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                    }`}></div>
                    <div className="flex-1">
                      <div className={`font-medium text-sm ${
                        task.completed 
                          ? `line-through ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`
                          : isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {task.text}
                      </div>
                      <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {task.category || 'personal'} • {task.priority || 'medium'} priority
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <i className={`bi-inbox text-4xl ${isDarkMode ? 'text-gray-600' : 'text-gray-300'} mb-4`}></i>
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                No tasks yet. Create your first task!
              </p>
            </div>
          )}
        </div>

        {/* Categories Overview */}
        <div className={`card p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}>
          <h2 className={`text-xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Categories
          </h2>
          {Object.keys(tasksByCategory).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(tasksByCategory).map(([category, count]) => {
                const categoryConfig = {
                  work: { icon: 'bi-briefcase', color: 'bg-blue-500', emoji: '💼' },
                  personal: { icon: 'bi-person', color: 'bg-green-500', emoji: '👤' },
                  shopping: { icon: 'bi-cart', color: 'bg-orange-500', emoji: '🛒' },
                  health: { icon: 'bi-heart-pulse', color: 'bg-red-500', emoji: '❤️' }
                };
                const config = categoryConfig[category] || categoryConfig.personal;
                
                return (
                  <div key={category} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${config.color} bg-opacity-10`}>
                        <span className="text-lg">{config.emoji}</span>
                      </div>
                      <div>
                        <div className={`font-medium capitalize ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {category}
                        </div>
                        <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {count} task{count > 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {count}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <i className={`bi-tags text-4xl ${isDarkMode ? 'text-gray-600' : 'text-gray-300'} mb-4`}></i>
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                No categories yet
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
