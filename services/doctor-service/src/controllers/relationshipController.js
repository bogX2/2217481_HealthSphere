const DoctorPatientRelationship = require('../models/DoctorPatientRelationship');
const Doctor = require('../models/Doctor');
const { Op } = require('sequelize');
const axios = require('axios');
const jwt = require('jsonwebtoken');


// Helper function to create service token
function createServiceToken(service, permissions = []) {
  return jwt.sign(
    { 
      service,
      permissions 
    }, 
    process.env.INTERNAL_SERVICE_SECRET,
    { expiresIn: '5m' }
  );
}


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
    const userId = req.user.id;
    
    const doctor = await Doctor.findOne({ where: { userId } });
    if (!doctor) {
      return res.status(404).json({
        error: 'Doctor profile not found. Please complete your doctor registration.'
      });
    }
    
    const relationship = await DoctorPatientRelationship.findOne({
      where: { 
        id,
        doctorId: doctor.id,
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
    
    // FIX: Create chat with JWT token
    try {
      const communicationServiceUrl = process.env.COMMUNICATION_SERVICE_URL || 'http://communication-service:8084';
      
      // Create a proper service token
      const serviceToken = createServiceToken('doctor-service', ['create:chat']);
      
      await axios.post(
        `${communicationServiceUrl}/api/internal/chats`,
        {
          participant1Id: doctor.userId,
          participant2Id: relationship.patientId
        },
        {
          headers: { 
            'Authorization': `Bearer ${serviceToken}`
          }
        }
      );
    } catch (chatErr) {
      console.error('Error creating chat for relationship:', chatErr.message);
      // Don't fail the whole request if chat creation fails
    }
    
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
    const doctor = await Doctor.findOne({ where: { userId } });
    if (!doctor) {
      return res.status(404).json({
        error: 'Doctor profile not found. Please complete your doctor registration.'
      });
    }

    const relationships = await DoctorPatientRelationship.findAll({
      where: { 
        doctorId: doctor.id,
        status: { [Op.notIn]: ['rejected'] } 
      }
    });

    const userServiceUrl = process.env.USER_SERVICE_URL || 'http://user-service:8081';
    
    // FIX: Use JWT token for service-to-service communication
    const serviceToken = createServiceToken('doctor-service', ['read:user:public']);
    
    const enrichedRelationships = await Promise.all(relationships.map(async (relationship) => {
      try {
        const userResp = await axios.get(
          `${userServiceUrl}/api/internal/users/${relationship.patientId}/public`,
          { 
            headers: { 
              'Authorization': `Bearer ${serviceToken}`
            }
          }
        );
        
        return {
          ...relationship.toJSON(),
          patient: userResp.data
        };
      } catch (err) {
        console.error(`Error fetching patient ${relationship.patientId}:`, err.response?.data || err.message);
        return {
          ...relationship.toJSON(),
          patient: {
            id: relationship.patientId,
            firstName: 'Unknown',
            lastName: 'Patient',
            role: 'patient'
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
    const userId = req.user.id; // This is the USER ID of the patient
    
    // First, find the relationships for this patient
    const relationships = await DoctorPatientRelationship.findAll({
      where: { 
        patientId: userId,
        status: { [Op.notIn]: ['rejected'] } 
      }
    });
    
    const userServiceUrl = process.env.USER_SERVICE_URL || 'http://user-service:8081';
    // FIX: Use JWT token for service-to-service communication (aligned with getDoctorRelationships)
    const serviceToken = createServiceToken('doctor-service', ['read:user:public']);
    
    const enrichedRelationships = await Promise.all(relationships.map(async (relationship) => {
      try {
        // First, get the doctor profile to get the userId
        const doctor = await Doctor.findByPk(relationship.doctorId);
        if (!doctor) {
          throw new Error('Doctor profile not found');
        }
        
        // Use the INTERNAL endpoint with service token (aligned with getDoctorRelationships)
        const userResp = await axios.get(
          `${userServiceUrl}/api/internal/users/${doctor.userId}/public`,
          { 
            headers: { 
              'Authorization': `Bearer ${serviceToken}`
            }
          }
        );
        
        return {
          ...relationship.toJSON(),
          doctor: {
            ...doctor.toJSON(),
            // Simplified structure to match getDoctorRelationships pattern
            firstName: userResp.data.firstName,
            lastName: userResp.data.lastName,
            role: userResp.data.role,
            // Keep the full user object for consistency with getDoctorRelationships
            user: userResp.data
          }
        };
      } catch (err) {
        console.error(`Error fetching doctor ${relationship.doctorId}:`, err.response?.data || err.message);
        return {
          ...relationship.toJSON(),
          doctor: {
            id: relationship.doctorId,
            // Consistent error structure with getDoctorRelationships
            firstName: 'Unknown',
            lastName: 'Doctor',
            role: 'doctor',
            user: {
              id: doctor ? doctor.userId : relationship.doctorId,
              firstName: 'Unknown',
              lastName: 'Doctor',
              role: 'doctor'
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
    
    // Check if there's an active relationship between these users
    const relationship = await DoctorPatientRelationship.findOne({
      where: {
        [Op.or]: [
          { 
            doctorId: userId1, 
            patientId: userId2,
            status: 'active'
          },
          { 
            doctorId: userId2, 
            patientId: userId1,
            status: 'active'
          }
        ]
      }
    });
    
    res.json({ 
      hasRelationship: !!relationship,
      relationshipType: relationship ? 'patient-doctor' : null,
      //relationshipCount: relationship ? 1 : 0
    });
  } catch (err) {
    console.error('Error checking relationship:', err);
    res.status(500).json({ 
      error: 'Internal server error while checking relationship',
      details: err.message 
    });
  }
};


exports.checkInternalRelationship = async (req, res) => {
  try {
    const { userId1, userId2 } = req.params;
    
    // Check if there's an active relationship between these users
    const relationship = await DoctorPatientRelationship.findOne({
      where: {
        [Op.or]: [
          { 
            doctorId: userId1, 
            patientId: userId2,
            status: 'active'
          },
          { 
            doctorId: userId2, 
            patientId: userId1,
            status: 'active'
          }
        ]
      }
    });
    
    res.json({ 
      hasRelationship: !!relationship,
      relationship: relationship ? relationship.toJSON() : null
    });
  } catch (err) {
    console.error('Error checking relationship:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};