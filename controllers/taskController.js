const Task = require("../models/taskModel");
const Project = require("../models/projectModel");

const createTask = async (req, res) => {
  try {
    const { title, description, project, assignedTo, priority, dueDate, tags } =
      req.body;
    const userId = req.user._id;
    if (!title || !project) {
      return res
        .status(400)
        .json({ message: "Title and Project name can't be empty" });
    }
    const projectExists = await Project.findById(project);
    if (!projectExists) {
      return res.status(404).json({ message: " Project not found" });
    }
    const isOwner = projectExists.owner.toString() === userId.toString();
    const isMember = projectExists.members.some(
      (member) => member.user.toString() === userId.toString(),
    );
    if (!isOwner && !isMember) {
      return res.status(403).json({ message: "You are not authorized" });
    }
    const task = new Task({
      title,
      description,
      project,
      createdBy: userId,
      assignedTo,
      priority,
      dueDate,
      tags,
      status: "todo",
    });
    await task.save();

    return res.status(201).json({ message: "Task created successfully", task });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getTaskByProject = async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const userId = req.user._id;
    const projectExists = await Project.findById(projectId);
    if (!projectExists) {
      return res.status(404).json({ message: "Project not found" });
    }
    const isOwner = projectExists.owner.toString() === userId.toString();
    const isMember = projectExists.members.some(
      (member) => member.user.toString() === userId.toString(),
    );
    if (!isOwner && !isMember) {
      return res.status(403).json({ message: "You are not authorized" });
    }
    const task = await Task.find({ project: projectId })
      .sort({ createdAt: -1 })
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email");

    return res.status(200).json({ tasks: task });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
const getAllTasks = async (req, res) => {
  try {
    const userId = req.user._id;

    // get projects where user is owner or member
    const projects = await Project.find({
      $or: [{ owner: userId }, { "members.user": userId }],
    });

    const projectIds = projects.map((p) => p._id);

    const tasks = await Task.find({
      project: { $in: projectIds },
    })
      .sort({ createdAt: -1 })
      .populate("assignedTo", "name email")
      .populate("project", "name");

    res.status(200).json({ tasks });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const updateTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    const userId = req.user._id;
    const {
      title,
      description,
      project,
      assignedTo,
      priority,
      dueDate,
      tags,
      status,
    } = req.body;
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    const projectExists = await Project.findById(task.project);
    const isOwner = projectExists.owner.toString() === userId.toString();
    const isMember = projectExists.members.some(
      (member) => member.user.toString() === userId.toString(),
    );
    if (!isOwner && !isMember) {
      return res.status(403).json({ message: "You are not authorized" });
    }
    if (title) task.title = title;
    if (description) task.description = description;
    if (project) task.project = project;
    if (assignedTo) task.assignedTo = assignedTo;
    if (priority) task.priority = priority;
    if (dueDate) task.dueDate = dueDate;
    if (tags) task.tags = tags;
    if (status) task.status = status;
    await task.save();

    return res.status(200).json({ message: "Task updated successfully", task });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const deleteTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    const userId = req.user._id;
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    const projectExists = await Project.findById(task.project);
    if (!projectExists) {
      return res.status(404).json({ message: "Project not found" });
    }
    const isOwner = projectExists.owner.toString() === userId.toString();
    const isTaskCreator = task.createdBy.toString() === userId.toString();
    if (!isOwner && !isTaskCreator) {
      return res.status(403).json({ message: "You are not authorized" });
    }
    await task.deleteOne();

    return res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
const addComment = async (req, res) => {
  try {
    const taskId = req.params.id;
    const userId = req.user._id;
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ message: "Comment can't be empty" });
    }
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    const projectExists = await Project.findById(task.project);
    if (!projectExists) {
      return res.status(404).json({ message: "Project not found" });
    }
    const isMember = projectExists.members.some(
      (member) => member.user.toString() === userId.toString(),
    );
    const isOwner = projectExists.owner.toString() === userId.toString();
    if (!isOwner && !isMember) {
      return res
        .status(403)
        .json({ message: "You are not authorized to comment on this task" });
    }

    task.comments.push({ user: userId, text });

    await task.save();

    return res
      .status(200)
      .json({ message: "Comment added successfully", task });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getTaskById = async (req, res) => {
  try {
    const taskId = req.params.id;
    const userId = req.user._id;
    const task = await Task.findById(taskId)
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email")
      .populate("comments.user", "name email");
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    const projectExists = await Project.findById(task.project);
    if (!projectExists) {
      return res.status(404).json({ message: "Project not found" });
    }
    const isOwner = projectExists.owner.toString() === userId.toString();
    const isMember = projectExists.members.some(
      (member) => member.user.toString() === userId.toString(),
    );
    if (!isOwner && !isMember) {
      return res.status(403).json({ message: "You are not authorized" });
    }

    return res.status(200).json({ task });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
const updateTaskStatus = async (req, res) => {
  try {
    const userId = req.user._id;
    const taskId = req.params.id;
    const { status } = req.body;
    const validStatus = ["todo", "inProgress", "review", "completed"];

    if (!validStatus.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    const projectExists = await Project.findById(task.project);
    if (!projectExists) {
      return res.status(404).json({ message: "Project not found" });
    }
    const isOwner = projectExists.owner.toString() === userId.toString();
    const isMember = projectExists.members.some(
      (member) => member.user.toString() === userId.toString(),
    );
    if (!isOwner && !isMember) {
      return res.status(403).json({ message: "You are not authorized" });
    }
    task.status = status;
    await task.save();
    return res
      .status(200)
      .json({ message: "Task status updated successfully", task });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getRecentTasks = async (req, res) => {
  try {
    const userId = req.user._id;

    const projects = await Project.find({
      $or: [{ owner: userId }, { "members.user": userId }],
    });

    const projectIds = projects.map((p) => p._id);

    const tasks = await Task.find({
      project: { $in: projectIds },
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("assignedTo", "name email avatar")
      .populate("project", "name");

    res.status(200).json({ tasks });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getTasksByUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const currentUserId = req.user._id;

    const tasks = await Task.find({
      assignedTo: userId,
    })
      .sort({ createdAt: -1 })
      .populate("project", "name")
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email");

    res.status(200).json({ tasks });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTasksCountByUser = async (req, res) => {
  try {
    const userId = req.params.userId;

    const taskCount = await Task.countDocuments({
      assignedTo: userId,
    });

    res.status(200).json({ taskCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createTask,
  getTaskByProject,
  getAllTasks,
  getRecentTasks,
  updateTask,
  deleteTask,
  addComment,
  getTaskById,
  updateTaskStatus,
  getTasksByUser,
  getTasksCountByUser,
};
