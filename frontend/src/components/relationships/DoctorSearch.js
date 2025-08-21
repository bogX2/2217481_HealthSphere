// src/components/relationships/DoctorSearch.js
import React, { useState, useEffect } from 'react';
import DoctorCard from './DoctorCard';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const DoctorSearch = () => {
  const [doctors, setDoctors] = useState([]);
  const [allDoctors, setAllDoctors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [error, setError] = useState(null); // This was causing the warning

  useEffect(() => {
    fetchAllDoctors();
  }, []);

  const fetchAllDoctors = async () => {
    setError(null); // Reset error before fetching
    const token = localStorage.getItem('token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    setLoading(true);
    try {
      const response = await api.get('/doctors/search', { headers });
      
      const doctorsWithDetails = response.data.doctors.map(doctor => ({
        ...doctor,
        name: `${doctor.firstName || ''} ${doctor.lastName || ''}`.trim() || doctor.specialty || 'Doctor'
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
    
    const filtered = allDoctors.filter(doctor => 
      `${doctor.firstName} ${doctor.lastName} ${doctor.specialty}`.toLowerCase().includes(query)
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
    <div className="container-fluid px-4 py-3">
      <div className="row mb-4">
        <div className="col-12 text-center">
          <h1 className="display-4 fw-bold mb-4">Find a Doctor</h1>
          
          <div className="col-lg-8 mx-auto">
            <div className="input-group input-group-lg mb-4">
              <input
                type="text"
                className="form-control rounded-start-pill ps-4 py-3"
                placeholder="Search by doctor name, specialty, or location..."
                value={searchQuery}
                onChange={handleSearch}
                onKeyPress={e => e.key === 'Enter' && handleSearch(e)}
              />
              <button
                className="btn btn-primary rounded-end-pill px-4 py-3"
                onClick={() => document.querySelector('input[type="text"]').focus()}
                disabled={loading}
              >
                {loading ? (
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                ) : null}
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>
          
          {error && (
            <div className="col-lg-8 mx-auto">
              <div className="alert alert-danger rounded-3">
                {error}
                <button 
                  className="btn btn-sm btn-outline-light ms-3"
                  onClick={fetchAllDoctors}
                >
                  Retry
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="row mb-4">
        <div className="col-12 text-center">
          <h4 className="text-muted">
            <strong className="text-dark fs-3">{doctors.length}</strong> doctor{doctors.length !== 1 ? 's' : ''} found
          </h4>
        </div>
      </div>

      <div className="row g-4 justify-content-center">
        {loading ? (
          <div className="col-12 text-center py-5">
            <div className="spinner-border text-primary" role="status" style={{ width: "3rem", height: "3rem" }}>
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-4 fs-5">Searching for doctors...</p>
          </div>
        ) : doctors.length === 0 ? (
          <div className="col-lg-8">
            <div className="alert alert-info rounded-3 py-4 text-center">
              {searchQuery 
                ? 'No doctors found matching your search criteria. Try different keywords.'
                : 'No doctors available in the system. Please check back later.'}
            </div>
          </div>
        ) : (
          doctors.map(doctor => (
            <div key={doctor.id} className="col-xl-3 col-lg-4 col-md-6 col-sm-8">
              <DoctorCard
                doctor={doctor}
                onActionClick={() => handleRequestCollaboration(doctor.id)}
                actionLabel="Request Collaboration"
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DoctorSearch;