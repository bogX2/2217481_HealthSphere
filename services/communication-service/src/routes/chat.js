const express = require('express');
const router = express.Router();
const controller = require('../controllers/chatController');
const { authenticateToken } = require('../middleware/auth'); // Reuse or adapt auth

// All routes in this file are prefixed with /api/chats (see index.js)

// Create a new chat channel
router.post('/', authenticateToken, controller.createChat);

// Get list of chats for the authenticated user
router.get('/user', authenticateToken, controller.getUserChats);

// Get message history for a specific chat (requires chat ID in URL)
router.get('/:chatId/history', authenticateToken, controller.getChatHistory);

// Optional: Get details for a specific chat
// router.get('/:chatId', authenticateToken, controller.getChatDetails);

module.exports = router;