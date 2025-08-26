import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(true);

  const handleHide = (path) => {
    setVisible(false);
    setTimeout(() => navigate(path), 500); // Aspetta che l'animazione finisca
  };

  return (
    <div className={`d-flex flex-column justify-content-center align-items-center vh-100`} style={{ backgroundColor: '#e8f7f5' }}>
      <div className={`card shadow-lg p-5 rounded-4 text-center`} style={{ maxWidth: '600px', borderColor: 'transparent', backgroundColor: '#ffffff' }}>
        {/* Logo */}
        <div className="d-flex justify-content-center">
  <img src="/logo192.png" alt="HealthSphere Logo" className="img-fluid rounded-circle shadow-lg mb-4" style={{ width: '120px', height: '120px', border: '5px solid #2a9d8f' }} />
</div>
        
        {/* Titolo e Descrizione */}
        <h1 className="display-4 fw-bold text-dark mb-3">HealthSphere</h1>
        <div className="lead text-secondary mx-auto mb-5" style={{ maxWidth: '500px' }}>
          Your personal platform for health management.
          <p> Connect with professionals and manage your medical information easily and intuitively.</p>
        </div>
        
        {/* Bottoni Affiancati */}
        <div className="d-flex justify-content-center gap-3 flex-wrap">
          <button onClick={() => handleHide('/login')} className="btn btn-outline-success btn-lg rounded-pill px-5">
            Login
          </button>
          <button onClick={() => handleHide('/register')} className="btn btn-outline-primary btn-lg rounded-pill px-5">
            Register
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;