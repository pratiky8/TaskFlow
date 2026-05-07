import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tasksAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';

const TaskDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchTaskDetails();
  }, [id]);

  const fetchTaskDetails = async () => {
    try {
      setLoading(true);
      const response = await tasksAPI.getById(id);
      setTask(response.data);
      setError(null);
    } catch (err) {
      let errorMessage = 'Failed to load task details';
      
      if (err.response?.status === 404) {
        errorMessage = 'Task not found';
      } else if (err.response?.status === 403) {
        errorMessage = 'You do not have permission to access this task';
      } else if (err.response?.status === 401) {
        errorMessage = 'Please log in to access this task';
      } else if (err.code === 'NETWORK_ERROR') {
        errorMessage = 'Network error. Please check your connection.';
      }
      
      setError(errorMessage);
      console.error('Task details error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (newStatus === task.status) return;

    setIsUpdating(true);
    try {
      const response = await tasksAPI.update(id, { status: newStatus });
      setTask(response.data);
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
    } finally {
      setIsUpdating(false);
    }
  };

  const canEditTask = isAdmin || task?.assigneeId === user?._id;

  const statusConfig = {
    'todo': {
      label: 'To Do',
      color: 'bg-gray-100 text-gray-700 border-gray-300',
      icon: '📋',
    },
    'in-progress': {
      label: 'In Progress',
      color: 'bg-blue-100 text-blue-700 border-blue-300',
      icon: '🔄',
    },
    'done': {
      label: 'Done',
      color: 'bg-green-100 text-green-700 border-green-300',
      icon: '✅',
    },
  };

  const priorityConfig = {
    'low': { color: 'bg-gray-100 text-gray-700', label: 'Low Priority' },
    'medium': { color: 'bg-yellow-100 text-yellow-700', label: 'Medium Priority' },
    'high': { color: 'bg-red-100 text-red-700', label: 'High Priority' },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader size="large" />
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white border border-gray-200 rounded-xl p-8 text-center card-shadow">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {error || 'Task not found'}
            </h3>
            <p className="text-gray-500 mb-6">
              {error?.includes('permission') 
                ? 'You may need to be added to the project to access this task.'
                : 'The task you\'re looking for might have been deleted or moved.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => navigate('/tasks')}
                className="btn-primary"
              >
                Back to Tasks
              </button>
              <button
                onClick={fetchTaskDetails}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <button
          onClick={() => navigate('/tasks')}
          className="hover:text-blue-600"
        >
          Tasks
        </button>
        <span>/</span>
        <span className="text-gray-900">{task.title}</span>
      </div>

      {/* Task Header */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{task.title}</h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${priorityConfig[task.priority]?.color || priorityConfig.low.color}`}>
                {priorityConfig[task.priority]?.label || 'Low Priority'}
              </span>
            </div>
            {task.project && (
              <p className="text-gray-500">
                Project:{' '}
                <button
                  onClick={() => navigate(`/projects/${task.project.id}`)}
                  className="text-blue-600 hover:underline"
                >
                  {task.project.name}
                </button>
              </p>
            )}
          </div>

          <div className={`px-4 py-2 rounded-lg border font-medium ${statusConfig[task.status]?.color || statusConfig.todo.color}`}>
            <span className="mr-2">{statusConfig[task.status]?.icon}</span>
            {statusConfig[task.status]?.label || 'To Do'}
          </div>
        </div>

        {task.description && (
          <div className="prose max-w-none">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
            <p className="text-gray-600 whitespace-pre-wrap">{task.description}</p>
          </div>
        )}
      </div>

      {/* Task Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Assignment Info */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Assignment</h3>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                {task.assignee?.name?.charAt(0).toUpperCase() || '?'}
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {task.assignee?.name || 'Unassigned'}
                </p>
                <p className="text-sm text-gray-500">
                  {task.assignee?.email || 'No assignee'}
                </p>
              </div>
            </div>

            {task.creator && (
              <div className="pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-500">
                  Created by: <span className="text-gray-700">{task.creator.name}</span>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Dates & Status */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h3>
          
          <div className="space-y-4">
            {task.dueDate && (
              <div className={`p-3 rounded-lg ${isOverdue ? 'bg-red-50 border border-red-200' : 'bg-gray-50'}`}>
                <p className="text-sm font-medium text-gray-700">Due Date</p>
                <p className={`text-lg ${isOverdue ? 'text-red-600 font-semibold' : 'text-gray-900'}`}>
                  {isOverdue && '⚠️ '}
                  {new Date(task.dueDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
                {isOverdue && (
                  <p className="text-sm text-red-600 mt-1">This task is overdue!</p>
                )}
              </div>
            )}

            {task.createdAt && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-gray-700">Created</p>
                <p className="text-gray-900">
                  {new Date(task.createdAt).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status Update Section */}
      {canEditTask && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Status</h3>
          
          <div className="flex flex-wrap gap-3">
            {Object.entries(statusConfig).map(([key, config]) => (
              <button
                key={key}
                onClick={() => handleStatusChange(key)}
                disabled={isUpdating || task.status === key}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 font-medium transition-all ${
                  task.status === key
                    ? config.color
                    : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isUpdating && task.status !== key ? (
                  <Loader size="small" />
                ) : (
                  <span>{config.icon}</span>
                )}
                {config.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Back Button */}
      <div className="flex justify-start">
        <button
          onClick={() => navigate('/tasks')}
          className="px-4 py-2 text-gray-600 hover:text-gray-900 flex items-center gap-2"
        >
          ← Back to Tasks
        </button>
      </div>
    </div>
  );
};

export default TaskDetails;
