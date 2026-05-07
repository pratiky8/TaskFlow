import Task from '../models/Task.js';
import Project from '../models/Project.js';

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private
export const createTask = async (req, res) => {
  try {
    const { title, description, projectId, assigneeId, assignedTo, priority, dueDate } = req.body;

    if (!title || !projectId) {
      return res.status(400).json({ message: 'Title and project are required' });
    }

    // Check if project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user has access to project
    const isMember = project.members.some(
      (member) => member.toString() === req.user._id.toString()
    );

    if (!isMember && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const task = await Task.create({
      title,
      description,
      project: projectId,
      assignedTo: assigneeId || assignedTo || req.user._id,
      createdBy: req.user._id,
      priority: priority || 'medium',
      dueDate,
    });

    const populatedTask = await Task.findById(task._id)
      .populate('project', 'name')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    const transformedTask = {
      ...populatedTask.toObject(),
      assigneeId: populatedTask.assignedTo?._id,
      assignee: populatedTask.assignedTo,
      creator: populatedTask.createdBy,
      projectId: populatedTask.project._id,
      project: {
        id: populatedTask.project._id,
        name: populatedTask.project.name
      }
    };

    res.status(201).json(transformedTask);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all tasks for user
// @route   GET /api/tasks
// @access  Private
export const getTasks = async (req, res) => {
  try {
    const { projectId, status, assignedTo, page = 1, limit = 50 } = req.query;

    // Build filter
    let filter = {};

    if (projectId) {
      filter.project = projectId;
    }

    if (status) {
      filter.status = status;
    }

    if (assignedTo) {
      filter.assignedTo = assignedTo;
    }

    // If not admin, only show tasks from projects user is member of
    if (req.user.role !== 'admin') {
      const userProjects = await Project.find({
        $or: [
          { createdBy: req.user._id },
          { members: req.user._id },
        ],
      }).select('_id');

      const projectIds = userProjects.map((p) => p._id);
      filter.project = { $in: projectIds };
    }

    const tasks = await Task.find(filter)
      .populate('project', 'name')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Transform tasks to match frontend expectations
    const transformedTasks = tasks.map(task => ({
      ...task.toObject(),
      assigneeId: task.assignedTo?._id,
      assignee: task.assignedTo,
      creator: task.createdBy,
      projectId: task.project._id,
      project: {
        id: task.project._id,
        name: task.project.name
      }
    }));

    res.json(transformedTasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single task by ID
// @route   GET /api/tasks/:id
// @access  Private
export const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('project', 'name')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user has access to the task's project
    const project = await Project.findById(task.project._id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const isMember = project.members.some(
      (member) => member.toString() === req.user._id.toString()
    );

    if (!isMember && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to access this task' });
    }

    // Transform the data to match frontend expectations
    const transformedTask = {
      ...task.toObject(),
      assigneeId: task.assignedTo?._id,
      assignee: task.assignedTo,
      creator: task.createdBy,
      projectId: task.project._id,
      project: {
        id: task.project._id,
        name: task.project.name
      }
    };

    res.json(transformedTask);
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
export const updateTask = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, assignedTo } = req.body;

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check authorization - admin or assigned user can update
    const canUpdate =
      req.user.role === 'admin' ||
      task.assignedTo?.toString() === req.user._id.toString();

    if (!canUpdate) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Update fields
    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (status) task.status = status;
    if (priority) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (assignedTo) task.assignedTo = assignedTo;

    await task.save();

    const updatedTask = await Task.findById(req.params.id)
      .populate('project', 'name')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    const transformedTask = {
      ...updatedTask.toObject(),
      assigneeId: updatedTask.assignedTo?._id,
      assignee: updatedTask.assignedTo,
      creator: updatedTask.createdBy,
      projectId: updatedTask.project._id,
      project: {
        id: updatedTask.project._id,
        name: updatedTask.project.name
      }
    };

    res.json(transformedTask);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private (Admin only)
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await Task.deleteOne({ _id: req.params.id });

    res.json({ message: 'Task deleted' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get overdue tasks
// @route   GET /api/tasks/overdue
// @access  Private
export const getOverdueTasks = async (req, res) => {
  try {
    const now = new Date();

    const tasks = await Task.find({
      dueDate: { $lt: now },
      status: { $ne: 'done' },
    })
      .populate('project', 'name')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort({ dueDate: 1 });

    // Transform tasks to match frontend expectations
    const transformedTasks = tasks.map(task => ({
      ...task.toObject(),
      assigneeId: task.assignedTo?._id,
      assignee: task.assignedTo,
      creator: task.createdBy,
      projectId: task.project._id,
      project: {
        id: task.project._id,
        name: task.project.name
      }
    }));

    res.json(transformedTasks);
  } catch (error) {
    console.error('Get overdue tasks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
