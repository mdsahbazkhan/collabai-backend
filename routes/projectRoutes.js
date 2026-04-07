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
  changeMemberRole,
} = require("../controllers/projectController");
const { protect } = require("../middleware/authMiddleware");
const { permit } = require("../middleware/permit");

const router = express.Router();

router.post("/create", protect, createProject);
router.get("/myprojects", protect, getUserProjects);
router.get("/:id", protect, getProjectById);
router.put("/:id", protect, updateProject);
router.delete("/:id", protect, deleteProject);
router.post("/:id/members", protect, addMember);
router.delete("/:id/members/:userId", protect, permit(["owner"]), removeMember);
router.delete("/members/:userId", protect, deleteMemberFromDB);
router.get("/user/:userId/count", protect, getProjectsCountByUser);
router.patch(
  "/:id/members/:userId/role",
  protect,
  permit(["owner"]),
  changeMemberRole,
);
module.exports = router;
