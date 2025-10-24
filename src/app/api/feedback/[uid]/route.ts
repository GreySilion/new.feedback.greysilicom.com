import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { uid: string } }
) {
  const { uid } = params;
  let connection;

  try {
    connection = await pool.getConnection();
    
    // Get the review by UID
    const [rows] = await connection.query(
      `SELECT id, name, status 
       FROM reviews 
       WHERE uid = ?`,
      [uid]
    ) as any[];

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { error: 'Feedback request not found' },
        { status: 404 }
      );
    }

    const review = rows[0];
    
    // If already submitted, don't allow resubmission
    if (review.status === 'replied') {
      return NextResponse.json(
        { 
          error: 'Feedback already submitted',
          submitted: true
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      id: review.id,
      name: review.name,
      status: review.status
    });

  } catch (error) {
    console.error('Error fetching feedback:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feedback' },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}
