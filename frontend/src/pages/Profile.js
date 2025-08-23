import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Profile.css';

const Profile = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const loadUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) return setUser(null);

    try {
      const res = await axios.get('http://localhost:8081/api/users/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data.user);
    } catch (err) {
      setUser(null);
    }
  };

  useEffect(() => {
    loadUser(); // caricamento iniziale
    window.addEventListener('authChanged', loadUser);
    return () => window.removeEventListener('authChanged', loadUser);
  }, []);

  if (!user) return <div>Caricamento...</div>;

  const handleStartChat = () => navigate('/chat');
  const handleManageChats = () => navigate('/chat');

  return (
    <div>
      <div className="header-outside">
        <img src="/logo192.png" alt="HealthSphere Logo" className="logo-outside-img" />
        <h1 className="header-title">HealthSphere</h1>
      </div>
      <div className="profile-page">
        <section className="welcome-section">
          <h2>Benvenuto, {user.profile?.firstName || user.firstName}!</h2>
        </section>
        <nav className="options-nav">
          <ul className="options-list profile-buttons">
            {user.role === 'patient' && (
              <>
                <li><button className="btn primary-btn" onClick={() => navigate('/infomanagement')}>Modifica dati personali</button></li>
                <li><button className="btn primary-btn" onClick={() => navigate('/doctors/search')}>Find a Doctor</button></li>
                <li><button className="btn primary-btn" onClick={() => navigate('/collaborations')}>My Collaborations</button></li>
                <li><button className="btn primary-btn" onClick={() => navigate('/appointments')}>Prenota un appuntamento</button></li>
                <li><button className="btn primary-btn" onClick={handleStartChat}>Inizia una nuova chat</button></li>
              </>
            )}
            {user.role === 'doctor' && (
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
    </div>
  );
};

export default Profile;
