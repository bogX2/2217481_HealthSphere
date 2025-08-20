const express = require('express');
const router = express.Router();
// Make sure to destructure the middleware correctly
const { authenticateInternalService } = require('../middleware/internalAuth');
const internalController = require('../controllers/internalController');

// Internal service-to-service endpoint
router.post('/doctors', authenticateInternalService, internalController.createDoctorInternal);

module.exports = router;