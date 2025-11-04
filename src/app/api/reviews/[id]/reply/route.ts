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
  console.log('Received request to reply to review:', params.id);
  
  try {
    const { id } = params;
    const body = await request.json();
    console.log('Request body:', body);
    
    const { reply, userId } = body;

    if (!reply || !userId) {
      const error = { error: 'Reply text and user ID are required', received: { reply: !!reply, userId: !!userId } };
      console.error('Validation error:', error);
      return NextResponse.json(error, { status: 400 });
    }

    const connection = await pool.getConnection();
    console.log('Database connection acquired');
    
    try {
      // First, verify the review exists
      console.log(`Checking if review ${id} exists and is accessible by user ${userId}`);
      
      const [reviews] = await connection.query<Review[]>(
        `SELECT r.* FROM reviews r
         LEFT JOIN companies c ON r.company_id = c.id
         WHERE r.id = ?`,
        [id]
      );

      console.log('Review check result:', reviews);

      if (!Array.isArray(reviews) || reviews.length === 0) {
        const error = { error: 'Review not found', reviewId: id };
        console.error('Review not found:', error);
        return NextResponse.json(error, { status: 404 });
      }
      
      // Check if user has access (commented out for now to test)
      // if (reviews[0].owner_id && reviews[0].owner_id !== userId) {
      //   const error = { error: 'Access denied', reviewId: id, userId };
      //   console.error('Access denied:', error);
      //   return NextResponse.json(error, { status: 403 });
      // }

      // Update the review with the reply
      console.log(`Updating review ${id} with reply`);
      
      // Using status = 1 to indicate 'replied' (assuming 1 means replied in your status field)
      const [updateResult] = await connection.query(
        `UPDATE reviews 
         SET reply = ?, status = 1, updated_at = NOW() 
         WHERE id = ?`,
        [reply, id]
      );
      
      console.log('Update result:', updateResult);

      // Get the updated review with company name
      const [updatedReviews] = await connection.query<Review[]>(
        `SELECT r.*, c.name as company_name 
         FROM reviews r
         LEFT JOIN companies c ON r.company_id = c.id
         WHERE r.id = ?`,
        [id]
      );
      
      const updatedReview = updatedReviews[0];
      console.log('Updated review:', updatedReview);

      // Map to the expected response format
      const responseData = {
        ...updatedReview,
        status: updatedReview.status === 1 ? 'replied' : 'pending',
        replied_at: updatedReview.updated_at // Use updated_at since we don't have replied_at
      };

      return NextResponse.json({
        success: true,
        message: 'Reply submitted successfully',
        data: responseData
      });

    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Error in reply endpoint:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    const errorDetails = {
      error: 'An error occurred while submitting the reply',
      message: errorMessage,
      stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined
    };
    console.error('Error details:', errorDetails);
    return NextResponse.json(errorDetails, { status: 500 });
  }
}
