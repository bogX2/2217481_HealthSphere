// services/communication-service/src/controllers/internalController.js
const Chat = require('../models/Chat');
const { Op } = require('sequelize');

exports.createChat = async (req, res) => {
  try {
    const { participant1Id, participant2Id } = req.body;
    
    // Verify the calling service has the right permission
    if (!req.service.permissions || !req.service.permissions.includes('create:chat')) {
      return res.status(403).json({
        error: 'Missing required permission: create:chat'
      });
    }
    
    if (!participant1Id || !participant2Id) {
      return res.status(400).json({ 
        error: 'Both participant IDs are required' 
      });
    }
    
    // Check if chat already exists
    const existingChat = await Chat.findOne({
      where: {
        [Op.or]: [
          { participant1Id, participant2Id },
          { participant1Id: participant2Id, participant2Id: participant1Id }
        ]
      }
    });
    
    if (existingChat) {
      console.log(`ℹ️ Chat already exists: ${existingChat.id}`);
      return res.status(200).json({
        chat: existingChat,
        message: 'Chat already exists'
      });
    }
    
    // Create new chat
    const newChat = await Chat.create({
      participant1Id,
      participant2Id
    });
    
    console.log(`✅ Created new chat: ${newChat.id}`);
    res.status(201).json({ chat: newChat });
  } catch (err) {
    console.error('🔥 CRITICAL ERROR creating chat:', err);
    res.status(500).json({
      error: 'Internal server error while creating chat',
      details: err.message
    });
  }
};