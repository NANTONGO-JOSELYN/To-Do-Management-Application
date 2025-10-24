import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../components/NotificationContext';
import OptimizedInput from '../components/OptimizedInput';
import OptimizedTextarea from '../components/OptimizedTextarea';

// InputField component outside of main component to prevent re-creation
const InputField = React.memo(({ label, error, children, required = false, help, isDarkMode }) => (
  <div className="space-y-2">
    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {children}
    {help && (
      <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        {help}
      </p>
    )}
    {error && (
      <p className="text-red-500 text-xs flex items-center">
        <i className="bi-exclamation-triangle mr-1"></i>
        {error}
      </p>
    )}
  </div>
));

// Quick templates moved outside component to prevent re-creation
const quickTemplates = [
  {
    name: 'Work Meeting',
    data: {
      text: 'Attend team meeting',
      description: 'Weekly team sync meeting',
      priority: 'high',
      category: 'work'
    }
  },
  {
    name: 'Grocery Shopping',
    data: {
      text: 'Buy groceries',
      description: 'Weekly grocery shopping',
      priority: 'medium',
      category: 'shopping'
    }
  },
  {
    name: 'Exercise',
    data: {
      text: 'Morning workout',
      description: '30 minutes cardio exercise',
      priority: 'medium',
      category: 'health'
    }
  },
  {
    name: 'Personal Project',
    data: {
      text: 'Work on side project',
      description: 'Continue development on personal project',
      priority: 'low',
      category: 'personal'
    }
  }
];

const CreateTask = ({ onSubmit, isDarkMode }) => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    text: '',
    description: '',
    priority: 'medium',
    category: 'personal',
    deadline: '',
    tags: ''
  });

  const [errors, setErrors] = useState({});

  const validateForm = useCallback(() => {
    const newErrors = {};
    
    if (!formData.text.trim()) {
      newErrors.text = 'Task title is required';
    } else if (formData.text.length < 3) {
      newErrors.text = 'Task title must be at least 3 characters';
    }

    // Note: We'll allow any text for deadline since it's more flexible
    // Users can enter "Tomorrow", "Next Monday", "Dec 25", etc.
    // The backend can handle date parsing if needed

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData.text, formData.deadline]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showError('All fields are required');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const taskData = {
        ...formData,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []
      };
      
      await onSubmit(taskData);
      
      showSuccess('Task created successfully! 🎉', {
        title: 'Success'
      });
      
      // Reset form
      setFormData({
        text: '',
        description: '',
        priority: 'medium',
        category: 'personal',
        deadline: '',
        tags: ''
      });
      
      // Navigate to tasks page after a short delay
      setTimeout(() => {
        navigate('/tasks');
      }, 1000);
      
    } catch (error) {
      showError(`Failed to create task: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, onSubmit, showSuccess, showError, navigate, validateForm]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    setErrors(prev => {
      if (prev[name]) {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      }
      return prev;
    });
  }, []);


  const applyTemplate = useCallback((template) => {
    setFormData(prev => ({ ...prev, ...template.data }));
    showSuccess(`Template "${template.name}" applied!`);
  }, [showSuccess]);



  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className={`card p-8 text-center ${isDarkMode ? 'bg-gradient-to-r from-gray-800 to-gray-900' : 'bg-gradient-to-r from-blue-50 to-indigo-100'} border-0`}>
        <div className="text-6xl mb-4">✨</div>
        <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Create New Task
        </h1>
        <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Add a new task to your productivity journey
        </p>
      </div>

      {/* Quick Templates */}
      <div className={`card p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}>
        <h2 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Quick Templates
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {quickTemplates.map((template) => (
            <button
              key={template.name}
              onClick={() => applyTemplate(template)}
              className={`p-3 rounded-lg text-left transition-all duration-200 hover:scale-105 ${
                isDarkMode 
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                  : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
              }`}
            >
              <div className="font-medium text-sm">{template.name}</div>
              <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {template.data.category} • {template.data.priority}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Form */}
      <div className={`card p-8 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Task Title */}
          <InputField 
            label="Task Title" 
            error={errors.text} 
            required={true}
            help="A clear, concise description of what needs to be done"
            isDarkMode={isDarkMode}
          >
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <i className="bi-pencil text-gray-400 text-lg"></i>
              </div>
              <OptimizedInput
                type="text"
                name="text"
                value={formData.text}
                onChange={handleChange}
                placeholder="Enter task title..."
                className={`input-field pl-12 ${
                  errors.text 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                    : ''
                } ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : ''}`}
              />
            </div>
          </InputField>

          {/* Description */}
          <InputField 
            label="Description" 
            error={errors.description}
            help="Optional detailed description or notes about the task"
            isDarkMode={isDarkMode}
          >
            <OptimizedTextarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Add more details about this task..."
              className={`input-field resize-none h-24 ${
                errors.description 
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                  : ''
              } ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : ''}`}
              rows="3"
            />
          </InputField>

          {/* Priority and Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField label="Priority" help="How urgent or important is this task?" isDarkMode={isDarkMode}>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <i className="bi-flag text-gray-400 text-lg"></i>
                </div>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className={`input-field pl-12 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                >
                  <option value="low">🟢 Low Priority</option>
                  <option value="medium">🟡 Medium Priority</option>
                  <option value="high">🔴 High Priority</option>
                </select>
              </div>
            </InputField>

            <InputField label="Category" help="What area of your life does this belong to?" isDarkMode={isDarkMode}>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <i className="bi-tags text-gray-400 text-lg"></i>
                </div>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={`input-field pl-12 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                >
                  <option value="personal">👤 Personal</option>
                  <option value="work">💼 Work</option>
                  <option value="shopping">🛒 Shopping</option>
                  <option value="health">❤️ Health</option>
                </select>
              </div>
            </InputField>
          </div>

          {/* Deadline and Tags */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField 
              label="Deadline" 
              error={errors.deadline}
              help="Optional deadline for this task"
              isDarkMode={isDarkMode}
            >
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <i className="bi-calendar3 text-gray-400 text-lg"></i>
                </div>
                <OptimizedInput
                  type="date"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleChange}
                  className={`input-field pl-12 date-input ${
                    errors.deadline 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : ''
                  } ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                  style={{
                    colorScheme: isDarkMode ? 'dark' : 'light'
                  }}
                />
              </div>
            </InputField>

            <InputField 
              label="Tags" 
              help="Comma-separated tags for organization"
              isDarkMode={isDarkMode}
            >
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <i className="bi-hash text-gray-400 text-lg"></i>
                </div>
                <OptimizedInput
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  placeholder="urgent, project, meeting..."
                  className={`input-field pl-12 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : ''}`}
                />
              </div>
            </InputField>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row sm:justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/tasks')}
              className={`btn-secondary flex items-center justify-center space-x-2 ${
                isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : ''
              }`}
            >
              <i className="bi-x-circle"></i>
              <span>Cancel</span>
            </button>
            
            <button
              type="submit"
              disabled={isSubmitting || !formData.text.trim()}
              className={`btn-primary flex items-center justify-center space-x-2 ${
                isSubmitting || !formData.text.trim() 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:shadow-xl'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <i className="bi-plus-circle"></i>
                  <span>Create Task</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Tips Section */}
      <div className={`card p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}>
        <h3 className={`text-lg font-semibold mb-4 flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          <i className="bi-lightbulb mr-2 text-yellow-500"></i>
          Pro Tips
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
            <div className={`font-medium text-sm mb-1 ${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`}>
              Be Specific
            </div>
            <div className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-blue-600'}`}>
              Instead of "Study", use "Study Chapter 5 of Biology textbook"
            </div>
          </div>
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-green-50'}`}>
            <div className={`font-medium text-sm mb-1 ${isDarkMode ? 'text-green-400' : 'text-green-700'}`}>
              Set Deadlines
            </div>
            <div className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-green-600'}`}>
              Tasks with deadlines are 42% more likely to be completed
            </div>
          </div>
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-orange-50'}`}>
            <div className={`font-medium text-sm mb-1 ${isDarkMode ? 'text-orange-400' : 'text-orange-700'}`}>
              Use Categories
            </div>
            <div className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-orange-600'}`}>
              Organize tasks by context to boost focus and efficiency
            </div>
          </div>
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-purple-50'}`}>
            <div className={`font-medium text-sm mb-1 ${isDarkMode ? 'text-purple-400' : 'text-purple-700'}`}>
              Prioritize Wisely
            </div>
            <div className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-purple-600'}`}>
              High priority should be reserved for truly urgent tasks
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTask;
