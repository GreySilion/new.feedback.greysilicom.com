import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import pool from '@/lib/db';

import type { RowDataPacket, OkPacket, ResultSetHeader } from 'mysql2';

interface AnalyticsData extends RowDataPacket {
  totalFeedback: number;
  averageRating: string;
  feedbackByRating: Array<{ rating: number; count: number }>;
  ratingsTrend: Array<{ date: string; averageRating: number }>;
  pendingReplies: number;
  avgResponseTime: string;
}

type QueryResult = RowDataPacket[] | RowDataPacket[][] | OkPacket | OkPacket[] | ResultSetHeader;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get('companyId');
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  if (!companyId) {
    return NextResponse.json(
      { success: false, error: 'Company ID is required' },
      { status: 400 }
    );
  }

  const userId = session.user.id;

  let connection;
  try {
    connection = await pool.getConnection();
    
    // Get current date and date 30 days ago
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    // Create a single query to fetch all analytics data
    const [results] = await connection.query<RowDataPacket[][]>(
      `-- Main metrics
      SELECT 
        -- Total feedback count
        (SELECT COUNT(*) FROM reviews WHERE company_id = ? AND owner_id = ?) as total_feedback,
        
        -- Average rating
        (SELECT COALESCE(AVG(COALESCE(rating, 0)), 0) FROM reviews WHERE company_id = ? AND owner_id = ?) as avg_rating,
        
        -- Pending replies count
        (SELECT COUNT(*) FROM reviews WHERE company_id = ? AND owner_id = ? AND (reply IS NULL OR reply = '')) as pending_replies,
        
        -- Average response time in hours
        (SELECT AVG(TIMESTAMPDIFF(HOUR, created_at, replied_at)) 
         FROM reviews 
         WHERE company_id = ? AND owner_id = ? AND replied_at IS NOT NULL) as avg_response_hours;
        
        -- Ratings distribution
        SELECT 
          rating, 
          COUNT(*) as count 
        FROM reviews 
        WHERE company_id = ? AND owner_id = ? AND rating IS NOT NULL 
        GROUP BY rating 
        ORDER BY rating;
        
        -- Ratings trend (last 30 days)
        SELECT 
          DATE(created_at) as date,
          COALESCE(AVG(rating), 0) as averageRating
        FROM reviews
        WHERE company_id = ? AND owner_id = ? AND created_at >= ?
        GROUP BY DATE(created_at)
        ORDER BY date;`,
      [
        // First query params
        companyId, userId,
        companyId, userId,
        companyId, userId,
        companyId, userId,
        // Second query params (for ratings distribution)
        companyId, userId,
        // Third query params (for ratings trend)
        companyId, userId, startDate
      ]
    );

    const [mainMetrics, feedbackByRating, ratingsTrend] = results as [RowDataPacket[], RowDataPacket[], RowDataPacket[]];
    const metrics = mainMetrics[0];
    
    const avgResponseHours = metrics.avg_response_hours || 0;
    const avgResponseTime = avgResponseHours 
      ? avgResponseHours < 24 
        ? `${Math.round(avgResponseHours)}h` 
        : `${Math.round(avgResponseHours / 24)}d`
      : 'N/A';

    // Format the response
    const result: Omit<AnalyticsData, keyof RowDataPacket> = {
      totalFeedback: Number(metrics.total_feedback) || 0,
      averageRating: parseFloat(metrics.avg_rating || '0').toFixed(1),
      feedbackByRating: feedbackByRating.map(item => ({
        rating: Number(item.rating),
        count: Number(item.count)
      })),
      ratingsTrend: ratingsTrend.map(item => ({
        date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        averageRating: parseFloat(item.averageRating || '0')
      })),
      pendingReplies: Number(metrics.pending_replies) || 0,
      avgResponseTime: avgResponseHours 
        ? avgResponseHours < 24 
          ? `${Math.round(avgResponseHours)}h` 
          : `${Math.round(avgResponseHours / 24)}d`
        : 'N/A'
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
