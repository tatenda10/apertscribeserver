// db.js
require('dotenv').config();
const mysql = require('mysql2/promise');

const HOST_URL = process.env.HOST_URL;
const password = process.env.password;
const database = process.env.database; 
const user = process.env.user; 

const pool = mysql.createPool({
    host: HOST_URL,
    user: user, 
    password: password,
    database: database,
});

module.exports = pool;
