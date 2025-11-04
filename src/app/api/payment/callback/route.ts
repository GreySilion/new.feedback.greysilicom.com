import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import type { RowDataPacket, ResultSetHeader, FieldPacket } from 'mysql2/promise';

interface ReviewRow extends RowDataPacket {
  id: number;
}

interface PaymentCallbackRequest {
  cname: string;
  phone: string;
  uid: string;
}

interface DatabaseError {
  code: string;
  errno: number;
  sqlMessage: string;
  sqlState: string;
  sql: string;
}

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
    const [existing] = await connection.query<ReviewRow[]>(
      'SELECT id FROM reviews WHERE uid = ?',
      [uid]
    ) as [ReviewRow[], FieldPacket[]];

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

  } catch (error: unknown) {
    console.error('Error processing payment callback:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    const errorDetails = error instanceof Error ? {
      name: error.name,
      message: error.message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    } : {};

    return NextResponse.json(
      { 
        error: 'Failed to process payment',
        message: errorMessage,
        ...(process.env.NODE_ENV === 'development' && { details: errorDetails })
      },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}
