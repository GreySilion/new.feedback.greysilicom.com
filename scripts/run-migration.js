import { createConnection } from 'mysql2/promise';
import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  // Database configuration
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost', 
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'S3cr3t_3',
    database: process.env.DB_NAME || 'Grey_silicon_feedback_dump',
    multipleStatements: true
  };

  let connection;
  try {
    // Create connection
    connection = await createConnection(dbConfig);
    console.log('✅ Successfully connected to the database');

    // Read and execute the migration file
    const migrationPath = path.join(__dirname, '../migrations/002_update_users_table_structure.sql');
    const migrationSQL = await readFile(migrationPath, 'utf8');

    console.log('🔄 Running database migration...');
    await connection.query(migrationSQL);
    
    console.log('✅ Database migration completed successfully!');
    console.log('✅ Users table has been updated with the new structure');
  } catch (error) {
    console.error('❌ Error running migration:');
    console.error(error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

runMigration().catch(console.error);
