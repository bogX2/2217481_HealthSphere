const express = require('express');
const router = express.Router();
const controller = require('../controllers/appointmentController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// Doctor-only: create slots
router.post('/slots', authenticateToken, authorizeRole(['doctor']), controller.createSlot);

// Anyone authenticated (patient) books a slot
router.post('/book', authenticateToken, authorizeRole(['patient']), controller.bookAppointment);

// Doctors see their appointments
router.get('/doctor/:doctorId', authenticateToken, authorizeRole(['doctor','admin']), controller.getDoctorAppointments);

// Patients see their appointments
router.get('/patient/:patientId', authenticateToken, authorizeRole(['patient','admin']), controller.getPatientAppointments);

// Admin cancel or update endpoints could be added similarly
module.exports = router;
