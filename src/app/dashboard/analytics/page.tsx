'use client';

import { useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import { BarChart3, Star, Clock, MessageSquare, RefreshCw } from 'lucide-react';
import ChartsSection from './ChartsSection';

interface AnalyticsData {
  totalFeedback: number;
  averageRating: string;
  feedbackByRating: Array<{ rating: number; count: number }>;
  ratingsTrend: Array<{ date: string; averageRating: number }>;
  pendingReplies?: number;
  avgResponseTime?: string;
}

const fetcher = async (url: string) => {
  const res = await fetch(url, {
    headers: {
      'Cache-Control': 'no-cache',
      'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
    }
  });
  
  if (!res.ok) {
    const error = new Error('Failed to fetch analytics data');
    throw error;
  }
  
  return res.json();
};

// Skeleton loader component
const SkeletonLoader = () => (
  <div className="space-y-6">
    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
      <div className="h-8 bg-gray-200 rounded w-64 animate-pulse"></div>
    </div>
    
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="p-6 bg-white rounded-lg shadow">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="ml-4 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
              <div className="h-6 bg-gray-200 rounded w-16 animate-pulse"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
    
    <div className="grid grid-cols-1 gap-5 mt-6 lg:grid-cols-2">
      <div className="p-6 bg-white rounded-lg shadow h-80">
        <div className="h-full bg-gray-200 rounded animate-pulse"></div>
      </div>
      <div className="p-6 bg-white rounded-lg shadow h-80">
        <div className="h-full bg-gray-200 rounded animate-pulse"></div>
      </div>
    </div>
  </div>
);

function AnalyticsPage() {
  const searchParams = useSearchParams();
  const companyId = searchParams.get('companyId');
  
  const { data, error, isLoading, mutate } = useSWR<AnalyticsData>(
    companyId ? `/api/dashboard/analytics?companyId=${companyId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60000, // 1 minute
      errorRetryCount: 3,
    }
  );

  const handleRefresh = () => {
    mutate();
  };

  if (isLoading) {
    return <SkeletonLoader />;
  }

  if (error) {
    return (
      <div className="p-4 rounded-md bg-red-50">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading analytics</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>Failed to load analytics data. Please try again.</p>
            </div>
            <div className="mt-4">
              <button
                onClick={handleRefresh}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
          <p className="mt-1 text-sm text-gray-500">Track your feedback performance and insights</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="inline-flex items-center px-3 py-1.5 mt-2 md:mt-0 text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Data
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="overflow-hidden transition-all duration-200 bg-white rounded-lg shadow hover:shadow-md">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 rounded-md bg-blue-100">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-5">
                <dt className="text-sm font-medium text-gray-500 truncate">Total Feedback</dt>
                <dd className="flex items-baseline">
                  <div className="text-2xl font-semibold text-gray-900">
                    {data?.totalFeedback?.toLocaleString() || '0'}
                  </div>
                </dd>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden transition-all duration-200 bg-white rounded-lg shadow hover:shadow-md">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 rounded-md bg-green-100">
                <Star className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-5">
                <dt className="text-sm font-medium text-gray-500 truncate">Average Rating</dt>
                <dd className="flex items-baseline">
                  <div className="text-2xl font-semibold text-gray-900">
                    {data?.averageRating || '0.0'}
                  </div>
                </dd>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden transition-all duration-200 bg-white rounded-lg shadow hover:shadow-md">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 rounded-md bg-yellow-100">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-5">
                <dt className="text-sm font-medium text-gray-500 truncate">Avg. Response Time</dt>
                <dd className="flex items-baseline">
                  <div className="text-2xl font-semibold text-gray-900">
                    {data?.avgResponseTime || 'N/A'}
                  </div>
                </dd>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden transition-all duration-200 bg-white rounded-lg shadow hover:shadow-md">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 rounded-md bg-purple-100">
                <MessageSquare className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-5">
                <dt className="text-sm font-medium text-gray-500 truncate">Pending Replies</dt>
                <dd className="flex items-baseline">
                  <div className="text-2xl font-semibold text-gray-900">
                    {data?.pendingReplies || '0'}
                  </div>
                </dd>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      {data && (
        <ChartsSection 
          ratingsTrend={data.ratingsTrend} 
          feedbackByRating={data.feedbackByRating} 
        />
      )}
    </div>
  );
}

export default AnalyticsPage;
