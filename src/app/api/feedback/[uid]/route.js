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

// GET /api/feedback/[uid] - Get feedback by UID
export async function GET(request, { params }) {
  const { uid } = params;
  let connection;

  try {
    if (!uid) {
      return NextResponse.json(
        { error: 'UID is required' },
        { status: 400 }
      );
    }

    connection = await getConnection();
    
    const [rows] = await connection.execute(
      'SELECT * FROM reviews WHERE uid = ?',
      [uid]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'Feedback not found' },
        { status: 404 }
      );
    }

    const feedback = rows[0];
    return NextResponse.json(feedback);

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

// PATCH /api/feedback/[uid] - Update feedback by UID
export async function PATCH(request, { params }) {
  const { uid } = params;
  let connection;
  console.log('PATCH request received for UID:', uid);

  try {
    if (!uid) {
      console.error('No UID provided');
      return NextResponse.json(
        { error: 'UID is required' },
        { status: 400 }
      );
    }

    // Parse the request body
    let body;
    try {
      body = await request.json();
      console.log('Request body:', body);
    } catch (e) {
      console.error('Error parsing request body:', e);
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      );
    }

    const { rating, review } = body || {};
    
    if (rating === undefined) {
      console.error('No rating provided');
      return NextResponse.json(
        { error: 'Rating is required' },
        { status: 400 }
      );
    }

    connection = await getConnection();
    
    try {
      // Update the record directly (the WHERE clause will handle non-existent UIDs)
      const [result] = await connection.execute(
        'UPDATE reviews SET rating = ?, review = ?, updated_at = NOW() WHERE uid = ?',
        [rating, review || null, uid]
      );

      // Check if the update was successful
      if (result.affectedRows === 0) {
        return NextResponse.json(
          { error: 'Feedback record not found with the provided UID' },
          { status: 404 }
        );
      }

      // Get the updated record
      const [updatedRows] = await connection.execute(
        'SELECT * FROM reviews WHERE uid = ?',
        [uid]
      );

      return NextResponse.json({
        success: true,
        message: 'Feedback updated successfully',
        data: updatedRows[0]
      });

    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { 
          error: 'Database error',
          ...(process.env.NODE_ENV === 'development' && { details: dbError.message })
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Unexpected error in PATCH handler:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { details: error.message })
      },
      { status: 500 }
    );
  } finally {
    if (connection) {
      try {
        await connection.end();
      } catch (e) {
        console.error('Error closing database connection:', e);
      }
    }
  }
}
