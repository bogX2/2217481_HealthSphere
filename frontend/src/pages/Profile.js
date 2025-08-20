// frontend/src/pages/Profile.js
import React, { useState } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { useNavigate } from 'react-router-dom';
import '../styles/Profile.css';

const Profile = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  if (!currentUser) return <div>Caricamento...</div>;

  const handleStartChat = () => {
    navigate('/chat');
  };
  
  const handleManageChats = () => {
    navigate('/chat');
  };

  return (
    <>
      <div className="header-outside">
        <img src="/logo192.png" alt="HealthSphere Logo" className="logo-outside-img" />
        <h1 className="header-title">HealthSphere</h1>
      </div>
      <div className="profile-page">
        <section className="welcome-section">
          <h2>Benvenuto, {currentUser.profile?.firstName || currentUser.firstName}!</h2>
        </section>
        <nav className="options-nav">
          <ul className="options-list profile-buttons">
            {currentUser.role === 'patient' && (
              <>
                <li><button className="btn primary-btn" onClick={() => navigate('/infomanagement')}>Modifica dati personali</button></li>
                <li><button className="btn primary-btn" onClick={() => navigate('/doctors/search')}>Find a Doctor</button></li>
                <li><button className="btn primary-btn" onClick={() => navigate('/appointments')}>Prenota un appuntamento</button></li>
                <li><button className="btn primary-btn" onClick={handleStartChat}>Inizia una nuova chat</button></li>
              </>
            )}
            {currentUser.role === 'doctor' && (
              <>
                <li><button className="btn secondary-btn" onClick={() => navigate('/infomanagement')}>Modifica dati personali</button></li>

                <li><button className="btn secondary-btn" onClick={() => navigate('/collaborations/pending')}>Pending Requests</button></li>
                <li><button className="btn secondary-btn" onClick={() => navigate('/collaborations')}>My Collaborations</button></li>

                <li><button className="btn secondary-btn" onClick={() => navigate('/appointments')}>Visualizza appuntamenti</button></li>
                <li><button className="btn secondary-btn" onClick={handleManageChats}>Gestisci chat</button></li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </>
  );
};

export default Profile;