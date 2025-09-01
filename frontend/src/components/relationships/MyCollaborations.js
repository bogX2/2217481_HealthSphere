import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Card, Button, Alert, Spinner, Row, Col, Nav, Badge } from 'react-bootstrap';
import api from '../../services/api';
import Header from '../../components/layout/Header'; // Assicurati che il percorso sia corretto
import { PersonCircle, CalendarCheck } from 'react-bootstrap-icons';

const MyCollaborations = () => {
    const [collaborations, setCollaborations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('active');
    const [user, setUser] = useState(null); // Stato per il profilo utente completo
    const navigate = useNavigate();

    // Fetch del profilo utente per l'Header e il ruolo
    useEffect(() => {
        const fetchUserAndCollaborations = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Please log in to view collaborations');
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                // 1. Prendi il profilo utente
                const profileResponse = await api.get('/users/profile', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const currentUser = profileResponse.data.user;
                setUser(currentUser);
                const userRole = currentUser.role;

                // 2. Prendi le collaborazioni in base al ruolo
                const url = userRole === 'doctor' 
                    ? '/doctors/relationships/doctor' 
                    : '/doctors/relationships/patient';
                
                const response = await api.get(url, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                setCollaborations(response.data.relationships || []);
            } catch (err) {
                console.error('Failed to load data:', err);
                setError('Failed to load collaborations. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchUserAndCollaborations();
    }, []);

    // Gestisce la terminazione di una collaborazione
    const handleTerminate = async (relationshipId) => {
        if (!window.confirm('Are you sure you want to terminate this collaboration?')) return;
        
        const token = localStorage.getItem('token');
        try {
            await api.put(`/doctors/relationships/${relationshipId}/terminate`, {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            // Aggiorna lo stato per riflettere la terminazione
            setCollaborations(prev => prev.map(c => 
                c.id === relationshipId ? { ...c, status: 'terminated' } : c
            ));
            alert('Collaboration terminated successfully!');
        } catch (err) {
            console.error('Error terminating collaboration:', err);
            alert(err.response?.data?.error || 'Failed to terminate collaboration.');
        }
    };

    // Filtra le collaborazioni per il tab attivo
    const filteredCollaborations = collaborations.filter(c => c.status === activeTab);

    const getPartnerInfo = (collaboration) => {
        if (user?.role === 'doctor') {
            return {
                id: collaboration.patient?.id,
                name: `${collaboration.patient?.firstName || ''} ${collaboration.patient?.lastName || ''}`.trim() || 'Patient'
            };
        }
        return {
            id: collaboration.doctor?.id,
            name: `${collaboration.doctor?.user?.firstName || ''} ${collaboration.doctor?.user?.lastName || ''}`.trim() || 'Doctor'
        };
    };

    const getStatusInfo = (status) => {
        switch (status) {
            case 'active': return { bg: 'success', text: 'Active' };
            case 'pending': return { bg: 'warning', text: 'Pending' };
            case 'terminated': return { bg: 'secondary', text: 'Terminated' };
            default: return { bg: 'light', text: 'Unknown' };
        }
    };

    // --- FUNZIONI DI RENDERING ---

    const renderContent = () => {
        if (loading) {
            return (
                <div className="text-center py-5">
                    <Spinner animation="border" variant="success" style={{ width: "3rem", height: "3rem" }} />
                </div>
            );
        }

        if (error) {
            return <Alert variant="danger" className="col-lg-8 mx-auto">{error}</Alert>;
        }

        if (filteredCollaborations.length === 0) {
            return (
                <Alert variant="info" className="col-lg-8 mx-auto text-center">
                    No {activeTab} collaborations found.
                    {user?.role === 'patient' && (
                        <div>
                            <Button variant="success" className="mt-3" onClick={() => navigate('/doctors/search')}>
                                Find a Doctor
                            </Button>
                        </div>
                    )}
                </Alert>
            );
        }

        return (
            <Row xs={1} md={2} xl={3} className="g-4">
                {filteredCollaborations.map(c => {
                    const partner = getPartnerInfo(c);
                    const status = getStatusInfo(c.status);

                    return (
                        <Col key={c.id}>
                            <Card className="shadow-sm h-100">
                                <Card.Header className="d-flex justify-content-between align-items-center bg-white">
                                    <div className="d-flex align-items-center">
                                        <PersonCircle size={24} className="me-2 text-success" />
                                        <span className="fw-bold">{partner.name}</span>
                                    </div>
                                    <Badge pill bg={status.bg}>{status.text}</Badge>
                                </Card.Header>
                                <Card.Body>
                                    <p className="d-flex align-items-center text-muted small">
                                        <CalendarCheck size={18} className="me-2" />
                                        Collaboration started on {new Date(c.requestedAt).toLocaleDateString()}
                                    </p>
                                </Card.Body>
                                {c.status === 'active' && (
                                    <Card.Footer className="bg-light d-flex justify-content-end gap-2">
                                        {/* CONTROLLO RICHIESTO: Il pulsante appare solo se l'utente è un paziente */}
                                        {user?.role === 'patient' && (
                                             <Button 
                                                variant="success" 
                                                size="sm"
                                                onClick={() => navigate(`/appointments/book/${partner.id}`)}
                                            >
                                                Book Appointment
                                            </Button>
                                        )}
                                        <Button 
                                            variant="outline-primary" 
                                            size="sm"
                                            onClick={() => navigate(`/chat?with=${partner.id}`)}
                                        >
                                            Chat
                                        </Button>
                                        <Button 
                                            variant="outline-danger" 
                                            size="sm"
                                            onClick={() => handleTerminate(c.id)}
                                        >
                                            Terminate
                                        </Button>
                                    </Card.Footer>
                                )}
                            </Card>
                        </Col>
                    );
                })}
            </Row>
        );
    };

    return (
        <div className="d-flex flex-column bg-light min-vh-100">
            <Header user={user} />

            <Container className="mt-5 pt-5 pb-5">
                <section className="mb-5 text-center pt-5">
                    <h2 className="display-5 fw-bold text-success">My Collaborations</h2>
                    <p className="lead text-muted">
                        {user?.role === 'doctor' ? 'Manage your patient relationships' : 'Manage your doctor relationships'}
                    </p>
                </section>
                
                <Nav variant="tabs" activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="justify-content-center mb-4">
                    <Nav.Item>
                        <Nav.Link eventKey="active">Active</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="pending">Pending</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="terminated">Terminated</Nav.Link>
                    </Nav.Item>
                </Nav>

                {renderContent()}
            </Container>
        </div>
    );
};

export default MyCollaborations;