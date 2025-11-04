export interface AnalyticsData {
  weekly: {
    day: string;
    avg_rating: number;
  }[];
  monthly: {
    month: string;
    total_reviews: number;
  }[];
  lastUpdated?: string;
}

export async function fetchAnalytics(companyId: string): Promise<AnalyticsData> {
  try {
    const response = await fetch(`/api/minDashboard/analytics?companyId=${companyId}`, {
      cache: 'no-store', // Ensure we get fresh data
    });

    if (!response.ok) {
      throw new Error('Failed to fetch analytics data');
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to load analytics');
    }

    return data.data;
  } catch (error) {
    console.error('Error fetching analytics:', error);
    throw error;
  }
}
