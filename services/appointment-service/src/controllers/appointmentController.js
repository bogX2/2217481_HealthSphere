const { Op } = require('sequelize');
const Appointment = require('../models/Appointment');
const AppointmentSlot = require('../models/AppointmentSlot');

// Create a slot (doctor creates slots for themself)
exports.createSlot = async (req, res) => {
  try {
    // user must be a doctor (route already checks role, but double-check)
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
    const patientId = req.user.userId;

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
    const callerId = req.user.userId;
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
    const callerId = req.user.userId;
    const { patientId } = req.params;

    if (req.user.role !== 'admin' && parseInt(patientId) !== callerId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const appointments = await Appointment.findAll({ where: { patientId } });
    res.json({ appointments });
  } catch (err) { res.status(500).json({ error: err.message }); }
};
