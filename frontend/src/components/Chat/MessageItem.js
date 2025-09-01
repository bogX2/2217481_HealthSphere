// frontend\src\components\Chat\MessageItem.js
import React from 'react';
import './MessageItem.css';

const MessageItem = ({ message, isOwnMessage }) => {
console.log(
    "MessageItem → senderId:", message.senderId,
    "isOwnMessage:", isOwnMessage,
    "content:", message.content
  );



  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`message-item ${isOwnMessage ? 'own' : 'other'}`}>
      <div className="message-content">
        <div className="message-text">{message.content}</div>
        <div className="message-time">{formatTime(message.timestamp)}</div>
      </div>
    </div>
  );
};

export default MessageItem;