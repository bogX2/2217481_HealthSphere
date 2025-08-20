// src/components/relationships/PendingRequests.js
import React, { useState, useEffect } from 'react';
import api from '../../services/api';  // Import the configured API instance

const PendingRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRequests();
    
    // Set up polling for real-time updates (every 30 seconds)
    const interval = setInterval(fetchRequests, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchRequests = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please log in to view pending requests');
      return;
    }
    
    setLoading(true);
    try {
      const response = await api.get('/doctors/relationships/pending', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log('Pending requests response:', response.data);
      setRequests(response.data.requests);
    } catch (err) {
      console.error('Failed to load pending requests:', err);
      
      let errorMessage = 'Failed to load pending requests';
      if (err.response?.data?.error) {
        errorMessage += ': ' + err.response.data.error;
      } else if (err.response?.status === 401) {
        errorMessage = 'Please log in to view pending requests';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (requestId, action) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please log in to manage requests');
      return;
    }
    
    try {
      await api.put(`/doctors/relationships/${requestId}/${action}`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Update UI immediately
      setRequests(requests.filter(req => req.id !== requestId));
      
      if (action === 'accept') {
        alert('Collaboration request accepted!');
      } else {
        alert('Collaboration request rejected.');
      }
    } catch (err) {
      let errorMessage = `Failed to ${action} request`;
      if (err.response?.data?.error) {
        errorMessage += ': ' + err.response.data.error;
      } else if (err.response?.status === 401) {
        errorMessage = 'Please log in to manage requests';
      }
      
      setError(errorMessage);
      console.error(err);
    }
  };

  return (
    <div className="container mt-4">
      <h1>Pending Collaboration Requests</h1>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      {loading ? (
        <div className="text-center">Loading requests...</div>
      ) : requests.length === 0 ? (
        <div className="alert alert-info">
          You don't have any pending collaboration requests
        </div>
      ) : (
        <div className="card">
          <div className="card-body">
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Requested</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map(request => (
                    <tr key={request.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="avatar bg-secondary text-white rounded-circle d-flex align-items-center justify-content-center me-2" 
                               style={{ width: '30px', height: '30px' }}>
                            {request.patient.user?.name?.charAt(0) || 
                             request.patient.name?.charAt(0) || 'P'}
                          </div>
                          <span>{request.patient.user?.name || request.patient.name}</span>
                        </div>
                      </td>
                      <td>
                        {new Date(request.requestedAt).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <button 
                            className="btn btn-sm btn-success"
                            onClick={() => handleAction(request.id, 'accept')}
                          >
                            Accept
                          </button>
                          <button 
                            className="btn btn-sm btn-danger"
                            onClick={() => handleAction(request.id, 'reject')}
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingRequests;