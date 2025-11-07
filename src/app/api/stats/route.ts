import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/config';
import pool from '@/lib/db';
import type { RowDataPacket } from 'mysql2/promise';

export const dynamic = 'force-dynamic';

interface StatsResponse {
  totalReviews: number;
  averageRating: string;
  ratingDistribution: Record<number, number>;
  statusDistribution: Record<string, number>;
  recentReviews: Array<{
    id: number;
    rating: number;
    review: string | null;
    title: string | null;
    created_at: string;
    company_name: string;
    name: string | null;
    email: string | null;
    phone: string | null;
  }>;
  companies: Array<{
    id: number;
    name: string;
    reviewCount: number;
    averageRating: string;
  }>;
  feedbackStats: {
    total: number;
    sent: number;
    pending: number;
  };
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export async function GET(request: Request): Promise<NextResponse<ApiResponse<StatsResponse>>> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    const companyCondition = companyId ? 'AND c.id = ?' : '';
    const queryParams: (string | number)[] = [userId];
    if (companyId) queryParams.push(companyId);

    // --- Main Stats ---
    const [statsResult] = await pool.query<RowDataPacket[]>(
      `SELECT 
        COUNT(r.id) as total_reviews,
        COALESCE(AVG(r.rating), 0) as average_rating,
        COALESCE(SUM(c.feedback_count), 0) as total_feedback,
        COALESCE(SUM(c.feedback_sent), 0) as feedback_sent
      FROM companies c
      LEFT JOIN reviews r ON c.id = r.company_id
      WHERE c.owner_id = ? ${companyCondition}`,
      queryParams
    );

    const totalFeedback = Number(statsResult[0]?.total_feedback) || 0;
    const feedbackSent = Number(statsResult[0]?.feedback_sent) || 0;

    // --- Rating Distribution ---
    const [ratingDistResult] = await pool.query<RowDataPacket[]>(
      `SELECT 
        r.rating,
        COUNT(*) as count
      FROM reviews r
      JOIN companies c ON r.company_id = c.id
      WHERE c.owner_id = ? ${companyCondition}
      GROUP BY r.rating
      ORDER BY r.rating`,
      queryParams
    );

    // --- Status Distribution ---
    const [statusDistResult] = await pool.query<RowDataPacket[]>(
      `SELECT 
        r.status,
        COUNT(*) as count
      FROM reviews r
      JOIN companies c ON r.company_id = c.id
      WHERE c.owner_id = ? ${companyCondition}
      GROUP BY r.status`,
      queryParams
    );

    // --- Recent Reviews ---
    const [recentReviews] = await pool.query<RowDataPacket[]>(
      `SELECT 
        r.id,
        r.rating,
        r.review,
        r.title,
        r.created_at,
        r.name,
        r.email,
        r.phone,
        c.name as company_name
      FROM reviews r
      JOIN companies c ON r.company_id = c.id
      WHERE c.owner_id = ? ${companyCondition}
      ORDER BY COALESCE(r.date, r.created_at) DESC
      LIMIT 5`,
      queryParams
    );

    // --- Companies Summary ---
    const [companies] = await pool.query<RowDataPacket[]>(
      `SELECT 
        c.id,
        c.name,
        COALESCE((
          SELECT COUNT(*) FROM reviews WHERE company_id = c.id
        ), 0) as review_count,
        COALESCE((
          SELECT AVG(rating) FROM reviews WHERE company_id = c.id
        ), 0) as average_rating
      FROM companies c
      WHERE c.owner_id = ? ${companyCondition}
      ORDER BY c.name`,
      queryParams
    );

    // --- Response Formatting ---
    const response: StatsResponse = {
      totalReviews: Number(statsResult[0]?.total_reviews) || 0,
      averageRating: Number(statsResult[0]?.average_rating || 0).toFixed(1),
      ratingDistribution: {
        1: 0, 2: 0, 3: 0, 4: 0, 5: 0,
        ...Object.fromEntries(
          ratingDistResult.map(row => [Number(row.rating), Number(row.count)])
        )
      },
      statusDistribution: Object.fromEntries(
        statusDistResult.map(row => [row.status, Number(row.count)])
      ),
      recentReviews: recentReviews.map(r => ({
        id: Number(r.id),
        rating: Number(r.rating),
        review: r.review,
        title: r.title,
        created_at: r.created_at,
        company_name: r.company_name,
        name: r.name,
        email: r.email,
        phone: r.phone
      })),
      companies: companies.map(c => ({
        id: Number(c.id),
        name: c.name,
        reviewCount: Number(c.review_count || 0),
        averageRating: Number(c.average_rating || 0).toFixed(1)
      })),
      feedbackStats: {
        total: totalFeedback,
        sent: feedbackSent,
        pending: Math.max(0, totalFeedback - feedbackSent)
      }
    };

    return NextResponse.json({
      success: true,
      data: response
    });

  } catch (error) {
    console.error('Error in GET /api/stats:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch dashboard statistics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
