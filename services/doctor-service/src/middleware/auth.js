const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  try {
    const header = req.headers['authorization'];
    const token = header && header.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Access token required' });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // expects payload.userId and payload.role
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

const authorizeRole = (roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }
  next();
};

module.exports = { authenticateToken, authorizeRole };
