// testCreateDoctor.js
const axios = require('axios');
const jwt = require('jsonwebtoken');

(async () => {
  try {
    // 1. Genera il token di servizio
    const serviceToken = jwt.sign(
      { service: 'user-service' },
      process.env.INTERNAL_SERVICE_SECRET || 'your_internal_secret_here',
      { expiresIn: '5m' }
    );

    // 2. Dati del nuovo dottore
    const doctorData = {
      userId: 123,  // puoi cambiare con l'ID di test
      firstName: 'Mario',
      lastName: 'Rossi',
      email: 'mario.rossi@example.com',
      phoneNumber: '1234567890',
      fiscalCode: 'RSSMRA80A01H501X',
      specialty: 'General Practice',
      bio: 'New doctor profile',
      verificationStatus: 'approved'
    };

    // 3. Chiamata POST al microservizio doctor
    const response = await axios.post(
      'http://localhost:8082/api/internal/doctors',
      doctorData,
      {
        headers: {
          Authorization: `Bearer ${serviceToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Response:', response.data);
  } catch (err) {
    console.error('Error:', err.response?.data || err.message);
  }
})();
