// frontend/src/components/Chat/MessageInput.js
import React, { useState, useEffect } from 'react';
import { getSocket } from '../../utils/socket';
import './MessageInput.css';


const MessageInput = ({ onSendMessage, currentChatId }) => {
  const [inputValue, setInputValue] = useState('');
  const socket = getSocket();

  const handleSend = () => {
    if (inputValue.trim() === '') return;
    
    onSendMessage(inputValue);
    setInputValue('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="message-input">
      <textarea
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Type a message..."
        rows="1"
      />
      <button onClick={handleSend} disabled={!inputValue.trim()}>
        Send
      </button>
    </div>
  );
};

export default MessageInput;