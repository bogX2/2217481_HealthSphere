const Chat = require('../models/Chat');
const Message = require('../models/Message');
const { Op } = require('sequelize');

// Helper function to validate if user exists (calls user-service)
// This requires the user-service to expose an endpoint like GET /api/users/:id
const axios = require('axios');
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:8081';

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
}

// Create a chat (e.g., when doctor/patient first connect)
exports.createChat = async (req, res) => {
  try {
    const { participant1Id, participant2Id } = req.body;
    const userId = req.user.userId;

    // 1. Basic validation
    if (!participant1Id || !participant2Id) {
      return res.status(400).json({ error: 'Both participant IDs are required' });
    }

    // 2. Ensure current user is one of the participants
    if (userId !== participant1Id && userId !== participant2Id) {
      return res.status(403).json({ error: 'Cannot create chat for others' });
    }

    // 3. Validate participants exist (through user-service)
    const user1Exists = await validateUserExists(participant1Id);
    const user2Exists = await validateUserExists(participant2Id);
    
    if (!user1Exists || !user2Exists) {
      return res.status(400).json({ error: 'One or both participants do not exist' });
    }

    // 4. Validate relationship between users
    const isValidRelationship = await validateUserRelationship(participant1Id, participant2Id);
    if (!isValidRelationship) {
      return res.status(403).json({ 
        error: 'Non è possibile avviare una chat con questo utente. Non esiste una relazione valida (prenotazione/appuntamento).' 
      });
    }

    // 5. Check if chat already exists (prevent duplicates)
    const existingChat = await Chat.findOne({
      where: {
        [Op.or]: [
          { participant1Id, participant2Id },
          { participant1Id: participant2Id, participant2Id: participant1Id }
        ]
      }
    });
    
    if (existingChat) {
      return res.status(200).json({ 
        chat: existingChat, 
        message: 'Chat already exists' 
      });
    }

    // 6. Create new chat
    const newChat = await Chat.create({ 
      participant1Id, 
      participant2Id 
    });
    
    res.status(201).json({ chat: newChat });
  } catch (err) {
    console.error('Error creating chat:', err);
    res.status(500).json({ error: 'Internal server error while creating chat' });
  }
};

// Get chat history
exports.getChatHistory = async (req, res) => {
   try {
     const { chatId } = req.params;
     // Ensure user is authorized to access this chat history
     const chat = await Chat.findByPk(chatId);
     if (!chat || (chat.participant1Id !== req.user.userId && chat.participant2Id !== req.user.userId)) {
         return res.status(403).json({ error: 'Access denied to this chat history' });
     }

     const limit = parseInt(req.query.limit) || 50; // Default last 50 messages
     const offset = parseInt(req.query.offset) || 0;

     const messages = await Message.findAll({
        where: { chatId },
        order: [['timestamp', 'ASC']], // Oldest first
        limit,
        offset
     });
     res.json({ messages });
   } catch (err) {
     console.error('Error fetching chat history:', err);
     res.status(500).json({ error: 'Internal server error while fetching chat history' });
   }
};

// Get list of chats for a user
exports.getUserChats = async (req, res) => {
    try {
        const userId = req.user.userId; // From auth middleware

        const chats = await Chat.findAll({
            where: {
                [Op.or]: [
                    { participant1Id: userId },
                    { participant2Id: userId }
                ]
            },
            // Optionally, include latest message or participant details via joins/associations
            // This would require fetching user details from user-service or storing names locally
            order: [['updatedAt', 'DESC']] // Most recently active chats first
        });
        res.json({ chats });
    } catch (err) {
        console.error('Error fetching user chats:', err);
        res.status(500).json({ error: 'Internal server error while fetching user chats' });
    }
};

// Optional: Get chat details by ID (including participants)
// exports.getChatDetails = async (req, res) => { ... }


//
async function validateUserRelationship(userId1, userId2) {
  try {
    // Check both appointments AND doctor-patient relationships
    const [appointmentsResponse, relationshipsResponse] = await Promise.all([
      // Check appointments
      axios.get(`${process.env.APPOINTMENT_SERVICE_URL}/api/appointments/relationship/${userId1}/${userId2}`, {
        headers: { 'Internal-Service-Token': process.env.INTERNAL_SERVICE_TOKEN }
      }),
      // Check doctor-patient relationships
      axios.get(`${process.env.DOCTOR_SERVICE_URL}/api/doctors/relationships/check/${userId1}/${userId2}`, {
        headers: { 'Internal-Service-Token': process.env.INTERNAL_SERVICE_TOKEN }
      })
    ]);

    // Return true if either check shows a valid relationship
    return appointmentsResponse.data.hasRelationship || 
           relationshipsResponse.data.hasRelationship;
  } catch (error) {
    console.error('Error validating user relationship:', error.message);
    return false;
  }
}