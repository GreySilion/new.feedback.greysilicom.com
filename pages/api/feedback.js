import db from '../../lib/db';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { rating, comment } = req.body;
      
      if (!rating || !comment) {
        return res.status(400).json({ error: 'Rating and comment are required' });
      }

      const [result] = await db.query(
        'INSERT INTO feedback (name, email, subject, message, status, rating) VALUES (?, ?, ?, ?, ?, ?)',
        ['Anonymous User', 'user@example.com', 'User Feedback', comment, 'pending', rating]
      );

      return res.status(201).json({
        id: result.insertId,
        status: 'success',
        message: 'Feedback submitted successfully'
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
      return res.status(500).json({ 
        error: 'Internal server error',
        message: error.message,
        code: error.code
      });
    }
  } else if (req.method === 'GET') {
    try {
      const [rows] = await db.query('SELECT * FROM feedback ORDER BY created_at DESC');
      return res.status(200).json(rows);
    } catch (error) {
      console.error('Error fetching feedback:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
