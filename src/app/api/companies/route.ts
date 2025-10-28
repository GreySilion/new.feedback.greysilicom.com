import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/server/auth';
import pool from '@/lib/db';
import type { ResultSetHeader } from 'mysql2/promise';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json(
      { success: false, error: 'User ID is required' },
      { status: 400 }
    );
  }

  try {
    const [rows] = await pool.query(
      'SELECT id, name, status, created_at FROM companies WHERE user_id = ? ORDER BY name ASC',
      [userId]
    );

    return NextResponse.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error('Error fetching companies:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch companies' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // First get the user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Then parse the request body
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON payload' },
        { status: 400 }
      );
    }

    const { name, description } = body;

    // Validate input
    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Company name is required' },
        { status: 400 }
      );
    }

    const connection = await pool.getConnection();

    try {
      // Start transaction
      await connection.beginTransaction();

      // Insert new company
      const [result] = await connection.execute<ResultSetHeader>(
        'INSERT INTO companies (user_id, name, description, status, created_at, updated_at) VALUES (?, ?, ?, 1, NOW(), NOW())',
        [user.id, name.trim(), description?.trim() || null]
      );

      const insertId = result.insertId;
      if (!insertId) {
        throw new Error('Failed to get insert ID');
      }

      // Get the inserted company
      const [companyRows] = await connection.query(
        'SELECT id, name, status, created_at FROM companies WHERE id = ?',
        [insertId]
      );
      
      // Ensure we have a valid company object
      const company = Array.isArray(companyRows) ? companyRows[0] : companyRows;

      // Commit transaction
      await connection.commit();

      // Ensure we have a valid company object
      const companyData = Array.isArray(company) ? company[0] : company;
      
      if (!companyData) {
        throw new Error('Failed to retrieve created company');
      }

      return NextResponse.json({
        success: true,
        data: companyData,
        userId: user.id,
      });
    } catch (error) {
      await connection.rollback();
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: 'Database error occurred' },
        { status: 500 }
      );
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
