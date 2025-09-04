const express = require('express');
const router = express.Router();
const prescriptionController = require('../controllers/prescriptionController');

// Rotta per caricare una nuova ricetta
// Applichiamo il middleware 'uploadMiddleware' per gestire il file
router.post('/upload', prescriptionController.uploadMiddleware, prescriptionController.uploadPrescription);

// Rotta per ottenere tutte le ricette di un paziente
router.get('/patient/:patientId', prescriptionController.getPrescriptionsForPatient);

// Rotta per scaricare una ricetta specifica
router.get('/download/:id', prescriptionController.downloadPrescription);

module.exports = router;