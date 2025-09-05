import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatList from './ChatList';
import ChatWindow from './ChatWindow';
import ChatSearch from './ChatSearch';
import './ChatContainer.css';

const ChatContainer = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [shouldStartNewChat, setShouldStartNewChat] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Carica l'utente e le chat
  const loadChats = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setCurrentUser(null);
      setChats([]);
      setSelectedChat(null);
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Carica profilo utente
      const userRes = await fetch('http://localhost:8081/api/users/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!userRes.ok) throw new Error('Failed to fetch user profile');
      const userData = await userRes.json();
      setCurrentUser(userData.user);

      // Carica chat dell'utente
      const chatRes = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/communication/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!chatRes.ok) throw new Error('Failed to fetch user chats');
      const chatData = await chatRes.json();

      setChats(chatData || []);
      setSelectedChat(chatData?.[0] || null);
    } catch (err) {
      console.error(err);
      setError('Failed to load your chats. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChats();
    window.addEventListener('authChanged', loadChats);
    return () => window.removeEventListener('authChanged', loadChats);
  }, []);

  const handleChatSelect = (chat) => {
    setSelectedChat(chat);
    setShouldStartNewChat(false);
  };

  const handleStartNewChat = () => setShouldStartNewChat(true);
  const handleBackToList = () => {
    setSelectedChat(null);
    setShouldStartNewChat(false);
  };

  const handleChatCreated = (chat) => {
    setChats((prev) => [chat, ...prev.filter((c) => c.id !== chat.id)]);
    setSelectedChat(chat);
    setShouldStartNewChat(false);
  };

  if (!currentUser) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
        <p className="text-secondary">Please log in to access your chats</p>
        <button className="btn btn-primary ms-3" onClick={() => navigate('/login')}>
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="chat-container d-flex vh-100">
     

      <div className="chat-sidebar border-end p-3">
        <div className="chat-header mb-3">
          <h2>Chats</h2>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

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
            currentUser={currentUser} 
          />
        )}
      </div>

      <div className="chat-main flex-grow-1 p-3">
        {selectedChat ? (
          <ChatWindow
            chat={selectedChat}
            onBack={handleBackToList}
            currentUser={currentUser}
          />
        ) : !shouldStartNewChat ? (
          <div className="chat-placeholder text-center mt-5">
            <h3>Select a chat or start a new conversation</h3>
            <button className="btn btn-success mt-3" onClick={handleStartNewChat}>
              Start New Chat
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ChatContainer;
