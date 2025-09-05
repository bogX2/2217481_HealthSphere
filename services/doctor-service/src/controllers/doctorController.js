const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { Op } = require('sequelize');
const Doctor = require('../models/Doctor');
const DoctorDocument = require('../models/DoctorDocument');
const Availability = require('../models/Availability');
const jwt = require('jsonwebtoken');

const UPLOADS_DIR = path.resolve(__dirname, '../../uploads');

// ---- Create or update doctor profile (doctor edits own profile) ----
const upsertDoctor = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const payload = req.body;

    let doctor = await Doctor.findOne({ where: { userId } });
    if (!doctor) {
      doctor = await Doctor.create({ userId, ...payload });
    } else {
      await doctor.update(payload);
    }
    res.json({ doctor });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ---- Upload document (credential/license) ----
const uploadDocument = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const doctor = await Doctor.findOne({ where: { userId } });
    if (!doctor) return res.status(404).json({ error: 'Doctor profile not found' });

    if (!req.file) return res.status(400).json({ error: 'File required' });

    // store record
    const doc = await DoctorDocument.create({
      doctorId: doctor.id,
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      purpose: req.body.purpose || 'credential'
    });

    // set verification status back to pending when new docs uploaded
    await doctor.update({ verificationStatus: 'pending' });

    res.json({ message: 'Uploaded', doc });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ---- List docs for doctor (owner or admin) ----
const listDocuments = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const docs = await DoctorDocument.findAll({ where: { doctorId } });
    res.json({ docs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const listPendingDoctors = async (req, res) => {
  try {
    // Trova tutti i medici con status 'pending'
    const doctors = await Doctor.findAll({
      where: { verificationStatus: 'pending' },
      order: [['createdAt', 'DESC']] // opzionale: i più recenti prima
    });

    res.json({ doctors });
  } catch (err) {
    console.error("Errore in listPendingDoctors:", err);
    res.status(500).json({ error: "Errore interno nel caricamento dei medici" });
  }
};

// ---- Set availability ----
const setAvailability = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const doctor = await Doctor.findOne({ where: { userId } });
    if (!doctor) return res.status(404).json({ error: 'Doctor profile not found' });

    const { type, data } = req.body;
    // basic validation
    if (!['recurring','single'].includes(type)) return res.status(400).json({ error: 'Invalid type' });
    if (!data) return res.status(400).json({ error: 'Missing data' });

    const avail = await Availability.create({ doctorId: doctor.id, type, data });
    res.json({ availability: avail });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ---- Get availability ----
const getAvailability = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const list = await Availability.findAll({ where: { doctorId } });
    res.json({ availability: list });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ---- Search doctors ---- IT WILL FIND ONLY DOCTORS THAT HAVE BEEN APPROVED (Now it finds everyone)
// supports: specialty, location, language, minRating, maxFee, availableOn (YYYY-MM-DD)
// const searchDoctors = async (req, res) => {
//   try {
//     const {
//       specialty, location, language,
//       minRating, maxFee, availableOn,
//       page = 1, limit = 20, sort = 'rating'
//     } = req.query;

//     //const where = { isActive: true, verificationStatus: 'approved' };
//     const where = { isActive: true };

//     if (specialty) where.specialty = { [Op.iLike]: `%${specialty}%` };
//     if (location) where.location = { [Op.iLike]: `%${location}%` };
//     if (language) where.languages = { [Op.contains]: [language] }; // requires Postgres array
//     if (minRating) where.rating = { ...(where.rating || {}), [Op.gte]: parseFloat(minRating) };
//     if (maxFee) where.fee = { ...(where.fee || {}), [Op.lte]: parseFloat(maxFee) };

//     const offset = (page - 1) * limit;
//     const order = [[sort, 'DESC']];

//     let doctors = await Doctor.findAll({ where, limit: parseInt(limit), offset: parseInt(offset), order });

//     // If availability filter requested (availableOn), simple check: if they have a 'single' availability on that date or recurring matching weekday
//     if (availableOn) {
//       const requestedDate = new Date(availableOn);
//       const dayOfWeek = requestedDate.getUTCDay() || 7; // 0..6 (Sun..Sat) -> map if needed
//       // load availabilities for the fetched doctors
//       const ids = doctors.map(d => d.id);
//       const avails = await Availability.findAll({ where: { doctorId: ids } });
//       const availMap = new Map();
//       avails.forEach(a => {
//         if (!availMap.has(a.doctorId)) availMap.set(a.doctorId, []);
//         availMap.get(a.doctorId).push(a);
//       });

//       doctors = doctors.filter(d => {
//         const list = availMap.get(d.id) || [];
//         // check single or recurring
//         return list.some(a => {
//           if (a.type === 'single') {
//             return a.data.date === availableOn;
//           } else if (a.type === 'recurring') {
//             // assume data.dayOfWeek (1-7) or 0-6 depending on your client; check both
//             const dow = a.data.dayOfWeek;
//             // normalize: client may send 1=Mon..7=Sun, JS getUTCDay 0=Sun..6=Sat
//             if (dow === undefined) return false;
//             if (dow === dayOfWeek || dow === (dayOfWeek % 7)) return true;
//           }
//           return false;
//         });
//       });
//     }

//     res.json({ doctors });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

const searchDoctors = async (req, res) => {
  try {
    const {
      specialty,
      location,
      language,
      minRating,
      maxFee,
      availableOn,
      page = 1,
      limit = 20,
      sort = 'rating'
    } = req.query;

    // THIS IS THE MISSING PART - DEFINE WHERECONDITION
    const whereCondition = {};
    if (specialty) whereCondition.specialty = specialty;
    if (location) whereCondition.location = { [Op.iLike]: `%${location}%` };
    // Add other filters as needed
    
    console.log(`Searching doctors with conditions:`, whereCondition);
    
    const doctors = await Doctor.findAll({
      where: whereCondition,
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      order: [[sort, 'DESC']]
    });
    
    console.log(`Found ${doctors.length} doctors in database`);
    
    // Enrich with user details using PUBLIC endpoint
    const result = await Promise.all(doctors.map(async (doctor) => {
      try {
        const userServiceUrl = process.env.USER_SERVICE_URL || 'http://user-service:8081';
        
        // USE THE PUBLIC ENDPOINT (no authentication needed)
        const userResp = await axios.get(`${userServiceUrl}/api/users/${doctor.userId}/public`);
        
        const user = userResp.data;
        
        return {
          ...doctor.toJSON(),
          firstName: user.firstName,
          lastName: user.lastName,
          specialty: doctor.specialty,
          bio: doctor.bio
        };
      } catch (err) {
        console.error(`Error enriching doctor ${doctor.id}:`, err.response?.data || err.message);
        // Return doctor data with fallback
        return {
          ...doctor.toJSON(),
          firstName: doctor.specialty || 'Doctor',
          lastName: '',
          specialty: doctor.specialty,
          bio: doctor.bio
        };
      }
    }));
    
    res.json({ doctors: result });
  } catch (err) {
    console.error('Error in searchDoctors:', err);
    res.status(500).json({ error: err.message });
  }
};

// ---- Admin: verify doctor (approve/reject) ----
const verifyDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { action, notes } = req.body; // action = 'approve' | 'reject'
    const doctor = await Doctor.findByPk(doctorId);
    if (!doctor) return res.status(404).json({ error: 'Doctor not found' });

    if (action === 'approve') {
      await doctor.update({ verificationStatus: 'approved' });
    } else if (action === 'reject') {
      await doctor.update({ verificationStatus: 'rejected' });
    } else {
      return res.status(400).json({ error: 'Invalid action' });
    }

    // store admin notes as part of credentials (simple)
    const creds = doctor.credentials || {};
    creds.verificationNotes = { notes, adminId: req.user.userId || req.user.id, date: new Date() };
    await doctor.update({ credentials: creds });

    res.json({ message: 'Doctor verification updated', doctor });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ---- Public get doctor (enrich with user-service if available) ----
const getDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const doctor = await Doctor.findByPk(doctorId);
    if (!doctor) return res.status(404).json({ error: 'Doctor not found' });

    const result = doctor.toJSON();

    // try to fetch basic user info from user-service if configured
    const userServiceUrl = process.env.USER_SERVICE_URL;
    if (userServiceUrl) {
      try {
        const userResp = await axios.get(`${userServiceUrl}/api/users/${doctor.userId}`); // assumes user-service xexists
        // merge public fields (avoid leaking sensitive fields)
        const userPublic = userResp.data.user || userResp.data;
        result.user = {
          id: userPublic.id || doctor.userId,
          name: userPublic.name || userPublic.profile?.firstName || null,
          email: userPublic.email ? undefined : undefined // omit email by default
        };
      } catch (err) {
        // ignore enrichment errors
      }
    } else {
      result.user = { id: doctor.userId };
    }

    res.json({ doctor: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


const getDoctorByUserId = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Find the doctor record associated with this user
    const doctor = await Doctor.findOne({
      where: { userId }
    });
    
    if (!doctor) {
      return res.status(404).json({ 
        error: 'Doctor profile not found' 
      });
    }
    
    res.json({ doctor });
  } catch (err) {
    console.error('Error getting doctor by user ID:', err);
    res.status(500).json({ 
      error: 'Failed to get doctor profile',
      details: err.message 
    });
  }
};

module.exports = {
  upsertDoctor,
  uploadDocument,
  listDocuments,
  setAvailability,
  getAvailability,
  searchDoctors,
  verifyDoctor,
  getDoctor,
  getDoctorByUserId,
  listPendingDoctors
};
