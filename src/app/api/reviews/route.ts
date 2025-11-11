//export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { RowDataPacket } from 'mysql2';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

interface Review extends RowDataPacket {
  id: string;
  title: string;
  comment: string;
  rating: number;
  created_at: string;
  customer_name?: string;
  company_name?: string;
  company_id: string | number;
  reply?: string;
  replied_at?: string | null;
  status?: 'pending' | 'replied';
}

export async function GET(request: Request) {
  try {
    // Verify session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const status = searchParams.get('status');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)));
    const offset = (page - 1) * limit;

    const userId = session.user.id;

    const connection = await pool.getConnection();

    try {
      console.log('Building query with params:', { userId, companyId, status });
      
      // Build dynamic query - only get reviews with actual content
      let query = `
        SELECT r.*, c.name as company_name
        FROM reviews r
        JOIN companies c ON r.company_id = c.id
        WHERE c.user_id = ?
        AND r.review IS NOT NULL 
        AND r.review != ''
      `;
      const queryParams: (string | number)[] = [userId];

      if (companyId) {
        query += ' AND r.company_id = ?';
        queryParams.push(companyId);
      }

      if (status === 'pending') {
        query += ' AND (r.reply IS NULL OR r.reply = "")';
      } else if (status === 'replied') {
        query += ' AND (r.reply IS NOT NULL AND r.reply != "")';
      }

      // Inline LIMIT and OFFSET to avoid binding errors
      query += ` ORDER BY r.created_at DESC LIMIT ${Number(limit)} OFFSET ${Number(offset)}`;

      console.log('Executing query:', query);
      console.log('With params:', queryParams);
      
      const [reviews] = await connection.query<Review[]>(query, queryParams);
      console.log(`Found ${reviews.length} reviews`);

      // Count query - only count reviews with actual content
      let countQuery = `
        SELECT COUNT(*) as total
        FROM reviews r
        JOIN companies c ON r.company_id = c.id
        WHERE c.user_id = ?
        AND r.review IS NOT NULL 
        AND r.review != ''
      `;
      const countParams: (string | number)[] = [userId];

      if (companyId) {
        countQuery += ' AND r.company_id = ?';
        countParams.push(companyId);
      }

      if (status === 'pending') {
        countQuery += ' AND (r.reply IS NULL OR r.reply = "")';
      } else if (status === 'replied') {
        countQuery += ' AND (r.reply IS NOT NULL AND r.reply != "")';
      }

      interface CountResult extends RowDataPacket {
        total: number;
      }

      console.log('Executing count query:', countQuery);
      console.log('With params:', countParams);
      
      const [countResult] = await connection.query<CountResult[]>(countQuery, countParams);
      const total = countResult[0]?.total || 0;
      
      console.log(`Found ${total} total reviews`);

      return NextResponse.json({
        success: true,
        data: reviews,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error fetching reviews:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch reviews',
        ...(process.env.NODE_ENV === 'development' && { details: errorMessage }),
      },
      { status: 500 }
    );
  }
}
