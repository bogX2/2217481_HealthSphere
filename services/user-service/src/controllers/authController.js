const User = require('../models/User');
const PatientProfile = require('../models/PatientProfile');
const DoctorProfile = require('../models/DoctorProfile');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


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
      fiscalCode,
    } = req.body;
    console.log('Request body:', req.body);
    // Creo l'utente con tutti i dati base
    const user = await User.create({ firstName: name, lastName: surname, email, password, role, phoneNumber, birthDate, birthPlace, fiscalCode});

    //se ho un paziente, creo anche il suo profilo personale in profileData
    if (role === 'patient') {
      await PatientProfile.create({ userId: user.id });
    }

    //se è dottore, non faccio niente altro

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
  console.error('Errore di registrazione:', err);
  res.status(400).json({ error: err.message, details: err.errors });
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
