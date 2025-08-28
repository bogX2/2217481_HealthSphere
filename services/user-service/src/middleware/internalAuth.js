// services/user-service/src/middleware/internalAuth.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

const authenticateInternalService = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  
  if (!token) {
    return res.status(401).json({ 
      error: 'Service token required in Authorization header' 
    });
  }
  
  try {
    // Verify using the INTERNAL_SERVICE_SECRET
    const decoded = jwt.verify(token, process.env.INTERNAL_SERVICE_SECRET);
    
    // Optional: Verify the service name
    const validServices = ['user-service', 'doctor-service', 'communication-service', 'appointment-service'];
    if (!validServices.includes(decoded.service)) {
      return res.status(403).json({ 
        error: `Invalid service: ${decoded.service}`,
        validServices: validServices 
      });
    }
    
    // Optional: Verify permissions
    if (req.path.includes('/users/') && req.method === 'GET') {
      if (!decoded.permissions || !decoded.permissions.includes('read:user:public')) {
        return res.status(403).json({ 
          error: 'Missing required permission: read:user:public' 
        });
      }
    }
    
    next();
  } catch (err) {
    return res.status(401).json({ 
      error: 'Invalid service token', 
      details: err.message 
    });
  }
};

module.exports = { authenticateInternalService };