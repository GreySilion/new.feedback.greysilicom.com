import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get('companyId');
  const userId = searchParams.get('userId');

  // Validate required parameters
  if (!companyId || !userId) {
    return NextResponse.json(
      { error: 'Missing required parameters: companyId and userId are required' },
      { status: 400 }
    );
  }

  const connection = await pool.getConnection();
  
  try {
    // Verify the company belongs to the user
    const [company] = await connection.query(
      'SELECT id FROM companies WHERE id = ? AND user_id = ?',
      [companyId, userId]
    );

    if (company.length === 0) {
      return NextResponse.json(
        { error: 'Company not found or access denied' },
        { status: 404 }
      );
    }

    // Get company stats
    const [stats] = await connection.query(
      `SELECT 
        COUNT(r.id) as total_reviews,
        AVG(r.rating) as average_rating,
        SUM(CASE WHEN r.status = 'replied' THEN 1 ELSE 0 END) as replied_reviews,
        SUM(CASE WHEN r.status = 'pending' THEN 1 ELSE 0 END) as pending_reviews
       FROM reviews r
       WHERE r.company_id = ?`,
      [companyId]
    );

    // Get recent tickets (example - adjust based on your tickets table)
    const [recentTickets] = await connection.query(
      `SELECT id, subject, status, created_at 
       FROM support_tickets 
       WHERE company_id = ? 
       ORDER BY created_at DESC 
       LIMIT 5`,
      [companyId]
    );

    // Format the response
    const response = {
      success: true,
      data: {
        company_id: companyId,
        total_reviews: stats[0].total_reviews || 0,
        average_rating: parseFloat(stats[0].average_rating || 0).toFixed(1),
        replied_reviews: stats[0].replied_reviews || 0,
        pending_reviews: stats[0].pending_reviews || 0,
        recent_tickets: recentTickets || [],
        // Add more stats as needed
      }
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('Error fetching company stats:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'An error occurred while fetching company stats',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}
