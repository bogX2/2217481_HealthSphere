const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Appointment = sequelize.define('Appointment', {
  doctorId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  patientId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  slotId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('scheduled', 'completed', 'cancelled'),
    defaultValue: 'scheduled'
  },
  notes: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'appointments',
  timestamps: true
});

module.exports = Appointment;
