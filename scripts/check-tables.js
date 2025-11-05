import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function checkTables() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'S3cr3t_3',
    database: 'new_greysilicon_feedback'
  });

  try {
    // Check if companies table exists
    const [tables] = await connection.execute(
      "SHOW TABLES LIKE 'companies'"
    );

    if (tables.length === 0) {
      console.error('❌ Companies table does not exist!');
      return;
    }

    console.log('✅ Companies table exists');

    // Check companies table structure
    const [columns] = await connection.execute(
      'DESCRIBE companies'
    );
    
    console.log('\n📋 Companies table structure:');
    console.table(columns);

    // Check if users table exists
    const [userTables] = await connection.execute(
      "SHOW TABLES LIKE 'users'"
    );

    if (userTables.length === 0) {
      console.error('❌ Users table does not exist!');
      return;
    }

    console.log('\n✅ Users table exists');

    // Check users table structure
    const [userColumns] = await connection.execute(
      'DESCRIBE users'
    );
    
    console.log('\n📋 Users table structure:');
    console.table(userColumns);

  } catch (error) {
    console.error('Error checking tables:', error);
  } finally {
    await connection.end();
  }
}

checkTables().catch(console.error);
