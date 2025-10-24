import db from '@/lib/db';

export async function POST(request) {
  try {
    const { rating, comment, uid } = await request.json();
    
    if (!rating || !uid) {
      return new Response(JSON.stringify({ 
        error: 'Rating and UID are required',
        received: { rating: !!rating, uid: !!uid }
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // First, check if a record with this UID exists and is pending
    const [existing] = await db.query(
      `SELECT id, status, name, email, phone 
       FROM reviews 
       WHERE uid = ? AND (status = 'pending' OR status IS NULL)`,
      [uid]
    );

    if (!existing || existing.length === 0) {
      return new Response(JSON.stringify({ 
        error: 'No pending feedback request found with the provided UID. Please make sure you have completed the payment process and have not already submitted feedback.'
      }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    const userData = existing[0];

    // Update the existing record with the feedback
    const [result] = await db.query(
      `UPDATE reviews 
       SET rating = ?, 
           review = ?,
           status = 'replied',
           updated_at = NOW(),
           date = NOW()
       WHERE uid = ?`,
      [
        rating,
        comment || null,  // Make sure comment is not undefined
        uid
      ]
    );

    if (result.affectedRows === 0) {
      throw new Error('Failed to update feedback');
    }

    return new Response(JSON.stringify({
      status: 'success',
      message: 'Thank you for your feedback!',
      uid: uid
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error('Error submitting feedback:', {
      message: error.message,
      code: error.code,
      sql: error.sql,
      sqlMessage: error.sqlMessage,
      sqlState: error.sqlState,
      stack: error.stack
    });
    
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: error.message,
      code: error.code
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

export async function GET() {
  try {
    const [rows] = await db.query(`
      SELECT 
        id, name, email, rating, review as comment, 
        DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as created_at
      FROM reviews 
      WHERE review IS NOT NULL 
      ORDER BY created_at DESC
    `);
    
    return new Response(JSON.stringify(rows), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
