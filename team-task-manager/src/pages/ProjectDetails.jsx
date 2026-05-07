import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectsAPI, tasksAPI, authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import TaskCard from '../components/TaskCard';
import Loader from '../components/Loader';
import EmailAutocomplete from '../components/EmailAutocomplete';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [isAddingMember, setIsAddingMember] = useState(false);

  useEffect(() => {
    fetchProjectDetails();
  }, [id]);

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      const [projectRes, tasksRes] = await Promise.all([
        projectsAPI.getById(id),
        tasksAPI.getAll({ projectId: id }),
      ]);
      setProject(projectRes.data);
      setTasks(tasksRes.data || []);
      setError(null);
    } catch (err) {
      setError('Failed to load project details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!newMemberEmail.trim()) return;

    setIsAddingMember(true);
    try {
      const response = await projectsAPI.addMember(id, newMemberEmail);
      setProject(response.data);
      setNewMemberEmail('');
    } catch (err) {
      console.error('Add member error:', err);
      alert(err.response?.data?.message || 'Failed to add member');
    } finally {
      setIsAddingMember(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Remove this member from the project?')) return;

    try {
      const response = await projectsAPI.removeMember(id, userId);
      setProject(response.data);
    } catch (err) {
      alert('Failed to remove member');
      console.error(err);
    }
  };

  const handleTaskStatusChange = async (taskId, newStatus) => {
    try {
      await tasksAPI.update(taskId, { status: newStatus });
      setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    } catch (err) {
      alert('Failed to update task status');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader size="large" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600 mb-4">{error || 'Project not found'}</p>
        <button
          onClick={() => navigate('/projects')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Back to Projects
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <button
          onClick={() => navigate('/projects')}
          className="hover:text-blue-600"
        >
          Projects
        </button>
        <span>/</span>
        <span className="text-gray-900">{project.name}</span>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
        {project.description && (
          <p className="text-gray-500 mt-1">{project.description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Members Section */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
            <div className="p-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                Members ({project.members?.length || 0})
              </h2>
            </div>

            {isAdmin && (
              <form onSubmit={handleAddMember} className="p-4 border-b border-gray-100">
                <div className="flex gap-2">
                  <EmailAutocomplete
                    value={newMemberEmail}
                    onChange={setNewMemberEmail}
                    placeholder="Enter email to add"
                    disabled={isAddingMember}
                    className="flex-1"
                  />
                  <button
                    type="submit"
                    disabled={isAddingMember || !newMemberEmail.trim()}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isAddingMember ? '...' : 'Add'}
                  </button>
                </div>
              </form>
            )}

            <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
              {project.members?.map((member) => (
                <div
                  key={member.id}
                  className="p-4 flex items-center justify-between hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
                      {member.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{member.name}</p>
                      <p className="text-sm text-gray-500">{member.email}</p>
                    </div>
                  </div>
                  {isAdmin && member.id !== project.ownerId && (
                    <button
                      onClick={() => handleRemoveMember(member.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      title="Remove member"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              ))}

              {(!project.members || project.members.length === 0) && (
                <div className="p-8 text-center text-gray-500">
                  No members yet
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tasks Section */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Project Tasks ({tasks.length})
              </h2>
              <a
                href="/tasks"
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                View All Tasks →
              </a>
            </div>

            {tasks.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-500 mb-4">No tasks in this project</p>
                <a
                  href="/tasks"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-block"
                >
                  Create Task
                </a>
              </div>
            ) : (
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {tasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onStatusChange={handleTaskStatusChange}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;
