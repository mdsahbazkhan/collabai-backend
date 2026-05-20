const Project = require("../models/projectModel");
const Task = require("../models/taskModel");

const buildProjectContext = async (projectId) => {
  try {
    const project = await Project.findById(projectId)
      .select("name description")
      .lean();
    if (!project) {
      throw new Error("Project not found");
    }

    const tasks = await Task.find({ project: projectId })
      .select("title description status")
      .lean();
    if (!tasks) {
      throw new Error("Tasks not found");
    }

    return {
      project,
      tasks,
    };
  } catch (error) {
    console.error("Error building project context:", error);
    throw error;
  }
};
module.exports = { buildProjectContext };
