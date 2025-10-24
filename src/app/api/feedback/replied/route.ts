import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const offset = (page - 1) * limit;
  
  let connection;
  try {
    connection = await pool.getConnection();

    // Fetch paginated replied feedback (where reply is NOT NULL and not empty)
    const [rows] = await connection.query(
      `SELECT 
          r.*, 
          COALESCE(CONCAT(u.firstname, ' ', u.lastname), r.name) as name, 
          COALESCE(u.email, r.email) as email 
       FROM reviews r
       LEFT JOIN users u ON r.user_id = u.id
       WHERE r.reply IS NOT NULL AND r.reply != ''
       ORDER BY r.updated_at DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    // Get total count for pagination
    const [countResult] = await connection.query(
      `SELECT COUNT(*) as total FROM reviews r 
       WHERE r.reply IS NOT NULL AND r.reply != ''`
    ) as any[];
    
    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      data: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching replied feedback:', error);
    return NextResponse.json(
      { error: 'Failed to fetch replied feedback' },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}

export const dynamic = 'force-dynamic';
