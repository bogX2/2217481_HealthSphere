// controllers/patientController.js
const PatientProfile = require('../models/PatientProfile');

// Crea un nuovo profilo paziente
exports.createPatient = async (req, res) => {
  try {
    const patient = await PatientProfile.create(req.body);
    res.status(201).json(patient);
  } catch (err) {
    console.error("Error creating patient:", err);
    res.status(500).json({ error: "Failed to create patient profile" });
  }
};

// Aggiorna profilo paziente
exports.updatePatient = async (req, res) => {
  try {
    const { id } = req.params;
     // Usa userId invece di id primario
    const patient = await PatientProfile.findOne({ where: { userId: id } });
  
    if (!patient) {
      return res.status(404).json({ error: "Patient not found" });
    }

    await patient.update(req.body);
    res.json(patient);
  } catch (err) {
    console.error("Error updating patient:", err);
    res.status(500).json({ error: "Failed to update patient profile" });
  }
};

// Recupera profilo paziente
exports.getPatient = async (req, res) => {
  try {
    const { id } = req.params;
    const patient = await PatientProfile.findByPk(id);

    if (!patient) {
      return res.status(404).json({ error: "Patient not found" });
    }

    res.json(patient);
  } catch (err) {
    console.error("Error fetching patient:", err);
    res.status(500).json({ error: "Failed to fetch patient profile" });
  }
};
