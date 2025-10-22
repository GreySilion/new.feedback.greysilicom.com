import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import pool from '@/lib/db';

interface DashboardStats {
  averageRating: string;
  totalFeedback: number;
  feedbackThisMonth: number;
  mostCommonRating: number | null;
}

export async function GET() {
  let connection;
  try {
    connection = await pool.getConnection();
    
    // Check if the reviews table exists
    const [tables] = await connection.query<mysql.RowDataPacket[]>(
      "SHOW TABLES LIKE 'reviews'"
    );
    
    if (!Array.isArray(tables) || tables.length === 0) {
      return NextResponse.json(
        { error: 'Reviews table does not exist' },
        { status: 404 }
      );
    }

    // Get current month's start and end dates
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    try {
      // Fetch all required stats in a single query for better performance
      const [rows] = await connection.query<mysql.RowDataPacket[]>(
        `SELECT 
          -- Average rating (handle NULL ratings by treating them as 0 for the average)
          COALESCE(AVG(COALESCE(rating, 0)), 0) as averageRating,
          
          -- Total feedback count
          COUNT(*) as totalFeedback,
          
          -- Feedback this month count
          SUM(CASE WHEN created_at BETWEEN ? AND ? THEN 1 ELSE 0 END) as feedbackThisMonth,
          
          -- Most common rating (mode)
          (
            SELECT rating 
            FROM reviews 
            WHERE rating IS NOT NULL 
            GROUP BY rating 
            ORDER BY COUNT(*) DESC 
            LIMIT 1
          ) as mostCommonRating
        FROM reviews`,
        [firstDayOfMonth, lastDayOfMonth]
      );

      if (!rows || rows.length === 0) {
        // If no data, return zeros
        return NextResponse.json({
          averageRating: '0.0',
          totalFeedback: 0,
          feedbackThisMonth: 0,
          mostCommonRating: null
        });
      }

      const stats = rows[0];
      const result: DashboardStats = {
        averageRating: parseFloat(String(stats.averageRating || 0)).toFixed(1),
        totalFeedback: Number(stats.totalFeedback) || 0,
        feedbackThisMonth: Number(stats.feedbackThisMonth) || 0,
        mostCommonRating: stats.mostCommonRating !== null ? Number(stats.mostCommonRating) : null
      };

      return NextResponse.json(result);
    } catch (queryError) {
      console.error('Database query error:', queryError);
      return NextResponse.json(
        { error: 'Failed to fetch dashboard statistics' },
        { status: 500 }
      );
    } finally {
      if (connection) {
        connection.release();
      }
    }
  } catch (error) {
    console.error('Error in dashboard stats endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic'; // Ensure we get fresh data on each request
