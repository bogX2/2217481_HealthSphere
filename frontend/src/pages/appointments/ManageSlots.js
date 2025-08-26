import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Dropdown from '../Dropdown'; // Assicurati che il percorso sia corretto

const ManageSlots = () => {
  const [slots, setSlots] = useState([]);
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const backendURL = 'http://localhost:8083/api/appointments';

  const fetchSlots = useCallback(async () => {
    try {
      const userId = localStorage.getItem('userId');
      const res = await axios.get(`${backendURL}/slots/doctor/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSlots(res.data.slots || []);
    } catch (err) {
      console.error('Error fetching slots:', err);
      setError('Unable to retrieve slots.');
    }
  }, [backendURL, token]);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.dispatchEvent(new Event('authChanged'));
    navigate('/');
  };

  const handleCreateSlot = async (e) => {
    e.preventDefault();
    setError('');

    if (!date || !startTime || !endTime) {
      return setError('Please fill in all fields.');
    }

    if (startTime >= endTime) {
      return setError('Start time must be before end time.');
    }

    try {
      const res = await axios.post(
        `${backendURL}/slots`,
        { date, startTime, endTime },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSlots([...slots, res.data.slot]);
      setDate('');
      setStartTime('');
      setEndTime('');
      alert('Slot created successfully!');
    } catch (err) {
      console.error('Error creating slot:', err);
      setError(err.response?.data?.error || 'Unknown error creating slot.');
    }
  };

  return (
    <div className="d-flex flex-column align-items-center vh-100 overflow-y-auto" style={{ backgroundColor: '#e8f7f5', paddingTop: '120px' }}>
      {/* 🔹 Static Header with Dropdown Menu */}
      <header className="position-fixed top-0 start-0 w-100 p-4 mb-4 d-flex justify-content-between align-items-center z-1" style={{ userSelect: 'none', backgroundColor: '#e8f7f5' }}>
        <div className="d-flex align-items-center">
          <img src="/logo192.png" alt="HealthSphere Logo" className="rounded-circle me-3" style={{ width: '60px', height: '60px', border: '3px solid #2a9d8f' }} />
          <h1 className="h4 fw-bold text-dark mb-0 d-none d-sm-block">HealthSphere</h1>
        </div>
        <Dropdown onLogout={handleLogout} />
      </header>

      {/* Main Content Card */}
      <div className="card shadow-lg p-4 p-md-5 rounded-4 my-5" style={{ maxWidth: '800px', width: '100%', borderColor: 'transparent', backgroundColor: '#ffffff' }}>
        <h2 className="text-center mb-4 h3 fw-bold">Manage Availability Slots</h2>

        {/* 1️⃣ Create Slot Form */}
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <h5 className="card-title fw-bold">1. Create a New Slot</h5>
            <p className="card-text text-muted mb-4">
              Specify the date and time to create an available slot for appointments.
            </p>
            {error && <div className="alert alert-danger" role="alert">{error}</div>}
            <form onSubmit={handleCreateSlot}>
              <div className="row g-3">
                <div className="col-md-4">
                  <label htmlFor="slotDate" className="form-label fw-bold">Date</label>
                  <input type="date" className="form-control rounded-pill" id="slotDate" value={date} onChange={e => setDate(e.target.value)} required />
                </div>
                <div className="col-md-4">
                  <label htmlFor="startTime" className="form-label fw-bold">Start Time</label>
                  <input type="time" className="form-control rounded-pill" id="startTime" value={startTime} onChange={e => setStartTime(e.target.value)} required />
                </div>
                <div className="col-md-4">
                  <label htmlFor="endTime" className="form-label fw-bold">End Time</label>
                  <input type="time" className="form-control rounded-pill" id="endTime" value={endTime} onChange={e => setEndTime(e.target.value)} required />
                </div>
              </div>
              <div className="d-grid mt-4">
                <button type="submit" className="btn btn-primary btn-lg rounded-pill" style={{ backgroundColor: '#2a9d8f', borderColor: '#2a9d8f' }}>Create Slot</button>
              </div>
            </form>
          </div>
        </div>

        {/* 2️⃣ Available Slots List */}
        <div className="card shadow-sm">
          <div className="card-body">
            <h5 className="card-title fw-bold">2. Available Slots</h5>
            <div className="list-group">
              {slots.length === 0 ? (
                <p className="text-muted text-center">No slots available.</p>
              ) : (
                slots.map((slot) => (
                  <li key={slot.id} className="list-group-item d-flex justify-content-between align-items-center">
                    <span>
                      <strong>{slot.date}</strong> from {slot.startTime} to {slot.endTime}
                    </span>
                    <span className={`badge ${slot.isBooked ? 'bg-danger' : 'bg-success'} rounded-pill`}>
                      {slot.isBooked ? 'Booked' : 'Available'}
                    </span>
                  </li>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageSlots;