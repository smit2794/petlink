const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'petlink_secret_key_279';

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No authentication token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = {
      id: decoded.id,
      _id: decoded.id,
      role: decoded.role,
      name: decoded.name,
      email: decoded.email
    };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired authentication token' });
  }
};

// Optional auth: parses token if provided, but does not block if unauthenticated
const optionalAuthMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = {
      id: decoded.id,
      _id: decoded.id,
      role: decoded.role,
      name: decoded.name,
      email: decoded.email
    };
  } catch (err) {
    req.user = null;
  }
  next();
};

module.exports = {
  authMiddleware,
  optionalAuthMiddleware
};
