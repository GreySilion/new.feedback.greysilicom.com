import mysql from 'mysql2/promise';

// Default configuration for local development
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'S3cr3t_3',
  database: process.env.DB_NAME || 'Grey_silicon_feedback',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

console.log('Connecting to database:', {
  host: dbConfig.host,
  database: dbConfig.database,
  user: dbConfig.user
});

const pool = mysql.createPool(dbConfig);

export default pool;
