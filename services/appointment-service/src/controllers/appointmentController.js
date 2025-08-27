const { Op } = require('sequelize');
const Appointment = require('../models/Appointment');
const AppointmentSlot = require('../models/AppointmentSlot');

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

exports.getDoctorAppointments = async (req, res) => {
  try {
    const callerId = req.user.id;
    const { doctorId } = req.params;

    // allow if admin or if callerId === doctorId
    if (req.user.role !== 'admin' && parseInt(doctorId) !== callerId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const appointments = await Appointment.findAll({ where: { doctorId } });
    res.json({ appointments });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getPatientAppointments = async (req, res) => {
  try {
    const callerId = req.user.id;
    const { patientId } = req.params;

    if (req.user.role !== 'admin' && parseInt(patientId) !== callerId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const appointments = await Appointment.findAll({ where: { patientId } });
    res.json({ appointments });
  } catch (err) { res.status(500).json({ error: err.message }); }
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
    const patientId = req.user.id;
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