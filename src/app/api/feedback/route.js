import db from '@/lib/db';

export async function POST(request) {
  try {
    const { rating, comment, name = 'Anonymous User', email = 'user@example.com', phone = null, uid = null } = await request.json();
    
    if (!rating || !comment) {
      return new Response(JSON.stringify({ error: 'Rating and comment are required' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    const currentDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    // Generate a unique UID for this review if not provided
    const reviewUid = uid || crypto.randomUUID();
    
    const [result] = await db.query(
      `INSERT INTO reviews 
      (user_id, owner_id, company_id, rating, review, title, 
       created_at, updated_at, date, email, name, phone, uid)
      VALUES (NULL, NULL, NULL, ?, ?, 'Customer Feedback', 
              ?, ?, ?, ?, ?, ?, ?)`,
      [
        rating, 
        comment,
        currentDate, // created_at
        currentDate, // updated_at
        currentDate, // date
        email,
        name,
        phone,
        reviewUid
      ]
    );

    return new Response(JSON.stringify({
      id: result.insertId,
      status: 'success',
      message: 'Thank you for your feedback!'
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
