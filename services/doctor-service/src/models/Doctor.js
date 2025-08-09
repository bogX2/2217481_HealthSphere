const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

const Doctor = sequelize.define('Doctor', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false }, // link to auth user id
  specialty: { type: DataTypes.STRING, allowNull: false },
  bio: { type: DataTypes.TEXT, defaultValue: '' },
  location: { type: DataTypes.STRING }, // city / address
  languages: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
  fee: { type: DataTypes.DECIMAL(10,2), defaultValue: 0.00 },
  rating: { type: DataTypes.FLOAT, defaultValue: 0.0 }, // aggregated rating
  experienceYears: { type: DataTypes.INTEGER, defaultValue: 0 },
  credentials: { type: DataTypes.JSONB, defaultValue: {} }, // e.g. { licenseNumber, issuedBy }
  verificationStatus: { type: DataTypes.ENUM('pending','approved','rejected'), defaultValue: 'pending' },
  profilePhoto: { type: DataTypes.STRING }, // path to uploaded photo
  profile: { type: DataTypes.JSONB, defaultValue: {} }, // flexible extra fields
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  indexes: [
    { fields: ['specialty'] },
    { fields: ['location'] },
    { fields: ['userId'] },
    { fields: ['verificationStatus'] }
  ]
});

module.exports = Doctor;
