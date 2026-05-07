import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProjectCard = ({ project, onDelete }) => {
  const { isAdmin } = useAuth();

  return (
    <div className="bg-white border rounded-lg p-5 transition-all duration-200 hover:shadow-md" style={{ borderColor: '#e7e5e4' }}>
      <div className="flex items-start justify-between mb-3">
        <Link
          to={`/projects/${project.id}`}
          className="text-base font-semibold transition-colors hover:text-indigo-600"
          style={{ color: '#1c1917' }}
        >
          {project.name}
        </Link>
        {isAdmin && onDelete && (
          <button
            onClick={() => onDelete(project.id)}
            className="p-1 rounded transition-colors hover:bg-red-50"
            style={{ color: '#a8a29e' }}
            title="Delete project"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>

      {project.description ? (
        <p className="text-sm mb-4 line-clamp-2" style={{ color: '#78716c' }}>{project.description}</p>
      ) : (
        <p className="text-sm mb-4 italic" style={{ color: '#a8a29e' }}>No description</p>
      )}

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2" style={{ color: '#78716c' }}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <span>{project.members?.length || 0} members</span>
        </div>
        <div className="flex items-center gap-2" style={{ color: '#78716c' }}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          <span>{project.taskCount || 0} tasks</span>
        </div>
      </div>

      <div className="mt-4 pt-3" style={{ borderTop: '1px solid #f5f5f4' }}>
        <Link
          to={`/projects/${project.id}`}
          className="text-sm font-medium transition-colors hover:underline flex items-center gap-1"
          style={{ color: '#4f46e5' }}
        >
          View Details
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
};

export default ProjectCard;
