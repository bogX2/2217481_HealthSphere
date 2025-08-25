import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Profile.css'; // Assicurati che questo sia il file CSS che abbiamo aggiornato

const Profile = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Questa logica per caricare l'utente non cambia
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

  // Anche questo hook non cambia
  useEffect(() => {
    loadUser(); // caricamento iniziale
    window.addEventListener('authChanged', loadUser);
    return () => window.removeEventListener('authChanged', loadUser);
  }, []);

  // Messaggio di caricamento con la nuova classe CSS
  if (!user) {
    return <div className="loading-text">Caricamento del profilo...</div>;
  }
  
  // Le funzioni di navigazione rimangono le stesse
  const handleStartChat = () => navigate('/chat');
  const handleManageChats = () => navigate('/chat');

  return (
    <div>
      {/* L'header rimane invariato */}
      <div className="header-outside">
        <img src="/logo192.png" alt="HealthSphere Logo" className="logo-outside-img" />
        <h1 className="header-title">HealthSphere</h1>
      </div>

      {/* Abbiamo rinominato la classe del contenitore principale */}
      <div className="profile-container">
        <section className="welcome-section">
          <h2>Benvenuto, {user.profile?.firstName || user.firstName}!</h2>
        </section>

        {/* Qui inizia la NUOVA STRUTTURA a griglia */}
        <div className="options-grid">
          {/* Card visibili solo se l'utente è un 'patient' */}
          {user.role === 'patient' && (
            <>
              <div className="option-card" onClick={() => navigate('/infomanagement')} tabIndex="0">
                <div className="card-icon">👤</div>
                <h3 className="card-title">Dati Personali</h3>
                <p className="card-description">Visualizza e modifica le tue informazioni.</p>
              </div>
              <div className="option-card" onClick={() => navigate('/doctors/search')} tabIndex="0">
                <div className="card-icon">👩‍⚕️</div>
                <h3 className="card-title">Trova un Medico</h3>
                <p className="card-description">Cerca uno specialista e avvia una collaborazione.</p>
              </div>
              <div className="option-card" onClick={() => navigate('/collaborations')} tabIndex="0">
                <div className="card-icon">🤝</div>
                <h3 className="card-title">Le mie Collaborazioni</h3>
                <p className="card-description">Gestisci i medici con cui collabori.</p>
              </div>
              <div className="option-card" onClick={() => navigate('/bookappointment')} tabIndex="0">
                <div className="card-icon">📅</div>
                <h3 className="card-title">Prenota Appuntamento</h3>
                <p className="card-description">Fissa una nuova visita con un medico.</p>
              </div>
              <div className="option-card" onClick={handleStartChat} tabIndex="0">
                <div className="card-icon">💬</div>
                <h3 className="card-title">Inizia una Chat</h3>
                <p className="card-description">Contatta un professionista in tempo reale.</p>
              </div>
            </>
          )}

          {/* Card visibili solo se l'utente è un 'doctor' */}
          {user.role === 'doctor' && (
            <>
              <div className="option-card" onClick={() => navigate('/infomanagement')} tabIndex="0">
                <div className="card-icon">👤</div>
                <h3 className="card-title">Dati Personali</h3>
                <p className="card-description">Aggiorna il tuo profilo e le tue informazioni.</p>
              </div>
              <div className="option-card" onClick={() => navigate('/collaborations/pending')} tabIndex="0">
                <div className="card-icon">⏳</div>
                <h3 className="card-title">Richieste in Sospeso</h3>
                <p className="card-description">Rivedi le richieste di collaborazione dei pazienti.</p>
              </div>
              <div className="option-card" onClick={() => navigate('/collaborations')} tabIndex="0">
                <div className="card-icon">🤝</div>
                <h3 className="card-title">Le mie Collaborazioni</h3>
                <p className="card-description">Visualizza e gestisci i tuoi pazienti.</p>
              </div>
              <div className="option-card" onClick={() => navigate('/appointmentlist')} tabIndex="0">
                <div className="card-icon">🗓️</div>
                <h3 className="card-title">Visualizza Appuntamenti</h3>
                <p className="card-description">Controlla la tua agenda e le prossime visite.</p>
              </div>
              <div className="option-card" onClick={handleManageChats} tabIndex="0">
                <div className="card-icon">💬</div>
                <h3 className="card-title">Gestisci Chat</h3>
                <p className="card-description">Comunica in modo sicuro con i tuoi pazienti.</p>
              </div>
              <div className="option-card" onClick={() => navigate('/manageslots')} tabIndex="0">
                <div className="card-icon">⏰</div>
                <h3 className="card-title">Gestione Disponibilità</h3>
                <p className="card-description">Configura i tuoi orari e le tue disponibilità.</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;