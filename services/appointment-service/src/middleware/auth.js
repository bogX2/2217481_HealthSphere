const jwt = require('jsonwebtoken');

const normalizePayload = (payload) => {
  const maybeSub = payload.sub !== undefined ? (isNaN(payload.sub) ? payload.sub : Number(payload.sub)) : undefined;
  const userId = payload.userId || payload.id || maybeSub;
  const role = payload.role || payload.userRole || payload.r;
  return { userId, role, raw: payload };
};

const authenticateToken = (req, res, next) => {
  try {
    const header = req.headers['authorization'] || req.headers['Authorization'];
    const token = header && header.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Access token required' });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const normalized = normalizePayload(payload);

    if (!normalized.userId) return res.status(401).json({ error: 'Token missing user id' });
    req.user = normalized; // req.user.userId and req.user.role available
    next();
  } catch (err) {
    console.error('Auth error:', err.message);
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
