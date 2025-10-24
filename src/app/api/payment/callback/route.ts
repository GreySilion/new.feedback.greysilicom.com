import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: Request) {
  let connection;
  try {
    const { cname, phone, uid } = await request.json();
    
    if (!cname || !phone || !uid) {
      return NextResponse.json(
        { error: 'Name, phone, and UID are required' },
        { status: 400 }
      );
    }

    connection = await pool.getConnection();

    // Check if a review with this UID already exists
    const [existing] = await connection.query(
      'SELECT id FROM reviews WHERE uid = ?',
      [uid]
    ) as any[];

    if (existing && existing.length > 0) {
      return NextResponse.json(
        { error: 'A review with this transaction ID already exists' },
        { status: 400 }
      );
    }

    // Create a new review record with default values
    await connection.query(
      `INSERT INTO reviews 
      (name, phone, uid, status, created_at, updated_at, date, rating, review, reply)
      VALUES (?, ?, ?, 'pending', NOW(), NOW(), NOW(), 0, NULL, NULL)`,
      [cname, phone, uid]
    );

    return NextResponse.json({
      status: 'success',
      message: 'Payment processed successfully. Feedback record created.'
    });

  } catch (error) {
    console.error('Error processing payment callback:', error);
    return NextResponse.json(
      { error: 'Failed to process payment callback' },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}
