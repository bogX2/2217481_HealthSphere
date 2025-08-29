// frontend/src/components/Chat/ChatContainer.js
import React, { useState, useEffect, useContext } from 'react';
import { useAuth } from '../../auth/AuthProvider';
import ChatList from './ChatList';
import ChatWindow from './ChatWindow';
import ChatSearch from './ChatSearch';
import './ChatContainer.css';

const ChatContainer = () => {
  const { currentUser } = useAuth();
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [shouldStartNewChat, setShouldStartNewChat] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentUser) {
      fetchUserChats();
    }
  }, [currentUser]);

  const fetchUserChats = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/api/communication/user`, 
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch user chats: ${response.status}`);
      }
      
      const data = await response.json();
      setChats(data.chats || []);
      
      // If there are chats but none selected, select the first one
      if (data.chats && data.chats.length > 0 && !selectedChat) {
        setSelectedChat(data.chats[0]);
      }
    } catch (err) {
      console.error('Error fetching user chats:', err);
      setError('Failed to load your chats. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleChatSelect = (chat) => {
    setSelectedChat(chat);
    setShouldStartNewChat(false);
  };

  const handleStartNewChat = () => {
    setShouldStartNewChat(true);
  };

  const handleBackToList = () => {
    setSelectedChat(null);
    setShouldStartNewChat(false);
  };

  const handleChatCreated = (chat) => {
    // Add the new chat to the list
    setChats(prev => [chat, ...prev.filter(c => c.id !== chat.id)]);
    setSelectedChat(chat);
    setShouldStartNewChat(false);
  };

  if (!currentUser) {
    return (
      <div className="chat-container">
        <div className="chat-placeholder">
          <p>Please log in to access your chats</p>
          <button onClick={() => window.location.href = '/login'}>
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <div className="chat-sidebar">
        <div className="chat-header">
          <h2>Chats</h2>
          
        </div>
        
        {error && <div className="error-banner">{error}</div>}
        
        {shouldStartNewChat ? (
          <ChatSearch 
            currentUser={currentUser} 
            onChatSelected={handleChatCreated}
            onBack={handleBackToList}
          />
        ) : (
          <ChatList
            chats={chats}
            onSelectChat={handleChatSelect}
            activeChatId={selectedChat?.id}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            loading={loading}
          />
        )}
      </div>
      
      <div className="chat-main">
        {selectedChat ? (
          <ChatWindow 
            chat={selectedChat} 
            onBack={handleBackToList}
            currentUser={currentUser}
          />
        ) : !shouldStartNewChat ? (
          <div className="chat-placeholder">
            <h3>Select a chat or start a new conversation</h3>
            <button className="primary-button" onClick={handleStartNewChat}>
              Start New Chat
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ChatContainer;