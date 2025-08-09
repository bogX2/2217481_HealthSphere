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
  getDoctor
} = require('../controllers/doctorController');

const { authenticateToken, authorizeRole } = require('../middleware/auth');

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

module.exports = router;
