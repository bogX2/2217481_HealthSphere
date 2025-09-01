// src/components/layout/Header.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Dropdown from '../../pages/Dropdown';


const Header = ({ user }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.dispatchEvent(new Event('authChanged'));
    navigate('/');
  };

  return (
    <header className="position-fixed top-0 start-0 w-100 p-4 d-flex justify-content-between align-items-center z-3" style={{ userSelect: 'none', backgroundColor: '#e8f7f5' }}>
      <div className="d-flex align-items-center" style={{ cursor: 'pointer' }} onClick={() => navigate('/profile')}>
        <img src="/logo192.png" alt="HealthSphere Logo" className="rounded-circle me-3" style={{ width: '60px', height: '60px', border: '3px solid #2a9d8f' }} />
        <h1 className="h4 fw-bold text-dark mb-0 d-none d-sm-block">HealthSphere</h1>
      </div>
      {/* Se l'utente è loggato, mostra il menu a tendina */}
      {user && <Dropdown onLogout={handleLogout} />}
    </header>
  );
};

export default Header;