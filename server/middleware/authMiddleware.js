const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  // 1. PRIMARY CHECK: Read from Cookie
  // This matches what your frontend expects now.
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }
  // 2. FALLBACK CHECK: Read from Header (for Postman/testing)
  else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // If neither source had a token, reject.
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from the token (exclude password)
    // NOTE: Ensure your JWT payload uses 'id' or 'userId'. 
    // If your login controller used 'userId', change this to decoded.userId
    req.user = await User.findById(decoded.id || decoded.userId).select('-password');

    if (!req.user) {
        return res.status(401).json({ message: 'User not found' });
    }

    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error.message);
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

module.exports = { protect };