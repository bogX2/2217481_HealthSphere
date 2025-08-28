const express = require('express');
const router = express.Router();
// Make sure to destructure the middleware correctly
const { authenticateInternalService } = require('../middleware/internalAuth');
const internalController = require('../controllers/internalController');

//const { verifyInternalService } = require('../middleware/internalAuth');
const relationshipController = require('../controllers/relationshipController');

// Protected internal routes
router.get('/relationships/check/:userId1/:userId2', 
  authenticateInternalService, 
  relationshipController.checkRelationship
);

// Internal service-to-service endpoint
router.post('/doctors', authenticateInternalService, internalController.createDoctorInternal);

module.exports = router;