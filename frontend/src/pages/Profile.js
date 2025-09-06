import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Dropdown from './Dropdown';

// NUOVO: Importa le icone che useremo
import { 
    PersonVcard, 
    SearchHeart, 
    PeopleFill, 
    Calendar2Check, 
    ChatDotsFill, 
    ClockHistory, 
    Calendar2Range,
    FileText
} from 'react-bootstrap-icons';

const Profile = () => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    const loadUser = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setUser(null);
            return;
        }
        try {
            const res = await axios.get('http://localhost:8081/api/users/profile', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUser(res.data.user);
        } catch (err) {
            setUser(null);
        }
    };

    useEffect(() => {
        loadUser();
        window.addEventListener('authChanged', loadUser);
        return () => window.removeEventListener('authChanged', loadUser);
    }, []);

    if (!user) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
                <div className="spinner-border text-success" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="ms-3 text-secondary">Loading profile...</p>
            </div>
        );
    }
    
    const handleLogout = () => {
        localStorage.removeItem('token');
        window.dispatchEvent(new Event('authChanged'));
        navigate('/');
    };
    if (user.role == "admin")
        navigate('/admin_dashboard')
    else 
        return (
            <div className="d-flex flex-column bg-light min-vh-100">
                <header className="position-fixed top-0 start-0 w-100 p-4 d-flex justify-content-between align-items-center z-1" style={{ userSelect: 'none', backgroundColor: '#e8f7f5' }}>
                    <div className="d-flex align-items-center" style={{ cursor: 'pointer' }} onClick={() => navigate('/profile')}>
                        <img src="/logo192.png" alt="HealthSphere Logo" className="rounded-circle me-3" style={{ width: '60px', height: '60px', border: '3px solid #2a9d8f' }} />
                        <h1 className="h4 fw-bold text-dark mb-0 d-none d-sm-block">HealthSphere</h1>
                    </div>
                    <Dropdown onLogout={handleLogout} />
                </header>

                <div className="container mt-5 pt-5 pb-5">
                    <section className="mb-5 text-center pt-5">
                        <h2 className="display-5 fw-bold text-success">Welcome, {user.profile?.firstName || user.firstName}!</h2>
                    </section>

                    <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                        {/* Opzioni per il Paziente */}
                        {user.role === 'patient' && (
                            <>
                                <div className="col">
                                    <div className="card h-100 shadow-sm option-card" onClick={() => navigate('/infomanagement')}>
                                        <div className="card-body text-center d-flex flex-column justify-content-center align-items-center">
                                            <PersonVcard size={48} className="mb-3 text-success" />
                                            <h5 className="card-title fw-bold text-primary">Personal Information</h5>
                                            <p className="card-text text-muted">View and modify your information.</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col">
                                    <div className="card h-100 shadow-sm option-card" onClick={() => navigate('/doctors/search')}>
                                        <div className="card-body text-center d-flex flex-column justify-content-center align-items-center">
                                            <SearchHeart size={48} className="mb-3 text-success" />
                                            <h5 className="card-title fw-bold text-primary">Find a Doctor</h5>
                                            <p className="card-text text-muted">Search for a specialist.</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col">
                                    <div className="card h-100 shadow-sm option-card" onClick={() => navigate('/collaborations')}>
                                        <div className="card-body text-center d-flex flex-column justify-content-center align-items-center">
                                            <PeopleFill size={48} className="mb-3 text-success" />
                                            <h5 className="card-title fw-bold text-primary">My Collaborations</h5>
                                            <p className="card-text text-muted">Manage your doctors.</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col">
                                    <div className="card h-100 shadow-sm option-card" onClick={() => navigate('/appointmentlist')}>
                                        <div className="card-body text-center d-flex flex-column justify-content-center align-items-center">
                                            <Calendar2Check size={48} className="mb-3 text-success" />
                                            <h5 className="card-title fw-bold text-primary">View Appointments</h5>
                                            <p className="card-text text-muted">Check your schedule.</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col">
                                    <div className="card h-100 shadow-sm option-card" onClick={() => navigate('/chat')}>
                                        <div className="card-body text-center d-flex flex-column justify-content-center align-items-center">
                                            <ChatDotsFill size={48} className="mb-3 text-success" />
                                            <h5 className="card-title fw-bold text-primary">Start a Chat</h5>
                                            <p className="card-text text-muted">Contact a professional.</p>
                                        </div>
                                    </div>
                                </div>
                                 {/* NUOVA CARD PER LE RICETTE */}
                    <div className="col">
                        <div className="card h-100 shadow-sm option-card" onClick={() => navigate('/prescriptions')}>
                            <div className="card-body text-center d-flex flex-column justify-content-center align-items-center">
                                <FileText size={48} className="mb-3 text-success" />
                                <h5 className="card-title fw-bold text-primary">My Prescriptions</h5>
                                <p className="card-text text-muted">View and download your prescriptions.</p>
                            </div>
                        </div>
                    </div>
                                
                            </>
                        )}

                        {/* Opzioni per il Dottore */}
                        {user.role === 'doctor' && (
                            <>
                                <div className="col">
                                    <div className="card h-100 shadow-sm option-card" onClick={() => navigate('/infomanagement')}>
                                        <div className="card-body text-center d-flex flex-column justify-content-center align-items-center">
                                            <PersonVcard size={48} className="mb-3 text-success" />
                                            <h5 className="card-title fw-bold text-primary">Personal Information</h5>
                                            <p className="card-text text-muted">Update your profile.</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col">
                                    <div className="card h-100 shadow-sm option-card" onClick={() => navigate('/collaborations/pending')}>
                                        <div className="card-body text-center d-flex flex-column justify-content-center align-items-center">
                                            <ClockHistory size={48} className="mb-3 text-success" />
                                            <h5 className="card-title fw-bold text-primary">Pending Requests</h5>
                                            <p className="card-text text-muted">Review patient requests.</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col">
                                    <div className="card h-100 shadow-sm option-card" onClick={() => navigate('/collaborations')}>
                                        <div className="card-body text-center d-flex flex-column justify-content-center align-items-center">
                                            <PeopleFill size={48} className="mb-3 text-success" />
                                            <h5 className="card-title fw-bold text-primary">My Collaborations</h5>
                                            <p className="card-text text-muted">View and manage patients.</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col">
                                    <div className="card h-100 shadow-sm option-card" onClick={() => navigate('/appointmentlist')}>
                                        <div className="card-body text-center d-flex flex-column justify-content-center align-items-center">
                                            <Calendar2Check size={48} className="mb-3 text-success" />
                                            <h5 className="card-title fw-bold text-primary">View Appointments</h5>
                                            <p className="card-text text-muted">Check your schedule.</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col">
                                    <div className="card h-100 shadow-sm option-card" onClick={() => navigate('/chat')}>
                                        <div className="card-body text-center d-flex flex-column justify-content-center align-items-center">
                                            <ChatDotsFill size={48} className="mb-3 text-success" />
                                            <h5 className="card-title fw-bold text-primary">Manage Chats</h5>
                                            <p className="card-text text-muted">Communicate with patients.</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col">
                                    <div className="card h-100 shadow-sm option-card" onClick={() => navigate('/manageslots')}>
                                        <div className="card-body text-center d-flex flex-column justify-content-center align-items-center">
                                            <Calendar2Range size={48} className="mb-3 text-success" />
                                            <h5 className="card-title fw-bold text-primary">Manage Availability</h5>
                                            <p className="card-text text-muted">Configure your hours.</p>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
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

export default Profile;