const jwt = require('jsonwebtoken');

const authenticateInternalService = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Service token required' });
  }
  
  try {
    // Verify using the dedicated internal service secret
    const decoded = jwt.verify(token, process.env.INTERNAL_SERVICE_SECRET);
    
    // Ensure it's from the user service
    if (decoded.service !== 'user-service') {
      return res.status(403).json({ error: 'Invalid service' });
    }
    
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid service token' });
  }
};

module.exports = { authenticateInternalService };