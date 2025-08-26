import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Dropdown from '../Dropdown'; // Assumi che il percorso sia corretto come da struttura file

const BookAppointment = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [error, setError] = useState('');
  const [doctor, setDoctor] = useState(null);

  const token = localStorage.getItem('token');
  const backendURL = 'http://localhost:8083/api/appointments';

  // 🔹 Fetch Doctor Info
  const fetchDoctorInfo = useCallback(async () => {
    try {
      const res = await axios.get(`http://localhost:8082/api/doctors/${doctorId}`);
      setDoctor(res.data.doctor);
    } catch (err) {
      console.error('Error fetching doctor info:', err);
      setError('Unable to load doctor information.');
    }
  }, [doctorId]);

  // 🔹 Fetch Doctor's Available Slots
  const fetchSlots = useCallback(async () => {
    try {
      const res = await axios.get(`${backendURL}/doctor/${doctorId}/slots`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSlots(res.data.slots.filter(slot => !slot.isBooked) || []);
    } catch (err) {
      console.error('Error fetching slots:', err);
      setError('Unable to retrieve slots.');
    }
  }, [doctorId, backendURL, token]);

  useEffect(() => {
    fetchDoctorInfo();
    fetchSlots();
  }, [fetchDoctorInfo, fetchSlots]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.dispatchEvent(new Event('authChanged'));
    navigate('/');
  };

  // 🔹 Handle Appointment Booking
  const handleBook = async (e) => {
    e.preventDefault();
    setError('');
    if (!selectedSlot) return setError('Please select an available slot!');

    try {
      await axios.post(`${backendURL}/book-appointment`, { slotId: selectedSlot }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Appointment booked successfully!');
      fetchSlots(); // Refresh the slot list
      setSelectedSlot('');
    } catch (err) {
      console.error('Booking error:', err);
      setError(err.response?.data?.error || 'Error during booking.');
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
        <h2 className="text-center mb-4 h3 fw-bold">Book an Appointment</h2>

        {error && <div className="alert alert-danger" role="alert">{error}</div>}

        {doctor && (
            <div className="text-center mb-4">
                <h4 className="fw-bold">Doctor: {doctor.firstName} {doctor.lastName}</h4>
                <p className="text-muted">{doctor.doctor?.specialty}</p>
            </div>
        )}

        {slots.length === 0 ? (
          <div className="alert alert-info text-center" role="alert">
            No available slots at the moment.
          </div>
        ) : (
          <form onSubmit={handleBook}>
            <div className="mb-4">
              <label htmlFor="slotSelect" className="form-label fw-bold">Select an available slot:</label>
              <select
                id="slotSelect"
                className="form-select rounded-pill"
                value={selectedSlot}
                onChange={e => setSelectedSlot(e.target.value)}
                required
              >
                <option value="">-- Select a slot --</option>
                {slots.map(slot => (
                  <option key={slot._id} value={slot._id}>
                    {slot.date} {slot.startTime} - {slot.endTime}
                  </option>
                ))}
              </select>
            </div>
            <div className="d-grid">
              <button type="submit" className="btn btn-primary btn-lg rounded-pill" style={{ backgroundColor: '#2a9d8f', borderColor: '#2a9d8f' }}>Book</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default BookAppointment;