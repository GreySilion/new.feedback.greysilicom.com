import { NextResponse } from 'next/server';
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
  const token = authHeader.split(' ')[1];
  const userId = 21; // Hardcoded for testing, replace with actual user ID from token

  const connection = await pool.getConnection();
  
  try {
    // Fetch companies that belong to the user
    const [companies] = await connection.query(
      'SELECT id, name, status, created_at FROM companies WHERE owner_id = ?',
      [userId]
    );

    // If no companies found, return empty array
    if (!companies || companies.length === 0) {
      return NextResponse.json([]);
    }

    return NextResponse.json(companies);

  } catch (error) {
    console.error('Error fetching companies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch companies' },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}
