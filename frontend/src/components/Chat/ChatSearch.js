// frontend/src/components/Chat/ChatSearch.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../auth/AuthProvider';
import api from '../../utils/api';
import './ChatSearch.css';

const ChatSearch = ({ currentUser, onChatSelected, onBack }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { token } = useAuth();

  useEffect(() => {
    if (searchQuery.length > 2) {
      handleSearch();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get('/api/communication/users/search', {
        params: { 
          query: searchQuery,
          excludeUserId: currentUser.id
        },
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Process the results to include relationship info
      const usersWithRelationship = response.data.users.map(user => ({
        ...user,
        // Default to false if not provided by backend
        hasRelationship: user.hasRelationship !== undefined ? user.hasRelationship : false
      }));
      
      setSearchResults(usersWithRelationship);
    } catch (err) {
      console.error('Error searching users:', err);
      setError('Errore durante la ricerca degli utenti');
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = async (user) => {
    try {
      // Check if a chat already exists or create a new one
      const response = await api.post('/api/communication/chats', {
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
      
      // Handle specific error for relationship validation
      if (err.response && err.response.status === 403) {
        setError('Non è possibile avviare una chat con questo utente. Non esiste una relazione valida (prenotazione/appuntamento).');
      } else {
        setError('Impossibile avviare la chat. Riprova.');
      }
    }
  };

  return (
    <div className="chat-search">
      <div className="search-header">
        <input
          type="text"
          placeholder="Cerca utente..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
        <button className="back-button" onClick={onBack}>
          ← Indietro
        </button>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="search-results">
        {searchQuery.length <= 2 ? (
          <div className="search-instructions">
            Inserisci almeno 3 caratteri per cercare un utente
          </div>
        ) : loading ? (
          <div className="loading">Ricerca in corso...</div>
        ) : searchResults.length === 0 && searchQuery.length > 2 ? (
          <div className="no-results">
            Nessun utente trovato
          </div>
        ) : (
          searchResults.map(user => {
            // Determine if this user has a valid relationship
            const isValidRelationship = user.hasRelationship || 
              (currentUser.role === 'doctor' && user.role === 'patient') || 
              (currentUser.role === 'patient' && user.role === 'doctor');
            
            return (
              <div 
                key={user.id} 
                className={`search-result-item ${!isValidRelationship ? 'disabled' : ''}`}
                onClick={isValidRelationship ? () => handleUserSelect(user) : null}
                title={isValidRelationship ? 
                  '' : 
                  'Non è possibile avviare una chat senza una relazione valida (prenotazione/appuntamento)'}
              >
                <div className="user-avatar">
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </div>
                <div className="user-info">
                  <div className="user-name">
                    {user.firstName} {user.lastName}
                  </div>
                  <div className="user-role">
                    {user.role === 'doctor' ? 'Medico' : 'Paziente'}
                  </div>
                </div>
                {!isValidRelationship && (
                  <div className="relationship-warning">
                    Nessuna relazione valida
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ChatSearch;