const Project = require("../models/projectModel");
const Task = require("../models/taskModel");
const User = require("../models/userModel");
const Activity = require("../models/activityModel");

const createProject = async (req, res) => {
  try {
    const { name, description, startDate, endDate, color } = req.body;

    const userId = req.user._id;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Project name is required" });
    }
    const existingProject = await Project.findOne({
      name: name.trim(),
      owner: userId,
    });

    if (existingProject) {
      return res.status(400).json({ message: "Project already exists" });
    }

    const project = await Project.create({
      name: name.trim(),
      description,
      startDate,
      endDate,
      color,
      status: "active",
      members: [
        {
          user: userId,
          role: "owner",
        },
      ],
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

const getUserProjects = async (req, res) => {
  try {
    const userId = req.user._id;

    const projects = await Project.find({
      $or: [{ owner: userId }, { "members.user": userId }],
    })
      .populate("members.user", "name email")
      .populate("owner", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Fetch all Projects",
      projects,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getProjectById = async (req, res) => {
  try {
    const projectId = req.params.id;
    const userId = req.user._id;

    const project = await Project.findById(projectId)
      .populate("owner", "name email")
      .populate("members.user", "name email");

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const isOwner = project.owner._id.toString() === userId.toString();

    // ✅ find member properly
    const member = project.members.find(
      (m) => m.user._id.toString() === userId.toString(),
    );

    const isMember = !!member;

    if (!isOwner && !isMember) {
      return res.status(403).json({
        message: "You are not authorized to access this project",
      });
    }

    return res.status(200).json({
      message: "Project fetched successfully",
      project,
      role: isOwner ? "owner" : member.role, // ✅ now safe
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

    // 🔥 find member
    const member = project.members.find(
      (m) => m.user.toString() === userId.toString(),
    );

    const isOwner = project.owner.toString() === userId.toString();

    if (!member && !isOwner) {
      return res.status(403).json({ message: "Access denied" });
    }

    // 🔥 RBAC check
    if (!isOwner && member.role !== "admin") {
      return res.status(403).json({
        message: "Only owner/admin can update project",
      });
    }

    // ✅ update fields
    if (name) project.name = name;
    if (description) project.description = description;
    if (startDate) project.startDate = startDate;
    if (endDate) project.endDate = endDate;
    if (status) project.status = status;
    if (color) project.color = color;

    const updatedProject = await project.save();

    return res.status(200).json({
      message: "Project updated successfully",
      project: updatedProject,
    });
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
      return res.status(403).json({
        message: "Only owner can delete project",
      });
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
    const { userId, role } = req.body;

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // 🔥 find current user role
    const currentUser = project.members.find(
      (m) => m.user.toString() === req.user._id.toString(),
    );

    if (!currentUser || !["owner", "admin"].includes(currentUser.role)) {
      return res.status(403).json({
        message: "Only owner/admin can add members",
      });
    }

    // 🔥 check already member
    const alreadyMember = project.members.find(
      (m) => m.user.toString() === userId.toString(),
    );

    if (alreadyMember) {
      return res.status(400).json({
        message: "User already a member",
      });
    }

    // ✅ push with role
    project.members.push({
      user: userId,
      role: role || "member",
    });

    await project.save();

    return res.status(200).json({
      message: "Member added successfully",
      project,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
const removeMember = async (req, res) => {
  try {
    const projectId = req.params.projectId || req.params.id;
    const userId = req.params.userId;
    const currentUserId = req.user._id;
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });
    // Find Currentuser
    const currentUser = project.members.find(
      (m) => m.user.toString() === currentUserId.toString(),
    );
    const isOwner = project.owner.toString() === currentUserId.toString();
    if (!isOwner) {
      return res.status(403).json({ message: "Only owner can remove members" });
    }
    // Target Remove Member
    const targetMember = project.members.find(
      (m) => m.user.toString() === userId.toString(),
    );
    if (!targetMember)
      return res.status(404).json({ message: "Member not found" });
    // Cannot Remove owner
    if (targetMember.role === "owner")
      return res.status(400).json({ message: "Cannot remove project owner" });
    // Unassign tasks assigned to this member in the project
    const Task = require("../models/taskModel");
    await Task.updateMany(
      { project: projectId, assignedTo: userId },
      { $unset: { assignedTo: 1 } },
    );
    // Remove Member
    project.members = project.members.filter(
      (m) => m.user.toString() !== userId.toString(),
    );
    await project.save();

    return res.status(200).json({
      message: "Member removed successfully",
      project,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const deleteMemberFromDB = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    const userToDelete = await User.findById(userId);
    if (!userToDelete) {
      return res.status(404).json({ message: "User not found" });
    }

    const projects = await Project.find({
      $or: [
        { owner: currentUserId },
        {
          "members.user": currentUserId,
          "members.role": { $in: ["owner", "admin"] },
        },
      ],
    });

    const userProjectRoles = [];
    for (const project of projects) {
      const member = project.members.find(
        (m) => m.user.toString() === userId.toString(),
      );
      if (member) {
        userProjectRoles.push({
          projectId: project._id,
          projectName: project.name,
          role: member.role,
        });

        await Task.updateMany(
          { project: project._id, assignedTo: userId },
          { $unset: { assignedTo: 1 } },
        );

        project.members = project.members.filter(
          (m) => m.user.toString() !== userId.toString(),
        );
        await project.save();
      }
    }

    await Activity.create({
      user: currentUserId,
      action: "member_deleted",
      description: `Deleted user ${userToDelete.name} from system`,
      targetUser: userId,
      targetUserName: userToDelete.name,
      metadata: {
        deletedFromProjects: userProjectRoles,
        deletedUserEmail: userToDelete.email,
      },
    });

    return res.status(200).json({
      message: "Member deleted from database successfully",
      deletedFromProjects: userProjectRoles,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getProjectsCountByUser = async (req, res) => {
  try {
    const userId = req.params.userId;

    const projectCount = await Project.countDocuments({
      $or: [{ owner: userId }, { "members.user": userId }],
    });

    res.status(200).json({ projectCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const changeMemberRole = async (req, res) => {
  try {
    const projectId = req.params.projectId || req.params.id;
    const memberId = req.params.userId || req.params.memberId;
    const { role } = req.body;
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const member = project.members.find((m) => m.user.toString() === memberId);
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    // Only owner can change roles
    const currentUser = project.members.find(
      (m) => m.user.toString() === req.user._id.toString(),
    );
    if (!currentUser || currentUser.role !== "owner") {
      return res.status(403).json({
        message: "Only project owner can change member roles",
      });
    }

    // Cannot change role of owner
    if (member.role === "owner") {
      return res
        .status(400)
        .json({ message: "Cannot change the role of project owner" });
    }

    member.role = role;
    await project.save();

    return res.status(200).json({
      message: "Member role updated successfully",
      project,
    });
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
  removeMember,
  deleteMemberFromDB,
  getProjectsCountByUser,
  changeMemberRole,
};
