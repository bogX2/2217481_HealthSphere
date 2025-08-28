const User = require('../models/User');

exports.getUserPublicProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: ['id', 'firstName', 'lastName', 'role']
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role
    });
  } catch (err) {
    console.error('Error in getUserPublicProfile:', err);
    res.status(500).json({ 
      error: 'Internal server error',
      userId: req.params.id 
    });
  }
};