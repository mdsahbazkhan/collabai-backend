const express = require("express");
const { createOrGetConversation } = require("../controllers/conversation.js");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createOrGetConversation);

module.exports = router;
