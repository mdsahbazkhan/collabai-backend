const express = require("express");
const {
  createProject,
  getUserProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addMember,
} = require("../controllers/projectController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/create", protect, createProject);
router.get("/myprojects", protect, getUserProjects);
router.get("/:id", protect, getProjectById);
router.put("/:id", protect, updateProject);
router.delete("/:id", protect, deleteProject);
router.post("/:id/members", protect, addMember);
module.exports = router;
