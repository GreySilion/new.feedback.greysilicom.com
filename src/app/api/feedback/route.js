import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { v4 as uuidv4 } from 'uuid';

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

// POST /api/feedback - Submit new feedback
export async function POST(request) {
  console.log('Received feedback submission request');
  let connection;
  
  try {
    // Parse the request body
    const { rating, comment = '' } = await request.json();
    console.log('Received data:', { rating, comment });
    
    // Basic validation
    if (!rating) {
      return NextResponse.json(
        { error: 'Rating is required' },
        { status: 400 }
      );
    }

    // Create a new connection
    connection = await mysql.createConnection(dbConfig);
    
    // Simple insert query with only required fields
    // Using status = 1 (assuming 1 means 'pending' in your database)
    const sql = `
      INSERT INTO reviews (
        rating, 
        review,
        status,
        uid,
        created_at,
        updated_at
      ) VALUES (?, ?, 1, ?, NOW(), NOW())`;
    
    const values = [
      rating,
      comment || null, // Store as NULL if empty string
      uuidv4()
    ];
    
    console.log('Executing query:', sql.replace(/\s+/g, ' ').trim());
    console.log('With values:', values);
    
    // Execute the query
    const [result] = await connection.execute(sql, values);
    console.log('Insert successful, ID:', result.insertId);
    
    return NextResponse.json(
      { 
        success: true,
        message: 'Feedback submitted successfully',
        id: result.insertId
      },
      { status: 201 }
    );
    
  } catch (error) {
    console.error('Error in /api/feedback:', {
      message: error.message,
      code: error.code,
      sqlState: error.sqlState,
      sql: error.sql
    });
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to submit feedback',
        message: error.message,
        ...(process.env.NODE_ENV === 'development' && {
          details: {
            code: error.code,
            sqlState: error.sqlState
          }
        })
      },
      { status: 500 }
    );
    
  } finally {
    // Close the connection
    if (connection) {
      try {
        await connection.end();
      } catch (e) {
        console.error('Error closing connection:', e);
      }
    }
  }
}

// GET /api/feedback - Get all feedback (for admin)
export async function GET() {
  try {
    const [rows] = await pool.query(`
      SELECT f.*, c.name as company_name 
      FROM feedback f 
      LEFT JOIN companies c ON f.company_id = c.id 
      ORDER BY f.created_at DESC
    `);
    
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feedback', details: error.message },
      { status: 500 }
    );
  }
}
