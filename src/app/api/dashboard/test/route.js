import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    // Test the database connection and query
    const connection = await pool.getConnection();
    
    // Query to get review stats
    const [stats] = await connection.query(`
      SELECT 
        COUNT(*) as total_reviews,
        AVG(rating) as avg_rating,
        SUM(CASE WHEN status = 0 THEN 1 ELSE 0 END) as pending_replies,
        SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) as replied
      FROM reviews
      WHERE owner_id = ?
    `, [21]); // Using hardcoded user ID 21 for testing
    
    // Query to get some sample reviews
    const [reviews] = await connection.query(
      'SELECT * FROM reviews WHERE owner_id = ? LIMIT 5',
      [21]
    );
    
    connection.release();
    
    return NextResponse.json({
      success: true,
      stats: stats[0],
      sampleReviews: reviews,
      message: 'Database connection and queries successful'
    });
    
  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Database test failed',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
