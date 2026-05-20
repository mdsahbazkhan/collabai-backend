const express = require("express");
const { chatWithAI } = require("../controllers/aiController");
const { protect } = require("../middleware/authMiddleware");
const { projectAIChat } = require("../controllers/aiController");

const router = express.Router();

router.post("/chat", protect, chatWithAI);
router.post("/projects/:projectId/ai/chat", protect, projectAIChat);

module.exports = router;
