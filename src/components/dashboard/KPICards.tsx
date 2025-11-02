'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
      value: stats.totalReviews,
      icon: MessageSquare,
      change: '+12% from last month',
    },
    {
      title: 'Avg. Rating',
      value: stats.averageRating ? `${stats.averageRating.toFixed(1)}/5` : 'N/A',
      icon: Star,
      change: stats.averageRating ? `+0.2 from last month` : 'N/A',
    },
    {
      title: 'Total Customers',
      value: stats.totalCustomers || 'N/A',
      icon: Users,
      change: '+8% from last month',
    },
    {
      title: 'Response Rate',
      value: stats.responseRate ? `${stats.responseRate}%` : 'N/A',
      icon: TrendingUp,
      change: '+5% from last month',
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              {kpi.title}
            </CardTitle>
            <kpi.icon className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">{kpi.value}</div>
                <p className="text-xs text-gray-500 mt-1">{kpi.change}</p>
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
