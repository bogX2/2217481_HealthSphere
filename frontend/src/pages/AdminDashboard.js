import React from 'react';
import { useNavigate } from 'react-router-dom';
import Dropdown from './Dropdown';
import { PeopleFill, ShieldLock, GraphUp, PatchCheck } from 'react-bootstrap-icons';

const AdminDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.dispatchEvent(new Event('authChanged'));
    navigate('/');
  };

  return (
    <div className="d-flex flex-column bg-light min-vh-100">
      {/* Header */}
      <header
        className="position-fixed top-0 start-0 w-100 p-4 d-flex justify-content-between align-items-center z-1"
        style={{ userSelect: 'none', backgroundColor: '#e8f7f5' }}
      >
        <div
          className="d-flex align-items-center"
          style={{ cursor: 'pointer' }}
          onClick={() => navigate('/admin_dashboard')}
        >
          <img
            src="/logo192.png"
            alt="HealthSphere Logo"
            className="rounded-circle me-3"
            style={{ width: '60px', height: '60px', border: '3px solid #2a9d8f' }}
          />
          <h1 className="h4 fw-bold text-dark mb-0 d-none d-sm-block">HealthSphere Admin</h1>
        </div>
        <Dropdown onLogout={handleLogout} />
      </header>

      {/* Contenuto */}
      <div className="container mt-5 pt-5 pb-5">
        <section className="mb-5 text-center pt-5">
          <h2 className="display-5 fw-bold text-success">Admin Dashboard</h2>
          <p className="text-muted">Gestisci utenti, medici, prestazioni e sicurezza della piattaforma</p>
        </section>

        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-2 g-4">
          {/* User Management */}
          <div className="col">
            <div
              className="card h-100 shadow-sm option-card"
              onClick={() => navigate('/admin/users')}
            >
              <div className="card-body text-center d-flex flex-column justify-content-center align-items-center">
                <PeopleFill size={48} className="mb-3 text-success" />
                <h5 className="card-title fw-bold text-primary">User Account Management</h5>
                <p className="card-text text-muted">
                  View, modify or deactivate accounts of patients and doctors.
                </p>
              </div>
            </div>
          </div>

          {/* Doctor Verification */}
          <div className="col">
            <div
              className="card h-100 shadow-sm option-card"
              onClick={() => navigate('/admin/doctor-verification')}
            >
              <div className="card-body text-center d-flex flex-column justify-content-center align-items-center">
                <PatchCheck size={48} className="mb-3 text-success" />
                <h5 className="card-title fw-bold text-primary">Doctor Verification</h5>
                <p className="card-text text-muted">
                  Verify doctors’ credentials and review documentation.
                </p>
              </div>
            </div>
          </div>

          {/* Platform Monitoring */}
          <div className="col">
            <div
              className="card h-100 shadow-sm option-card"
              onClick={() => navigate('/admin/monitoring')}
            >
              <div className="card-body text-center d-flex flex-column justify-content-center align-items-center">
                <GraphUp size={48} className="mb-3 text-success" />
                <h5 className="card-title fw-bold text-primary">Platform Monitoring</h5>
                <p className="card-text text-muted">
                  Monitor performance and usage metrics of the platform.
                </p>
              </div>
            </div>
          </div>

          {/* Security & Privacy */}
          <div className="col">
            <div
              className="card h-100 shadow-sm option-card"
              onClick={() => navigate('/admin/security')}
            >
              <div className="card-body text-center d-flex flex-column justify-content-center align-items-center">
                <ShieldLock size={48} className="mb-3 text-success" />
                <h5 className="card-title fw-bold text-primary">Security & Privacy</h5>
                <p className="card-text text-muted">
                  Configure and update security policies and permissions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx="true">{`
        .option-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          cursor: pointer;
        }
        .option-card:hover,
        .option-card:focus-visible {
          transform: translateY(-8px);
          box-shadow: 0 1rem 3rem rgba(0, 0, 0, 0.175) !important;
        }
        .option-card:focus-visible {
          outline: 3px solid #1f776d;
          outline-offset: 4px;
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
