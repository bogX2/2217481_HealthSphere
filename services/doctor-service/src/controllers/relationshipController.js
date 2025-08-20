const DoctorPatientRelationship = require('../models/DoctorPatientRelationship');
const Doctor = require('../models/Doctor');
const { Op } = require('sequelize');

// Request a relationship with a doctor
exports.requestRelationship = async (req, res) => {
  try {
    const { doctorId } = req.body;
    const patientId = req.user.id;
    
    // Check if doctor exists
    const doctor = await Doctor.findByPk(doctorId);
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }
    
    // Check if relationship already exists
    const existing = await DoctorPatientRelationship.findOne({
      where: {
        doctorId,
        patientId,
        status: { [Op.in]: ['pending', 'active'] }
      }
    });
    
    if (existing) {
      return res.status(400).json({ 
        error: 'Relationship request already exists or active relationship exists' 
      });
    }
    
    // Create new relationship request
    const relationship = await DoctorPatientRelationship.create({
      doctorId,
      patientId,
      status: 'pending',
      requestedAt: new Date()
    });
    
    res.status(201).json({ relationship });
  } catch (err) {
    console.error('Error requesting relationship:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get pending relationship requests for a doctor
exports.getPendingRelationships = async (req, res) => {
  try {
    const doctorId = req.user.id;
    
    const relationships = await DoctorPatientRelationship.findAll({
      where: {
        doctorId,
        status: 'pending'
      },
      include: [{
        model: Doctor,
        as: 'doctor',
        include: [{ 
          model: User, 
          as: 'user',
          attributes: ['id', 'name', 'email']
        }]
      }, {
        model: Patient,
        as: 'patient',
        include: [{ 
          model: User, 
          as: 'user',
          attributes: ['id', 'name', 'email']
        }]
      }]
    });
    
    res.json({ requests: relationships });
  } catch (err) {
    console.error('Error getting pending relationships:', err);
    res.status(500).json({ error: err.message });
  }
};

// Accept a relationship request
exports.acceptRelationship = async (req, res) => {
  try {
    const { id } = req.params;
    const doctorId = req.user.id;
    
    const relationship = await DoctorPatientRelationship.findOne({
      where: { id, doctorId, status: 'pending' }
    });
    
    if (!relationship) {
      return res.status(404).json({ 
        error: 'Relationship request not found or already processed' 
      });
    }
    
    await relationship.update({
      status: 'active',
      respondedAt: new Date()
    });
    
    res.json({ relationship });
  } catch (err) {
    console.error('Error accepting relationship:', err);
    res.status(500).json({ error: err.message });
  }
};

// Reject a relationship request
exports.rejectRelationship = async (req, res) => {
  try {
    const { id } = req.params;
    const doctorId = req.user.id;
    
    const relationship = await DoctorPatientRelationship.findOne({
      where: { id, doctorId, status: 'pending' }
    });
    
    if (!relationship) {
      return res.status(404).json({ 
        error: 'Relationship request not found or already processed' 
      });
    }
    
    await relationship.update({
      status: 'rejected',
      respondedAt: new Date()
    });
    
    res.json({ relationship });
  } catch (err) {
    console.error('Error rejecting relationship:', err);
    res.status(500).json({ error: err.message });
  }
};

// Terminate an active relationship
exports.terminateRelationship = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const relationship = await DoctorPatientRelationship.findOne({
      where: { 
        id,
        [Op.or]: [
          { doctorId: userId },
          { patientId: userId }
        ],
        status: 'active'
      }
    });
    
    if (!relationship) {
      return res.status(404).json({ error: 'Active relationship not found' });
    }
    
    await relationship.update({
      status: 'terminated',
      terminatedAt: new Date()
    });
    
    res.json({ relationship });
  } catch (err) {
    console.error('Error terminating relationship:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get all relationships for a doctor
exports.getDoctorRelationships = async (req, res) => {
  try {
    const doctorId = req.user.id;
    
    const relationships = await DoctorPatientRelationship.findAll({
      where: { 
        doctorId,
        status: { [Op.notIn]: ['rejected'] }
      },
      include: [{
        model: Patient,
        as: 'patient',
        include: [{ 
          model: User, 
          as: 'user',
          attributes: ['id', 'name', 'email']
        }]
      }]
    });
    
    res.json({ relationships });
  } catch (err) {
    console.error('Error getting doctor relationships:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get all relationships for a patient
exports.getPatientRelationships = async (req, res) => {
  try {
    const patientId = req.user.id;
    
    const relationships = await DoctorPatientRelationship.findAll({
      where: { 
        patientId,
        status: { [Op.notIn]: ['rejected'] }
      },
      include: [{
        model: Doctor,
        as: 'doctor',
        include: [{ 
          model: User, 
          as: 'user',
          attributes: ['id', 'name', 'email']
        }]
      }]
    });
    
    res.json({ relationships });
  } catch (err) {
    console.error('Error getting patient relationships:', err);
    res.status(500).json({ error: err.message });
  }
};

// Check if a relationship exists between two users
exports.checkRelationship = async (req, res) => {
  try {
    const { userId1, userId2 } = req.params;
    
    // Check if there's an active relationship between these users
    const relationship = await DoctorPatientRelationship.findOne({
      where: {
        [Op.or]: [
          { doctorId: userId1, patientId: userId2, status: 'active' },
          { doctorId: userId2, patientId: userId1, status: 'active' }
        ]
      }
    });
    
    res.json({ 
      hasRelationship: !!relationship,
      relationshipType: relationship ? 'patient-doctor' : null,
      relationshipCount: relationship ? 1 : 0
    });
  } catch (err) {
    console.error('Error checking relationship:', err);
    res.status(500).json({ 
      error: 'Internal server error while checking relationship',
      details: err.message 
    });
  }
};