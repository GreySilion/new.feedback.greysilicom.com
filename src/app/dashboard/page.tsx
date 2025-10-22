import { 
  ArrowUpRight, 
  MessageSquare, 
  Star, 
  Calendar, 
  Smile,
  BarChart3, 
  Settings,
  TrendingUp
} from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';

async function getDashboardStats() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/dashboard/stats`, {
      next: { revalidate: 60 } // Revalidate every 60 seconds
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch dashboard stats');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return null;
  }
}

export default async function DashboardPage() {
  const [currentUser, statsData] = await Promise.all([
    getCurrentUser(),
    getDashboardStats()
  ]);
  
  const userName = currentUser?.name || 'User';

  const stats = [
    {
      title: 'Average Rating',
      value: statsData?.averageRating || '0.0',
      change: 'N/A',
      icon: <Star className="h-6 w-6 text-amber-400" />,
      color: 'bg-amber-100',
      textColor: 'text-amber-700',
    },
    {
      title: 'Total Feedback',
      value: statsData?.totalFeedback?.toLocaleString() || '0',
      change: 'N/A',
      icon: <MessageSquare className="h-6 w-6 text-blue-500" />,
      color: 'bg-blue-100',
      textColor: 'text-blue-700',
    },
    {
      title: 'Feedback This Month',
      value: statsData?.feedbackThisMonth?.toLocaleString() || '0',
      change: 'N/A',
      icon: <Calendar className="h-6 w-6 text-emerald-500" />,
      color: 'bg-emerald-100',
      textColor: 'text-emerald-700',
    },
    {
      title: 'Most Common Rating',
      value: statsData?.mostCommonRating ? `${statsData.mostCommonRating}★` : 'N/A',
      change: 'N/A',
      icon: <BarChart3 className="h-6 w-6 text-green-500" />,
      color: 'bg-green-100',
      textColor: 'text-green-700',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Welcome back, {userName}</h1>
            <p className="mt-1 text-blue-100">Here's what's happening with your feedback today.</p>
          </div>
          <button className="mt-4 inline-flex items-center justify-center rounded-lg bg-white/20 px-4 py-2.5 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/30 md:mt-0">
            View Reports
            <ArrowUpRight className="ml-2 h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <div 
            key={index}
            className="group relative overflow-hidden rounded-xl bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md"
          >
            <div className="absolute right-4 top-4 opacity-10">
              <div className={`h-12 w-12 rounded-full ${stat.color}`}></div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">{stat.value}</p>
                <div className="mt-2 flex items-center">
                  <TrendingUp className={`h-4 w-4 ${stat.textColor}`} />
                  <span className={`ml-1 text-sm font-medium ${stat.textColor}`}>
                    {stat.change} this month
                  </span>
                </div>
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-full ${stat.color} ${stat.textColor} transition-transform group-hover:scale-110`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Feedback */}
        <div className="rounded-xl bg-white p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Recent Feedback</h3>
            <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
              View All
            </button>
          </div>
          
          <div className="mt-6 space-y-6">
            {[1, 2, 3].map((item) => (
              <div key={item} className="group flex items-start space-x-4 rounded-lg p-3 transition-colors hover:bg-gray-50">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-900">New feedback received</h4>
                    <span className="text-xs text-gray-500">2h ago</span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    {item === 1 && 'Great product! The interface is very intuitive and easy to use.'}
                    {item === 2 && 'Had some issues with the checkout process. It was a bit confusing.'}
                    {item === 3 && 'Loving the new features! Keep up the good work.'}
                  </p>
                  <div className="mt-2 flex items-center">
                    <div className="flex -space-x-2">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-600 border-2 border-white">
                          {i}
                        </div>
                      ))}
                    </div>
                    <span className="ml-2 text-xs text-gray-500">+2 more</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
            <div className="mt-4 space-y-3">
              <button className="flex w-full items-center justify-between rounded-lg border border-gray-200 p-4 text-left transition-colors hover:bg-gray-50">
                <div className="flex items-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">New Feedback Form</p>
                    <p className="text-xs text-gray-500">Create a new feedback form</p>
                  </div>
                </div>
                <ArrowUpRight className="h-5 w-5 text-gray-400" />
              </button>
              
              <button className="flex w-full items-center justify-between rounded-lg border border-gray-200 p-4 text-left transition-colors hover:bg-gray-50">
                <div className="flex items-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                    <BarChart3 className="h-5 w-5" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">Generate Report</p>
                    <p className="text-xs text-gray-500">Create a custom report</p>
                  </div>
                </div>
                <ArrowUpRight className="h-5 w-5 text-gray-400" />
              </button>
              
              <button className="flex w-full items-center justify-between rounded-lg border border-gray-200 p-4 text-left transition-colors hover:bg-gray-50">
                <div className="flex items-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600">
                    <Settings className="h-5 w-5" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">Settings</p>
                    <p className="text-xs text-gray-500">Configure your dashboard</p>
                  </div>
                </div>
                <ArrowUpRight className="h-5 w-5 text-gray-400" />
              </button>
            </div>
          </div>

          <div className="rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 p-6 text-white shadow-lg">
            <h3 className="text-lg font-semibold">Need help?</h3>
            <p className="mt-1 text-sm text-indigo-100">Our support team is here to help you with any questions.</p>
            <button className="mt-4 inline-flex items-center rounded-lg bg-white/20 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/30">
              Contact Support
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
