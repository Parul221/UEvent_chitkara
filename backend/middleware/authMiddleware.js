//authMiddleware.js
const jwt = require("jsonwebtoken");
const jwtConfig = require("../config/jwt");

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Token missing
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "No token provided"
      });
    }

    // Extract token
    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(token, jwtConfig.secret);

    // Attach user info
    req.user = decoded;

    next(); // allow access

  } catch (error) {
    return res.status(401).json({
      message: "Token invalid or expired"
    });
  }
};

module.exports = authMiddleware;
