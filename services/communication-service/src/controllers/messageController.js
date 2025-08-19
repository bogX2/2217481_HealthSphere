const socketIO = require('socket.io');
const Message = require('../models/Message');
const Chat = require('../models/Chat');
const jwt = require('jsonwebtoken');
require('dotenv').config();

let io;

const initializeSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:3001", // Adjust for your frontend
      methods: ["GET", "POST"],
      credentials: true // If needed
    }
  });

  // Middleware to authenticate socket connection
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication error: No token provided"));
    }
    try {
      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET); // Use same secret as user-service
      socket.userId = decoded.userId;
      // Store user role if needed (requires calling user-service or having it in token)
      // const user = await getUserById(decoded.userId); // Implement this helper
      // socket.userRole = user?.role;
      next();
    } catch (err) {
      console.error("Socket authentication error:", err);
      next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected via Socket.IO: ${socket.userId}`);

    // Join specific chat rooms
    socket.on('joinChat', async (data) => {
        const { chatId } = data;
        try {
            // Validate if user is part of the chat
            const chat = await Chat.findByPk(chatId);
            if (!chat || (chat.participant1Id !== socket.userId && chat.participant2Id !== socket.userId)) {
                return socket.emit('error', { message: 'Unauthorized access to chat' });
            }
            socket.join(chatId);
            console.log(`User ${socket.userId} joined chat room ${chatId}`);
            // Optionally, emit a confirmation or initial data
            socket.emit('joinedChat', { chatId });
        } catch (err) {
             console.error('Error joining chat room:', err);
             socket.emit('error', { message: 'Failed to join chat room' });
        }
    });

    // Handle sending messages
    socket.on('sendMessage', async (data) => {
         const { chatId, content } = data;
         // Basic validation
         if (!chatId || !content || content.trim() === '') {
             return socket.emit('error', { message: 'Chat ID and non-empty content are required' });
         }
         try {
             // Validate chat access again (security)
             const chat = await Chat.findByPk(chatId);
             if (!chat || (chat.participant1Id !== socket.userId && chat.participant2Id !== socket.userId)) {
                 return socket.emit('error', { message: 'Unauthorized to send message to this chat' });
             }

             // Save message to database
             const message = await Message.create({
                 chatId,
                 senderId: socket.userId,
                 content: content.trim()
             });

             // Emit message to the specific chat room
             // io.to(chatId).emit('receiveMessage', message); // Sends to everyone in the room, including sender
             // Better: emit to others only, sender updates UI optimistically
             socket.to(chatId).emit('receiveMessage', message); // Send the saved message (includes timestamp, etc.)
             console.log(`Message sent in chat ${chatId} by user ${socket.userId}`);
         } catch (err) {
              console.error('Error sending message:', err);
              socket.emit('error', { message: 'Failed to send message' });
         }
    });

    // Handle typing indicators (optional)
    socket.on('typing', (data) => {
        const { chatId } = data;
        // Broadcast to others in the room that this user is typing
        socket.to(chatId).emit('userTyping', { userId: socket.userId, chatId });
    });
    socket.on('stopTyping', (data) => {
         const { chatId } = data;
         socket.to(chatId).emit('userStopTyping', { userId: socket.userId, chatId });
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected from Socket.IO: ${socket.userId}`);
    });
  });
};

module.exports = { initializeSocket, getIO: () => io }; // Export function to get io instance if needed elsewhere