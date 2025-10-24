#  To-Do Management Application

A modern, feature-rich task management application built with React.js frontend and Node.js backend. This application helps you organize, prioritize, and track your daily tasks with an intuitive and attractive user interface.

##  Features

###  Core Functionality
- **Create Tasks**: Add new tasks with detailed information
- **View Tasks**: Browse all tasks in a clean, organized interface
- **Update Tasks**: Edit task details, priority, and status
- **Delete Tasks**: Remove completed or unwanted tasks
- **Mark Complete**: Toggle task completion status

###  User Interface
- **Modern Design**: Beautiful blue-themed UI with smooth animations
- **Dark Mode**: Toggle between light and dark themes
- **Responsive Layout**: Works perfectly on desktop, tablet, and mobile devices
- **Bootstrap Icons**: Comprehensive icon system for better visual experience
- **Drag & Drop**: Reorder tasks by dragging and dropping

###  Organization & Filtering
- **Priority Levels**: High, Medium, Low priority tasks
- **Categories**: Personal, Work, Shopping, Health categories
- **Filtering**: Filter by status (all, active, completed), priority, or category
- **Search**: Search tasks by title, description, or tags
- **Sorting**: Sort by date, name, priority, category, or deadline

###  Advanced Features
- **Dashboard**: Overview with statistics and quick actions
- **Navigation**: Clean navigation bar with quick stats
- **Bulk Operations**: Select and perform actions on multiple tasks
- **Deadlines**: Set due dates for tasks with overdue tracking
- **Tags**: Add custom tags for better organization
- **Persistence**: Data saved to backend with offline fallback
- **Real-time Updates**: Live updates across the application

## 🛠 Technology Stack

### Frontend
- **React.js 19.2.0**: Modern React with hooks and function components
- **React Router DOM**: Client-side routing for navigation
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Bootstrap Icons**: Icon library for UI elements
- **Axios**: HTTP client for API communication

### Backend
- **Node.js**: JavaScript runtime for server-side development
- **Express.js**: Web framework for API development
- **CORS**: Cross-origin resource sharing support
- **UUID**: Unique identifier generation
- **File System**: JSON file-based data storage

## Project Structure

```
To-Do-Management-Application/
├── frontend/                 # React.js frontend application
│   ├── public/              # Public assets
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   │   ├── Navigation.js
│   │   │   ├── TodoForm.js
│   │   │   ├── TodoItem.js
│   │   │   ├── FilterBar.js
│   │   │   ├── SearchBar.js
│   │   │   └── ...
│   │   ├── pages/           # Main application pages
│   │   │   ├── Dashboard.js
│   │   │   ├── TaskList.js
│   │   │   └── CreateTask.js
│   │   ├── services/        # API service files
│   │   ├── App.js           # Main application component
│   │   └── index.js         # Application entry point
│   ├── tailwind.config.js   # Tailwind CSS configuration
│   └── package.json
├── backend/                 # Node.js backend application
│   ├── data/               # JSON data storage
│   │   └── tasks.json      # Task data file
│   ├── server.js           # Main server file
│   └── package.json
└── README.md               # This file
```

##  Getting Started

### Prerequisites
- Node.js (version 14 or higher)
- npm (Node Package Manager)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/NANTONGO-JOSELYN/To-Do-Management-Application.git
   cd To-Do-Management-Application
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../frontend
   npm install --legacy-peer-deps
   ```

### Running the Application

#### Option 1: Manual Start (Recommended for Development)

1. **Start the Backend Server**
   ```bash
   cd backend
   npm run dev
   ```
   The backend will run on `http://localhost:5000`

2. **Start the Frontend Development Server** (in a new terminal)
   ```bash
   cd frontend
   npm start
   ```
   The frontend will run on `http://localhost:3000`

#### Option 2: Production Build

1. **Build the Frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Start the Backend**
   ```bash
   cd backend
   npm start
   ```

## Usage Guide

### Dashboard
- **Overview**: View task statistics and quick actions
- **Quick Stats**: See total, completed, and active task counts
- **Recent Tasks**: Preview of your latest tasks
- **Categories**: Overview of tasks by category

### Creating Tasks
1. Click "Create New Task" or use the navigation
2. Fill in task details:
   - **Title**: Brief description of the task
   - **Description**: Optional detailed description
   - **Priority**: High, Medium, or Low
   - **Category**: Personal, Work, Shopping, or Health
   - **Deadline**: Optional due date and time
   - **Tags**: Comma-separated tags for organization
3. Click "Create Task" to save

### Managing Tasks
- **View Tasks**: Go to Tasks page to see all tasks
- **Filter**: Use filter buttons to show specific task types
- **Search**: Use the search bar to find specific tasks
- **Sort**: Click sort options to reorder tasks
- **Edit**: Click on a task to edit its details
- **Complete**: Check the checkbox to mark as complete
- **Delete**: Use the delete button to remove tasks

### Bulk Operations
1. Select multiple tasks using checkboxes
2. Use bulk action buttons to:
   - Mark selected tasks as complete
   - Mark selected tasks as incomplete
   - Delete selected tasks

### Dark Mode
- Click the moon/sun icon in the navigation to toggle themes
- Preference is saved and remembered across sessions

## 📡 API Endpoints


### Tasks
- `GET /api/tasks` - Get all tasks with optional filtering
- `GET /api/tasks/:id` - Get a specific task
- `POST /api/tasks` - Create a new task
- `PUT /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task

### Bulk Operations
- `POST /api/tasks/bulk` - Perform bulk operations (complete, incomplete, delete)
- `PUT /api/tasks/reorder` - Reorder tasks

### Statistics
- `GET /api/stats` - Get task statistics

## 🐛 Troubleshooting

### Common Issues

1. **Typing Issues (Input Fields Losing Focus)**
   - This is usually caused by component re-rendering
   - Make sure React keys are stable
   - Avoid defining components inside render methods

2. **Backend Connection Failed**
   - Ensure backend server is running on port 5000
   - Check if CORS is properly configured
   - Verify API endpoints are accessible

3. **Frontend Not Loading**
   - Clear browser cache and reload
   - Check console for JavaScript errors
   - Ensure all dependencies are installed with `--legacy-peer-deps`

4. **Tasks Not Saving**
   - Verify backend server is running
   - Check network connectivity
   - Data will fall back to localStorage if backend is unavailable

### Performance Tips
- The application is optimized for performance
- Large task lists are handled efficiently
- Offline mode provides backup functionality
- Dark mode reduces eye strain in low light

## Contributing


1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License - see the package.json files for details.

##Acknowledgments

- React.js community for excellent documentation
- Tailwind CSS for the utility-first CSS framework
- Bootstrap Icons for the comprehensive icon set
- Express.js for the robust backend framework

---

**Developed  by NANTONGO-JOSELYN**

For support or questions, please open an issue on the GitHub repository.
