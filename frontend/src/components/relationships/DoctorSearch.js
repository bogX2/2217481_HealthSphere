// src/components/relationships/DoctorSearch.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, Button } from 'react-bootstrap'; // Modal da react-bootstrap
import api from '../../services/api';
import Header from '../layout/Header';
import DoctorCard from './DoctorCard';

const DoctorSearch = () => {
  const [doctors, setDoctors] = useState([]);
  const [allDoctors, setAllDoctors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null); // medico selezionato
  const [showModal, setShowModal] = useState(false); // stato modal

  const navigate = useNavigate();

  // Carica profilo utente
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await api.get('/users/profile', {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUser(res.data.user);
        } catch (err) {
          console.error('Failed to fetch user', err);
          setUser(null);
        }
      }
    };
    fetchUser();
  }, []);

  // Carica tutti i dottori
  useEffect(() => {
    const fetchAllDoctors = async () => {
      setError(null);
      setLoading(true);
      try {
        const response = await api.get('/doctors/search');
        const doctorsWithDetails = response.data.doctors.map((doctor) => ({
          ...doctor,
          name: `${doctor.firstName || ''} ${doctor.lastName || ''}`.trim() || doctor.specialty || 'Doctor',
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
    fetchAllDoctors();
  }, []);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = allDoctors.filter((doctor) =>
      `${doctor.firstName} ${doctor.lastName} ${doctor.specialty}`.toLowerCase().includes(query)
    );
    setDoctors(filtered);
  };

  const handleRequestCollaboration = async (doctorId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to request collaborations');
      navigate('/login');
      return;
    }
    try {
      await api.post(
        '/doctors/relationships/request',
        { doctorId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setDoctors((prev) => prev.filter((d) => d.id !== doctorId));
      setAllDoctors((prev) => prev.filter((d) => d.id !== doctorId));
      alert('Collaboration request sent successfully!');
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to send request';
      alert(errorMessage);
      console.error(err);
    }
  };

  const handleViewProfile = (doctor) => {
    setSelectedDoctor(doctor);
    setShowModal(true);
  };

  return (
    <div className="d-flex flex-column bg-light min-vh-100">
      <Header user={user} />

      <div className="container mt-5 pt-5 pb-5">
        {/* Sezione di ricerca */}
        <section className="mb-5 text-center pt-5">
          <h2 className="display-5 fw-bold text-success">Find a Specialist</h2>
          <p className="lead text-muted">Search for the right doctor and start a collaboration.</p>
          <div className="col-lg-8 mx-auto mt-4">
            <div className="input-group input-group-lg">
              <input
                type="text"
                className="form-control"
                placeholder="Search by name or specialty..."
                value={searchQuery}
                onChange={handleSearch}
              />
              <span className="input-group-text bg-success text-white">
                <i className="bi bi-search"></i>
              </span>
            </div>
          </div>
        </section>

        {/* Risultati */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-success" role="status" style={{ width: '3rem', height: '3rem' }}>
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : error ? (
          <div className="alert alert-danger col-lg-8 mx-auto">{error}</div>
        ) : (
          <>
            <div className="text-center mb-4">
              <h4 className="text-muted">
                <strong className="text-dark fs-3">{doctors.length}</strong> doctor
                {doctors.length !== 1 ? 's' : ''} found
              </h4>
            </div>

            {doctors.length > 0 ? (
              <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 row-cols-xl-4 g-4">
                {doctors.map((doctor) => (
                  <div key={doctor.id} className="col">
                    <DoctorCard
                      doctor={doctor}
                      onActionClick={() => handleRequestCollaboration(doctor.id)}
                      actionLabel="Request Collaboration"
                      onViewProfile={() => handleViewProfile(doctor)} // 👈 aggiunto per aprire il modal
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="alert alert-info col-lg-8 mx-auto text-center">
                No doctors found matching your search criteria. Try different keywords.
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal profilo medico */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{selectedDoctor?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p><strong>Specialty:</strong> {selectedDoctor?.specialty}</p>
          <p><strong>Experience:</strong> {selectedDoctor?.experience || 'Not provided'}</p>
          <p><strong>Availability:</strong> {selectedDoctor?.availability || 'Check calendar'}</p>
          <p><strong>Rating:</strong> {selectedDoctor?.rating || 'No reviews yet'}</p>
          {/* puoi aggiungere certificazioni, contatti, ecc. */}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
          <Button variant="success" onClick={() => handleRequestCollaboration(selectedDoctor.id)}>
            Request Collaboration
          </Button>
        </Modal.Footer>
      </Modal>

      <style jsx="true">{`
        .option-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          cursor: pointer;
        }
        .option-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 1rem 3rem rgba(0, 0, 0, 0.175) !important;
        }
      `}</style>
    </div>
  );
}

export default DoctorSearch;
