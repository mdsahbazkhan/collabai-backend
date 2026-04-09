const express = require("express");
const {
  getProjectMessages,
  getConversationMessages,
} = require("../controllers/message.js");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// project chat
router.get("/project/:projectId", protect, getProjectMessages);

// DM chat
router.get("/conversation/:conversationId", protect, getConversationMessages);

module.exports = router;
