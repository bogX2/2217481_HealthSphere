const { Op } = require('sequelize');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const Chat  = require('../models/Chat');
const Message = require('../models/Message');

// Create a new chat between two users
exports.createChat = async (req, res) => {
  try {
    const participant1Id = req.user.id; // The ID of the user making the request
    const { participant2Id } = req.body;

    console.log(`\n🔄 Attempting to create a chat between ${participant1Id} and ${participant2Id}`);

    // Validate inputs
    if (!participant1Id || !participant2Id) {
      console.error('❌ Missing participant ID.');
      return res.status(400).json({ error: 'Both participant IDs are required.' });
    }

    if (participant1Id === participant2Id) {
      console.error('❌ User cannot create a chat with themselves.');
      return res.status(400).json({ error: 'You cannot create a chat with yourself.' });
    }
    
    // Check if a valid relationship exists between doctor and patient before creating the chat
    try {
      console.log(`🔍 Verifying relationship between ${participant1Id} and ${participant2Id}...`);
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
          headers: { 'Authorization': `Bearer ${serviceToken}` },
          timeout: 5000
        }
      );
      
      console.log('✅ Response from relationship check:', relationshipResponse.data);
      
      if (!relationshipResponse.data.hasRelationship) {
        console.error('❌ No valid relationship found.');
        return res.status(403).json({
          error: 'Cannot start chat. No valid relationship exists with this user.'
        });
      }
    } catch (relationshipErr) {
      console.error('🔥 ERROR during relationship verification:');
      if (relationshipErr.response) {
        console.error(`Status: ${relationshipErr.response.status}, Data:`, relationshipErr.response.data);
      } else {
        console.error(`Message: ${relationshipErr.message}`);
      }
      console.warn('⚠️ Proceeding with chat creation anyway (relationship service unavailable).');
    }

    // Check if a chat between these two users already exists
    const existingChat = await Chat.findOne({
      where: {
        [Op.or]: [
          { participant1Id, participant2Id },
          { participant1Id: participant2Id, participant2Id: participant1Id }
        ]
      }
    });

    if (existingChat) {
      console.log(`ℹ️ Chat ${existingChat.id} already exists.`);
      return res.status(200).json({ chat: existingChat, message: 'Chat already exists.' });
    }

    // Create the new chat if it doesn't exist
    const newChat = await Chat.create({ participant1Id, participant2Id });
    console.log(`✅ New chat successfully created: ${newChat.id}`);
    res.status(201).json({ chat: newChat });

  } catch (err) {
    console.error('🔥 CRITICAL ERROR while creating chat:', err);
    res.status(500).json({ error: 'Internal server error while creating chat.' });
  }
};

// Get the message history of a chat
exports.getChatHistory = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;

    const chat = await Chat.findByPk(chatId);
    if (!chat || (chat.participant1Id !== userId && chat.participant2Id !== userId)) {
      console.error(`Access denied: User ${userId} trying to access chat ${chatId}`);
      return res.status(403).json({ error: 'Access denied to this chat history.' });
    }

    const messages = await Message.findAll({
      where: { chatId },
      order: [['timestamp', 'ASC']],
    });

    res.json({ messages });
  } catch (err) {
    console.error('Error fetching chat history:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// Get the list of all chats for a user
exports.getUserChats = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log(`\n🔄 Fetching chats for user ${userId}...`);

    const chats = await Chat.findAll({
      where: {
        [Op.or]: [{ participant1Id: userId }, { participant2Id: userId }],
      },
      order: [['updatedAt', 'DESC']]
    });

    console.log(`Found ${chats.length} chats for user ${userId}.`);

    const enrichedChats = await Promise.all(
      chats.map(async (chat) => {
        const chatData = chat.get({ plain: true });
        const otherUserId = chatData.participant1Id === userId 
          ? chatData.participant2Id 
          : chatData.participant1Id;
        
        try {
          // Prepare the call to get the other user's data
          const userServiceUrl = process.env.USER_SERVICE_URL || 'http://user-service:8081';
          const serviceToken = jwt.sign(
            { 
              service: 'communication-service',
              permissions: ['read:user:public']
            }, 
            process.env.INTERNAL_SERVICE_SECRET,
            { expiresIn: '5m' }
          );
          
          // Execute ONLY ONE call to get the other participant's data
          const userResponse = await axios.get(
            `${userServiceUrl}/api/internal/users/${otherUserId}/public`,
            { 
              headers: { 'Authorization': `Bearer ${serviceToken}` },
              timeout: 5000
            }
          );

          // Return the enriched chat data with the other user's details
          return {
            ...chatData,
            otherParticipant: userResponse.data
          };
        } catch (err) {
          console.error(`Error fetching details for user ${otherUserId}:`, err.message);
          // If the call fails, still return the chat data with a placeholder user
          return {
            ...chatData,
            otherParticipant: {
              id: otherUserId,
              firstName: 'Unknown',
              lastName: 'User',
              error: 'Could not load data.'
            }
          };
        }
      })
    );

    console.log(`✅ Sending ${enrichedChats.length} enriched chats.`);
    res.json(enrichedChats);

  } catch (err) {
    console.error('🔥 CRITICAL ERROR while fetching chats:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// Check if a chat between two users already exists
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