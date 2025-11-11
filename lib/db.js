
import mysql from 'mysql2/promise';

// Default configuration for local development
if (!process.env.DB_NAME) {
  console.error('❌ DB_NAME is not set in environment variables');
  throw new Error('Database name (DB_NAME) is required in environment variables');
}

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'S3cr3t_3',
  database: process.env.DB_NAME, // No fallback, we want it to fail fast if not set
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // Enable debug mode in development
  debug: process.env.NODE_ENV === 'development' ? ['ComQueryPacket'] : false
};

console.log('🔌 Database connection details:', {
  host: dbConfig.host,
  database: dbConfig.database,
  user: dbConfig.user,
  port: dbConfig.port || 3306,
  env: process.env.NODE_ENV || 'development',
  hasDbName: !!process.env.DB_NAME
});

if (!process.env.DB_NAME) {
  console.error('❌ ERROR: DB_NAME environment variable is not set');
}

const pool = mysql.createPool(dbConfig);

// Add logging for database connections
pool.on('connection', (connection) => {
  console.log('🔗 New database connection established');
  
  connection.on('error', (err) => {
    console.error('❌ Database connection error:', err);
  });

  connection.on('end', () => {
    console.log('🔌 Database connection closed');
  });
});

// Test the connection when the module loads
async function testConnection() {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log('✅ Successfully connected to the database');
    
    // Check if users table exists
    const [tables] = await connection.query(
      "SHOW TABLES LIKE 'users'"
    );
    
    if (tables.length === 0) {
      console.warn('⚠️  Users table does not exist in the database');
    } else {
      console.log('✅ Users table exists');
      
      // Log the users table structure
      try {
        const [columns] = await connection.query('DESCRIBE users');
        console.log('📋 Users table structure:', columns);
      } catch (err) {
        console.error('❌ Failed to describe users table:', err);
      }
    }
  } catch (error) {
    console.error('❌ Failed to connect to the database:', {
      message: error.message,
      code: error.code,
      errno: error.errno,
      sqlState: error.sqlState,
      sqlMessage: error.sqlMessage
    });
  } finally {
    if (connection) connection.release();
  }
}

// Run the connection test
testConnection().catch(console.error);

export default pool;
