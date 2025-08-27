import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Dropdown from './Dropdown';

const Profile = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const loadUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
      return;
    }

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
    loadUser();
    window.addEventListener('authChanged', loadUser);
    return () => window.removeEventListener('authChanged', loadUser);
  }, []);

  if (!user) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="ms-3 text-secondary">Loading profile...</p>
      </div>
    );
  }
  
  // 1. Definisci la funzione handleLogout
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.dispatchEvent(new Event('authChanged')); // Per notificare altri componenti del logout
    navigate('/');
  };

  const handleStartChat = () => navigate('/chat');
  const handleManageChats = () => navigate('/chat');

  return (
    <div className="d-flex flex-column bg-light vh-100">
      <header className="position-fixed top-0 start-0 w-100 p-4 d-flex justify-content-between align-items-center z-1" style={{ userSelect: 'none', backgroundColor: '#e8f7f5' }}>
        <div className="d-flex align-items-center">
          <img src="/logo192.png" alt="HealthSphere Logo" className="rounded-circle me-3" style={{ width: '60px', height: '60px', border: '3px solid #2a9d8f' }} />
          <h1 className="h4 fw-bold text-dark mb-0 d-none d-sm-block">HealthSphere</h1>
        </div>
        {/* 2. Passa la funzione come prop al componente Dropdown */}
        <Dropdown onLogout={handleLogout} />
      </header>

      {/* Main Dashboard Content */}
      <div className="container mt-5 pt-5 pb-5">
        <section className="mb-5 text-center pt-5">
          <h2 className="display-5 fw-bold text-success">Welcome, {user.profile?.firstName || user.firstName}!</h2>
        </section>

        {/* Options Grid */}
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {user.role === 'patient' && (
            <>
              <div className="col">
                <div className="card h-100 shadow-sm option-card" onClick={() => navigate('/infomanagement')}>
                  <div className="card-body text-center">
                    <div className="fs-1 mb-2">👤</div>
                    <h5 className="card-title fw-bold text-primary">Personal Information</h5>
                    <p className="card-text text-muted">View and modify your information.</p>
                  </div>
                </div>
              </div>
              <div className="col">
                <div className="card h-100 shadow-sm option-card" onClick={() => navigate('/doctors/search')}>
                  <div className="card-body text-center">
                    <div className="fs-1 mb-2">👩‍⚕️</div>
                    <h5 className="card-title fw-bold text-primary">Find a Doctor</h5>
                    <p className="card-text text-muted">Search for a specialist and start a collaboration.</p>
                  </div>
                </div>
              </div>
              <div className="col">
                <div className="card h-100 shadow-sm option-card" onClick={() => navigate('/collaborations')}>
                  <div className="card-body text-center">
                    <div className="fs-1 mb-2">🤝</div>
                    <h5 className="card-title fw-bold text-primary">My Collaborations</h5>
                    <p className="card-text text-muted">Manage the doctors you collaborate with.</p>
                  </div>
                </div>
              </div>
              <div className="col">
                <div className="card h-100 shadow-sm option-card" onClick={() => navigate('/appointmentlist')}>
                  <div className="card-body text-center">
                    <div className="fs-1 mb-2">🗓️</div>
                    <h5 className="card-title fw-bold text-primary">View Appointments</h5>
                    <p className="card-text text-muted">Check your schedule and upcoming visits.</p>
                  </div>
                </div>
              </div>
              <div className="col">
                <div className="card h-100 shadow-sm option-card" onClick={handleStartChat}>
                  <div className="card-body text-center">
                    <div className="fs-1 mb-2">💬</div>
                    <h5 className="card-title fw-bold text-primary">Start a Chat</h5>
                    <p className="card-text text-muted">Contact a professional in real-time.</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {user.role === 'doctor' && (
            <>
              <div className="col">
                <div className="card h-100 shadow-sm option-card" onClick={() => navigate('/infomanagement')}>
                  <div className="card-body text-center">
                    <div className="fs-1 mb-2">👤</div>
                    <h5 className="card-title fw-bold text-primary">Personal Information</h5>
                    <p className="card-text text-muted">Update your profile and information.</p>
                  </div>
                </div>
              </div>
              <div className="col">
                <div className="card h-100 shadow-sm option-card" onClick={() => navigate('/collaborations/pending')}>
                  <div className="card-body text-center">
                    <div className="fs-1 mb-2">⏳</div>
                    <h5 className="card-title fw-bold text-primary">Pending Requests</h5>
                    <p className="card-text text-muted">Review patient collaboration requests.</p>
                  </div>
                </div>
              </div>
              <div className="col">
                <div className="card h-100 shadow-sm option-card" onClick={() => navigate('/collaborations')}>
                  <div className="card-body text-center">
                    <div className="fs-1 mb-2">🤝</div>
                    <h5 className="card-title fw-bold text-primary">My Collaborations</h5>
                    <p className="card-text text-muted">View and manage your patients.</p>
                  </div>
                </div>
              </div>
              <div className="col">
                <div className="card h-100 shadow-sm option-card" onClick={() => navigate('/appointmentlist')}>
                  <div className="card-body text-center">
                    <div className="fs-1 mb-2">🗓️</div>
                    <h5 className="card-title fw-bold text-primary">View Appointments</h5>
                    <p className="card-text text-muted">Check your schedule and upcoming visits.</p>
                  </div>
                </div>
              </div>
              <div className="col">
                <div className="card h-100 shadow-sm option-card" onClick={handleManageChats}>
                  <div className="card-body text-center">
                    <div className="fs-1 mb-2">💬</div>
                    <h5 className="card-title fw-bold text-primary">Manage Chats</h5>
                    <p className="card-text text-muted">Communicate securely with your patients.</p>
                  </div>
                </div>
              </div>
              <div className="col">
                <div className="card h-100 shadow-sm option-card" onClick={() => navigate('/manageslots')}>
                  <div className="card-body text-center">
                    <div className="fs-1 mb-2">⏰</div>
                    <h5 className="card-title fw-bold text-primary">Manage Availability</h5>
                    <p className="card-text text-muted">Configure your hours and availability.</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      {/* Styles for hover and focus on cards */}
      <style jsx="true">{`
        .option-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          cursor: pointer;
        }
        .option-card:hover,
        .option-card:focus-visible {
          transform: translateY(-8px);
          box-shadow: 0 1rem 3rem rgba(0, 0, 0, 0.175) !important;
          outline: none;
        }
        .option-card:focus-visible {
          outline: 3px solid #1f776d;
          outline-offset: 4px;
        }
      `}</style>
    </div>
  );
};

export default Profile;