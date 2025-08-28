const express = require('express');
const router = express.Router();
const controller = require('../controllers/chatController');
const { authenticateToken } = require('../middleware/auth'); // Reuse or adapt auth
const { checkChatExists } = require('../controllers/chatController');

// All routes in this file are prefixed with /api/chats (see index.js)

// Create a new chat channel
router.post('/', authenticateToken, controller.createChat);

// Get list of chats for the authenticated user
router.get('/user', authenticateToken, controller.getUserChats);

// Get message history for a specific chat (requires chat ID in URL)
router.get('/:chatId/history', authenticateToken, controller.getChatHistory);

// ROUTE FOR MIGRATION
router.get('/check/:userId1/:userId2', authenticateToken, checkChatExists);


module.exports = router;