import db from '@/lib/db';

export async function POST(request) {
  try {
    const { rating, comment } = await request.json();
    
    if (!rating || !comment) {
      return new Response(JSON.stringify({ error: 'Rating and comment are required' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    const [result] = await db.query(
      'INSERT INTO feedback (name, email, subject, message, status, rating) VALUES (?, ?, ?, ?, ?, ?)',
      ['Anonymous User', 'user@example.com', 'User Feedback', comment, 'pending', rating]
    );

    return new Response(JSON.stringify({
      id: result.insertId,
      status: 'success',
      message: 'Feedback submitted successfully'
    }), {
      status: 201,
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
    const [rows] = await db.query('SELECT * FROM feedback ORDER BY created_at DESC');
    return new Response(JSON.stringify(rows), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
