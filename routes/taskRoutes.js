const express = require("express");
const {
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
} = require("../controllers/taskController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/create", protect, createTask);
router.get("/project/:projectId", protect, getTaskByProject);
router.get("/all", protect, getAllTasks);
router.get("/recent", protect, getRecentTasks);
router.get("/user/:userId", protect, getTasksByUser);
router.get("/user/:userId/count", protect, getTasksCountByUser);
router.put("/:id", protect, updateTask);
router.delete("/:id", protect, deleteTask);
router.post("/:id/comments", protect, addComment);
router.get("/:id", protect, getTaskById);
router.patch("/:id/status", protect, updateTaskStatus);
module.exports = router;
