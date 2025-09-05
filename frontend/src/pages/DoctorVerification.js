import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const DoctorVerification = () => {
  const [user, setUser] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const loadUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
      setLoadingUser(false);
      return;
    }
    try {
      const res = await axios.get('http://localhost:8081/api/users/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data.user);
    } catch (err) {
      setUser(null);
    } finally {
      setLoadingUser(false);
    }
  };

  const fetchPendingDoctors = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Token mancante');
      setLoadingDoctors(false);
      return;
    }

    try {
      const res = await axios.get('http://localhost:8082/api/doctors/pending', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const enrichedDoctors = await Promise.all(res.data.doctors.map(async doc => {
        let profile = {};
        let documents = [];

        try {
          const userRes = await axios.get(`http://localhost:8081/api/users/${doc.userId}/public`);
          profile = userRes.data;
        } catch {
          profile = {};
        }

        try {
          const docRes = await axios.get(`http://localhost:8082/api/doctors/${doc.id}/documents`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          documents = docRes.data.docs || [];
        } catch {
          documents = [];
        }

        return { ...doc, profile, documents };
      }));

      setDoctors(enrichedDoctors || []);
    } catch (err) {
      if (err.response && err.response.status === 403) {
        setError('Accesso negato: utente non admin o token non valido');
      } else {
        setError('Errore nel caricamento medici');
      }
      console.error(err);
    } finally {
      setLoadingDoctors(false);
    }
  };

  const handleVerify = async (doctorId, action) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      await axios.patch(`http://localhost:8082/api/doctors/${doctorId}/verify`,
        { action },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setDoctors(prev => prev.map(d =>
        d.id === doctorId ? { ...d, verificationStatus: action === 'approve' ? 'approved' : 'rejected' } : d
      ));
    } catch (err) {
      console.error(err);
      alert('Errore nell\'aggiornamento dello status del medico');
    }
  };

  const openDocument = (filename) => {
    if (!filename) return alert('Documento non disponibile');
    window.open(`http://localhost:8082/uploads/${filename}`, '_blank');
  };

  useEffect(() => {
    loadUser();
    window.addEventListener('authChanged', loadUser);
    return () => window.removeEventListener('authChanged', loadUser);
  }, []);

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchPendingDoctors();
    }
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.dispatchEvent(new Event('authChanged'));
    navigate('/');
  };

  if (!user && !loadingUser) {
    navigate('/');
    return null;
  }

  if (user && user.role !== 'admin') {
    navigate('/profile');
    return null;
  }

  if (loadingUser || loadingDoctors) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="ms-3 text-secondary">Caricamento...</p>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column bg-light min-vh-100">
      <header className="position-fixed top-0 start-0 w-100 p-4 d-flex justify-content-between align-items-center z-1" style={{ userSelect: 'none', backgroundColor: '#e8f7f5' }}>
        <div className="d-flex align-items-center" style={{ cursor: 'pointer' }} onClick={() => navigate('/admin_dashboard')}>
          <img src="/logo192.png" alt="HealthSphere Logo" className="rounded-circle me-3" style={{ width: '60px', height: '60px', border: '3px solid #2a9d8f' }} />
          <h1 className="h4 fw-bold text-dark mb-0 d-none d-sm-block">HealthSphere Admin</h1>
        </div>
        <button className="btn btn-outline-danger" onClick={handleLogout}>Logout</button>
      </header>

      <div className="container mt-5 pt-5 pb-5">
        <section className="mb-5 text-center pt-5">
          <h2 className="display-5 fw-bold text-success">Doctors waiting to be verified</h2>
          {error && <p className="text-danger">{error}</p>}
        </section>

        {doctors.length === 0 ? (
          <p className="text-center text-muted">No pending doctor</p>
        ) : (
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
            {doctors.map(doc => (
              <div key={doc.id} className="col">
                <div className="card h-100 shadow-sm">
                  {doc.profilePhoto && (
                    <img src={`http://localhost:8082/uploads/${doc.profilePhoto}`} className="card-img-top" alt="Profile" />
                  )}
                  <div className="card-body">
                    <h5 className="card-title">{doc.profile?.firstName || 'N/A'} {doc.profile?.lastName || ''}</h5>
                    <p className="card-text"><strong>Email:</strong> {doc.profile?.email || 'N/A'}</p>
                    <p className="card-text"><strong>Specialty:</strong> {doc.specialty}</p>
                    <p className="card-text"><strong>Location:</strong> {doc.location || 'N/A'}</p>
                    <p className="card-text"><strong>Languages:</strong> {doc.languages?.join(', ') || 'N/A'}</p>
                    <p className="card-text"><strong>Experience:</strong> {doc.experienceYears} years</p>
                    <p className="card-text"><strong>Fee:</strong> ${doc.fee}</p>
                    <p className="card-text"><strong>Status:</strong> {doc.verificationStatus}</p>

                    {doc.documents && doc.documents.length > 0 ? (
                      <div className="mt-3">
                        <h6>Documenti caricati:</h6>
                        <ul>
                          {doc.documents.map(d => (
                            <li key={d.id}>
                              {d.originalName || d.filename}
                              <button
                                className="btn btn-link btn-sm ms-2"
                                onClick={() => openDocument(d.filename)}
                              >
                                Apri Documento
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <p className="text-muted">Nessun documento caricato</p>
                    )}

                    {doc.verificationStatus === 'pending' && (
                      <div className="mt-2">
                        <button className="btn btn-success me-2" onClick={() => handleVerify(doc.id, 'approve')}>Approve</button>
                        <button className="btn btn-danger" onClick={() => handleVerify(doc.id, 'reject')}>Reject</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorVerification;
