// frontend\src\components\Chat/MessageList.js
import React from 'react';
import MessageItem from './MessageItem';
import './MessageList.css';

const MessageList = ({ messages, currentUserId }) => {
  return (
    <div className="message-list">
      {messages.map((message) => (
        <MessageItem
          key={message.id || message.timestamp} // Use timestamp for optimistic messages
          message={message}
          isOwnMessage={message.senderId === currentUserId}
        />
      ))}
    </div>
  );
};

export default MessageList;