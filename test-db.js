const mysql = require('mysql2/promise');

async function testConnection() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'S3cr3t_3',
    database: 'new_greysilicon_feedback'
  });

  try {
    console.log('Successfully connected to the database');
    
    // Test query to get companies
    const [rows] = await connection.execute(
      'SELECT id, name, user_id FROM companies WHERE user_id = ?',
      [16] // Using user_id 16 from the test data
    );
    
    console.log('Companies for user 16:', JSON.stringify(rows, null, 2));
    
  } catch (error) {
    console.error('Database error:', error);
  } finally {
    await connection.end();
  }
}

testConnection();
