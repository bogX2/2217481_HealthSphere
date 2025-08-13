import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/Profile.css';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get('http://localhost:8081/api/users/profile', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setUser(res.data.user))
    .catch(() => setError('Errore nel caricamento del profilo'));
  }, []);

  if (error) return <div className="error-text">{error}</div>;
  if (!user) return <div>Caricamento...</div>;

  const handleOptionClick = (option) => {
    setSelectedOption(option);
  };

return (
  <>
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
              <li><button className="btn primary-btn" onClick={() => handleOptionClick('editProfile')}>Modifica dati personali</button></li>
              <li><button className="btn primary-btn" onClick={() => handleOptionClick('bookAppointment')}>Prenota un appuntamento</button></li>
              <li><button className="btn primary-btn" onClick={() => handleOptionClick('startChat')}>Inizia una nuova chat</button></li>
              <li><button className="btn primary-btn" onClick={() => handleOptionClick('searchDoctors')}>Cerca dottori</button></li>
            </>
          )}

          {user.role === 'doctor' && (
            <>
              <li><button className="btn secondary-btn" onClick={() => handleOptionClick('editProfile')}>Modifica dati personali</button></li>
              <li><button className="btn secondary-btn" onClick={() => handleOptionClick('viewAppointments')}>Visualizza appuntamenti</button></li>
              <li><button className="btn secondary-btn" onClick={() => handleOptionClick('manageChats')}>Gestisci chat</button></li>
            </>
          )}
        </ul>
      </nav>

      <section className="selected-option">
        {selectedOption === 'editProfile' && <div>Modulo modifica dati qui</div>}
        {selectedOption === 'bookAppointment' && <div>Modulo prenotazione qui</div>}
        {selectedOption === 'startChat' && <div>Modulo chat qui</div>}
        {selectedOption === 'searchDoctors' && <div>Modulo ricerca dottori qui</div>}
        {selectedOption === 'viewAppointments' && <div>Appuntamenti</div>}
        {selectedOption === 'manageChats' && <div>Chat</div>}
      </section>
    </div>
  </>
);


};

export default Profile;
