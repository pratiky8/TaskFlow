import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { tasksAPI, projectsAPI } from '../services/api';
import TaskCard from '../components/TaskCard';
import Loader from '../components/Loader';
import { useAuth } from '../context/AuthContext';
import { TaskCardSkeleton, FormSkeleton } from '../components/SkeletonLoader';

const Tasks = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState(searchParams.get('status') || 'all');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'createdAt');
  const [priorityFilter, setPriorityFilter] = useState(searchParams.get('priority') || 'all');
  const [projectFilter, setProjectFilter] = useState(searchParams.get('project') || 'all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user, isAdmin } = useAuth();

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    projectId: '',
    priority: 'medium',
    dueDate: '',
    assigneeId: '',
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tasksRes, projectsRes] = await Promise.all([
        tasksAPI.getAll(),
        projectsAPI.getAll(),
      ]);
      setTasks(tasksRes.data || []);
      setProjects(projectsRes.data || []);
      setError(null);
    } catch (err) {
      setError('Failed to load tasks');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks = tasks
    .filter((task) => {
      // Status filter
      if (filter === 'my-tasks') return task.assigneeId === user?.id;
      if (filter !== 'all' && task.status !== filter) return false;
      
      // Priority filter
      if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;
      
      // Project filter
      if (projectFilter !== 'all' && task.projectId !== projectFilter) return false;
      
      // Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          task.title?.toLowerCase().includes(query) ||
          task.description?.toLowerCase().includes(query) ||
          task.project?.name?.toLowerCase().includes(query)
        );
      }
      
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title?.localeCompare(b.title);
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
        case 'dueDate':
          return new Date(a.dueDate || '9999') - new Date(b.dueDate || '9999');
        case 'createdAt':
        default:
          return new Date(b.createdAt || b.id) - new Date(a.createdAt || a.id);
      }
    });

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (filter !== 'all') params.set('status', filter);
    if (searchQuery) params.set('search', searchQuery);
    if (sortBy !== 'createdAt') params.set('sort', sortBy);
    if (priorityFilter !== 'all') params.set('priority', priorityFilter);
    if (projectFilter !== 'all') params.set('project', projectFilter);
    
    setSearchParams(params);
  }, [filter, searchQuery, sortBy, priorityFilter, projectFilter, setSearchParams]);

  const validateForm = () => {
    const errors = {};
    if (!newTask.title.trim()) {
      errors.title = 'Title is required';
    }
    if (!newTask.projectId) {
      errors.projectId = 'Project is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // Only include assigneeId if it's not empty
      const taskData = { ...newTask };
      if (!taskData.assigneeId) {
        delete taskData.assigneeId;
      }
      
      const response = await tasksAPI.create(taskData);
      setTasks([response.data, ...tasks]);
      setNewTask({
        title: '',
        description: '',
        projectId: '',
        priority: 'medium',
        dueDate: '',
        assigneeId: '',
      });
      setIsModalOpen(false);
    } catch (err) {
      setFormErrors({ submit: err.response?.data?.message || 'Failed to create task' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await tasksAPI.update(taskId, { status: newStatus });
      setTasks(tasks.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
    } catch (err) {
      let errorMessage = 'Failed to update task status';
      
      if (err.response?.status === 403) {
        errorMessage = 'You are not authorized to update this task. Only the assigned user or admin can update task status.';
      } else if (err.response?.status === 404) {
        errorMessage = 'Task not found';
      } else if (err.response?.status === 401) {
        errorMessage = 'Please log in to update task status';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      alert(errorMessage);
      console.error('Status update error:', err);
    }
  };

  const handleDeleteTask = async (task) => {
    if (!window.confirm(`Are you sure you want to delete "${task.title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await tasksAPI.delete(task._id);
      setTasks(tasks.filter(t => t._id !== task._id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete task');
    }
  };

  const filterOptions = [
    { value: 'all', label: 'All Tasks' },
    { value: 'my-tasks', label: 'My Tasks' },
    { value: 'todo', label: 'To Do' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'done', label: 'Done' },
  ];

  if (loading) {
    return (
      <div className="p-6 lg:p-8 space-y-8">
        {/* Header Skeleton */}
        <div className="flex flex-col gap-4">
          <div>
            <div className="h-8 bg-gray-200 rounded w-16 mb-2 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-48 animate-pulse" />
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 max-w-md">
              <div className="h-10 bg-gray-200 rounded-lg animate-pulse" />
            </div>
            <div className="h-10 bg-gray-200 rounded w-24 animate-pulse" />
          </div>
        </div>

        {/* Filters Skeleton */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-wrap gap-3">
            <div className="h-10 bg-gray-200 rounded-lg w-32 animate-pulse" />
            <div className="h-10 bg-gray-200 rounded-lg w-32 animate-pulse" />
            <div className="h-10 bg-gray-200 rounded-lg w-32 animate-pulse" />
            <div className="h-10 bg-gray-200 rounded-lg w-32 animate-pulse" />
          </div>
        </div>

        {/* Tasks Grid Skeleton */}
        <TaskCardSkeleton count={6} />
      </div>
    );
  }

  const clearFilters = () => {
    setFilter('all');
    setPriorityFilter('all');
    setProjectFilter('all');
    setSearchQuery('');
    setSortBy('createdAt');
  };

  const activeFiltersCount = [
    filter !== 'all',
    priorityFilter !== 'all',
    projectFilter !== 'all',
    searchQuery !== ''
  ].filter(Boolean).length;

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-500 mt-1">Manage and track your tasks</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search Box */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tasks..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-sm"
              />
            </div>
          </div>
          
          {isAdmin && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-all shadow-sm hover:shadow-md"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Task
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-wrap gap-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 text-sm bg-white"
          >
            <option value="all">All Status</option>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
            <option value="my-tasks">My Tasks</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 text-sm bg-white"
          >
            <option value="all">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="px-3 py-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 text-sm bg-white"
          >
            <option value="all">All Projects</option>
            {projects.map((p) => (
              <option key={p._id} value={p._id}>{p.name}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 text-sm bg-white"
          >
            <option value="createdAt">Newest First</option>
            <option value="title">Title A-Z</option>
            <option value="priority">Priority</option>
            <option value="dueDate">Due Date</option>
          </select>
        </div>

        {/* Active Filters */}
        {activeFiltersCount > 0 && (
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
            <span className="text-sm text-gray-500">Active filters:</span>
            {filter !== 'all' && (
              <button
                onClick={() => setFilter('all')}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium hover:bg-indigo-100 transition-colors"
              >
                Status: {filter}
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            {priorityFilter !== 'all' && (
              <button
                onClick={() => setPriorityFilter('all')}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium hover:bg-indigo-100 transition-colors"
              >
                Priority: {priorityFilter}
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            {projectFilter !== 'all' && (
              <button
                onClick={() => setProjectFilter('all')}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium hover:bg-indigo-100 transition-colors"
              >
                Project
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium hover:bg-indigo-100 transition-colors"
              >
                Search: {searchQuery}
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            <button
              onClick={clearFilters}
              className="text-xs text-gray-500 hover:text-gray-700 underline ml-auto"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
          {error}
        </div>
      )}

      {filteredTasks.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {activeFiltersCount > 0 ? 'No tasks match your filters' : 'No tasks yet'}
          </h3>
          <p className="text-gray-500 mb-6">
            {activeFiltersCount > 0
              ? 'Try adjusting your search or filters'
              : isAdmin 
                ? 'Create your first task to get started'
                : 'No tasks assigned to you yet. Contact your admin to get tasks assigned.'}
          </p>
          {activeFiltersCount > 0 ? (
            <button
              onClick={clearFilters}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Clear Filters
            </button>
          ) : isAdmin ? (
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn-primary"
            >
              Create Task
            </button>
          ) : null}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onStatusChange={handleStatusChange}
              onDelete={isAdmin ? handleDeleteTask : null}
            />
          ))}
        </div>
      )}

      {/* Create Task Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn"
          style={{
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.4) 0%, rgba(168, 85, 247, 0.4) 100%)',
            backdropFilter: 'blur(8px)'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false);
          }}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto transform animate-slideUp"
            style={{
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.5)'
            }}
          >
            {/* Header with gradient background */}
            <div 
              className="p-6 flex items-center justify-between"
              style={{
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                borderTopLeftRadius: '1rem',
                borderTopRightRadius: '1rem'
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Create New Task</h2>
                  <p className="text-indigo-100 text-sm">Add a task to your project</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-white hover:bg-white/30 transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="p-0">
              {formErrors.submit && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-start gap-3 animate-shake">
                  <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-red-700">{formErrors.submit}</p>
                </div>
              )}

              {/* Modern Card Design */}
              <div className="relative">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-blue-50 rounded-3xl"></div>
                <div className="absolute inset-0 bg-white rounded-3xl shadow-2xl shadow-blue-100/20 backdrop-blur-xl"></div>
                
                {/* Content */}
                <div className="relative p-8">
                  {/* Header with Icon */}
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg mb-4">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2">
                      Create New Task
                    </h2>
                    <p className="text-gray-500 text-sm">Organize your work and boost productivity</p>
                  </div>

                  {/* Form Fields */}
                  <div className="space-y-6">
                    {/* Title Field */}
                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <span className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg group-hover:scale-110 transition-transform">
                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </span>
                        Task Title
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={newTask.title}
                          onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                          className={`w-full px-4 py-3 pl-12 border-2 rounded-xl focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-300 bg-gray-50/50 backdrop-blur-sm ${
                            formErrors.title 
                              ? 'border-red-300 bg-red-50/50 focus:border-red-500 focus:ring-red-100' 
                              : 'border-gray-200 hover:border-blue-400 focus:border-blue-500 hover:bg-white'
                          }`}
                          placeholder="Enter task title..."
                          style={{ fontSize: '1rem' }}
                        />
                        <div className="absolute left-4 top-1/2 -translate-y-1/2">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </div>
                      </div>
                      {formErrors.title && (
                        <p className="mt-2 text-sm text-red-600 flex items-center gap-1 animate-pulse">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01" />
                          </svg>
                          {formErrors.title}
                        </p>
                      )}
                    </div>

                    {/* Description Field */}
                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <span className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg group-hover:scale-110 transition-transform">
                          <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                          </svg>
                        </span>
                        Description
                      </label>
                      <div className="relative">
                        <textarea
                          value={newTask.description}
                          onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                          rows={3}
                          className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 outline-none resize-none transition-all duration-300 bg-gray-50/50 backdrop-blur-sm hover:bg-white hover:border-purple-400"
                          placeholder="Add task details..."
                        />
                        <div className="absolute left-4 top-4">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Configuration Cards */}
                    <div className="grid grid-cols-3 gap-4">
                      {/* Project Card */}
                      <div className="group">
                        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                          <span className="flex items-center justify-center w-6 h-6 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-md group-hover:scale-110 transition-transform">
                            <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                            </svg>
                          </span>
                          Project
                          <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <select
                            value={newTask.projectId}
                            onChange={(e) => setNewTask({ ...newTask, projectId: e.target.value })}
                            className={`w-full px-3 py-2.5 pr-10 border-2 rounded-xl focus:ring-3 focus:ring-emerald-100 outline-none transition-all duration-300 appearance-none cursor-pointer text-sm bg-white/80 backdrop-blur-sm hover:bg-white hover:border-emerald-400 focus:border-emerald-500 ${
                              formErrors.projectId 
                                ? 'border-red-300 bg-red-50/80 focus:border-red-500' 
                                : 'border-gray-200'
                            }`}
                          >
                            <option value="">Select project</option>
                            {projects.map((p) => (
                              <option key={p._id} value={p._id}>
                                {p.name}
                              </option>
                            ))}
                          </select>
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Priority Card */}
                      <div className="group">
                        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                          <span className="flex items-center justify-center w-6 h-6 bg-gradient-to-br from-amber-100 to-orange-100 rounded-md group-hover:scale-110 transition-transform">
                            <svg className="w-3 h-3 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </span>
                          Priority
                        </label>
                        <div className="relative">
                          <select
                            value={newTask.priority}
                            onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                            className={`w-full px-3 py-2.5 pr-10 border-2 rounded-xl focus:ring-3 focus:ring-amber-100 outline-none transition-all duration-300 appearance-none cursor-pointer text-sm bg-white/80 backdrop-blur-sm hover:bg-white hover:border-amber-400 focus:border-amber-500 border-gray-200 ${
                              newTask.priority === 'high' ? 'text-red-600 font-medium' :
                              newTask.priority === 'medium' ? 'text-amber-600 font-medium' :
                              'text-green-600 font-medium'
                            }`}
                          >
                            <option value="low" className="text-green-600">🟢 Low</option>
                            <option value="medium" className="text-amber-600">🟡 Medium</option>
                            <option value="high" className="text-red-600">🔴 High</option>
                          </select>
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Assignee Card */}
                      <div className="group">
                        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                          <span className="flex items-center justify-center w-6 h-6 bg-gradient-to-br from-rose-100 to-pink-100 rounded-md group-hover:scale-110 transition-transform">
                            <svg className="w-3 h-3 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </span>
                          Assign To
                        </label>
                        <div className="relative">
                          <select
                            value={newTask.assigneeId}
                            onChange={(e) => setNewTask({ ...newTask, assigneeId: e.target.value })}
                            className="w-full px-3 py-2.5 pr-10 border-2 border-gray-200 rounded-xl focus:ring-3 focus:ring-rose-100 focus:border-rose-500 outline-none transition-all duration-300 appearance-none cursor-pointer bg-white/80 backdrop-blur-sm hover:bg-white hover:border-rose-400 text-sm"
                          >
                            <option value="">Unassigned</option>
                            {(() => {
                              const selectedProject = projects.find(p => p._id === newTask.projectId);
                              if (!selectedProject?.members) return null;
                              
                              return selectedProject.members.map((member) => {
                                // Use the correct ID field - check both id and _id
                                const memberId = member.id || member._id;
                                return (
                                  <option key={memberId} value={memberId}>
                                    {member.name} ({member.email})
                                  </option>
                                );
                              });
                            })()}
                          </select>
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Due Date Card */}
                    <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-6 border border-blue-200/50 backdrop-blur-sm">
                      <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-3">
                        <span className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </span>
                        Due Date
                        <span className="text-xs text-gray-500 font-normal">(Optional)</span>
                      </label>
                      <input
                        type="date"
                        value={newTask.dueDate}
                        onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-blue-200/50 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all duration-300 hover:border-blue-400 bg-white/90 backdrop-blur-sm text-sm"
                        style={{ colorScheme: 'light' }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: isSubmitting 
                      ? 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)'
                      : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader size="small" variant="spinner" />
                      Creating...
                    </>
                  ) : (
                    'Create Task'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
