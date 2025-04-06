/**
 * Authentication middleware
 * Verifies JWT token from request headers
 */
const jwt = require("jsonwebtoken");

module.exports = async function isAuthenticated(req, res, next) {
  // Extract token from Authorization header
  const token = req.headers["authorization"]?.split(" ")[1];

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(401).json({ message: err });
    } else {
      req.user = user;
      next();
    }
  });
};
