const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Parth@1234',
  database: process.env.DB_NAME || 'campus_marketplace',
  waitForConnections: true,
  connectionLimit: 15,
  queueLimit: 0,
  dateStrings: true
});

// Test connection on launch
pool.getConnection()
  .then(conn => {
    console.log('✅ MySQL Pool connected successfully to database:', process.env.DB_NAME || 'campus_marketplace');
    conn.release();
  })
  .catch(err => {
    console.error('❌ MySQL Pool connection error:', err.message);
  });

module.exports = pool;
