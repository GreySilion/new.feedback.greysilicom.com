import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'S3cr3t_3',
  database: process.env.DB_NAME || 'Grey_silicon_feedback_dump',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Helper function to create a database connection
async function getConnection() {
  return await mysql.createConnection(dbConfig);
}

// GET /api/feedback - Get all feedback (for admin)
export async function GET() {
  let connection;
  
  try {
    connection = await getConnection();
    
    const [rows] = await connection.execute(
      'SELECT r.*, c.name as company_name FROM reviews r LEFT JOIN companies c ON r.company_id = c.id ORDER BY r.created_at DESC'
    );
    
    return NextResponse.json(rows);
    
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch feedback',
        ...(process.env.NODE_ENV === 'development' && { details: error.message })
      },
      { status: 500 }
    );
  } finally {
    if (connection) await connection.end();
  }
}

// POST /api/feedback - Submit new feedback (kept for backward compatibility)
export async function POST(request) {
  return NextResponse.json(
    { error: 'Please use PATCH /api/feedback/[uid] to update existing feedback' },
    { status: 405 }
  );
}
