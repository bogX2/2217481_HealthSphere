import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const MyCollaborations = () => {
  const [collaborations, setCollaborations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('active');
  const [userRole, setUserRole] = useState(null);
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
      // First, get the user profile to determine role
      const profileResponse = await api.get('/users/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log('Full profile response:', profileResponse.data);
      
      // ROBUST ROLE DETECTION - handles multiple formats
      let role = '';
      if (profileResponse.data.role) {
        role = profileResponse.data.role.toLowerCase();
      } else if (profileResponse.data.user && profileResponse.data.user.role) {
        role = profileResponse.data.user.role.toLowerCase();
      } else if (profileResponse.data.data && profileResponse.data.data.role) {
        role = profileResponse.data.data.role.toLowerCase();
      }
      
      console.log('Detected role (normalized):', role);
      setUserRole(role);
      
      // Get the appropriate relationships based on role
      let url;
      if (role.includes('doctor')) {
        url = '/doctors/relationships/doctor';
        console.log('✅ Fetching DOCTOR relationships from:', url);
      } else {
        url = '/doctors/relationships/patient';
        console.log('✅ Fetching PATIENT relationships from:', url);
      }
      
      const response = await api.get(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setCollaborations(response.data.relationships || []);
    } catch (err) {
      // Error handling remains the same...
    } finally {
      setLoading(false);
    }
  };

  const handleTerminate = async (relationshipId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please log in to terminate collaborations');
      return;
    }
    
    try {
      await api.put(`/doctors/relationships/${relationshipId}/terminate`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Update UI immediately
      setCollaborations(collaborations.filter(c => c.id !== relationshipId));
      alert('Collaboration terminated successfully!');
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
        {/* Only show Find a Doctor button for patients */}
        {userRole === 'patient' && (
          <button
            className="btn btn-primary"
            onClick={() => navigate('/doctors/search')}
          >
            Find a Doctor
          </button>
        )}
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
              {/* Only show this button for patients */}
              {activeTab === 'active' && userRole === 'patient' && (
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
                          <div className="avatar bg-secondary text-white rounded-circle d-flex align-items-center justify-content-center me-2" 
                              style={{ width: '30px', height: '30px' }}>
                            {userRole === 'doctor' 
                              ? (c.patient?.firstName?.charAt(0) || c.patient?.lastName?.charAt(0) || 'P')
                              : (c.doctor?.user?.firstName?.charAt(0) || c.doctor?.user?.lastName?.charAt(0) || 'D')
                            }
                          </div>
                          <span>
                            {userRole === 'doctor' 
                              ? `${c.patient?.firstName || ''} ${c.patient?.lastName || ''}`.trim() || 'Patient'
                              : `${c.doctor?.user?.firstName || ''} ${c.doctor?.user?.lastName || ''}`.trim() || 'Doctor'
                            }
                          </span>
                        </div>
                      </td>
                      <td>
                        {new Date(c.requestedAt).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td>
                        <span className={`badge ${c.status === 'active' ? 'bg-success' : c.status === 'pending' ? 'bg-warning' : 'bg-secondary'}`}>
                          {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => navigate(`/appointments/book/${userRole === 'doctor' ? c.patient?.id : c.doctor?.id}`)}
                          >
                            Book Appointment
                          </button>
                          <button
                            className="btn btn-sm btn-outline-info"
                            onClick={() => navigate(`/chat?with=${userRole === 'doctor' ? c.patient?.id : c.doctor?.id}`)}
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