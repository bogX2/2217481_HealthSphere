const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false,
});

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('PostgreSQL connected...');
        await sequelize.sync(); // Aggiungi questa linea per sincronizzare i modelli
    } catch (err) {
        console.error('Unable to connect to the database:', err);
        process.exit(1);
    }
};

module.exports = { sequelize, connectDB };