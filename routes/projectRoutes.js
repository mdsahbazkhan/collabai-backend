const express = require("express");
const {
  createProject,
  getUserProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
  deleteMemberFromDB,
  getProjectsCountByUser,
} = require("../controllers/projectController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/create", protect, createProject);
router.get("/myprojects", protect, getUserProjects);
router.get("/:id", protect, getProjectById);
router.put("/:id", protect, updateProject);
router.delete("/:id", protect, deleteProject);
router.post("/:id/members", protect, addMember);
router.delete("/:projectId/members/:userId", protect, removeMember);
router.delete("/members/:userId", protect, deleteMemberFromDB);
router.get("/user/:userId/count", protect, getProjectsCountByUser);
module.exports = router;
