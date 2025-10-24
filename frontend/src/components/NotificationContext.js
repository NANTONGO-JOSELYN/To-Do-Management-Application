import React, { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const addNotification = useCallback((notification) => {
    const id = Date.now().toString();
    const newNotification = {
      id,
      type: 'success',
      duration: 4000,
      ...notification,
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto remove notification
    setTimeout(() => {
      removeNotification(id);
    }, newNotification.duration);

    return id;
  }, [removeNotification]);

  const showSuccess = useCallback((message, options = {}) => {
    return addNotification({
      type: 'success',
      message,
      ...options,
    });
  }, [addNotification]);

  const showError = useCallback((message, options = {}) => {
    return addNotification({
      type: 'error',
      message,
      duration: 6000,
      ...options,
    });
  }, [addNotification]);

  const showInfo = useCallback((message, options = {}) => {
    return addNotification({
      type: 'info',
      message,
      ...options,
    });
  }, [addNotification]);

  const showWarning = useCallback((message, options = {}) => {
    return addNotification({
      type: 'warning',
      message,
      ...options,
    });
  }, [addNotification]);

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      removeNotification,
      showSuccess,
      showError,
      showInfo,
      showWarning,
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const NotificationContainer = () => {
  const { notifications, removeNotification } = useNotification();

  if (notifications.length === 0) return null;

  const getNotificationStyles = (type) => {
    const baseStyles = "flex items-center p-4 rounded-lg shadow-lg border-l-4 backdrop-blur-sm";
    const typeStyles = {
      success: "bg-green-50 bg-opacity-95 border-green-500 text-green-800",
      error: "bg-red-50 bg-opacity-95 border-red-500 text-red-800",
      warning: "bg-yellow-50 bg-opacity-95 border-yellow-500 text-yellow-800",
      info: "bg-blue-50 bg-opacity-95 border-blue-500 text-blue-800",
    };
    return `${baseStyles} ${typeStyles[type] || typeStyles.info}`;
  };

  const getNotificationIcon = (type) => {
    const icons = {
      success: "bi-check-circle-fill text-green-600",
      error: "bi-x-circle-fill text-red-600",
      warning: "bi-exclamation-triangle-fill text-yellow-600",
      info: "bi-info-circle-fill text-blue-600",
    };
    return icons[type] || icons.info;
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm w-full">
      {notifications.map((notification, index) => (
        <div
          key={notification.id}
          className={`${getNotificationStyles(notification.type)} animate-slide-up transform transition-all duration-300 hover:scale-105`}
          style={{
            animationDelay: `${index * 100}ms`,
          }}
        >
          <div className="flex items-start space-x-3 flex-1">
            <i className={`${getNotificationIcon(notification.type)} text-lg flex-shrink-0 mt-0.5`}></i>
            <div className="flex-1">
              {notification.title && (
                <div className="font-semibold text-sm mb-1">
                  {notification.title}
                </div>
              )}
              <div className="text-sm leading-relaxed">
                {notification.message}
              </div>
            </div>
          </div>
          <button
            onClick={() => removeNotification(notification.id)}
            className="ml-2 flex-shrink-0 p-1 rounded-full hover:bg-black hover:bg-opacity-10 transition-colors"
          >
            <i className="bi-x text-lg"></i>
          </button>
        </div>
      ))}
    </div>
  );
};
