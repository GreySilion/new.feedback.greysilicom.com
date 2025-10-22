import { BarChart3, TrendingUp, Star } from 'lucide-react';
import ChartsSection from './ChartsSection';

async function getAnalyticsData() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/dashboard/analytics`, {
      next: { revalidate: 60 } // Revalidate every 60 seconds
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch analytics data');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    return null;
  }
}

export default async function AnalyticsPage() {
  const analyticsData = await getAnalyticsData();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
          <p className="mt-1 text-sm text-gray-500">Track your feedback performance and insights</p>
        </div>
        <div className="mt-4 flex space-x-3 md:mt-0">
          <button className="inline-flex items-center rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
            <TrendingUp className="-ml-0.5 mr-1.5 h-5 w-5" />
            Export Report
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 rounded-md bg-blue-500 p-3">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dt className="truncate text-sm font-medium text-gray-500">Total Feedback</dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-gray-900">
                  {analyticsData?.totalFeedback?.toLocaleString() || '0'}
                </div>
              </dd>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 rounded-md bg-green-500 p-3">
              <Star className="h-6 w-6 text-white" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dt className="truncate text-sm font-medium text-gray-500">Average Rating</dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-gray-900">
                  {analyticsData?.averageRating || '0.0'}
                </div>
                <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                  <span>2.3%</span>
                  <span className="sr-only">increase from last month</span>
                </div>
              </dd>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 rounded-md bg-yellow-500 p-3">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dt className="truncate text-sm font-medium text-gray-500">Avg. Response Time</dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-gray-900">4h 23m</div>
                <div className="ml-2 flex items-baseline text-sm font-semibold text-red-600">
                  <span>8.1%</span>
                  <span className="sr-only">increase from last month</span>
                </div>
              </dd>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 rounded-md bg-purple-500 p-3">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dt className="truncate text-sm font-medium text-gray-500">Pending Replies</dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-gray-900">23</div>
                <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                  <span>15.3%</span>
                  <span className="sr-only">decrease from last month</span>
                </div>
              </dd>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <ChartsSection />
    </div>
  );
}
