import { BarChart3, TrendingUp } from 'lucide-react';
import ChartsSection from './ChartsSection';

export default function AnalyticsPage() {
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
                <div className="text-2xl font-semibold text-gray-900">1,234</div>
                <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                  <span>12.5%</span>
                  <span className="sr-only">increase from last month</span>
                </div>
              </dd>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 rounded-md bg-green-500 p-3">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dt className="truncate text-sm font-medium text-gray-500">Average Rating</dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-gray-900">4.2</div>
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
