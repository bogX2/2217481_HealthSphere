import React, { useState, useEffect } from 'react';
import { fetchUserDetails } from '../../utils/userService';
import './ChatListItem.css';

const ChatListItem = ({ chat, isActive, onClick, currentUser }) => {
  const [otherParticipant, setOtherParticipant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!currentUser || !chat) return;

    const getOtherParticipantDetails = async () => {
      setLoading(true);
      setError(null);

      try {
        let otherUserId;
        if (chat.participant1Id === currentUser.id) {
          otherUserId = chat.participant2Id;
        } else if (chat.participant2Id === currentUser.id) {
          otherUserId = chat.participant1Id;
        } else {
          throw new Error('Current user is not part of this chat.');
        }

        const userDetails = await fetchUserDetails(otherUserId);
        setOtherParticipant(userDetails);

        console.log('ChatListItem - currentUser:', currentUser);
        console.log('ChatListItem - chat:', chat);
        console.log('Computed otherUserId:', otherUserId);

      } catch (err) {
        console.error('Error fetching participant details:', err);
        setError('Failed to load participant');
      } finally {
        setLoading(false);
      }
    };

    getOtherParticipantDetails();
  }, [chat, currentUser]);

  let displayName = 'Loading...';
  if (error) displayName = 'Error';
  else if (!loading && otherParticipant) {
    displayName = `${otherParticipant.firstName || ''} ${otherParticipant.lastName || ''}`.trim() ||
                  otherParticipant.email ||
                  `User ${otherParticipant.id}`;
  } else if (!loading && !otherParticipant) displayName = 'Unknown User';

  return (
    <div className={`chat-list-item ${isActive ? 'active' : ''}`} onClick={onClick}>
      <div className="chat-list-item-info">
        <div>
          <h4>{displayName}</h4>
        </div>
      </div>
    </div>
  );
};

export default ChatListItem;
