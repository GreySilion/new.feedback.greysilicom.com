'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useSession } from 'next-auth/react';
import { useCompany } from '@/contexts/CompanyContext';
import { MessageSquare, Star, MessageCircle } from 'lucide-react';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { ReviewList } from '@/components/dashboard/ReviewList';
import { getReviewStats } from '@/lib/review-utils';
import { Skeleton } from '@/components/ui/skeleton';

interface ReviewStats {
  totalReviews: number;
  averageRating: number | null;
}

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

  // Get company object from context for more details
  const companyObj = companies.find(c => c.id.toString() === selectedCompany);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Welcome to Min Dashboard</h1>
      
      {selectedCompany && companyObj ? (
        <div className="space-y-6">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold">{companyObj.name}</h2>
            <p className="text-sm text-muted-foreground">
              {companyObj.status || 'Active'} • {session.user.email}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2 mb-8">
            <MetricCard
              title="Total Feedback"
              value={stats.totalReviews.toLocaleString()}
              icon={<MessageSquare className="h-4 w-4" />}
              isLoading={isLoadingStats}
              description="Total number of reviews received"
            />
            <MetricCard
              title="Average Rating"
              value={stats.averageRating ? `${stats.averageRating}/5` : 'N/A'}
              icon={<Star className="h-4 w-4" />}
              isLoading={isLoadingStats}
              description="Average rating from all reviews"
            />
          </div>

          <div className="mt-8">
            <div className="flex items-center mb-4">
              <MessageCircle className="h-5 w-5 mr-2" />
              <h2 className="text-lg font-medium">Customer Reviews</h2>
            </div>
            <ReviewList companyId={selectedCompany} />
          </div>
        </div>
      ) : (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-yellow-700">
            No company selected. Please select a company from the Companies page.
          </p>
          <Button 
            onClick={() => router.push('/companies')} 
            variant="outline" 
            className="mt-2"
          >
            Go to Companies
          </Button>
        </div>
      )}

      <div className="flex gap-2 mt-6">
        <Button onClick={() => window.location.reload()} variant="outline">
          Refresh Page
        </Button>
        <Button onClick={() => router.push('/companies')} variant="outline">
          Back to Companies
        </Button>
      </div>
    </div>
  );
}
