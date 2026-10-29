const { verifyToken } = require('../config/jwt');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }

  req.user = decoded;
  next();
};

const authorizeRole = (allowedRoles) => {
  return (req, res, next) => {
    const userRole = String(req.user.role ?? '').toUpperCase();
    const normalizedAllowedRoles = allowedRoles.map((role) => role.toUpperCase());
    if (!normalizedAllowedRoles.includes(userRole)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
};

module.exports = { authenticateToken, authorizeRole };
