import { NextResponse } from 'next/server';
import { RowDataPacket } from 'mysql2';
import pool from '@/lib/db';

interface Review extends RowDataPacket {
  id: string;
  company_id: string | number;
  // Add other review fields as needed
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { reply, userId } = await request.json();

    if (!reply || !userId) {
      return NextResponse.json(
        { error: 'Reply text and user ID are required' },
        { status: 400 }
      );
    }

    const connection = await pool.getConnection();
    
    try {
      // First, verify the review exists and belongs to a company the user has access to
      const [reviews] = await connection.query<Review[]>(
        `SELECT r.* FROM reviews r
         JOIN companies c ON r.company_id = c.id
         WHERE r.id = ? AND c.owner_id = ?`,
        [id, userId]
      );

      if (!Array.isArray(reviews) || reviews.length === 0) {
        return NextResponse.json(
          { error: 'Review not found or access denied' },
          { status: 404 }
        );
      }

      // Update the review with the reply
      await connection.query(
        `UPDATE reviews 
         SET reply = ?, status = 'replied', replied_at = NOW() 
         WHERE id = ?`,
        [reply, id]
      );

      // Get the updated review
      const [updatedReviews] = await connection.query<Review[]>(
        'SELECT * FROM reviews WHERE id = ?',
        [id]
      );

      return NextResponse.json({
        message: 'Reply submitted successfully',
        data: updatedReviews[0]
      });

    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Error submitting reply:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json(
      { 
        error: 'An error occurred while submitting the reply',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}
