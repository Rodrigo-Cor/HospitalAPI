require("dotenv").config();
const { Sequelize } = require("sequelize");
const fs = require('fs');
const path = require('path');

const parentDir = path.join(__dirname, '..');
const filePath = path.join(parentDir, 'DigiCertGlobalRootCA.crt.pem');

const DATABASE = process.env.DATABASE;
const USER = process.env.USER;
const PASSWORD = process.env.PASSWORD;
const HOST = process.env.HOST;

const sslOptions = {
  ssl: true,
  ca: fs.readFileSync(filePath), 
};

const sequelize = new Sequelize(
  DATABASE,
  USER,
  PASSWORD,
  {
    host: HOST,
    dialect: "mssql",
    dialectOptions: sslOptions,
  }
);

module.exports = sequelize;