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

// Add this new route for patients to get available slots
router.get('/available-slots/:doctorId', 
  authenticateToken, 
  authorizeRole(['patient']), 
  controller.getAvailableSlotsForPatient);

router.get(
  '/slots/doctor/:doctorId',
  authenticateToken,
  //authorizeRole(['doctor','admin']),
  controller.getDoctorSlots
);

// Cancellation route
router.put('/:appointmentId/cancel', authenticateToken, authorizeRole(['patient', 'doctor']), controller.cancelAppointment);

router.get('/relationship/:userId1/:userId2', authenticateToken, async (req, res) => {
  try {
    const { userId1, userId2 } = req.params;
    
    // Check if there are any appointments between these users
    const appointments = await Appointment.findAll({
      where: {
        [Op.or]: [
          { patientId: userId1, doctorId: userId2 },
          { patientId: userId2, doctorId: userId1 }
        ],
        status: { [Op.notIn]: ['cancelled', 'rejected'] }
      }
    });
    
    res.json({ 
      hasRelationship: appointments.length > 0,
      relationshipType: appointments.length > 0 ? 'patient-doctor' : null,
      appointmentCount: appointments.length
    });
  } catch (err) {
    console.error('Error checking relationship:', err);
    res.status(500).json({ 
      error: 'Internal server error while checking relationship',
      details: err.message 
    });
  }
});

// Admin cancel or update endpoints could be added similarly
module.exports = router;
