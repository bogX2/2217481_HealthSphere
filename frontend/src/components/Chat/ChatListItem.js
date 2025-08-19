// frontend\src\components\Chat\ChatListItem.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../auth/AuthProvider'; // auth method
import { fetchUserDetails } from '../../utils/userService';
import './ChatListItem.css';

const ChatListItem = ({ chat, isActive, onClick }) => {
  const { currentUser } = useAuth(); // Get currently logged-in user
  const [otherParticipant, setOtherParticipant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getOtherParticipantDetails = async () => {
      if (!currentUser || !chat) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // 1. Determine the ID of the other participant
        let otherUserId;
        if (chat.participant1Id === currentUser.id) {
          otherUserId = chat.participant2Id;
        } else if (chat.participant2Id === currentUser.id) {
          otherUserId = chat.participant1Id;
        } else {
          // Should not happen if chat list is filtered correctly for the user
          throw new Error('Current user is not part of this chat.');
        }

        // 2. Fetch details for the other participant
        // This assumes you have a utility function `fetchUserDetails` that calls
        // your API Gateway (e.g., GET /api/users/:id/public or similar)
        // and handles authentication (using the token stored in localStorage/context)
        const userDetails = await fetchUserDetails(otherUserId);
        setOtherParticipant(userDetails);

      } catch (err) {
        console.error('Error fetching participant details:', err);
        setError('Failed to load participant');
        // Optionally, set a default name like 'User [ID]' if fetch fails
        // setOtherParticipant({ id: otherUserId, firstName: 'User', lastName: otherUserId.toString() });
      } finally {
        setLoading(false);
      }
    };

    getOtherParticipantDetails();
  }, [chat, currentUser]); // Re-run if chat or currentUser changes

  // Determine display name
  let displayName = 'Loading...';
  if (error) {
    displayName = 'Error';
  } else if (!loading && otherParticipant) {
    // Combine first and last name if available, otherwise fallback
    displayName = `${otherParticipant.firstName || ''} ${otherParticipant.lastName || ''}`.trim() ||
                  otherParticipant.email || // Fallback to email if names aren't available
                  `User ${otherParticipant.id}`;
  } else if (!loading && !otherParticipant) {
      // Edge case: chat exists but participant data couldn't be determined
      displayName = 'Unknown User';
  }
  // If loading is true, displayName remains 'Loading...'

  return (
    <div
      className={`chat-list-item ${isActive ? 'active' : ''}`}
      onClick={onClick}
    >
      <div className="chat-list-item-info">
        {/* Placeholder for avatar if you add user avatars later */}
        {/* <div className="avatar-placeholder"></div> */}
        <div>
          <h4>{displayName}</h4>
          {/* Placeholder for last message preview and time */}
          {/* <p className="last-message-preview">Last message...</p>
          <span className="last-message-time">HH:MM</span> */}
        </div>
      </div>
    </div>
  );
};

export default ChatListItem;