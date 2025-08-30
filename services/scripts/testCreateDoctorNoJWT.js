// testCreateDoctorNoJWT.js
const axios = require('axios');

// ---- Genera un token dummy (base64) ----
const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
const payload = Buffer.from(JSON.stringify({ service: 'user-service' })).toString('base64');
// firma finta per test (il middleware deve accettare il token così)
const signature = 'dummy_signature';
const serviceToken = `${header}.${payload}.${signature}`;

(async () => {
  try {
    const doctorData = {
      userId: 123,
      firstName: 'Mario',
      lastName: 'Rossi',
      email: 'mario.rossi@example.com',
      phoneNumber: '1234567890',
      fiscalCode: 'RSSMRA80A01H501X',
      specialty: 'General Practice',
      bio: 'New doctor profile',
      verificationStatus: 'approved'
    };

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
