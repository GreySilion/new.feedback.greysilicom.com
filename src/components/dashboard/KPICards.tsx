'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { Star, MessageSquare, TrendingUp, Users } from 'lucide-react';

interface KPICardsProps {
  stats: {
    totalReviews: number;
    averageRating: number | null;
    totalCustomers?: number;
    responseRate?: number;
  };
  isLoading: boolean;
}

export function KPICards({ stats, isLoading }: KPICardsProps) {
  const kpis = [
    {
      title: 'Total Reviews',
      value: stats?.totalReviews?.toLocaleString() ?? '0',
      icon: MessageSquare,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      change: { value: 12, positive: true },
      changeText: 'from last month',
      loading: isLoading || !stats,
    },
    {
      title: 'Avg. Rating',
      value: stats?.averageRating ? `${Number(stats.averageRating).toFixed(1)}` : 'N/A',
      icon: Star,
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-500',
      change: { value: 0.2, positive: true },
      changeText: 'from last month',
      showMax: true,
      loading: isLoading || !stats,
    },
    {
      title: 'Total Customers',
      value: stats?.totalCustomers ? stats.totalCustomers.toLocaleString() : 'N/A',
      icon: Users,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      change: { value: 8, positive: true },
      changeText: 'from last month',
      loading: isLoading || !stats,
    },
    {
      title: 'Response Rate',
      value: stats?.responseRate ? `${stats.responseRate}%` : 'N/A',
      icon: TrendingUp,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      change: { value: 5, positive: true },
      changeText: 'from last month',
      loading: isLoading || !stats,
    },
  ];

  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi, index) => (
        <div 
          key={index} 
          className="relative bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
          aria-busy={kpi.loading}
          aria-live="polite"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">{kpi.title}</p>
              {kpi.loading ? (
                <Skeleton className="h-9 w-24 mt-2" />
              ) : (
                <div className="flex items-end space-x-2 mt-2">
                  <span className="text-3xl font-bold text-gray-900">
                    {kpi.value}
                    {kpi.showMax && <span className="text-lg font-normal text-gray-400">/5</span>}
                  </span>
                </div>
              )}
            </div>
            <div className={`p-2.5 rounded-lg ${kpi.iconBg} ${kpi.iconColor} ${kpi.loading ? 'opacity-50' : ''}`}>
              <kpi.icon className="h-5 w-5" />
            </div>
          </div>
          
          {!kpi.loading && kpi.change && (
            <div className="mt-4 flex items-center">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                kpi.change.positive 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {kpi.change.positive ? (
                  <svg className="-ml-0.5 mr-1 h-3 w-3 text-green-500" fill="currentColor" viewBox="0 0 8 8">
                    <path d="M2.3 6.73L.6 4.53c-.4-1.04.46-1.4 1.1-.8l1.1 1.4 3.4-3.8c.6-.63 1.6-.27 1.2.7l-4 4.6c-.43.5-.8.4-1.1.1z" />
                  </svg>
                ) : (
                  <svg className="-ml-0.5 mr-1 h-3 w-3 text-red-500" fill="currentColor" viewBox="0 0 8 8">
                    <path d="M2.3 1.27L.6 3.47c-.4 1.04.46 1.4 1.1.8l1.1-1.4 3.4 3.8c.6.63 1.6.27 1.2-.7l-4-4.6c-.43-.5-.8-.4-1.1-.1z" />
                  </svg>
                )}
                {kpi.change.value}%
              </span>
              <span className="ml-2 text-xs text-gray-500">{kpi.changeText}</span>
            </div>
          )}
          
          {/* Decorative element */}
          <div className="absolute top-0 right-0 -mr-1 -mt-1 w-4 h-4 rounded-bl-full bg-gradient-to-br from-blue-50 to-white"></div>
        </div>
      ))}
    </div>
  );
}
