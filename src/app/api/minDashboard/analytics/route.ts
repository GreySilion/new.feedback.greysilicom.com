import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { RowDataPacket } from 'mysql2';

interface WeeklyData extends RowDataPacket {
  day: string;
  avg_rating: string | number;
}

interface MonthlyData extends RowDataPacket {
  month: string;
  total_reviews: number;
}

// Disable static generation for this route
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get('companyId');
  
  // Validate companyId if provided
  if (companyId && isNaN(Number(companyId))) {
    return NextResponse.json(
      { success: false, error: 'Invalid company ID' },
      { status: 400 }
    );
  }

  let connection;
  
  if (!db) {
    return NextResponse.json(
      { success: false, error: 'Database connection not available' },
      { status: 500 }
    );
  }

  try {
    connection = await db.getConnection();
    
    if (!connection) {
      throw new Error('Failed to establish database connection');
    }
    
    // Get weekly average ratings
    let weeklyQuery = `
      SELECT 
        DAYNAME(updated_at) AS day, 
        ROUND(COALESCE(AVG(rating), 0), 2) AS avg_rating 
      FROM reviews 
      WHERE updated_at >= DATE_SUB(NOW(), INTERVAL 1 WEEK)
    `;

    const queryParams = [];
    if (companyId) {
      weeklyQuery += ` AND company_id = ?`;
      queryParams.push(companyId);
    }

    weeklyQuery += `
      GROUP BY DAYOFWEEK(updated_at), DAYNAME(updated_at)
      ORDER BY DAYOFWEEK(updated_at)
    `;

    // Execute weekly query
    const [weeklyData] = await connection.query<WeeklyData[]>(weeklyQuery, queryParams);

    // Reset query params for monthly query
    const monthlyParams = companyId ? [companyId] : [];
    
    // Get monthly review counts for the last 6 months
    let monthlyQuery = `
      SELECT 
        DATE_FORMAT(updated_at, '%b %Y') AS month,
        COUNT(*) AS total_reviews
      FROM reviews
      WHERE updated_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
    `;

    if (companyId) {
      monthlyQuery += ` AND company_id = ?`;
    }

    monthlyQuery += `
      GROUP BY DATE_FORMAT(updated_at, '%Y-%m'), month
      ORDER BY MIN(updated_at)
    `;

    // Execute monthly query
    const [monthlyData] = await connection.query<MonthlyData[]>(monthlyQuery, monthlyParams);

    // Ensure all days of the week are present with 0 values if no data
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const completeWeeklyData = daysOfWeek.map(day => {
      const dayData = Array.isArray(weeklyData) 
        ? weeklyData.find(d => d.day === day)
        : null;
      
      // Safely parse the average rating, defaulting to 0 if parsing fails
      let avgRating = 0;
      if (dayData) {
        try {
          avgRating = typeof dayData.avg_rating === 'number' 
            ? dayData.avg_rating 
            : parseFloat(dayData.avg_rating as string) || 0;
        } catch (e) {
          console.error('Error parsing average rating:', e);
          avgRating = 0;
        }
      }

      return {
        day: day.substring(0, 3),
        avg_rating: avgRating
      };
    });

    // Ensure monthly data is properly formatted
    const formattedMonthlyData = Array.isArray(monthlyData) 
      ? monthlyData.map(item => ({
          month: item.month,
          total_reviews: typeof item.total_reviews === 'number' 
            ? item.total_reviews 
            : parseInt(item.total_reviews as string, 10) || 0
        }))
      : [];

    return NextResponse.json({
      success: true,
      data: {
        weekly: completeWeeklyData,
        monthly: formattedMonthlyData,
        lastUpdated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch analytics data',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  } finally {
    // Ensure the connection is always released
    if (connection) {
      try {
        await connection.release();
      } catch (releaseError) {
        console.error('Error releasing database connection:', releaseError);
      }
    }
  }
}
