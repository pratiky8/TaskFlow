import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { tasksAPI } from '../services/api';
import Loader from '../components/Loader';
import { StatsCardSkeleton, TaskCardSkeleton } from '../components/SkeletonLoader';

const Dashboard = () => {
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    overdue: 0,
    inProgress: 0,
  });
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('week');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await tasksAPI.getAll();
      const tasks = response.data || [];

      const now = new Date();
      const completed = tasks.filter(t => t.status === 'done').length;
      const pending = tasks.filter(t => t.status === 'todo').length;
      const inProgress = tasks.filter(t => t.status === 'in-progress').length;
      const overdue = tasks.filter(t => {
        if (t.status === 'done') return false;
        return t.dueDate && new Date(t.dueDate) < now;
      }).length;

      setStats({
        total: tasks.length,
        completed,
        pending,
        inProgress,
        overdue,
      });

      // Get 6 most recent tasks
      const sorted = tasks
        .sort((a, b) => new Date(b.createdAt || b.id) - new Date(a.createdAt || a.id))
        .slice(0, 6);
      setRecentTasks(sorted);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { 
      label: 'Total Tasks', 
      value: stats.total, 
      color: '#4f46e5',
      bgColor: '#e0e7ff',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      )
    },
    { 
      label: 'Completed', 
      value: stats.completed, 
      color: '#059669',
      bgColor: '#d1fae5',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    { 
      label: 'In Progress', 
      value: stats.inProgress, 
      color: '#0891b2',
      bgColor: '#cffafe',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    },
    { 
      label: 'Overdue', 
      value: stats.overdue, 
      color: '#dc2626',
      bgColor: '#fee2e2',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
  ];

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  if (loading) {
    return (
      <div className="p-6 lg:p-8 space-y-8">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="h-8 bg-gray-200 rounded w-32 mb-2 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-48 animate-pulse" />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 bg-gray-200 rounded w-32 animate-pulse" />
            <div className="h-10 bg-gray-200 rounded w-24 animate-pulse" />
          </div>
        </div>

        {/* Stats Skeleton */}
        <StatsCardSkeleton />

        {/* Recent Tasks Skeleton */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="h-6 bg-gray-200 rounded w-24 animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
            </div>
          </div>
          <div className="p-6">
            <TaskCardSkeleton count={3} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-gray-500">Here's what's happening with your projects</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
          <Link
            to="/tasks"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-all shadow-sm hover:shadow-md"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Task
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-lg text-sm bg-red-50 text-red-700 border border-red-200">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="bg-white border border-gray-200 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:border-gray-300 group"
          >
            <div className="flex items-center justify-between mb-4">
              <div 
                className="inline-flex items-center justify-center w-12 h-12 rounded-xl transition-transform group-hover:scale-110"
                style={{ background: stat.bgColor, color: stat.color }}
              >
                {stat.icon}
              </div>
              <span className="text-sm font-medium text-gray-500">{stat.label}</span>
            </div>
            
            <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            
            {stat.label === 'Completed' && (
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-500">Completion rate</span>
                  <span className="font-semibold text-green-600">{completionRate}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full transition-all duration-500 bg-green-500"
                    style={{ width: `${completionRate}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Recent Tasks */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Tasks</h2>
            <Link to="/tasks" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
              View all
            </Link>
          </div>
        </div>
        <div className="p-6">
          {recentTasks.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gray-50 flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-gray-500">No tasks yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentTasks.map((task) => (
                <div key={task.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    task.status === 'done' ? 'bg-green-500' :
                    task.status === 'in-progress' ? 'bg-blue-500' :
                    task.priority === 'high' ? 'bg-red-500' : 'bg-gray-300'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
                    <p className="text-xs text-gray-500">{task.project?.name || 'No project'}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    task.status === 'done' ? 'bg-green-100 text-green-700' :
                    task.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {task.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
