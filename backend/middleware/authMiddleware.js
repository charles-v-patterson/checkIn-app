const jwt = require('jsonwebtoken');

module.exports = async function authMiddleware(req, res, next) {
  // 1. Get token from header
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Check for Bearer token

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  try {
    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Attach user data to request object
    req.user = decoded; 

    next(); // Proceed to the next middleware or route handler

  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};
