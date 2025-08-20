import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import DoctorCard from './DoctorCard';

const DoctorSearch = () => {
  const [doctors, setDoctors] = useState([]);
  const [allDoctors, setAllDoctors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllDoctors();
  }, []);

  const fetchAllDoctors = async () => {
    const token = localStorage.getItem('token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    setLoading(true);
    try {
      // Get ALL doctors first
      const response = await api.get('/doctors/search', { headers });
      
      // Fetch user details for each doctor to get their name
      const doctorsWithDetails = await Promise.all(response.data.doctors.map(async (doctor) => {
        try {
          const userResponse = await api.get(`/users/${doctor.userId}`, {
            headers: headers
          });
          
          return {
            ...doctor,
            name: `${userResponse.data.user.firstName} ${userResponse.data.user.lastName}`,
            email: userResponse.data.user.email
          };
        } catch (err) {
          console.error(`Error fetching user details for doctor ${doctor.id}:`, err);
          return {
            ...doctor,
            name: 'Doctor',
            email: ''
          };
        }
      }));
      
      setAllDoctors(doctorsWithDetails);
      setDoctors(doctorsWithDetails);
    } catch (err) {
      console.error('Failed to load doctors:', err);
      setError('Failed to load doctors. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    
    if (query.trim() === '') {
      setDoctors(allDoctors);
      return;
    }
    
    // Client-side filtering by name
    const filtered = allDoctors.filter(doctor => 
      doctor.name.toLowerCase().includes(query)
    );
    
    setDoctors(filtered);
  };

  const handleRequestCollaboration = async (doctorId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please log in to request collaborations');
      setTimeout(() => navigate('/login'), 2000);
      return;
    }
    
    try {
      await api.post('/doctors/relationships/request', {
        doctorId
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Update the UI immediately
      setDoctors(doctors.filter(d => d.id !== doctorId));
      setAllDoctors(allDoctors.filter(d => d.id !== doctorId));
      alert('Collaboration request sent successfully!');
    } catch (err) {
      let errorMessage = 'Failed to send request';
      if (err.response?.data?.error) {
        errorMessage += ': ' + err.response.data.error;
      } else if (err.response?.status === 401) {
        errorMessage = 'Please log in to request collaborations';
        setTimeout(() => navigate('/login'), 2000);
      }
      
      setError(errorMessage);
      console.error(err);
    }
  };

  return (
    <div className="container mt-4">
      <h1>Find a Doctor</h1>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      <div className="card mb-4">
        <div className="card-body">
          <div className="input-group">
            <input 
              type="text"
              className="form-control"
              placeholder="Search by doctor name..."
              value={searchQuery}
              onChange={handleSearch}
              onKeyPress={e => e.key === 'Enter' && handleSearch(e)}
            />
            <button 
              className="btn btn-primary"
              onClick={() => document.querySelector('input[type="text"]').focus()}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Search'}
            </button>
          </div>
        </div>
      </div>
      
      <div className="card mb-4">
        <div className="card-header">Debug Information</div>
        <div className="card-body">
          <p><strong>Token present:</strong> {localStorage.getItem('token') ? 'Yes' : 'No'}</p>
          <p><strong>Doctors Found:</strong> {doctors.length}</p>
          <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
          <p><strong>Search Query:</strong> "{searchQuery}"</p>
        </div>
      </div>
      
      {loading ? (
        <div className="text-center">Loading doctors...</div>
      ) : doctors.length === 0 ? (
        <div className="alert alert-info">
          {searchQuery ? 
            'No doctors found matching your search criteria' : 
            'No doctors available in the system'}
        </div>
      ) : (
        <div className="row">
          {doctors.map(doctor => (
            <div key={doctor.id} className="col-md-6 mb-4">
              <DoctorCard 
                doctor={doctor} 
                onActionClick={() => handleRequestCollaboration(doctor.id)}
                actionLabel="Request Collaboration"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorSearch;