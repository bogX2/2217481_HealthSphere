const User = require('../models/User');
const PatientProfile = require('../models/PatientProfile');
const DoctorProfile = require('../models/DoctorProfile');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const axios = require('axios');

exports.register = async (req, res) => {
  try {
    const {
      name,
      surname,
      email,
      password,
      role,
      phoneNumber,
      birthDate,
      birthPlace,
      fiscalCode
    } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    // Hash password
    //const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with ALL fields
    const user = await User.create({
      firstName: name,
      lastName: surname,
      email,
      password: password,
      role,
      phoneNumber,
      birthDate,
      birthPlace,
      fiscalCode
    });

    // If patient, create patient profile
    if (role === 'patient') {
      await PatientProfile.create({ userId: user.id });
    }

    // If doctor, also create doctor profile in doctor service
    if (role === 'doctor') {
      try {
        const doctorServiceUrl =
          process.env.NODE_ENV === 'development'
            ? 'http://localhost:8082/api/internal/doctors'
            : 'http://doctor-service:8082/api/internal/doctors';

        // Create a service token using the dedicated internal secret
        const serviceToken = jwt.sign(
          { service: 'user-service' },
          process.env.INTERNAL_SERVICE_SECRET,
          { expiresIn: '5m' } // Slightly longer expiration for reliability
        );

        await axios.post(doctorServiceUrl, {
          userId: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          fiscalCode: user.fiscalCode,
          specialty: 'General Practice',
          bio: 'New doctor profile',
          verificationStatus: 'approved'
        }, {
          headers: { Authorization: `Bearer ${serviceToken}`, 'Content-Type': 'application/json' }
        });

        console.log(`Doctor profile created for user ${user.id}`);
      } catch (err) {
        console.error(
          'Failed to create doctor profile:',
          err.response?.data || err.message
        );
      }
    }


    // Return JWT
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET
    );
    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
};


exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET);
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
