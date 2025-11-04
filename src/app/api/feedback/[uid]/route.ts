import { NextResponse } from 'next/server';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { RowDataPacket, FieldPacket, ResultSetHeader } from 'mysql2/promise';
import pool from '@/lib/db';

type QueryResult<T = RowDataPacket> = T[] & { affectedRows?: number; insertId?: number };

interface ReviewRow extends RowDataPacket {
  id: number;
  uid: string;
  rating: number | null;
  review: string | null;
  status: string | null;
  name: string | null;
  company_id: number | null;
  user_id: number | null;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface UserRow extends RowDataPacket {
  name?: string;
}

interface Feedback extends RowDataPacket {
  id: number;
  uid: string;
  rating: number;
  review: string | null;
  status: string;
  created_at: Date;
  updated_at: Date;
  user_id: number;
  company_id: number;
  completed_at: Date | null;
  userName?: string;
  companyName?: string;
}

type FeedbackWithRelations = Feedback & {
  userName?: string;
  companyName?: string;
};


export async function GET(
  request: Request,
  { params }: { params: { uid: string } }
) {
  try {
    const { uid } = params;
    
    // Get a connection from the pool
    const connection = await pool.getConnection();
    
    try {
      // Find the feedback by UID
      // First, get the feedback with just the basic data
      // First, get the review details using the UID
      const [reviewRows] = await connection.query<RowDataPacket[]>(
        'SELECT id, user_id, company_id FROM reviews WHERE uid = ?',
        [uid]
      ) as [RowDataPacket[], any];
      
      if (!reviewRows || reviewRows.length === 0) {
        return NextResponse.json(
          { error: 'Review not found' },
          { status: 404 }
        );
      }
      
      const review = reviewRows[0];
      
      // Get the full review details with company info
      const [reviewWithDetails] = await connection.query<QueryResult<FeedbackWithRelations>>(
        `SELECT r.*, c.name as companyName, r.name as userName 
         FROM reviews r
         LEFT JOIN companies c ON r.company_id = c.id
         WHERE r.id = ?`, 
        [review.id]
      ) as [QueryResult<FeedbackWithRelations>, FieldPacket[]];
      
      const feedback = reviewWithDetails[0];

      if (!feedback) {
        return NextResponse.json(
          { error: 'Feedback not found' },
          { status: 404 }
        );
      }

      // Return the feedback data
      if (!feedback) {
        return NextResponse.json(
          { error: 'Feedback not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        id: feedback.id,
        uid: feedback.uid,
        rating: feedback.rating,
        review: feedback.review,
        status: feedback.status,
        companyName: feedback.companyName,
        name: feedback.userName,
        createdAt: feedback.created_at,
        updatedAt: feedback.updated_at
      });
    } finally {
      // Release the connection back to the pool
      connection.release();
    }
  } catch (error) {
    console.error('Error in GET /api/feedback/[uid]:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { uid: string } }
) {
  const connection = await pool.getConnection();
  
  try {
    const { uid } = params;
    const { rating, review } = await request.json();
    
    // Ensure review is a string or null
    const reviewText = typeof review === 'string' ? review.trim() : null;
    try {
      console.log(`Looking up review with UID: ${uid}`);
      
      // First, get the review details using the UID
      const [reviewRows] = await connection.query<ReviewRow[]>(
        'SELECT * FROM reviews WHERE uid = ?',
        [uid]
      );
      
      console.log('Review rows from database:', reviewRows);

      if (!reviewRows || reviewRows.length === 0) {
        const error = `No review found with UID: ${uid}`;
        console.error(error);
        return NextResponse.json(
          { error: 'Review not found', details: error },
          { status: 404 }
        );
      }
      
      const reviewData = reviewRows[0];
      console.log('Found review:', reviewData);

      // Start a transaction
      await connection.beginTransaction();
      
      try {
        console.log(`Updating review ${reviewData.id} with rating: ${rating}, review: ${reviewText}`);
        
        // First, update the review with the new data
        // Only update status to 1 (replied) if it's not already set
        // Otherwise, keep the existing status (0 for pending)
        const [updateResult] = await connection.execute<ResultSetHeader>(
          'UPDATE reviews SET rating = ?, review = ?, status = COALESCE(status, 0), updated_at = NOW() WHERE id = ?',
          [rating, reviewText, reviewData.id]
        ) as [ResultSetHeader, FieldPacket[]];
        
        console.log('Update result:', updateResult);
        
        if (updateResult.affectedRows === 0) {
          throw new Error('No rows were updated');
        }

        // Commit the transaction
        await connection.commit();
        
        // Get the updated review with all its data
        const [updatedRows] = await connection.query<ReviewRow[]>(
          'SELECT * FROM reviews WHERE id = ?',
          [reviewData.id]
        );
        
        const updatedReview = updatedRows[0];
        console.log('Updated review from database:', updatedReview);
        
        // Commit the transaction
        await connection.commit();
        
        // Get company name if available
        let companyName = null;
        if (updatedReview.company_id) {
          const [companyRows] = await connection.query<RowDataPacket[]>(
            'SELECT name FROM companies WHERE id = ?',
            [updatedReview.company_id]
          ) as [RowDataPacket[], any];
          companyName = companyRows[0]?.name || null;
        }
        
        return NextResponse.json({
          success: true,
          data: {
            id: updatedReview.id,
            uid: updatedReview.uid,
            rating: updatedReview.rating,
            review: updatedReview.review,
            status: updatedReview.status,
            userName: updatedReview.name,
            companyName: companyName,
            message: 'Review updated successfully'
          }
        });
        
      } catch (error) {
        await connection.rollback();
        console.error('Error updating review:', error);
        throw error;
      }

      // Get the updated review with company data
      const [updatedRows] = await connection.query<RowDataPacket[]>(
        `SELECT r.*, c.name as companyName, r.name as userName
         FROM reviews r
         LEFT JOIN companies c ON r.company_id = c.id
         WHERE r.uid = ?`,
        [uid]
      ) as [RowDataPacket[], any];
      
      const updatedFeedback = updatedRows[0] as FeedbackWithRelations;
      
      // If we have a result, get the user's name separately
      if (updatedFeedback && updatedFeedback.user_id) {
        const [userRows] = await connection.query<RowDataPacket[]>(
          'SELECT name FROM users WHERE id = ?',
          [updatedFeedback.user_id]
        ) as [RowDataPacket[], any];
        
        if (userRows && userRows.length > 0) {
          updatedFeedback.userName = userRows[0].name as string;
        }
      }

      // Commit the transaction
      await connection.commit();

      if (!updatedFeedback) {
        return NextResponse.json(
          { error: 'Failed to fetch updated feedback' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        id: updatedFeedback.id,
        uid: updatedFeedback.uid,
        rating: updatedFeedback.rating,
        review: updatedFeedback.review,
        status: updatedFeedback.status,
        companyName: updatedFeedback.companyName,
        name: updatedFeedback.userName,
        createdAt: updatedFeedback.created_at,
        updatedAt: updatedFeedback.updated_at
      });
    } catch (error) {
      // Rollback the transaction in case of error
      await connection.rollback();
      console.error('Error in PATCH /api/feedback/[uid] transaction:', error);
      throw error;
    } finally {
      // Release the connection back to the pool
      connection.release();
    }
  } catch (error) {
    console.error('Error in PATCH /api/feedback/[uid]:', error);
    
    if (error instanceof Error && 'code' in error) {
      if (error.code === 'ER_NO_REFERENCED_ROW_2') {
        return NextResponse.json(
          { 
            error: 'Referenced user or company not found',
            details: error.message
          },
          { status: 404 }
        );
      } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
        return NextResponse.json(
          { 
            error: 'Database access denied',
            message: 'Please check your database credentials',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
          },
          { status: 500 }
        );
      } else if (error.code === 'ECONNREFUSED') {
        return NextResponse.json(
          { 
            error: 'Database connection refused',
            message: 'Could not connect to the database server',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
          },
          { status: 500 }
        );
      }
    }
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'An unknown error occurred',
        ...(process.env.NODE_ENV === 'development' && {
          stack: error instanceof Error ? error.stack : undefined,
          raw: JSON.stringify(error, Object.getOwnPropertyNames(error))
        })
      },
      { status: 500 }
    );
  }
}
