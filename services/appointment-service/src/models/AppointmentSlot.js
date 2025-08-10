const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AppointmentSlot = sequelize.define('AppointmentSlot', {
  doctorId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  startTime: {
    type: DataTypes.TIME,
    allowNull: false
  },
  endTime: {
    type: DataTypes.TIME,
    allowNull: false
  },
  isBooked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'appointment_slots',
  timestamps: true
});

module.exports = AppointmentSlot;
