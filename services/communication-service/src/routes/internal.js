// services/communication-service/src/routes/internal.js
const express = require('express');
const router = express.Router();
const { authenticateService } = require('../middleware/serviceAuth');
const internalController = require('../controllers/internalController');

// Service-to-service endpoints
router.post('/chats', authenticateService, internalController.createChat);

module.exports = router;