const DoctorPatientRelationship = require('../models/DoctorPatientRelationship');
const Doctor = require('../models/Doctor');
const { Op } = require('sequelize');
const axios = require('axios');


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
    const userId = req.user.id; // This is the USER ID (105), not the DOCTOR ID
    
    // First, find the Doctor record associated with this user
    const doctor = await Doctor.findOne({ where: { userId } });
    if (!doctor) {
      return res.status(404).json({ 
        error: 'Doctor profile not found. Please complete your doctor registration.' 
      });
    }
    
    // Now use the actual DOCTOR ID to find pending relationships
    const relationships = await DoctorPatientRelationship.findAll({
      where: {
        doctorId: doctor.id,  // THIS IS THE CRITICAL FIX
        status: 'pending'
      }
    });

    // Enrich with patient details through the user service API
    const userServiceUrl = process.env.USER_SERVICE_URL || 'http://user-service:8081';
    const enrichedRelationships = await Promise.all(relationships.map(async (relationship) => {
      try {
        // Use the PUBLIC endpoint to get patient details
        const userResp = await axios.get(
          `${userServiceUrl}/api/users/${relationship.patientId}/public`, 
          {
            headers: { 
              'Authorization': req.headers.authorization 
            }
          }
        );
        
        return {
          ...relationship.toJSON(),
          patient: userResp.data
        };
      } catch (err) {
        console.error(`Error fetching patient ${relationship.patientId}:`, 
          err.response?.data || err.message);
        return {
          ...relationship.toJSON(),
          patient: {
            id: relationship.patientId,
            firstName: 'Unknown',
            lastName: 'Patient',
            email: 'unknown@example.com'
          }
        };
      }
    }));

    res.json({ requests: enrichedRelationships });
  } catch (err) {
    console.error('Error getting pending relationships:', err);
    res.status(500).json({ error: err.message });
  }
};


// Accept a relationship request
exports.acceptRelationship = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id; // This is the USER ID, not the DOCTOR ID
    
    // First, find the Doctor record associated with this user
    const doctor = await Doctor.findOne({ where: { userId } });
    if (!doctor) {
      return res.status(404).json({ 
        error: 'Doctor profile not found. Please complete your doctor registration.' 
      });
    }
    
    // Now use the ACTUAL DOCTOR ID to find the relationship
    const relationship = await DoctorPatientRelationship.findOne({
      where: { 
        id, 
        doctorId: doctor.id,  // CRITICAL: Use doctor.id, not userId
        status: 'pending' 
      }
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
    const userId = req.user.id; // This is the USER ID, not the DOCTOR ID
    
    // First, find the Doctor record associated with this user
    const doctor = await Doctor.findOne({ where: { userId } });
    if (!doctor) {
      return res.status(404).json({ 
        error: 'Doctor profile not found. Please complete your doctor registration.' 
      });
    }
    
    // Now use the ACTUAL DOCTOR ID to find the relationship
    const relationship = await DoctorPatientRelationship.findOne({
      where: { 
        id, 
        doctorId: doctor.id,  // CRITICAL: Use doctor.id, not userId
        status: 'pending' 
      }
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
    const userId = req.user.id; // This is the USER ID
    
    // Determine if user is doctor or patient and find appropriate profile
    let profile, profileType;
    
    // First, check if user is a doctor
    const doctor = await Doctor.findOne({ where: { userId } });
    if (doctor) {
      profile = doctor;
      profileType = 'doctor';
    } else {
      // User might be a patient - in your system, patients are just users without doctor profiles
      profile = { id: userId };
      profileType = 'patient';
    }
    
    if (!profile) {
      return res.status(404).json({ 
        error: 'User profile not found' 
      });
    }
    
    // Find the relationship based on profile type
    const whereCondition = { id, status: 'active' };
    if (profileType === 'doctor') {
      whereCondition.doctorId = profile.id;
    } else {
      whereCondition.patientId = profile.id;
    }
    
    const relationship = await DoctorPatientRelationship.findOne({
      where: whereCondition
    });
    
    if (!relationship) {
      return res.status(404).json({ 
        error: 'Active relationship not found' 
      });
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
    const userId = req.user.id;
    
    // First, find the Doctor record associated with this user
    const doctor = await Doctor.findOne({ where: { userId } });
    if (!doctor) {
      return res.status(404).json({ 
        error: 'Doctor profile not found. Please complete your doctor registration.' 
      });
    }
    
    // Now use the actual DOCTOR ID to find relationships
    const relationships = await DoctorPatientRelationship.findAll({
      where: { 
        doctorId: doctor.id,
        status: { [Op.notIn]: ['rejected'] }
      }
    });

    // Enrich with patient details through the user service API
    const userServiceUrl = process.env.USER_SERVICE_URL || 'http://user-service:8081';
    const enrichedRelationships = await Promise.all(relationships.map(async (relationship) => {
      try {
        const userResp = await axios.get(
          `${userServiceUrl}/api/users/${relationship.patientId}/public`, 
          {
            headers: { 'Authorization': req.headers.authorization }
          }
        );
        
        return {
          ...relationship.toJSON(),
          patient: userResp.data
        };
      } catch (err) {
        console.error(`Error fetching patient ${relationship.patientId}:`, 
          err.response?.data || err.message);
        return {
          ...relationship.toJSON(),
          patient: {
            id: relationship.patientId,
            firstName: 'Unknown',
            lastName: 'Patient',
            email: 'unknown@example.com'
          }
        };
      }
    }));

    res.json({ relationships: enrichedRelationships });
  } catch (err) {
    console.error('Error getting doctor relationships:', err);
    res.status(500).json({ error: err.message });
  }
};


// Get all relationships for a patient
exports.getPatientRelationships = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // First, find the relationships for this patient
    const relationships = await DoctorPatientRelationship.findAll({
      where: { 
        patientId: userId,
        status: { [Op.notIn]: ['rejected'] }
      }
    });

    // Enrich with doctor details through the user service API
    const userServiceUrl = process.env.USER_SERVICE_URL || 'http://user-service:8081';
    const enrichedRelationships = await Promise.all(relationships.map(async (relationship) => {
      try {
        // First, get the doctor profile to get the userId
        const doctor = await Doctor.findByPk(relationship.doctorId);
        if (!doctor) {
          throw new Error('Doctor profile not found');
        }
        
        // Use the PUBLIC endpoint to get doctor user details
        const userResp = await axios.get(
          `${userServiceUrl}/api/users/${doctor.userId}/public`, 
          {
            headers: { 'Authorization': req.headers.authorization }
          }
        );
        
        return {
          ...relationship.toJSON(),
          doctor: {
            ...doctor.toJSON(),
            user: userResp.data
          }
        };
      } catch (err) {
        console.error(`Error fetching doctor ${relationship.doctorId}:`, 
          err.response?.data || err.message);
        return {
          ...relationship.toJSON(),
          doctor: {
            id: relationship.doctorId,
            user: {
              id: doctor ? doctor.userId : relationship.doctorId,
              firstName: 'Unknown',
              lastName: 'Doctor',
              email: 'unknown@example.com'
            }
          }
        };
      }
    }));

    res.json({ relationships: enrichedRelationships });
  } catch (err) {
    console.error('Error getting patient relationships:', err);
    res.status(500).json({ error: err.message });
  }
};


// Check if a relationship exists between two users
exports.checkRelationship = async (req, res) => {
  try {
    const { userId1, userId2 } = req.params;
    const userServiceUrl = process.env.USER_SERVICE_URL || 'http://user-service:8081';
    
    // First, check if userId1 is a doctor
    let isDoctor1 = false;
    let doctorId1 = null;
    try {
      const doctorResp1 = await axios.get(
        `${userServiceUrl}/api/users/${userId1}/public`, 
        { headers: { 'Authorization': req.headers.authorization } }
      );
      if (doctorResp1.data.role === 'doctor') {
        // Find the Doctor record for this user
        const doctor1 = await Doctor.findOne({ where: { userId: userId1 } });
        if (doctor1) {
          isDoctor1 = true;
          doctorId1 = doctor1.id;
        }
      }
    } catch (err) {
      console.error(`Error checking if user ${userId1} is a doctor:`, err);
    }
    
    // First, check if userId2 is a doctor
    let isDoctor2 = false;
    let doctorId2 = null;
    try {
      const doctorResp2 = await axios.get(
        `${userServiceUrl}/api/users/${userId2}/public`, 
        { headers: { 'Authorization': req.headers.authorization } }
      );
      if (doctorResp2.data.role === 'doctor') {
        // Find the Doctor record for this user
        const doctor2 = await Doctor.findOne({ where: { userId: userId2 } });
        if (doctor2) {
          isDoctor2 = true;
          doctorId2 = doctor2.id;
        }
      }
    } catch (err) {
      console.error(`Error checking if user ${userId2} is a doctor:`, err);
    }
    
    // Now check for relationships based on roles
    let relationship = null;
    
    // Case 1: userId1 is doctor, userId2 is patient
    if (isDoctor1) {
      relationship = await DoctorPatientRelationship.findOne({
        where: {
          doctorId: doctorId1,
          patientId: userId2,
          status: 'active'
        }
      });
    }
    
    // Case 2: userId2 is doctor, userId1 is patient
    if (!relationship && isDoctor2) {
      relationship = await DoctorPatientRelationship.findOne({
        where: {
          doctorId: doctorId2,
          patientId: userId1,
          status: 'active'
        }
      });
    }
    
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