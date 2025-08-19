// frontend/src/utils/socket.js
import { io } from 'socket.io-client';
import { getAuthToken } from './auth';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:8084';

let socket;

export const connectSocket = (token) => {
  if (socket) {
    disconnectSocket();
  }
  
  socket = io(SOCKET_URL, {
    auth: { token: token || getAuthToken() },
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    timeout: 10000,
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;

// Add these missing exports
export const joinChatRoom = (chatId) => {
  if (socket) {
    socket.emit('joinChat', { chatId });
  } else {
    console.error('Cannot join chat room: Socket not connected');
  }
};

export const leaveChatRoom = (chatId) => {
  if (socket) {
    socket.emit('leaveChat', { chatId });
  } else {
    console.error('Cannot leave chat room: Socket not connected');
  }
};

export const sendMessage = (chatId, content) => {
  if (socket) {
    socket.emit('sendMessage', { chatId, content });
  } else {
    console.error('Cannot send message: Socket not connected');
  }
};