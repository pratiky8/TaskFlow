import Project from '../models/Project.js';
import Task from '../models/Task.js';
import User from '../models/User.js';

// @desc    Create new project
// @route   POST /api/projects
// @access  Private (Admin only)
export const createProject = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Project name is required' });
    }

    const project = await Project.create({
      name,
      description,
      createdBy: req.user._id,
      members: [req.user._id], // Creator is first member
    });

    const populatedProject = await Project.findById(project._id)
      .populate('createdBy', 'name email')
      .populate('members', 'name email');

    res.status(201).json({ ...populatedProject.toObject(), id: populatedProject._id });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all projects for user
// @route   GET /api/projects
// @access  Private
export const getProjects = async (req, res) => {
  try {
    // Find projects where user is creator or member
    const projects = await Project.find({
      $or: [
        { createdBy: req.user._id },
        { members: req.user._id },
      ],
    })
      .populate('createdBy', 'name email')
      .populate('members', 'name email')
      .sort({ createdAt: -1 });

    // Add task count for each project
    const projectsWithTaskCount = await Promise.all(
      projects.map(async (project) => {
        const taskCount = await Task.countDocuments({ project: project._id });
        return { ...project.toObject(), id: project._id, taskCount };
      })
    );

    res.json(projectsWithTaskCount);
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single project by ID
// @route   GET /api/projects/:id
// @access  Private
export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('members', 'name email');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user has access
    const isMember = project.members.some(
      (member) => member._id.toString() === req.user._id.toString()
    );

    if (!isMember && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json({ ...project.toObject(), id: project._id });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add member to project
// @route   POST /api/projects/:id/members
// @access  Private (Admin only)
export const addMember = async (req, res) => {
  try {
    const { userId, email } = req.body;
    const projectId = req.params.id;

    // Support both email and userId
    const userEmail = email || userId;

    if (!userEmail) {
      return res.status(400).json({ message: 'User email is required' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Find user by email
    const user = await User.findOne({ email: userEmail.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'User not found with this email' });
    }

    // Check if user is already a member
    if (project.members.includes(user._id)) {
      return res.status(400).json({ message: 'User is already a member' });
    }

    // Add member
    project.members.push(user._id);
    await project.save();

    const updatedProject = await Project.findById(projectId)
      .populate('createdBy', 'name email')
      .populate('members', 'name email');

    res.json({ ...updatedProject.toObject(), id: updatedProject._id });
  } catch (error) {
    console.error('Add member error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Remove member from project
// @route   DELETE /api/projects/:id/members
// @access  Private (Admin only)
export const removeMember = async (req, res) => {
  try {
    const { userId } = req.body;
    const projectId = req.params.id;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Remove member
    project.members = project.members.filter(
      (member) => member.toString() !== userId
    );
    await project.save();

    const updatedProject = await Project.findById(projectId)
      .populate('createdBy', 'name email')
      .populate('members', 'name email');

    res.json({ ...updatedProject.toObject(), id: updatedProject._id });
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private (Admin only)
export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Count associated tasks before deletion
    const taskCount = await Task.countDocuments({ project: req.params.id });

    // Delete associated tasks
    await Task.deleteMany({ project: req.params.id });

    // Delete project
    await Project.deleteOne({ _id: req.params.id });

    res.json({ 
      message: `Project "${project.name}" deleted successfully${taskCount > 0 ? ` along with ${taskCount} associated task${taskCount > 1 ? 's' : ''}` : ''}` 
    });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
