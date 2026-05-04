const express = require("express");
const { chatWithAI } = require("../controllers/ai.js");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/chat", protect, chatWithAI);

module.exports = router;
