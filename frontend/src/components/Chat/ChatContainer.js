// frontend/src/components/Chat/ChatContainer.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../auth/AuthProvider';
import ChatList from './ChatList';
import ChatWindow from './ChatWindow';
import ChatSearch from './ChatSearch';
import { useNavigate, useLocation } from 'react-router-dom';
import './ChatContainer.css';

const ChatContainer = () => {
  const { currentUser, token } = useAuth();
  const [selectedChat, setSelectedChat] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [chats, setChats] = useState([]);
  const [loadingChats, setLoadingChats] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  const shouldStartNewChat = location.state?.startNewChat;

  // Fetch user chats when currentUser is available
  useEffect(() => {
    if (!currentUser || !token) return;
    
    const fetchChats = async () => {
      setLoadingChats(true);
      setError(null);
      
      try {
        const response = await fetch('http://localhost:8084/api/chats/user', {
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
        setChats(data.chats || []);
      } catch (err) {
        console.error('Error fetching chats:', err);
        setError('Failed to load chat list.');
      } finally {
        setLoadingChats(false);
      }
    };
    
    fetchChats();
  }, [currentUser, token]);

  const handleChatSelect = (chat) => {
    setSelectedChat(chat);
  };

  const handleStartNewChat = () => {
    navigate('/chat', { state: { startNewChat: true } });
  };

  const handleBackToList = () => {
    setSelectedChat(null);
    if (location.state?.startNewChat) {
      navigate('/chat', { replace: true });
    }
  };

  // Show loading while auth is initializing
  if (!currentUser) {
    return <div className="chat-container">Caricamento...</div>;
  }

  // Show loading while chats are being fetched
  if (loadingChats && !error) {
    return <div className="chat-container">Caricamento chat...</div>;
  }

  return (
    <div className="chat-container">
      {!selectedChat && !shouldStartNewChat && (
        <div className="chat-header">
          <h2>Le tue chat</h2>
          <button className="btn primary-btn" onClick={handleStartNewChat}>
            Nuova chat
          </button>
        </div>
      )}
      
      {shouldStartNewChat && !selectedChat && (
        <div className="new-chat-header">
          <button className="back-button" onClick={handleBackToList}>
            ← Indietro
          </button>
          <h2>Nuova chat</h2>
        </div>
      )}

      <div className="chat-content">
        {error ? (
          <div className="error-message">{error}</div>
        ) : !selectedChat && !shouldStartNewChat ? (
          <ChatList 
            chats={chats}
            onSelectChat={handleChatSelect} 
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        ) : shouldStartNewChat ? (
          <ChatSearch 
            currentUser={currentUser}
            onChatSelected={handleChatSelect}
            onBack={handleBackToList}
          />
        ) : (
          <ChatWindow 
            chat={selectedChat} 
            onBack={handleBackToList} 
          />
        )}
      </div>
    </div>
  );
};

export default ChatContainer;