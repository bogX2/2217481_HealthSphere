const Chat = require('../models/Chat');
const Message = require('../models/Message');
const { Op } = require('sequelize');
const jwt = require('jsonwebtoken');

// Helper function to validate if user exists (calls user-service)
// This requires the user-service to expose an endpoint like GET /api/users/:id
const axios = require('axios');
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:8081';

/* //
// services/communication-service/src/controllers/chatController.js
async function validateUserRelationship(userId1, userId2) {
  try {
    // Check doctor-patient relationships
    const doctorServiceUrl = process.env.DOCTOR_SERVICE_URL || 'http://doctor-service:3001';
    
    // Create a JWT token using the INTERNAL_SERVICE_SECRET
    const serviceToken = jwt.sign(
      { 
        service: 'communication-service',
        permissions: ['check:relationship']
      }, 
      process.env.INTERNAL_SERVICE_SECRET,
      { expiresIn: '5m' }
    );
    
    const response = await axios.get(
      `${doctorServiceUrl}/api/internal/relationships/check/${userId1}/${userId2}`,
      {
        headers: { 
          'Authorization': `Bearer ${serviceToken}`
        }
      }
    );
    
    return response.data.hasRelationship;
  } catch (error) {
    console.error('Error validating user relationship:', error.message);
    return false;
  }
}

async function validateUserExists(userId) {
    try {
        // Make internal call to user-service
        const response = await axios.get(`${USER_SERVICE_URL}/api/users/${userId}`, {
             // Don't pass user's token here, service-to-service call
             // Or use service-specific auth if implemented
        });
        return response.status === 200;
    } catch (error) {
        console.error(`Error validating user ${userId}:`, error.message);
        // If user-service returns 404, it means user doesn't exist
        if (error.response && error.response.status === 404) {
            return false;
        }
        // For other errors (network issues, 500s), you might choose to fail or assume exists
        // Let's assume validation fails on error for safety
        return false;
    }
} */


// Create a chat (e.g., when doctor/patient first connect)
exports.createChat = async (req, res) => {
  try {
    const participant1Id = req.user.userId;
    const participant2Id = req.body.participant2Id;
    
    console.log(`\n🔄 Creating chat between ${participant1Id} and ${participant2Id}`);
    
    // Validate participants exist
    if (!participant1Id || !participant2Id) {
      console.error('❌ Missing participant IDs');
      return res.status(400).json({ 
        error: 'Both participant IDs are required' 
      });
    }
    
    if (participant1Id === participant2Id) {
      console.error('❌ Cannot create chat with yourself');
      return res.status(400).json({ 
        error: 'Cannot create chat with yourself' 
      });
    }
    
    // CRITICAL: Log the relationship validation attempt
    console.log(`🔍 Checking relationship between ${participant1Id} and ${participant2Id}`);
    
    // Check if relationship exists
    try {
      const doctorServiceUrl = process.env.DOCTOR_SERVICE_URL || 'http://doctor-service:3001';
      const serviceToken = jwt.sign(
        { 
          service: 'communication-service',
          permissions: ['check:relationship']
        }, 
        process.env.INTERNAL_SERVICE_SECRET,
        { expiresIn: '5m' }
      );
      
      const relationshipResponse = await axios.get(
        `${doctorServiceUrl}/api/internal/relationships/check/${participant1Id}/${participant2Id}`,
        {
          headers: { 
            'Authorization': `Bearer ${serviceToken}`
          },
          timeout: 5000
        }
      );
      
      console.log('✅ Relationship check response:', relationshipResponse.data);
      
      if (!relationshipResponse.data.hasRelationship) {
        console.error('❌ No valid relationship exists');
        return res.status(403).json({
          error: 'Cannot start chat with this user. No valid relationship exists.'
        });
      }
    } catch (relationshipErr) {
      console.error('🔥 ERROR checking relationship:');
      if (relationshipErr.response) {
        console.error(`Status: ${relationshipErr.response.status}`);
        console.error(`Data:`, relationshipErr.response.data);
      } else {
        console.error(`Error message: ${relationshipErr.message}`);
      }
      // Don't fail chat creation if relationship service is down
      console.warn('⚠️ Proceeding with chat creation (relationship service unavailable)');
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

// Get chat history
exports.getChatHistory = async (req, res) => {
  try {
    const { chatId } = req.params;
    
    // FIX: Use correct user ID property (id instead of userId)
    const userId = req.user.id || req.user.userId; // Handle both formats
    
    // Ensure user is authorized to access this chat history
    const chat = await Chat.findByPk(chatId);
    if (!chat || (chat.participant1Id !== userId && chat.participant2Id !== userId)) {
      console.error(`Access denied: User ${userId} trying to access chat ${chatId} which belongs to ${chat?.participant1Id} and ${chat?.participant2Id}`);
      return res.status(403).json({ 
        error: 'Access denied to this chat history',
        debug: {
          userId,
          participant1Id: chat?.participant1Id,
          participant2Id: chat?.participant2Id
        }
      });
    }
    
    // Rest of the function remains the same
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    
    const messages = await Message.findAll({
      where: { chatId },
      order: [['timestamp', 'ASC']],
      limit,
      offset
    });
    
    res.json({ messages });
  } catch (err) {
    console.error('Error fetching chat history:', err);
    res.status(500).json({ 
      error: 'Internal server error while fetching chat history',
      details: err.message 
    });
  }
};


// Get list of chats for a user
exports.getUserChats = async (req, res) => {
  try {
    console.log('\n🔄 Starting getUserChats...');
    const userId = req.user.userId || req.user.id;
    console.log('👤 User ID:', userId);
    
    if (!userId) {
      return res.status(401).json({ 
        error: 'User ID not found in authentication'
      });
    }

    // CRITICAL FIX: This line was MISSING in your implementation
    const chats = await Chat.findAll({
      where: {
        [Op.or]: [
          { participant1Id: userId },
          { participant2Id: userId }
        ],
      },
      order: [['updatedAt', 'DESC']]
    });
    
    console.log(`Found ${chats.length} chats for user ${userId}`);
    
    // Now chats is properly defined and can be used
    const enrichedChats = await Promise.all(chats.map(async (chat) => {
      const chatData = chat.get({ plain: true });
      const otherUserId = chatData.participant1Id === userId ? 
        chatData.participant2Id : 
        chatData.participant1Id;
      
      try {
        const userServiceUrl = process.env.USER_SERVICE_URL || 'http://user-service:8081';
        
        const serviceToken = jwt.sign(
          { 
            service: 'communication-service',
            permissions: ['read:user:public']
          }, 
          process.env.INTERNAL_SERVICE_SECRET,
          { expiresIn: '5m' }
        );
        
        const userResp = await axios.get(
          `${userServiceUrl}/api/internal/users/${otherUserId}/public`,
          { 
            headers: { 
              'Authorization': `Bearer ${serviceToken}`
            },
            timeout: 5000
          }
        );
        
        return {
          ...chatData,
          otherParticipant: userResp.data
        };
      } catch (err) {
        console.error(`Error processing chat with ${otherUserId}:`, err.message);
        return {
          ...chatData,
          otherParticipant: {
            id: otherUserId,
            firstName: 'Error',
            lastName: 'Loading',
            role: 'error',
            error: err.message
          }
        };
      }
    }));

    console.log('📤 Sending response with', enrichedChats.length, 'chats');
    res.json({ chats: enrichedChats });
  } catch (err) {
    console.error('🔥 CRITICAL ERROR:', err);
    res.status(500).json({ 
      error: 'Internal server error',
      details: err.message 
    });
  }
};



exports.checkChatExists = async (req, res) => {
  try {
    const { userId1, userId2 } = req.params;
    
    const chat = await Chat.findOne({
      where: {
        [Op.or]: [
          { participant1Id: userId1, participant2Id: userId2 },
          { participant1Id: userId2, participant2Id: userId1 }
        ]
      }
    });
    
    res.json({ exists: !!chat });
  } catch (err) {
    console.error('Error checking if chat exists:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};