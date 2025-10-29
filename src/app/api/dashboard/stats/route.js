import { NextResponse } from 'next/server';
import { getSession } from 'next-auth/react';
import pool from '@/lib/db';

export async function GET(request) {
  // Get the authorization header
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader) {
    return NextResponse.json(
      { error: 'Authorization header is required' },
      { status: 401 }
    );
  }

  // In a real app, you would validate the token here
  // For now, we'll just extract the user ID from the token
  const token = authHeader.split(' ')[1];
  const userId = 21; // Hardcoded for testing, replace with actual user ID from token
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get('companyId');

  if (!companyId) {
    return NextResponse.json(
      { error: 'Company ID is required' },
      { status: 400 }
    );
  }

  const connection = await pool.getConnection();
  
  try {
    // Verify user has access to this company
    const [companies] = await connection.query(
      'SELECT id FROM companies WHERE id = ? AND owner_id = ?',
      [companyId, userId]
    );

    if (companies.length === 0) {
      return NextResponse.json(
        { error: 'Company not found or access denied' },
        { status: 404 }
      );
    }

    // Get dashboard statistics
    const [stats] = await connection.query(
      `SELECT 
        COUNT(*) as total_reviews,
        IFNULL(AVG(rating), 0) as average_rating,
        SUM(CASE WHEN reply IS NULL OR reply = '' THEN 1 ELSE 0 END) as pending_replies,
        SUM(CASE WHEN reply IS NOT NULL AND reply != '' THEN 1 ELSE 0 END) as replied
       FROM reviews 
       WHERE company_id = ? AND owner_id = ?`,
      [companyId, userId]
    );

    const statsData = stats[0] || {};
    
    return NextResponse.json({
      average_rating: statsData.average_rating ? parseFloat(statsData.average_rating).toFixed(1) : '0.0',
      total_feedback: parseInt(statsData.total_reviews) || 0,
      pending_replies: parseInt(statsData.pending_replies) || 0,
      replied: parseInt(statsData.replied) || 0
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}
