import React from 'react';
import ChatListItem from './ChatListItem';
import './ChatList.css';

const ChatList = ({ chats, onSelectChat, activeChatId, currentUser }) => {
  return (
    <div className="chat-list">
      {chats.length > 0 ? (
        chats.map(chat => (
          <ChatListItem
            key={chat.id}
            chat={chat}
            isActive={chat.id === activeChatId}
            onClick={() => onSelectChat(chat)}
            currentUser={currentUser} // ✅ Passaggio a ChatListItem
          />
        ))
      ) : (
        <div className="no-chats">No chats available.</div>
      )}
    </div>
  );
};

export default ChatList;
