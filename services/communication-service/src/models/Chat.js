// Example Chat model
const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');
const Chat = sequelize.define('Chat', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  participant1Id: { // User ID (could be doctor or patient)
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users', // Assuming user-service DB or a shared schema reference
      key: 'id'
    }
  },
  participant2Id: { // User ID (the other participant)
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  
  // Optional: Type of chat
  type: {
     type: DataTypes.ENUM('general', 'doctor-patient'),
     defaultValue: 'general'
  }
  // createdAt, updatedAt handled by Sequelize timestamps
}, {
  timestamps: true,
  toJSON: { 
    transform: (instance, options) => {
      const jsonObject = instance.get({ plain: true });
      return jsonObject;
    }
  },
  // Add indexes for participant1Id, participant2Id, appointmentId
  indexes: [
    { fields: ['participant1Id'] },
    { fields: ['participant2Id'] },
  ]
});
module.exports = Chat;