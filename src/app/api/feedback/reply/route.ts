import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import pool from '@/lib/db';

export async function POST(request: Request) {
  let connection;
  try {
    const { reviewId, reply } = await request.json();
    
    if (!reviewId || !reply) {
      return NextResponse.json(
        { error: 'Review ID and reply are required' },
        { status: 400 }
      );
    }

    connection = await pool.getConnection();

    // Update the review with the reply and set updated_at to current timestamp
    const [result] = await connection.query(
      `UPDATE reviews 
       SET reply = ?, updated_at = NOW() 
       WHERE id = ?`,
      [reply, reviewId]
    );

    if ((result as any).affectedRows === 0) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }

    // Fetch the updated review
    const [rows] = await connection.query<mysql.RowDataPacket[]>(
      `SELECT 
          r.*, 
          COALESCE(CONCAT(u.firstname, ' ', u.lastname), r.name) as name, 
          COALESCE(u.email, r.email) as email 
       FROM reviews r
       LEFT JOIN users u ON r.user_id = u.id
       WHERE r.id = ?`,
      [reviewId]
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { error: 'Failed to fetch updated review' },
        { status: 500 }
      );
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('Error replying to feedback:', error);
    return NextResponse.json(
      { error: 'Failed to submit reply' },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}

export const dynamic = 'force-dynamic';
