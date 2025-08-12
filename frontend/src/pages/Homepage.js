import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Homepage.css'

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      
      <header className="home-header">
       
      </header>

      <main className="home-main">
        <img
          src="/logo192.png"
          alt="HealthSphere Logo"
          className="home-logo"
        />
        <h1 className="home-title">HealthSphere</h1>
        <p className="home-description">
          Your personal healthcare management platform — easy, secure, and efficient.
        </p>

        <div className="home-buttons">
          <button onClick={() => navigate('/login')} className="btn primary-btn">
            Login
          </button>
          <button onClick={() => navigate('/register')} className="btn secondary-btn">
            Register
          </button>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
