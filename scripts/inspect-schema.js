import mysql from 'mysql2/promise';
import pool from '../lib/db.js';

async function getTableSchema(tableName) {
  const [columns] = await pool.query(`
    SELECT 
      COLUMN_NAME, 
      DATA_TYPE, 
      IS_NULLABLE,
      COLUMN_DEFAULT,
      COLUMN_KEY,
      EXTRA
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
    ORDER BY ORDINAL_POSITION
  `, [process.env.DB_NAME || 'Grey_silicon_feedback_dump', tableName]);
  
  return columns;
}

async function getTableConstraints(tableName) {
  const [constraints] = await pool.query(`
    SELECT 
      CONSTRAINT_NAME, 
      COLUMN_NAME, 
      REFERENCED_TABLE_NAME,
      REFERENCED_COLUMN_NAME
    FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
    WHERE 
      TABLE_SCHEMA = ? AND 
      TABLE_NAME = ? AND
      REFERENCED_TABLE_NAME IS NOT NULL
  `, [process.env.DB_NAME || 'Grey_silicon_feedback_dump', tableName]);
  
  return constraints;
}

async function inspectDatabase() {
  try {
    const tables = ['users', 'companies', 'reviews'];
    const schema = {};
    
    for (const table of tables) {
      console.log(`\n🔍 Inspecting table: ${table}`);
      
      // Get columns
      const columns = await getTableSchema(table);
      console.log(`\nColumns in ${table}:`);
      console.table(columns);
      
      // Get foreign key constraints
      const constraints = await getTableConstraints(table);
      if (constraints.length > 0) {
        console.log(`\nForeign key constraints in ${table}:`);
        console.table(constraints);
      }
      
      schema[table] = { columns, constraints };
    }
    
    return schema;
  } catch (error) {
    console.error('Error inspecting database:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the inspection
inspectDatabase()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Inspection failed:', error);
    process.exit(1);
  });
