// src/components/relationships/MyCollaborations.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';  // Import the configured API instance

const MyCollaborations = () => {
  const [collaborations, setCollaborations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('active');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCollaborations();
    
    // Set up polling for real-time updates (every 30 seconds)
    const interval = setInterval(fetchCollaborations, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchCollaborations = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please log in to view collaborations');
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      let url = '';
      const headers = { 'Authorization': `Bearer ${token}` };
      
      // Determine which endpoint to call based on user role
      try {
        const profileResponse = await api.get('/users/profile', { headers });
        const userRole = profileResponse.data.user.role;
        
        if (userRole === 'doctor') {
          url = '/doctors/relationships/doctor';
        } else {
          url = '/doctors/relationships/patient';
        }
        
        const response = await api.get(url, { headers });
        setCollaborations(response.data.relationships);
      } catch (profileErr) {
        console.error('Failed to get user profile:', profileErr);
        setError('Failed to determine user role. Please log in again.');
      }
    } catch (err) {
      console.error('Failed to load collaborations:', err);
      
      let errorMessage = 'Failed to load collaborations';
      if (err.response?.data?.error) {
        errorMessage += ': ' + err.response.data.error;
      } else if (err.response?.status === 401) {
        errorMessage = 'Please log in to view collaborations';
        setTimeout(() => navigate('/login'), 2000);
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleTerminate = async (relationshipId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please log in to manage collaborations');
      return;
    }
    
    if (!window.confirm('Are you sure you want to terminate this collaboration?')) {
      return;
    }
    
    try {
      await api.put(`/doctors/relationships/${relationshipId}/terminate`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Update UI immediately
      setCollaborations(collaborations.filter(c => c.id !== relationshipId));
      alert('Collaboration terminated successfully');
    } catch (err) {
      let errorMessage = 'Failed to terminate collaboration';
      if (err.response?.data?.error) {
        errorMessage += ': ' + err.response.data.error;
      } else if (err.response?.status === 401) {
        errorMessage = 'Please log in to manage collaborations';
        setTimeout(() => navigate('/login'), 2000);
      }
      
      setError(errorMessage);
      console.error(err);
    }
  };

  const filterCollaborations = () => {
    return collaborations.filter(c => c.status === activeTab);
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>My Collaborations</h1>
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/doctors/search')}
        >
          Find a Doctor
        </button>
      </div>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      <div className="card mb-4">
        <div className="card-header">
          <ul className="nav nav-tabs card-header-tabs">
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'active' ? 'active' : ''}`}
                onClick={() => setActiveTab('active')}
              >
                Active
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'pending' ? 'active' : ''}`}
                onClick={() => setActiveTab('pending')}
              >
                Pending
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'terminated' ? 'active' : ''}`}
                onClick={() => setActiveTab('terminated')}
              >
                Terminated
              </button>
            </li>
          </ul>
        </div>
        <div className="card-body">
          {loading ? (
            <div className="text-center">Loading collaborations...</div>
          ) : filterCollaborations().length === 0 ? (
            <div className="text-center py-4">
              <p>No {activeTab} collaborations found.</p>
              {activeTab === 'active' && (
                <button 
                  className="btn btn-outline-primary mt-2"
                  onClick={() => navigate('/doctors/search')}
                >
                  Find a Doctor to Collaborate With
                </button>
              )}
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Partner</th>
                    <th>Started</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filterCollaborations().map(c => (
                    <tr key={c.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="avatar bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2" 
                               style={{ width: '30px', height: '30px' }}>
                            {c.doctor ? 
                              (c.doctor.user?.name?.charAt(0) || c.doctor.name?.charAt(0) || 'D') :
                              (c.patient.user?.name?.charAt(0) || c.patient.name?.charAt(0) || 'P')}
                          </div>
                          <span>
                            {c.doctor ? 
                              (c.doctor.user?.name || c.doctor.name) :
                              (c.patient.user?.name || c.patient.name)}
                          </span>
                        </div>
                      </td>
                      <td>
                        {new Date(c.requestedAt).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </td>
                      <td>
                        <span className={`badge ${
                          c.status === 'active' ? 'bg-success' :
                          c.status === 'pending' ? 'bg-warning text-dark' :
                          'bg-secondary'
                        }`}>
                          {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                        </span>
                      </td>
                      <td>
                        {c.status === 'active' && (
                          <div className="d-flex gap-2">
                            <button 
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => navigate(`/appointments/book/${c.doctor ? c.doctor.id : c.patient.id}`)}
                            >
                              Book Appointment
                            </button>
                            <button 
                              className="btn btn-sm btn-outline-info"
                              onClick={() => navigate(`/chat?with=${c.doctor ? c.doctor.id : c.patient.id}`)}
                            >
                              Chat
                            </button>
                            <button 
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleTerminate(c.id)}
                            >
                              Terminate
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyCollaborations;