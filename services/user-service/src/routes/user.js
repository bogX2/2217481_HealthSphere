const express = require('express');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const {
  updateProfile,
  getUserProfile,
  getAllUsers,
  deactivateUser
} = require('../controllers/userController');

const router = express.Router();

// Protected user endpoints
router.get(['/profile', '/profile/:id'], authenticateToken, getUserProfile);
router.put('/profile', authenticateToken, updateProfile);

// Admin endpoints (protected + role check)
router.get('/', authenticateToken, authorizeRole(['admin']), getAllUsers);
router.patch('/:userId/deactivate', authenticateToken, authorizeRole(['admin']), deactivateUser);

module.exports = router;