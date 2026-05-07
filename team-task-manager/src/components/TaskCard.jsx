import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const TaskCard = ({ task, onStatusChange, onDelete }) => {
  const { user, isAdmin } = useAuth();
  const statusColors = {
    'todo': { bg: '#f5f5f4', text: '#57534e' },
    'in-progress': { bg: '#cffafe', text: '#0891b2' },
    'done': { bg: '#d1fae5', text: '#059669' },
  };

  const priorityColors = {
    'low': { bg: '#f5f5f4', text: '#57534e' },
    'medium': { bg: '#fef3c7', text: '#d97706' },
    'high': { bg: '#fee2e2', text: '#dc2626' },
  };

  const statusLabels = {
    'todo': 'To Do',
    'in-progress': 'In Progress',
    'done': 'Done',
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';
  const canUpdateStatus = isAdmin || (task.assignee?._id === user?._id);
  const canDelete = isAdmin;

  return (
    <div className="bg-white border rounded-lg p-4 transition-all duration-200 hover:shadow-md" style={{ borderColor: '#e7e5e4' }}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <Link
          to={`/tasks/${task._id}`}
          className="text-sm font-semibold transition-colors hover:text-indigo-600 line-clamp-1 flex-1"
          style={{ color: '#1c1917' }}
        >
          {task.title}
        </Link>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span 
            className="px-2 py-1 rounded-full text-xs font-medium"
            style={{
              background: priorityColors[task.priority]?.bg || priorityColors.low.bg,
              color: priorityColors[task.priority]?.text || priorityColors.low.text,
            }}
          >
            {task.priority?.charAt(0).toUpperCase() + task.priority?.slice(1) || 'Low'}
          </span>
          {canDelete && onDelete && (
            <button
              onClick={() => onDelete(task)}
              className="text-red-500 hover:text-red-700 transition-colors"
              title="Delete task"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {task.description ? (
        <p className="text-sm mb-3 line-clamp-2" style={{ color: '#78716c' }}>{task.description}</p>
      ) : (
        <p className="text-sm mb-3 italic" style={{ color: '#a8a29e' }}>No description</p>
      )}

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div 
            className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium"
            style={{ background: '#e7e5e4', color: '#57534e' }}
          >
            {task.assignee?.name?.charAt(0).toUpperCase() || '?'}
          </div>
          <span className="text-sm" style={{ color: '#78716c' }}>
            {task.assignee?.name || 'Unassigned'}
          </span>
        </div>

        {task.dueDate && (
          <div className="flex items-center gap-1">
            {isOverdue && (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#dc2626' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <span 
              className="text-xs"
              style={{ color: isOverdue ? '#dc2626' : '#78716c', fontWeight: isOverdue ? 500 : 400 }}
            >
              {new Date(task.dueDate).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid #f5f5f4' }}>
        <span 
          className="px-2 py-1 rounded-full text-xs font-medium"
          style={{
            background: statusColors[task.status]?.bg || statusColors.todo.bg,
            color: statusColors[task.status]?.text || statusColors.todo.text,
          }}
        >
          {statusLabels[task.status] || 'To Do'}
        </span>

        {onStatusChange && (
          <select
            value={task.status}
            onChange={(e) => onStatusChange(task._id, e.target.value)}
            className="text-xs border rounded-md px-2 py-1 outline-none"
            style={{ borderColor: '#e7e5e4', color: '#57534e' }}
          >
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
