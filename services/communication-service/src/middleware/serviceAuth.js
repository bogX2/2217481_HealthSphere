const jwt = require('jsonwebtoken');
require('dotenv').config();

const authenticateService = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      return res.status(401).json({ error: 'Service token required' });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.INTERNAL_SERVICE_SECRET);
    
    // Verify service name
    const validServices = ['user-service', 'doctor-service', 'communication-service', 'appointment-service'];
    if (!validServices.includes(decoded.service)) {
      return res.status(403).json({
        error: `Invalid service: ${decoded.service}`,
        validServices: validServices
      });
    }
    
    req.service = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ 
      error: 'Invalid service token', 
      details: err.message 
    });
  }
};

module.exports = { authenticateService };