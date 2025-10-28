import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request, { params }) {
  const { id: reviewId } = params;
  const { reply, userId } = await request.json();
  
  if (!reviewId) {
    return NextResponse.json(
      { error: 'Review ID is required' },
      { status: 400 }
    );
  }

  if (!reply) {
    return NextResponse.json(
      { error: 'Reply text is required' },
      { status: 400 }
    );
  }

  const connection = await pool.getConnection();
  
  try {
    // First, verify the review exists and belongs to the user
    const [reviews] = await connection.query(
      'SELECT r.* FROM reviews r WHERE r.id = ? AND r.owner_id = ?',
      [reviewId, userId]
    );

    if (reviews.length === 0) {
      return NextResponse.json(
        { error: 'Review not found or access denied' },
        { status: 404 }
      );
    }

    // Update the review with the reply and set status to 'replied'
    const [result] = await connection.query(
      `UPDATE reviews 
       SET reply = ?, status = 'replied', updated_at = NOW() 
       WHERE id = ?`,
      [reply, reviewId]
    );

    // Fetch the updated review with company name
    const [updatedReviews] = await connection.query(
      `SELECT r.*, c.name as company_name, 
              r.updated_at as replied_at 
       FROM reviews r 
       JOIN companies c ON r.company_id = c.id 
       WHERE r.id = ?`,
      [reviewId]
    );

    // Format the response to match the expected frontend format
    const review = {
      ...updatedReviews[0],
      replied_at: updatedReviews[0].updated_at // Map updated_at to replied_at for frontend
    };

    return NextResponse.json({
      message: 'Reply submitted successfully',
      review
    });

  } catch (error) {
    console.error('Error submitting reply:', error);
    return NextResponse.json(
      { 
        error: 'Failed to submit reply',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}
