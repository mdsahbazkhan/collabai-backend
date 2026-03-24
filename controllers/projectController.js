const Project = require("../models/projectModel");

const createProject = async (req, res) => {
  try {
    const { name, description, startDate, endDate, color } = req.body;

    const userId = req.user._id;
    const existingProject = await Project.findOne({
      name: name.trim(),
      owner: userId,
    });

    if (existingProject) {
      return res.status(400).json({ message: "Project already exists" });
    }
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Project name is required" });
    }

    const project = await Project.create({
      name,
      description,
      startDate,
      endDate,
      color,
      status: "active",
      members: [userId],
      owner: userId,
    });

    return res
      .status(201)
      .json({ message: "Project created successfully", project });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: error.message });
  }
};

// const getUserProjects = async (req, res) => {
//   try {
//     const userId = req.user._id;
//     const projects = await Project.find({
//       $or: [{ owner: userId }, { members: userId }],
//     }).sort({ createdAt: -1 });
//     return res.status(200).json({ message: "Fetch all Projects ", projects });
//   } catch (error) {
//     return res.status(500).json({ message: error.message });
//   }
// };
const getUserProjects = async (req, res) => {
  try {
    const userId = req.user._id;
    const projects = await Project.find({
      $or: [{ owner: userId }, { members: userId }],
    })
      .populate("members", "name")
      .populate("owner", "name") // Add this line to populate member names
      .sort({ createdAt: -1 });
    return res.status(200).json({ message: "Fetch all Projects ", projects });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// const getProjectById = async (req, res) => {
//   try {
//     const projectId = req.params.id;
//     const userId = req.user._id;
//     const project = await Project.findById(projectId)
//     if (!project) {
//       return res.status(404).json({ message: "Project not found" });
//     }
//     const isOwner = project.owner.toString() === userId.toString();
//     const isMember = project.members.includes(userId);
//     if (!isOwner && !isMember) {
//       return res
//         .status(401)
//         .json({ message: "You are not authorized to access this project" });
//     }

//     return res
//       .status(200)
//       .json({ message: "Project fetched successfully", project });
//   } catch (error) {
//     return res.status(500).json({ message: error.message });
//   }
// };
const getProjectById = async (req, res) => {
  try {
    const projectId = req.params.id;
    const userId = req.user._id;

    const project = await Project.findById(projectId)
      .populate("owner", "name ")
      .populate("members", "name ");

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const isOwner = project.owner._id.toString() === userId.toString();
    const isMember = project.members.some(
      (member) => member._id.toString() === userId.toString(),
    );

    if (!isOwner && !isMember) {
      return res
        .status(401)
        .json({ message: "You are not authorized to access this project" });
    }

    return res.status(200).json({
      message: "Project fetched successfully",
      project,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
const updateProject = async (req, res) => {
  try {
    const projectId = req.params.id;
    const userId = req.user._id;
    const { name, description, startDate, endDate, status, color } = req.body;
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    if (project.owner.toString() !== userId.toString()) {
      return res
        .status(401)
        .json({ message: "You are not authorized to update this project" });
    }
    if (name) project.name = name;
    if (description) project.description = description;
    if (startDate) project.startDate = startDate;
    if (endDate) project.endDate = endDate;
    if (status) project.status = status;
    if (color) project.color = color;
    const updatedProject = await project.save();

    return res
      .status(200)
      .json({ message: "Project updated successfully", updatedProject });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
const deleteProject = async (req, res) => {
  try {
    const projectId = req.params.id;
    const userId = req.user._id;
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    if (project.owner.toString() !== userId.toString()) {
      return res
        .status(401)
        .json({ message: "You are not authorized to delete this project" });
    }
    await Project.findByIdAndDelete(projectId);
    return res.status(200).json({ message: "Project deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
const addMember = async (req, res) => {
  try {
    const projectId = req.params.id;
    const { userId } = req.body;
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Only owner can add member" });
    }
    if (
      project.members.some((member) => member.toString() === userId.toString())
    ) {
      return res
        .status(400)
        .json({ message: "User is already member of project" });
    }
    project.members.push(userId);
    await project.save();

    return res
      .status(200)
      .json({ message: "Member added successfully", project });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
module.exports = {
  createProject,
  getUserProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addMember,
};
