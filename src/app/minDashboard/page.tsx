'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useCompany } from '@/contexts/CompanyContext';
import { getReviewStats } from '@/lib/review-utils';
import { Skeleton } from '@/components/ui/skeleton';
import { KPICards } from '@/components/dashboard/KPICards';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, ChevronLeft, Download, Calendar, MoreHorizontal, RefreshCw, BarChart2, Star, MessageSquare } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ReviewStats {
  totalReviews: number;
  averageRating: number | null;
  totalCustomers?: number;
  responseRate?: number;
}

// Mock data for charts
const chartData = [
  { name: 'Jan', rating: 4.2, reviews: 24 },
  { name: 'Feb', rating: 4.5, reviews: 32 },
  { name: 'Mar', rating: 4.1, reviews: 28 },
  { name: 'Apr', rating: 4.7, reviews: 41 },
  { name: 'May', rating: 4.4, reviews: 35 },
  { name: 'Jun', rating: 4.6, reviews: 38 },
];

export default function MinDashboard() {
  const router = useRouter();
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/login');
    },
  });

  const { selectedCompany, companies, loadCompanies } = useCompany();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<ReviewStats>({ totalReviews: 0, averageRating: null });
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const searchParams = useSearchParams();

  // Fetch review stats when selectedCompany changes
  useEffect(() => {
    const fetchReviewStats = async () => {
      if (!selectedCompany) {
        setIsLoadingStats(false);
        return;
      }

      try {
        setIsLoadingStats(true);
        const reviewStats = await getReviewStats(selectedCompany);
        setStats(reviewStats);
      } catch (error) {
        console.error('Error fetching review stats:', error);
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchReviewStats();
  }, [selectedCompany]);

  useEffect(() => {
    const initialize = async () => {
      if (status === 'loading') return;
      
      try {
        // If we have a company ID in the URL, use it
        const companyIdFromUrl = searchParams.get('companyId');
        
        if (companyIdFromUrl) {
          // If we already have the company in context, just use it
          const companyExists = companies.some(c => c.id.toString() === companyIdFromUrl);
          
          if (!companyExists && session?.user?.email) {
            // If company not in context, try to load it
            await loadCompanies(session.user.email);
          }
        }
      } catch (error) {
        console.error('Error initializing dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    initialize();
  }, [status, searchParams, companies, loadCompanies, session]);

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Please sign in to access the dashboard</p>
      </div>
    );
  }

  // Get the current company details
  const currentCompany = companies.find(company => company.id.toString() === selectedCompany);
  const enhancedStats = {
    ...stats,
    totalCustomers: stats.totalCustomers || 0,
    responseRate: stats.responseRate || 0,
  };

  return (
    <div className="space-y-8">
      {/* Company Overview Header */}
      {currentCompany && (
        <div className="bg-gradient-to-r from-blue-50 to-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                <Building2 className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{currentCompany.name}</h1>
                <p className="text-gray-600 mt-1">
                  {currentCompany.description || 'Welcome to your company dashboard'}
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="text-right">
                <p className="text-sm text-gray-500 mb-1">Company ID: <span className="font-mono">{currentCompany.id}</span></p>
                {currentCompany.status && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {currentCompany.status}
                  </span>
                )}
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => router.push('/companies')}
                className="group flex items-center justify-center space-x-1 transition-all duration-200 border-blue-200 hover:bg-blue-50 hover:text-blue-600 hover:shadow-sm h-9"
              >
                <ChevronLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
                <span>Companies</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Performance Overview</h2>
            <p className="text-gray-500 text-sm">Key metrics and insights for your business</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" className="text-sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm" className="text-sm">
              <Calendar className="h-4 w-4 mr-2" />
              This Month
            </Button>
          </div>
        </div>
        <KPICards stats={enhancedStats} isLoading={isLoadingStats} />
      </div>

      {!selectedCompany ? (
        <Card className="border-dashed border-2 border-gray-200 bg-gray-50 hover:border-blue-200 transition-colors">
          <CardContent className="p-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 mb-4">
              <Building2 className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No company selected</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Please select a company to view analytics and performance metrics.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                onClick={() => router.push('/companies')} 
                className="bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                <Building2 className="h-4 w-4 mr-2" />
                Select a Company
              </Button>
              <Button 
                onClick={() => window.location.reload()} 
                variant="outline" 
                className="border-gray-300 hover:bg-gray-50"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">Monthly Reviews</CardTitle>
                  <BarChart2 className="h-5 w-5 text-blue-500" />
                </div>
                <p className="text-sm text-gray-500">Review activity over time</p>
              </CardHeader>
              <CardContent className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <defs>
                      <linearGradient id="reviewsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                    />
                    <Tooltip 
                      contentStyle={{
                        borderRadius: '0.5rem',
                        border: '1px solid #e5e7eb',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                      }}
                    />
                    <Bar 
                      dataKey="reviews" 
                      fill="url(#reviewsGradient)" 
                      name="Reviews" 
                      radius={[4, 4, 0, 0]}
                      animationDuration={1500}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">Average Rating Trend</CardTitle>
                  <Star className="h-5 w-5 text-amber-400 fill-amber-100" />
                </div>
                <p className="text-sm text-gray-500">Rating performance over time</p>
              </CardHeader>
              <CardContent className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <defs>
                      <linearGradient id="ratingGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                    />
                    <YAxis 
                      domain={[0, 5]} 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                    />
                    <Tooltip 
                      contentStyle={{
                        borderRadius: '0.5rem',
                        border: '1px solid #e5e7eb',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                      }}
                    />
                    <Bar 
                      dataKey="rating" 
                      fill="url(#ratingGradient)" 
                      name="Rating" 
                      radius={[4, 4, 0, 0]}
                      animationDuration={1500}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          
          {/* Recent Activity Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Activity</CardTitle>
                  <p className="text-sm text-gray-500 mt-1">Latest updates and notifications</p>
                </div>
                <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50">
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="flex items-start pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mr-3">
                      <MessageSquare className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">New review received</p>
                      <p className="text-sm text-gray-500">A customer left a {4 + (item % 2)} star review</p>
                      <p className="text-xs text-gray-400 mt-1">{item * 2} hours ago</p>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
