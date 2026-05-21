const express = require("express");
const router = express.Router();

const {
  loginOrRegister,
  verifyOtp,
  register   // ✅ ADD THIS
} = require("../controllers/authController");

router.post("/login", loginOrRegister);
router.post("/verify-otp", verifyOtp);
router.post("/register", register);   // ✅ ADD THIS

module.exports = router;