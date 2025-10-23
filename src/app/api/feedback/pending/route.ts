import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  let connection;
  try {
    connection = await pool.getConnection();

    // Fetch all pending feedback (where reply is NULL or empty)
    const [rows] = await connection.query(
      `SELECT 
          r.*, 
          COALESCE(CONCAT(u.firstname, ' ', u.lastname), r.name) as name, 
          COALESCE(u.email, r.email) as email 
       FROM reviews r
       LEFT JOIN users u ON r.user_id = u.id
       WHERE r.reply IS NULL OR r.reply = ''
       ORDER BY r.date DESC`
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching pending feedback:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pending feedback' },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}

export const dynamic = 'force-dynamic';
