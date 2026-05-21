//protectedRoutes.js
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

router.get("/dashboard", authMiddleware, (req, res) => {
  res.status(200).json({
    message: "Welcome to protected dashboard",
    user: req.user
  });
});

module.exports = router;
