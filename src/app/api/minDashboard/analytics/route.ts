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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get('companyId');
  try {
    const connection = await db.getConnection();
    
    // Get weekly average ratings
    let weeklyQuery = `
      SELECT 
        DAYNAME(updated_at) AS day, 
        ROUND(AVG(rating), 2) AS avg_rating 
      FROM reviews 
      WHERE updated_at >= DATE_SUB(NOW(), INTERVAL 1 WEEK)
    `;

    if (companyId) {
      weeklyQuery += ` AND company_id = ?`;
    }

    weeklyQuery += `
      GROUP BY DAYOFWEEK(updated_at), DAYNAME(updated_at)
      ORDER BY DAYOFWEEK(updated_at)
    `;

    const [weeklyData] = companyId 
      ? await connection.query<WeeklyData[]>(weeklyQuery, [companyId])
      : await connection.query<WeeklyData[]>(weeklyQuery);

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

    const [monthlyData] = companyId 
      ? await connection.query<MonthlyData[]>(monthlyQuery, [companyId])
      : await connection.query<MonthlyData[]>(monthlyQuery);

    connection.release();

    // Ensure all days of the week are present with 0 values if no data
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const completeWeeklyData = daysOfWeek.map(day => {
      const dayData = Array.isArray(weeklyData) ? (weeklyData as WeeklyData[]).find(d => d.day === day) : null;
      return {
        day: day.substring(0, 3),
        avg_rating: dayData ? parseFloat(dayData.avg_rating as string) : 0
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        weekly: completeWeeklyData,
        monthly: monthlyData
      }
    });

  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}
