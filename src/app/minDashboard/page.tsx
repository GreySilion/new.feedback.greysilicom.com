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
import { ChevronLeft } from 'lucide-react';
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
    <div className="space-y-6">
      {/* Company Overview Header */}
      {currentCompany && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{currentCompany.name}</h1>
              <p className="text-gray-600 mt-1">
                {currentCompany.description || 'Welcome to your company dashboard'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Company ID: {currentCompany.id}</p>
              <div className="flex items-center space-x-3">
                {currentCompany.status && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {currentCompany.status}
                  </span>
                )}
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => router.push('/companies')}
                  className="group flex items-center space-x-1 transition-colors duration-200 border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                >
                  <ChevronLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
                  <span>Companies</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Performance Overview</h2>
        <KPICards stats={enhancedStats} isLoading={isLoadingStats} />
      </div>

      {!selectedCompany ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-gray-600 mb-4">No company selected. Please select a company to view analytics.</p>
              <div className="flex gap-2 justify-center">
                <Button onClick={() => router.push('/companies')}>
                  Select a Company
                </Button>
                <Button onClick={() => window.location.reload()} variant="outline">
                  Refresh
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Reviews</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="reviews" fill="#3b82f6" name="Reviews" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Average Rating Trend</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 5]} />
                  <Tooltip />
                  <Bar dataKey="rating" fill="#10b981" name="Rating" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
