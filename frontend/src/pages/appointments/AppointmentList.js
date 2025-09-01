import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Alert, Spinner, Badge, Collapse, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/layout/Header';


// Importa le icone che useremo
import { CalendarEvent, FileText, Person } from 'react-bootstrap-icons';

// Funzione helper per capire se un appuntamento è passato
const isPastAppointment = (slot) => {
    try {
        let dateObj = slot.date ? new Date(slot.date) : new Date(slot.slot?.date);
        if (isNaN(dateObj.getTime())) return false;

        const endTime = slot.endTime || slot.slot?.endTime;
        if (!endTime) return false;

        const [hours, minutes] = endTime.split(':').map(Number);
        dateObj.setHours(hours, minutes, 0, 0);

        return dateObj < new Date();
    } catch (e) {
        console.error('Error checking past appointment:', e);
        return false;
    }
};


const AppointmentList = () => {
    const [appointments, setAppointments] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [reviewFormId, setReviewFormId] = useState(null);
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const backendURL = 'http://localhost:8083/api/appointments';

    // Fetch user profile to determine role
    useEffect(() => {
        const fetchUserProfile = async () => {
            if (!token) {
                // ... (la tua logica esistente)
                return;
            }
            try {
                const response = await axios.get('http://localhost:8081/api/users/profile', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUser(response.data.user);
            } catch (err) {
                console.error('Error fetching user profile:', err);
                setError('Unable to load user information. Please log in again.');
                setTimeout(() => navigate('/login'), 3000);
            }
        };
        fetchUserProfile();
    }, [token, navigate]);

    // Fetch appointments based on user role
    useEffect(() => {
        if (!user) return;

        const fetchAppointments = async () => {
            setLoading(true);
            setError('');
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                const userId = payload.id;

                let endpoint = user.role === 'doctor'
                    ? `${backendURL}/doctor/${userId}`
                    : `${backendURL}/patient/${userId}`;

                const response = await axios.get(endpoint, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const sortedAppointments = (response.data.appointments || []).sort((a, b) =>
                    new Date(b.slot.date || b.slot.slot.date) - new Date(a.slot.date || a.slot.slot.date)
                );

                setAppointments(sortedAppointments);
            } catch (err) {
                console.error('Error fetching appointments:', err);
                setError('Failed to load appointments.');
            } finally {
                setLoading(false);
            }
        };

        fetchAppointments();
    }, [user, token]);

    // Format date and time for display
    const formatAppointmentDateTime = (slot) => {
        if (!slot) return 'Invalid date/time';
        try {
            const dateObj = new Date(slot.date || slot.slot?.date);
            return `${dateObj.toLocaleDateString()} ${slot.startTime || slot.slot?.startTime} - ${slot.endTime || slot.slot?.endTime}`;
        } catch (e) {
            return 'Invalid date/time';
        }
    };

    // Get status badge variant
    const getStatusVariant = (status) => {
        switch (status) {
            case 'scheduled': return 'primary';
            case 'completed': return 'success';
            case 'cancelled': return 'danger';
            default: return 'secondary';
        }
    };

    // Handle canceling an appointment
    const handleCancel = async (appointmentId) => {
        if (!window.confirm('Are you sure you want to cancel this appointment?')) return;

        try {
            await axios.put(`${backendURL}/${appointmentId}/cancel`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAppointments(prev => prev.map(app =>
                app.id === appointmentId ? { ...app, status: 'cancelled' } : app
            ));
            alert('Appointment cancelled successfully!');
        } catch (err) {
            console.error('Error cancelling appointment:', err);
            alert(err.response?.data?.error || 'Failed to cancel appointment.');
        }
    };

    // Render appointments
    const renderAppointments = () => {
        if (loading) {
            return (
                <div className="text-center py-5">
                    <Spinner animation="border" variant="success" style={{ width: "3rem", height: "3rem" }} />
                    <p className="mt-3 text-muted">Loading appointments...</p>
                </div>
            );
        }

        if (error) {
            return <Alert variant="danger" className="col-lg-8 mx-auto">{error}</Alert>;
        }

        if (appointments.length === 0) {
            return (
                <Alert variant="info" className="col-lg-8 mx-auto text-center">
                    You don't have any appointments booked.
                </Alert>
            );
        }

        return (
            <Row xs={1} lg={2} className="g-4">
                {appointments.map(appointment => (
                    <Col key={appointment.id}>
                        <Card className="shadow-sm h-100">
                            <Card.Header className="d-flex justify-content-between align-items-center bg-white border-bottom-0">
                                <div className="d-flex align-items-center">
                                    <Person size={24} className="me-2 text-success" />
                                    <h5 className="mb-0 fs-6 fw-bold">
                                        {user?.role === 'doctor'
                                            ? `${appointment.patient?.firstName || ''} ${appointment.patient?.lastName || ''}`
                                            : `Dr. ${appointment.doctor?.firstName || ''} ${appointment.doctor?.lastName || ''}`}
                                    </h5>
                                </div>
                                <Badge pill bg={getStatusVariant(appointment.status)} className="text-capitalize">
                                    {appointment.status}
                                </Badge>
                            </Card.Header>
                            <Card.Body>
                                <p className="d-flex align-items-center"><CalendarEvent size={18} className="me-2 text-muted" /> {formatAppointmentDateTime(appointment.slot)}</p>
                                {appointment.notes && (
                                    <p className="d-flex align-items-start"><FileText size={18} className="me-2 text-muted flex-shrink-0" /> <small className="text-muted fst-italic">"{appointment.notes}"</small></p>
                                )}
                            </Card.Body>
                            <Card.Footer className="bg-light d-flex justify-content-end gap-2">
                                {user?.role === 'patient' && appointment.status === 'scheduled' && !isPastAppointment(appointment.slot) && (
                                    <Button variant="outline-danger" size="sm" onClick={() => handleCancel(appointment.id)}>
                                        Cancel
                                    </Button>
                                )}

                                {user?.role === 'patient' && appointment.status === 'completed' && isPastAppointment(appointment.slot) && (
                                    <Button variant="outline-success" size="sm" onClick={() => setReviewFormId(reviewFormId === appointment.id ? null : appointment.id)}>
                                        {reviewFormId === appointment.id ? 'Close Review' : 'Leave a Review'}
                                    </Button>
                                )}

                                <Button variant="success" size="sm" onClick={() => navigate(`/chat?with=${user?.role === 'doctor' ? appointment.patient.id : appointment.doctor.userId}`)}>
                                    Message
                                </Button>
                            </Card.Footer>
                        </Card>
                        <Collapse in={reviewFormId === appointment.id}>
                            <div>
                                <Card className="mt-2 border-success">

                                </Card>
                            </div>
                        </Collapse>
                    </Col>
                ))}
            </Row>
        );
    };

    return (
        <div className="d-flex flex-column bg-light min-vh-100">
            <Header user={user} />

            <Container className="mt-5 pt-5 pb-5">
                <section className="mb-5 text-center pt-5">
                    <h2 className="display-5 fw-bold text-success">
                        {user?.role === 'doctor' ? 'My Appointments' : 'My Booked Appointments'}
                    </h2>
                    <p className="lead text-muted">
                        {user?.role === 'doctor'
                            ? 'View and manage your scheduled appointments'
                            : 'View your upcoming and past appointments'}
                    </p>
                </section>

                {renderAppointments()}
            </Container>
        </div>
    );
};

export default AppointmentList;