// frontend/src/components/Chat/ChatWindow.js

import React, { useState, useEffect, useRef } from 'react';
import { 
  getSocket, 
  joinChatRoom, 
  leaveChatRoom 
} from '../../utils/socket';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import './ChatWindow.css';
import PrescriptionUploadForm from '../prescriptions/PrescriptionUploadForm';

const ChatWindow = ({ chat, currentUser }) => {
  const [messages, setMessages] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) {
      setError('Chat connection not established.');
      setLoadingHistory(false);
      return;
    }

    joinChatRoom(chat.id);

    return () => {
      leaveChatRoom(chat.id);
    };
  }, [chat.id]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoadingHistory(true);
        setError('');
        const token = localStorage.getItem('token');
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/communication/${chat.id}/history`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) throw new Error(`Failed to fetch chats: ${response.statusText}`);
        const data = await response.json();
        setMessages(data.messages || []);
      } catch (err) {
        console.error('Error fetching chat history:', err);
        setError('Failed to load message history');
      } finally {
        setLoadingHistory(false);
      }
    };

    if (currentUser) fetchHistory();

    const handleReceiveMessage = (message) => {
      if (message.chatId === chat.id) {
        setMessages(prev => [...prev, message]);
      }
    };

    const socket = getSocket();
    if (socket) socket.on('receiveMessage', handleReceiveMessage);

    return () => {
      if (socket) socket.off('receiveMessage', handleReceiveMessage);
    };
  }, [chat.id, chat, currentUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (content) => {
    if (!currentUser) {
      setError('You must be logged in to send messages');
      return;
    }

    const socket = getSocket();
    if (!socket) {
      alert('Not connected to chat service.');
      return;
    }

    const tempMessage = {
      id: Date.now(),
      chatId: chat.id,
      senderId: currentUser.id,
      content,
      timestamp: new Date().toISOString(),
      status: 'sending'
    };

    setMessages(prev => [...prev, tempMessage]);

    socket.emit('sendMessage', { chatId: chat.id, content }, (ackError) => {
      if (ackError) {
        setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
        alert('Failed to send message.');
      }
    });
  };

  // --- MODIFICA 1: Semplificato il modo di trovare l'altro utente ---
  // Usiamo direttamente l'oggetto "otherParticipant" fornito dal backend,
  // che contiene già tutte le informazioni del paziente.
  const otherUser = chat.otherParticipant;

  if (loadingHistory) return <div className="chat-window">Loading messages...</div>;
  if (error) return <div className="chat-window error">{error}</div>;

  return (
    <div className="chat-window">
      <div className="chat-header">
        <h3>
          Chat with: {otherUser?.firstName} {otherUser?.lastName}
        </h3>
      </div>
      <div className="chat-messages">
        <MessageList messages={messages} currentUserId={currentUser?.id} />
        <div ref={messagesEndRef} />
      </div>
      <div className="chat-input-area">
        <MessageInput onSendMessage={handleSendMessage} currentChatId={chat.id} />
        
        {/* --- MODIFICA 2: Aggiunta la prop "patientId" --- */}
        {/* Ora passiamo l'ID del paziente, preso da "otherUser", al form di upload. */}
        {currentUser?.role === 'doctor' && otherUser && (
          <PrescriptionUploadForm 
            doctorId={currentUser.id} 
            patientId={otherUser.id}
          />
        )}
      </div>
    </div>
  );
};

export default ChatWindow;