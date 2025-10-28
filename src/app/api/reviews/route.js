import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const companyId = searchParams.get('companyId');

  // Validate userId
  if (!userId) {
    return NextResponse.json(
      { error: 'Authentication required. Please provide a valid user ID.' },
      { status: 401 }
    );
  }

  const connection = await pool.getConnection();
  
  try {
    // First, get the user's companies to verify access
    const [userCompanies] = await connection.query(
      'SELECT id, name FROM companies WHERE user_id = ?',
      [userId]
    );

    if (userCompanies.length === 0) {
      return NextResponse.json(
        { 
          message: 'No companies found for your account. Please add a company first.',
          data: [] 
        },
        { status: 200 }
      );
    }

    // If companyId is provided, verify the user has access to it
    if (companyId) {
      const hasAccess = userCompanies.some(company => company.id.toString() === companyId);
      if (!hasAccess) {
        return NextResponse.json(
          { error: 'Company not found or access denied' },
          { status: 404 }
        );
      }
    }

    // Build the base query
    let query = `
      SELECT r.*, c.name as company_name 
      FROM reviews r 
      JOIN companies c ON r.company_id = c.id 
      WHERE c.user_id = ?
    `;
    const queryParams = [userId];

    // Add company filter if specified
    if (companyId) {
      query += ' AND c.id = ?';
      queryParams.push(companyId);
    }

    query += ' ORDER BY r.created_at DESC';

    // Execute the query
    const [reviews] = await connection.query(query, queryParams);

    // Format the response with company context
    const response = {
      message: 'Reviews retrieved successfully',
      data: reviews,
      meta: {
        total: reviews.length,
        companyId: companyId || 'all',
        companies: userCompanies.map(company => ({
          id: company.id,
          name: company.name,
          review_count: companyId 
            ? (companyId === company.id.toString() ? reviews.length : 0)
            : reviews.filter(r => r.company_id === company.id).length
        }))
      }
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { 
        error: 'An error occurred while fetching reviews',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}
