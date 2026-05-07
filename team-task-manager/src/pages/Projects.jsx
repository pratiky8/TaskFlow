import React, { useState, useEffect } from 'react';
import Loader from '../components/Loader';
import ProjectCard from '../components/ProjectCard';
import { projectsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ProjectCardSkeleton, FormSkeleton } from '../components/SkeletonLoader';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '' });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { isAdmin } = useAuth();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await projectsAPI.getAll();
      setProjects(response.data || []);
      setError(null);
    } catch (err) {
      setError('Failed to load projects');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Filter projects based on search query
  const filteredProjects = projects.filter(project => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      project.name?.toLowerCase().includes(query) ||
      project.description?.toLowerCase().includes(query)
    );
  });

  const handleDelete = async (projectId) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    
    if (!window.confirm(`Are you sure you want to delete "${project.name}"? This will also delete all tasks associated with this project.`)) return;
    
    try {
      const response = await projectsAPI.delete(projectId);
      setProjects(projects.filter(p => p.id !== projectId));
      alert(response.data.message || 'Project deleted successfully');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete project');
      console.error(err);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!newProject.name.trim()) {
      errors.name = 'Project name is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      const response = await projectsAPI.create(newProject);
      setProjects([...projects, response.data]);
      setNewProject({ name: '', description: '' });
      setIsModalOpen(false);
    } catch (err) {
      setFormErrors({ submit: err.response?.data?.message || 'Failed to create project' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8 space-y-8">
        {/* Header Skeleton */}
        <div className="flex flex-col gap-4">
          <div>
            <div className="h-8 bg-gray-200 rounded w-24 mb-2 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-40 animate-pulse" />
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 max-w-md">
              <div className="h-10 bg-gray-200 rounded-lg animate-pulse" />
            </div>
            <div className="h-10 bg-gray-200 rounded w-32 animate-pulse" />
          </div>
        </div>

        {/* Projects Grid Skeleton */}
        <ProjectCardSkeleton count={6} />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          <p className="mt-1 text-gray-500">Manage your team projects</p>
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
                placeholder="Search projects..."
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
              New Project
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-lg text-sm bg-red-50 text-red-700 border border-red-200">
          {error}
        </div>
      )}

      {filteredProjects.length === 0 && projects.length > 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-50 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No projects found</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Try adjusting your search terms
          </p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-indigo-50 flex items-center justify-center">
            <svg className="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No projects yet</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            {isAdmin 
              ? 'Create your first project to get started' 
              : 'No projects available. Contact an admin to be added to a project.'}
          </p>
          {isAdmin && (
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader size="small" variant="spinner" />
                  Creating...
                </>
              ) : (
                'Create Project'
              )}
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onDelete={isAdmin ? handleDelete : null}
            />
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Create New Project</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="p-6 space-y-5">
              {formErrors.submit && (
                <div className="p-3 rounded-lg text-sm bg-red-50 text-red-700 border border-red-200">
                  {formErrors.submit}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  className={`w-full px-4 py-2.5 border rounded-lg outline-none transition-all ${
                    formErrors.name 
                      ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-100' 
                      : 'border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
                  }`}
                  placeholder="Enter project name"
                />
                {formErrors.name && (
                  <p className="mt-1.5 text-sm text-red-600">{formErrors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg outline-none resize-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                  placeholder="Enter project description (optional)"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader size="small" variant="spinner" />
                      Creating...
                    </>
                  ) : (
                    'Create Project'
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

export default Projects;
