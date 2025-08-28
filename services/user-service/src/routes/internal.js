const express = require('express');
const router = express.Router();
const { authenticateInternalService } = require('../middleware/internalAuth');
const { getUserPublicProfile } = require('../controllers/internalController');

// Protected internal routes
router.get('/users/:id/public', authenticateInternalService, getUserPublicProfile);

module.exports = router;