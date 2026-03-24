const express = require("express");
const {
  registerUser,
  loginUser,
  getMe,
  getAllUsers,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getMe);
router.get("/all", protect, getAllUsers);
module.exports = router;
