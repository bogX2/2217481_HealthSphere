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


exports.cancelAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const userId = req.user.userId || req.user.id;
    const role = req.user.role;
    
    const appointment = await Appointment.findByPk(appointmentId);
    
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    
    // Check if the user has permission to cancel this appointment
    if (
      (role === 'patient' && appointment.patientId !== Number(userId)) ||
      (role === 'doctor' && appointment.doctorId !== Number(userId)) ||
      (role !== 'patient' && role !== 'doctor' && role !== 'admin')
    ) {
      return res.status(403).json({ 
        error: 'You do not have permission to cancel this appointment' 
      });
    }
    
    // Update appointment status
    await appointment.update({ status: 'cancelled' });
    
    // Update slot availability
    await AppointmentSlot.update(
      { isBooked: false },
      { where: { id: appointment.slotId } }
    );
    
    res.json({ 
      message: 'Appointment cancelled successfully',
      appointment: appointment.toJSON()
    });
  } catch (err) {
    console.error('Error cancelling appointment:', err);
    res.status(500).json({ 
      error: 'Failed to cancel appointment',
      details: err.message
    });
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


const getUserDetails = async (userId, req) => {
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
    console.error(`Error fetching user details for ${userId}:`, 
      err.response?.data || err.message);
    return {
      id: userId,
      firstName: 'Unknown',
      lastName: 'Doctor',
      email: 'unknown@example.com'
    };
  }
};


const getDoctorWithUserDetails = async (userId, req) => {
  try {
    console.log(`Fetching doctor profile for user ID: ${userId}`);
    
    // First, get the doctor profile to verify this user is a doctor
    const doctorResp = await axios.get(
      `http://doctor-service:8082/api/doctors/user/${userId}`,
      {
        headers: { 'Authorization': req.headers.authorization }
      }
    );
    
    console.log(`Doctor profile found:`, {
      doctorId: doctorResp.data.doctor.id,
      userId: doctorResp.data.doctor.userId,
      specialty: doctorResp.data.doctor.specialty
    });
    
    // Now, get the user details to get firstName and lastName
    const userDetails = await getUserDetails(userId, req);
    
    console.log(`User details found:`, {
      id: userDetails.id,
      firstName: userDetails.firstName,
      lastName: userDetails.lastName
    });
    
    // Return combined doctor and user details
    return {
      id: doctorResp.data.doctor.id,
      userId: doctorResp.data.doctor.userId,
      firstName: userDetails.firstName,
      lastName: userDetails.lastName,
      specialty: doctorResp.data.doctor.specialty,
      bio: doctorResp.data.doctor.bio,
      verificationStatus: doctorResp.data.doctor.verificationStatus
    };
  } catch (err) {
    console.error(`Error getting doctor with user details for user ${userId}:`, {
      status: err.response?.status,
      data: err.response?.data,
      message: err.message
    });
    
    try {
      // Even if doctor profile fails, try to get user details
      const userDetails = await getUserDetails(userId, req);
      return {
        id: null,
        userId: userId,
        firstName: userDetails.firstName,
        lastName: userDetails.lastName,
        specialty: 'Unknown',
        bio: 'No doctor profile available',
        verificationStatus: 'unknown'
      };
    } catch (userErr) {
      console.error(`Failed to get user details for ${userId}:`, userErr);
      return {
        id: null,
        userId: userId,
        firstName: 'Unknown',
        lastName: 'Doctor',
        specialty: 'Unknown',
        bio: 'Error retrieving doctor information',
        verificationStatus: 'error'
      };
    }
  }
};


exports.getPatientAppointments = async (req, res) => {
  try {
    const { patientId } = req.params;
    
    // Get the user ID correctly
    const callerId = req.user?.userId || req.user?.id;
    
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
    
    console.log(`Found ${appointments.length} appointments for patient ${patientId}`);
    
    // Enrich with doctor details
    const enrichedAppointments = await Promise.all(appointments.map(async (appointment) => {
      try {
        console.log(`Enriching appointment ${appointment.id} with doctor details for doctor user ID: ${appointment.doctorId}`);
        
        // Get doctor details WITH USER INFORMATION
        const doctor = await getDoctorWithUserDetails(appointment.doctorId, req);
        
        if (!doctor) {
          throw new Error('Doctor details not found');
        }
        
        console.log(`Successfully enriched appointment with doctor:`, {
          id: doctor.id,
          userId: doctor.userId,
          name: `${doctor.firstName} ${doctor.lastName}`
        });
        
        return {
          ...appointment.toJSON(),
          doctor: {
            id: doctor.id,
            userId: doctor.userId,
            firstName: doctor.firstName,
            lastName: doctor.lastName,
            specialty: doctor.specialty,
            bio: doctor.bio,
            verificationStatus: doctor.verificationStatus
          },
          slot: appointment.slot
        };
      } catch (err) {
        console.error(`Error enriching appointment ${appointment.id}:`, err);
        return {
          ...appointment.toJSON(),
          doctor: {
            id: appointment.doctorId,
            userId: appointment.doctorId,
            firstName: 'Unknown',
            lastName: 'Doctor',
            specialty: 'Unknown',
            bio: 'Error retrieving doctor information',
            verificationStatus: 'error'
          },
          slot: appointment.slot
        };
      }
    }));
    
    console.log('Returning enriched appointments:', {
      count: enrichedAppointments.length,
      appointments: enrichedAppointments.map(a => ({
        id: a.id,
        doctorName: `${a.doctor.firstName} ${a.doctor.lastName}`,
        specialty: a.doctor.specialty,
        date: a.slot?.date,
        startTime: a.slot?.startTime
      }))
    });
    
    res.json({ appointments: enrichedAppointments });
  } catch (err) {
    console.error('Error fetching patient appointments:', err);
    res.status(500).json({ 
      error: 'Internal server error',
      details: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
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