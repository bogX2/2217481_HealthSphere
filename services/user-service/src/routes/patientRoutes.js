// routes/patientRoutes.js
const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');

router.post('/', patientController.createPatient);
router.put('/:id', patientController.updatePatient);
router.get('/:id', patientController.getPatient);

module.exports = router;
