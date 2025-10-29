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
  const limit = parseInt(searchParams.get('limit')) || 5; // Default to 5 reviews
  const showPending = searchParams.get('showPending') !== 'false'; // Default to true

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

    // Build the query based on filters
    let query = `
      SELECT 
        r.id,
        r.name as reviewer_name,
        r.phone,
        r.review,
        r.rating,
        r.status,
        DATE_FORMAT(r.updated_at, '%b %d, %Y') as formatted_date,
        c.name as company_name
      FROM reviews r
      LEFT JOIN companies c ON r.company_id = c.id
      WHERE r.company_id = ? AND r.owner_id = ?
    `;

    const queryParams = [companyId, userId];

    // Add status filter if needed
    if (showPending) {
      query += ' AND (r.status IS NULL OR r.status = 0)';
    }

    // Add sorting and limiting
    query += ' ORDER BY r.updated_at DESC LIMIT ?';
    queryParams.push(limit);

    const [reviews] = await connection.query(query, queryParams);

    // Format the response to match the expected format
    const formattedReviews = reviews.map(review => ({
      id: review.id,
      reviewer_name: review.reviewer_name,
      phone: review.phone,
      review: review.review || 'No review text',
      rating: review.rating || 0,
      status: review.status === 1, // Convert to boolean
      formatted_date: review.formatted_date,
      company_name: review.company_name || 'Unknown Company'
    }));

    return NextResponse.json(formattedReviews);

  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}
