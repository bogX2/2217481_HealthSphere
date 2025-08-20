const Doctor = require('../models/Doctor');

exports.createDoctorInternal = async (req, res) => {
  try {
    const { userId, specialty, bio, verificationStatus } = req.body;
    
    // Basic validation
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    
    // Create doctor profile
    const doctor = await Doctor.create({
      userId,
      specialty: specialty || 'General Practice',
      bio: bio || 'New doctor profile',
      verificationStatus: verificationStatus || 'pending'
    });
    
    res.status(201).json({ 
      message: 'Doctor profile created successfully',
      doctor 
    });
  } catch (err) {
    console.error('Error creating doctor profile internally:', err);
    res.status(500).json({ error: err.message });
  }
};