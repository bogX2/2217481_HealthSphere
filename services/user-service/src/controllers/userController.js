// services/user-service/src/controllers/userController.js
const User = require('../models/User');
const { Op } = require('sequelize');

// Update profile (authenticated)
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const profileData = { ...req.body };

    // prevent updating sensitive fields via this endpoint
    delete profileData.email;
    delete profileData.password;
    delete profileData.role;
    delete profileData.isVerified;
    delete profileData.isActive;

    // We store profile as JSONB; merge with existing profile if needed
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const newProfile = { ...user.profile, ...profileData };
    await User.update(
      { profile: newProfile },
      { where: { id: userId } }
    );

    const updatedUser = await User.findByPk(userId, {
      attributes: { exclude: ['password'] }
    });

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('updateProfile error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

// Get user profile (by id or current user)
const getUserProfile = async (req, res) => {
  try {
    const userId = req.params.id || req.user.id;
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] }
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({ user });
  } catch (error) {
    console.error('getUserProfile error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

// Admin: Get all users with pagination, filters and search
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let whereCondition = {};
    if (role) whereCondition.role = role;
    if (search) {
    whereCondition[Op.or] = [
      { email: { [Op.iLike]: `%${search}%` } },
      { firstName: { [Op.iLike]: `%${search}%` } },
      { lastName: { [Op.iLike]: `%${search}%` } }
    ];
  }

    const { count, rows: users } = await User.findAndCountAll({
      where: whereCondition,
      attributes: { exclude: ['password'] },
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      users,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      total: count
    });
  } catch (error) {
    console.error('getAllUsers error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

// Admin: deactivate user
const deactivateUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const target = await User.findByPk(userId);
    if (!target) return res.status(404).json({ error: 'User not found' });

    await User.update({ isActive: false }, { where: { id: userId } });

    res.json({ message: 'User deactivated successfully' });
  } catch (error) {
    console.error('deactivateUser error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

// Admin: activate user
const activateUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const target = await User.findByPk(userId);
    if (!target) return res.status(404).json({ error: 'User not found' });

    await User.update({ isActive: true }, { where: { id: userId } });

    res.json({ message: 'User activated successfully' });
  } catch (error) {
    console.error('activateUser error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

// --- function for user existence check ---
const getUserByIdPublic = async (req, res) => {
  try {
    const userId = req.params.id;
    // Find user by ID, excluding sensitive information
    const user = await User.findByPk(userId, {
      attributes: ['id', 'email', 'firstName', 'lastName', 'role'] // Select only necessary public fields
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user); // Return public user data
  } catch (err) {
    console.error('Error fetching user by ID (public):', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  updateProfile,
  getUserProfile,
  getAllUsers,
  deactivateUser,
  activateUser,
  getUserByIdPublic
};
