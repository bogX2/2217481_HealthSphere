// frontend/src/components/Chat/ChatSearch.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './ChatSearch.css';

const ChatSearch = ({ currentUser, onChatSelected, onBack }) => {
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCollaborations();
  }, []);

  const fetchCollaborations = async () => {
  try {
    setLoading(true);
    setError('');
    
    const token = localStorage.getItem('token'); // recupera il token
    let collaborations = [];
    
    if (currentUser.role === 'doctor') {
      const response = await api.get('doctors/relationships/doctor', {
        headers: { Authorization: `Bearer ${token}` }
      });
      collaborations = response.data.requests || [];
    } else if (currentUser.role === 'patient') {
      const response = await api.get('doctors/relationships/patient', {
        headers: { Authorization: `Bearer ${token}` }
      });
      collaborations = response.data.relationships || [];
    }
    
    // estrazione utenti
    const users = collaborations
      .filter(collab => collab.status === 'active')
      .map(collab => {
        if (currentUser.role === 'doctor') {
          return {
            ...collab.patient,
            id: collab.patientId,
            role: 'patient',
            hasRelationship: true
          };
        } else {
          return {
            ...collab.doctor,
            id: collab.doctorId,
            role: 'doctor',
            hasRelationship: true
          };
        }
      });
    
    setSearchResults(users);
  } catch (err) {
    console.error('Error fetching collaborations:', err);
    setError('Failed to load your collaborations');
  } finally {
    setLoading(false);
  }
};

  const handleUserSelect = async (user) => {
    try {
      const token = localStorage.getItem('token');
      // Create chat with the selected user (should always succeed since we filtered by relationships)
      const response = await api.post('/api/communication', {
        participant1Id: currentUser.id,
        participant2Id: user.id
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      onChatSelected(response.data.chat);
    } catch (err) {
      console.error('Error creating chat:', err);
      // This should not happen since we're only showing users with active relationships
      if (err.response && err.response.status === 403) {
        setError('Cannot chat with this user. No valid relationship exists.');
      } else {
        setError('Failed to start chat. Please try again.');
      }
    }
  };

  return (
    <div className="chat-search">
      <div className="search-header">
        <button className="back-button" onClick={onBack}>
          ← Back to Chats
        </button>
        <h2>Start New Chat</h2>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      {loading ? (
        <div className="loading">Loading your collaborations...</div>
      ) : searchResults.length === 0 ? (
        <div className="no-results">
          You don't have any active collaborations yet.<br />
          <button 
            className="primary-button" 
            onClick={() => navigate('/doctors/search')}
          >
            Find Doctors
          </button>
        </div>
      ) : (
        <div className="search-results">
          {searchResults.map(user => {
            const isValidRelationship = user.hasRelationship;
            return (
              <div
                key={user.id}
                className={`search-result-item ${!isValidRelationship ? 'disabled' : ''}`}
                onClick={isValidRelationship ? () => handleUserSelect(user) : null}
                title={isValidRelationship 
                  ? '' 
                  : 'Cannot start chat without a valid relationship'}
              >
                <div className="user-avatar">
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </div>
                <div className="user-info">
                  <div className="user-name">
                    {user.firstName} {user.lastName}
                  </div>
                  <div className="user-role">
                    {user.role === 'doctor' ? 'Doctor' : 'Patient'}
                  </div>
                </div>
                {!isValidRelationship && (
                  <div className="relationship-warning">
                    No active relationship
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ChatSearch;