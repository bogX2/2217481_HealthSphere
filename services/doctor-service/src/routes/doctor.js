const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
  upsertDoctor,
  uploadDocument,
  listDocuments,
  setAvailability,
  getAvailability,
  searchDoctors,
  verifyDoctor,
  getDoctor,
  getDoctorByUserId
} = require('../controllers/doctorController');
const relationshipController = require('../controllers/relationshipController');



const { authenticateToken, authorizeRole } = require('../middleware/auth');
//const { serviceAuth } = require('../middleware/serviceAuth');

const uploadsDir = path.resolve(__dirname, '../../uploads');
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    // use timestamp + originalname to avoid collisions
    const name = `${Date.now()}-${file.originalname.replace(/\s+/g,'_')}`;
    cb(null, name);
  }
});
const upload = multer({ storage });

// public search
router.get('/search', searchDoctors);

// public get profile
router.get('/:doctorId', getDoctor);

// doctor creates/updates own profile
router.post('/', authenticateToken, upsertDoctor);
router.put('/', authenticateToken, upsertDoctor);

// upload document (doctor only)
router.post('/documents', authenticateToken, upload.single('file'), uploadDocument);

// list documents (admin or owner)
router.get('/:doctorId/documents', authenticateToken, listDocuments);

// availability
router.post('/availability', authenticateToken, setAvailability);
router.get('/:doctorId/availability', getAvailability);

// admin verify
router.patch('/:doctorId/verify', authenticateToken, authorizeRole(['admin']), verifyDoctor);

// Relationship management endpoints
router.post('/relationships/request', authenticateToken, authorizeRole(['patient']), relationshipController.requestRelationship);
router.get('/relationships/pending', authenticateToken, authorizeRole(['doctor']), relationshipController.getPendingRelationships);
router.put('/relationships/:id/accept', authenticateToken, authorizeRole(['doctor']), relationshipController.acceptRelationship);
router.put('/relationships/:id/reject', authenticateToken, authorizeRole(['doctor']), relationshipController.rejectRelationship);
router.put('/relationships/:id/terminate', authenticateToken, relationshipController.terminateRelationship);
router.get('/relationships/doctor', authenticateToken, authorizeRole(['doctor']), relationshipController.getDoctorRelationships);
router.get('/relationships/patient', authenticateToken, authorizeRole(['patient']), relationshipController.getPatientRelationships);
router.get('/relationships/check/:userId1/:userId2', authenticateToken, relationshipController.checkRelationship);

// Get all relationships for a doctor
router.get('/doctor', authenticateToken, authorizeRole(['doctor', 'admin']), 
  relationshipController.getDoctorRelationships);

// Get all relationships for a patient
router.get('/patient', authenticateToken, authorizeRole(['patient', 'admin']), 
  relationshipController.getPatientRelationships);

 router.get('/user/:userId', authenticateToken, getDoctorByUserId);

// Allow service-to-service calls for profile creation
//router.post('/', serviceAuth, upsertDoctor);

module.exports = router;
