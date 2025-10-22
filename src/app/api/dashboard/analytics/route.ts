import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import pool from '@/lib/db';

interface AnalyticsData {
  totalFeedback: number;
  averageRating: string;
  feedbackByRating: Array<{ rating: number; count: number }>;
  ratingsTrend: Array<{ date: string; averageRating: number }>;
}

export async function GET() {
  let connection;
  try {
    connection = await pool.getConnection();
    
    // Get current date and date 30 days ago
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    // Fetch all required analytics data
    const [totalFeedbackResult] = await connection.query<mysql.RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM reviews'
    );

    const [averageRatingResult] = await connection.query<mysql.RowDataPacket[]>(
      'SELECT COALESCE(AVG(COALESCE(rating, 0)), 0) as average FROM reviews'
    );

    const [feedbackByRating] = await connection.query<mysql.RowDataPacket[]>(
      `SELECT 
        rating, 
        COUNT(*) as count 
      FROM reviews 
      WHERE rating IS NOT NULL 
      GROUP BY rating 
      ORDER BY rating`
    );

    // Get ratings trend for the last 30 days
    const [ratingsTrend] = await connection.query<mysql.RowDataPacket[]>(
      `SELECT 
        DATE(created_at) as date,
        COALESCE(AVG(rating), 0) as averageRating
      FROM reviews
      WHERE created_at >= ?
      GROUP BY DATE(created_at)
      ORDER BY date`,
      [startDate]
    );

    // Format the response
    const result: AnalyticsData = {
      totalFeedback: Number(totalFeedbackResult[0]?.count) || 0,
      averageRating: parseFloat(String(averageRatingResult[0]?.average || 0)).toFixed(1),
      feedbackByRating: (feedbackByRating || []).map(item => ({
        rating: Number(item.rating),
        count: Number(item.count)
      })),
      ratingsTrend: (ratingsTrend || []).map(item => ({
        date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        averageRating: parseFloat(String(item.averageRating || 0))
      }))
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

export const dynamic = 'force-dynamic';
