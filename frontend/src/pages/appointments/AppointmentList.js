import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Alert, Spinner, Badge } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AppointmentList = () => {
  const [appointments, setAppointments] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const backendURL = 'http://localhost:8083/api/appointments';
  
  // Fetch user profile to determine role
  useEffect(() => {
    const fetchUserProfile = async () => {
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
  
  // Fetch appointments based on user role - FIXED VERSION
  useEffect(() => {
    if (!user) return;
    
    const fetchAppointments = async () => {
        try {
        setLoading(true);
        setError('');
        
        // Get the ACTUAL user ID from the token (this is critical)
        const token = localStorage.getItem('token');
        let userId = null;
        
        if (token) {
            try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            userId = payload.id; // This is what your token ACTUALLY contains
            } catch (e) {
            console.error('Error parsing token:', e);
            }
        }
        
        if (!userId) {
            throw new Error('User ID not found in token');
        }
        
        console.log('Fetching appointments with userId:', userId);
        
        let response;
        if (user.role === 'doctor') {
            // Use the NUMBER format that matches the backend check
            response = await axios.get(`${backendURL}/doctor/${Number(userId)}`, {
            headers: { Authorization: `Bearer ${token}` }
            });
        } else if (user.role === 'patient') {
            response = await axios.get(`${backendURL}/patient/${Number(userId)}`, {
            headers: { Authorization: `Bearer ${token}` }
            });
        }
        
        setAppointments(response.data.appointments || []);
        } catch (err) {
        // Error handling as above
        } finally {
        setLoading(false);
        }
    };
    
    fetchAppointments();
    }, [user, token, backendURL]);
  
  // Format date and time for display
  const formatAppointmentDateTime = (slot) => {
    if (!slot) return 'Invalid date/time';
    
    try {
        // Handle multiple possible slot structures
        let dateObj;
        if (slot.date) {
        dateObj = typeof slot.date === 'string' ? new Date(slot.date) : slot.date;
        } else if (slot.slot?.date) {
        dateObj = typeof slot.slot.date === 'string' ? new Date(slot.slot.date) : slot.slot.date;
        } else {
        return 'Invalid date/time';
        }
        
        return `${dateObj.toLocaleDateString()} ${slot.startTime || slot.slot?.startTime} - ${slot.endTime || slot.slot?.endTime}`;
    } catch (e) {
        console.error('Error formatting date:', e);
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
    if (!window.confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }
    
    try {
      console.log('Attempting to cancel appointment:', {
        appointmentId,
        userId: user?.id,
        role: user?.role
      });
      
      const response = await axios.put(
        `${backendURL}/${appointmentId}/cancel`,
        {},
        { 
          headers: { 
            Authorization: `Bearer ${token}` 
          }
        }
      );
      
      console.log('Cancellation successful:', response.data);
      
      // FIX: Use user.id directly with fallback to token ID
      let userId = user?.id;
      
      // Fallback: Try to get user ID from token if not in user object
      if (!userId) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          userId = payload.id;
          console.log('Retrieved user ID from token:', userId);
        } catch (e) {
          console.error('Error parsing token:', e);
          throw new Error('User authentication lost. Please log in again.');
        }
      }
      
      console.log('Refreshing appointments for user:', userId);
      
      if (!userId) {
        throw new Error('User ID not found');
      }
      
      // FIX: Always use Number(userId) for consistency
      const numericUserId = Number(userId);
      
      const response2 = user.role === 'doctor'
        ? await axios.get(`${backendURL}/doctor/${numericUserId}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        : await axios.get(`${backendURL}/patient/${numericUserId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
      
      console.log('Refreshed appointments:', {
        count: response2.data.appointments?.length,
        appointments: response2.data.appointments
      });
      
      setAppointments(response2.data.appointments || []);
      alert('Appointment cancelled successfully!');
    } catch (err) {
      console.error('Error cancelling appointment:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
        url: `${backendURL}/${appointmentId}/cancel`
      });
      
      let errorMessage = 'Failed to cancel appointment.';
      if (err.response?.data?.error) {
        errorMessage += ` ${err.response.data.error}`;
      } else if (err.response?.status === 403) {
        errorMessage += ' You do not have permission to cancel this appointment.';
      } else if (err.response?.status === 404) {
        errorMessage += ' Appointment not found.';
      }
      
      alert(errorMessage);
    }
  };
  
  // Render appointments
  const renderAppointments = () => {
    if (loading) {
      return (
        <div className="text-center py-4">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-2">Loading appointments...</p>
        </div>
      );
    }
    
    if (error) {
      return <Alert variant="danger">{error}</Alert>;
    }
    
    if (appointments.length === 0) {
      return (
        <Alert variant="info" className="text-center">
          {user?.role === 'doctor' 
            ? "You don't have any appointments scheduled." 
            : "You don't have any appointments booked."}
        </Alert>
      );
    }
    
    return appointments.map(appointment => (
      <Card key={appointment.id} className="mb-4 shadow-sm">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-start flex-wrap">
            <div className="mb-2 mb-md-0">
              <div className="d-flex align-items-center mb-2">
                <h5 className="card-title mb-0 me-2">
                  {user?.role === 'doctor' 
                    ? `Patient: ${appointment.patient?.firstName || 'Unknown'} ${appointment.patient?.lastName || ''}`
                    : `Doctor: ${appointment.doctor?.firstName || 'Unknown'} ${appointment.doctor?.lastName || ''}`}
                </h5>
                <Badge bg={getStatusVariant(appointment.status)} className="text-white">
                  {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                </Badge>
              </div>
              <p className="card-text mb-1">
                <strong>Date & Time:</strong> {formatAppointmentDateTime(appointment.slot)}
              </p>
              {appointment.notes && (
                <p className="card-text mb-1">
                  <strong>Notes:</strong> {appointment.notes}
                </p>
              )}
            </div>
            
            <div className="d-flex flex-column align-items-end">
              {user?.role === 'patient' && appointment.status === 'scheduled' && (
                <Button 
                  variant="outline-danger" 
                  size="sm"
                  className="mb-2"
                  onClick={() => handleCancel(appointment.id)}
                >
                  Cancel Appointment
                </Button>
              )}
              <Button 
                variant="outline-primary" 
                size="sm"
                onClick={() => navigate(`/chat?with=${user?.role === 'doctor' ? appointment.patient.id : appointment.doctor.userId}`)}
              >
                Message {user?.role === 'doctor' ? 'Patient' : 'Doctor'}
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>
    ));
  };
  
  return (
    <Container className="mt-5 mb-5">
      <div className="text-center mb-4">
        <h2 className="display-5 fw-bold">
          {user?.role === 'doctor' ? 'My Appointments' : 'My Booked Appointments'}
        </h2>
        <p className="text-muted">
          {user?.role === 'doctor' 
            ? 'View and manage your scheduled appointments with patients' 
            : 'View your upcoming and past appointments with doctors'}
        </p>
      </div>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      {renderAppointments()}
    </Container>
  );
};

export default AppointmentList;