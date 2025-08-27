const { Op } = require('sequelize');
const Appointment = require('../models/Appointment');
const AppointmentSlot = require('../models/AppointmentSlot');
const axios = require('axios');

// Create a slot (doctor creates slots for themself)
exports.createSlot = async (req, res) => {
  try {
    // user must be a doctor (route already checks role, but double-check)
    //const doctorId = req.user.id;
    const doctorId = req.user.userId;
    const { date, startTime, endTime } = req.body;
    const slot = await AppointmentSlot.create({ doctorId, date, startTime, endTime });
    res.json({ slot });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Book an appointment (patient books themself)
exports.bookAppointment = async (req, res) => {
  try {
    const slotId = req.body.slotId;
    const patientId = req.user.userId || req.user.id;

    const slot = await AppointmentSlot.findByPk(slotId);
    if (!slot) return res.status(404).json({ error: 'Slot not found' });
    if (slot.isBooked) return res.status(400).json({ error: 'Slot already booked' });

    const appointment = await Appointment.create({
      doctorId: slot.doctorId,
      patientId,
      slotId,
      status: 'scheduled'
    });

    await slot.update({ isBooked: true });

    res.json({ appointment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Helper function to get the actual user ID from request
const getActualUserId = (req) => {
  // Try multiple possible locations for the user ID
  return req.user?.userId || 
         req.user?.id || 
         req.user?.user?.id || 
         req.user?.user?.userId;
};

// Create a helper function to fetch user details
const fetchUserDetails = async (userId, req) => {
  try {
    const userServiceUrl = process.env.USER_SERVICE_URL || 'http://user-service:8081';
    const userResp = await axios.get(
      `${userServiceUrl}/api/users/${userId}/public`, 
      {
        headers: { 'Authorization': req.headers.authorization }
      }
    );
    
    return {
      id: userResp.data.id,
      firstName: userResp.data.firstName,
      lastName: userResp.data.lastName,
      email: userResp.data.email
    };
  } catch (err) {
    console.error(`Error fetching user ${userId}:`, err.response?.data || err.message);
    return {
      id: userId,
      firstName: 'Unknown',
      lastName: 'User',
      email: 'unknown@example.com'
    };
  }
};

// Create a helper function to fetch doctor details
const fetchDoctorDetails = async (doctorId, req) => {
  try {
    const doctorResp = await axios.get(
      `http://doctor-service:8082/api/doctors/${doctorId}`,
      {
        headers: { 'Authorization': req.headers.authorization }
      }
    );
    
    return {
      id: doctorResp.data.doctor.id,
      firstName: doctorResp.data.doctor.firstName,
      lastName: doctorResp.data.doctor.lastName,
      specialty: doctorResp.data.doctor.specialty
    };
  } catch (err) {
    console.error(`Error fetching doctor ${doctorId}:`, err.response?.data || err.message);
    return {
      id: doctorId,
      firstName: 'Unknown',
      lastName: 'Doctor',
      specialty: 'Unknown'
    };
  }
};

exports.getDoctorAppointments = async (req, res) => {
  try {
    const { doctorId } = req.params;
    
    const callerId = req.user?.userId; 
    
    console.log('Appointment query:', {
      requestedDoctorId: doctorId,
      callerId,
      role: req.user.role
    });
    
    // Authorization check
    if (req.user.role !== 'admin' && Number(doctorId) !== Number(callerId)) {
      return res.status(403).json({ 
        error: `Forbidden: Cannot access appointments for doctor ${doctorId}. You are user ${callerId}.`,
        details: {
          callerId,
          doctorId,
          role: req.user.role
        }
      });
    }
    
    // Get appointments
    const appointments = await Appointment.findAll({ 
      where: { doctorId: Number(doctorId) },
      include: [{
        model: AppointmentSlot,
        as: 'slot',
        required: true
      }]
    });
    
    // Enrich with patient details
    const enrichedAppointments = await Promise.all(appointments.map(async (appointment) => {
      try {
        const patient = await fetchUserDetails(appointment.patientId, req);
        return {
          ...appointment.toJSON(),
          patient,
          slot: appointment.slot
        };
      } catch (err) {
        console.error(`Error enriching appointment ${appointment.id}:`, err);
        return {
          ...appointment.toJSON(),
          patient: {
            id: appointment.patientId,
            firstName: 'Unknown',
            lastName: 'Patient'
          },
          slot: appointment.slot
        };
      }
    }));
    
    res.json({ appointments: enrichedAppointments });
  } catch (err) {
    console.error('Error fetching doctor appointments:', err);
    res.status(500).json({ 
      error: 'Internal server error',
      details: err.message
    });
  }
};

exports.getPatientAppointments = async (req, res) => {
  try {
    const { patientId } = req.params;
    
    const callerId = req.user?.userId;
    
    console.log('Appointment query:', {
      requestedPatientId: patientId,
      callerId,
      role: req.user.role
    });
    
    // Authorization check
    if (req.user.role !== 'admin' && Number(patientId) !== Number(callerId)) {
      return res.status(403).json({ 
        error: `Forbidden: Cannot access appointments for patient ${patientId}. You are user ${callerId}.`,
        details: {
          callerId,
          patientId,
          role: req.user.role
        }
      });
    }
    
    // Get appointments
    const appointments = await Appointment.findAll({ 
      where: { patientId: Number(patientId) },
      include: [{
        model: AppointmentSlot,
        as: 'slot',
        required: true
      }]
    });
    
    // Enrich with doctor details
    const enrichedAppointments = await Promise.all(appointments.map(async (appointment) => {
      try {
        const doctor = await fetchDoctorDetails(appointment.doctorId, req);
        return {
          ...appointment.toJSON(),
          doctor,
          slot: appointment.slot
        };
      } catch (err) {
        console.error(`Error enriching appointment ${appointment.id}:`, err);
        return {
          ...appointment.toJSON(),
          doctor: {
            id: appointment.doctorId,
            firstName: 'Unknown',
            lastName: 'Doctor'
          },
          slot: appointment.slot
        };
      }
    }));
    
    res.json({ appointments: enrichedAppointments });
  } catch (err) {
    console.error('Error fetching patient appointments:', err);
    res.status(500).json({ 
      error: 'Internal server error',
      details: err.message
    });
  }
};


//functionality to get all the doctor's slot
exports.getDoctorSlots = async (req, res) => {
  try {
    const doctorId = req.params.doctorId;
    
    // Get all slots for this doctor
    const slots = await AppointmentSlot.findAll({
      where: { doctorId },
      order: [['date', 'ASC'], ['startTime', 'ASC']]
    });
    
    // If user is a patient, only show available slots
    if (req.user.role === 'patient') {
      res.json({ 
        slots: slots.filter(slot => !slot.isBooked) 
      });
    } else {
      // Doctors see all slots (booked and available)
      res.json({ slots });
    }
  } catch (err) {
    console.error('Error getting doctor slots:', err);
    res.status(500).json({ 
      error: 'Failed to get slots',
      details: err.message 
    });
  }
};


// Get available slots for a doctor (only if patient has active relationship)
exports.getAvailableSlotsForPatient = async (req, res) => {
  try {
    const patientId = req.user.id || req.user.userId;;
    const { doctorId } = req.params;
    
    // Get the patient's relationships to verify access
    try {
      const relationshipsResponse = await axios.get(
        `${process.env.USER_SERVICE_URL}/api/doctors/relationships/patient`,
        { 
          headers: { 
            'Authorization': req.headers.authorization,
            'Internal-Service-Token': process.env.INTERNAL_SERVICE_TOKEN 
          } 
        }
      );
      
      const hasRelationship = relationshipsResponse.data.some(
        rel => rel.doctorId === parseInt(doctorId) && rel.status === 'active'
      );
      
      if (!hasRelationship) {
        return res.status(403).json({ 
          error: 'You do not have an active relationship with this doctor' 
        });
      }
    } catch (relError) {
      console.error('Error checking relationships:', relError);
      return res.status(500).json({ 
        error: 'Failed to verify doctor-patient relationship' 
      });
    }
    
    // Get ONLY available (unbooked) slots for the doctor
    const slots = await AppointmentSlot.findAll({
      where: { 
        doctorId,
        isBooked: false
      },
      order: [['date', 'ASC'], ['startTime', 'ASC']]
    });
    
    res.json({ slots });
  } catch (err) {
    console.error('Error getting available slots:', err);
    res.status(500).json({ 
      error: 'Failed to get available slots',
      details: err.message 
    });
  }
};