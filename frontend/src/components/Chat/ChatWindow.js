// frontend/src/components/Chat/ChatWindow.js
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../auth/AuthProvider'; // Fixed import path
import { 
  getSocket, 
  joinChatRoom, 
  leaveChatRoom 
} from '../../utils/socket'; // Added socket imports
import { getAuthToken } from '../../utils/auth'; // Added auth import
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import './ChatWindow.css';


const ChatWindow = ({ chat }) => {
  const [messages, setMessages] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const { currentUser } = useAuth(); // Moved out of handleSendMessage


  useEffect(() => {
    const socket = getSocket();
    if (!socket) {
      setError('Chat connection not established.');
      setLoadingHistory(false);
      return;
    }

    // Join the specific chat room
    joinChatRoom(chat.id);

    // Cleanup on unmount
    return () => {
      leaveChatRoom(chat.id);
    };
  }, [chat.id]);


  // Fetch chat history when component mounts
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

        if (!response.ok) {
          throw new Error(`Failed to fetch chats: ${response.statusText}`);
        }

        const data = await response.json();
        setMessages(data.messages || []);
      } catch (err) {
        console.error('Error fetching chat history:', err);
        setError('Failed to load message history');
      } finally {
        setLoadingHistory(false);
      }
    };

    fetchHistory();

    // Socket Event Listeners for this specific chat
    const handleReceiveMessage = (message) => {
      // Ensure the message belongs to the currently active chat
      if (message.chatId === chat.id) {
        console.log("Received message for current chat:", message);
        setMessages(prevMessages => [...prevMessages, message]);
      }
    };

    const socket = getSocket();
    if (socket) {
      socket.on('receiveMessage', handleReceiveMessage);
    }

    return () => {
      if (socket) {
        socket.off('receiveMessage', handleReceiveMessage);
      }
    };
  }, [chat.id, chat]);


  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);


  const handleSendMessage = (content) => {
    // Now currentUser is available from the outer scope
    if (!currentUser) {
      setError('You must be logged in to send messages');
      return;
    }

    const socket = getSocket();
    if (socket) {
      // Create a temporary message for optimistic UI
      const tempMessage = {
        id: Date.now(),
        chatId: chat.id,
        senderId: currentUser.id,
        content,
        timestamp: new Date().toISOString(),
        status: 'sending'
      };

      setMessages(prev => [...prev, tempMessage]);

      socket.emit('sendMessage', { 
        chatId: chat.id, 
        content 
      }, (ackError) => {
        if (ackError) {
          console.error('Message send error (ack):', ackError);
          // Remove optimistic message or show error
          setMessages(prevMessages => 
            prevMessages.filter(msg => msg.id !== tempMessage.id)
          );
          alert('Failed to send message.');
        }
      });
    } else {
      alert('Not connected to chat service.');
    }
  };


  if (loadingHistory) return <div className="chat-window">Loading messages...</div>;
  if (error) return <div className="chat-window error">{error}</div>;

  
  return (
    <div className="chat-window">
      <div className="chat-header">
        <h3></h3>
      </div>
      <div className="chat-messages">
        <MessageList messages={messages} currentUserId={currentUser?.id} />
        <div ref={messagesEndRef} />
      </div>
      <div className="chat-input-area">
        <MessageInput 
          onSendMessage={handleSendMessage} 
          currentChatId={chat.id} 
        />
      </div>
    </div>
  );
};

export default ChatWindow;