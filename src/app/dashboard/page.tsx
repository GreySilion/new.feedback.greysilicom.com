'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Clock, CheckCircle, MessageSquare, Star, BarChart3 } from 'lucide-react';

// Mock session data for testing
const MOCK_SESSION = {
  user: {
    id: 21,
    name: 'Test User',
    email: 'test@example.com',
    image: null,
    accessToken: 'test-token-123'
  },
  expires: '2025-12-31T23:59:59.999Z'
};

interface Company {
  id: string;
  name: string;
  status: string;
  created_at: string;
}

interface Review {
  id: string;
  reviewer_name: string;
  phone: string;
  review: string;
  rating: number;
  status: boolean;
  formatted_date: string;
  company_name: string;
}

interface DashboardStats {
  averageRating: string;
  totalFeedback: number;
  pendingReplies: number;
  repliedFeedback: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<any>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState('19');
  const [stats, setStats] = useState<DashboardStats>({
    averageRating: '0.0',
    totalFeedback: 0,
    pendingReplies: 0,
    repliedFeedback: 0
  });
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showPending, setShowPending] = useState(true);
  const [loading, setLoading] = useState(true);

  // Fetch companies for the current user
  const fetchCompanies = async () => {
    try {
      const session = MOCK_SESSION; // Replace with actual session in production
      
      // In a real app, you would fetch this from your API
      // For now, we'll fetch directly from the database
      const response = await fetch('/api/companies', {
        headers: {
          'Authorization': `Bearer ${session.user.accessToken}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch companies');
      }
      
      const companiesData = await response.json();
      
      if (companiesData.length > 0) {
        setCompanies(companiesData);
        setSelectedCompanyId(companiesData[0].id);
        return companiesData[0].id;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching companies:', error);
      return null;
    }
  };

  // Initialize data fetching on component mount
  useEffect(() => {
    setUser(MOCK_SESSION.user);
    
    const initializeDashboard = async () => {
      try {
        // First, fetch companies
        const companyId = await fetchCompanies() || '19'; // Fallback to '19' if no companies found
        
        // Then fetch dashboard data for the first company
        await Promise.all([
          fetchDashboardStats(companyId),
          fetchReviews(companyId, true)
        ]);
      } catch (error) {
        console.error('Error initializing dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    
    initializeDashboard();
  }, []);

  // Fetch dashboard stats for the selected company
  const fetchDashboardStats = async (companyId: string) => {
    if (!companyId) return;
    
    try {
      // Get the session
      const session = MOCK_SESSION; // Replace with actual session in production
      
      const response = await fetch(`/api/dashboard/stats?companyId=${companyId}`, {
        headers: {
          'Authorization': `Bearer ${session.user.accessToken}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats');
      }
      
      const data = await response.json();
      
      setStats({
        averageRating: data.average_rating || '0.0',
        totalFeedback: data.total_feedback || 0,
        pendingReplies: data.pending_replies || 0,
        repliedFeedback: data.replied || 0
      });
      
    } catch (error) {
      console.error('Error in fetchDashboardStats:', error);
      // Fallback to mock data if API fails
      setStats({
        averageRating: '0.0',
        totalFeedback: 0,
        pendingReplies: 0,
        repliedFeedback: 0
      });
    }
  };

  // Fetch reviews for the selected company
  const fetchReviews = async (companyId: string, pendingOnly: boolean) => {
    if (!companyId) return;
    
    setLoading(true);
    try {
      // Get the session
      const session = MOCK_SESSION; // Replace with actual session in production
      
      // Call the API to get reviews
      const response = await fetch(`/api/dashboard/reviews?companyId=${companyId}&pendingOnly=${pendingOnly}`, {
        headers: {
          'Authorization': `Bearer ${session.user.accessToken}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }
      
      const reviewsData = await response.json();
      
      // Get the current company name
      const currentCompany = companies.find(c => c.id === companyId);
      const companyName = currentCompany?.name || 'Unknown Company';
      
      // Format the reviews data to match our interface
      const formattedReviews = reviewsData.map((review: any) => ({
        id: review.id.toString(),
        reviewer_name: review.reviewer_name || 'Anonymous',
        phone: review.phone || '',
        review: review.review || 'No review text',
        rating: review.rating || 0,
        status: review.status, // This should be a boolean from the API
        formatted_date: review.formatted_date || (review.updated_at ? 
          new Date(review.updated_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          }) : 'Unknown date'),
        company_name: companyName
      }));
      
      setReviews(formattedReviews);
    } catch (error) {
      console.error('Error in fetchReviews:', error);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle company selection change
  const handleCompanyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const companyId = e.target.value;
    setSelectedCompanyId(companyId);
    fetchDashboardStats(companyId);
    fetchReviews(companyId, showPending);
    
    // Update URL with selected company
    if (typeof window !== 'undefined') {
      const newSearchParams = new URLSearchParams(window.location.search);
      newSearchParams.set('companyId', companyId);
      router.push(`/dashboard?${newSearchParams.toString()}`);
    }
  };

  // Toggle between showing all reviews and pending only
  const toggleShowPending = () => {
    const newShowPending = !showPending;
    setShowPending(newShowPending);
    if (selectedCompanyId) {
      fetchReviews(selectedCompanyId, newShowPending);
    }
  };
  
  // Format number with K/M/B suffix
  const formatNumber = (num: number): string => {
    if (num >= 1000000000) {
      return (num / 1000000000).toFixed(1) + 'B';
    }
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        {companies.length > 0 && (
          <div className="relative">
            <select
              value={selectedCompanyId}
              onChange={handleCompanyChange}
              className="appearance-none bg-white border border-gray-300 rounded-md py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            >
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-6 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Average Rating</h3>
              <div className="flex items-center space-x-1">
                <p className="text-2xl font-bold">{stats.averageRating}</p>
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              </div>
            </div>
            <div className="rounded-full bg-primary/10 p-3 text-primary">
              <Star className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Based on {formatNumber(stats.totalFeedback)} reviews</p>
        </div>
        <div className="rounded-lg border bg-card p-6 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Total Feedback</h3>
              <p className="text-2xl font-bold">{formatNumber(stats.totalFeedback)}</p>
            </div>
            <div className="rounded-full bg-primary/10 p-3 text-primary">
              <MessageSquare className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Total reviews received</p>
        </div>
        <div className="rounded-lg border bg-card p-6 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Pending Replies</h3>
              <p className="text-2xl font-bold">{formatNumber(stats.pendingReplies)}</p>
            </div>
            <div className="rounded-full bg-amber-100 p-3 text-amber-600">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Awaiting your response</p>
        </div>
        <div className="rounded-lg border bg-card p-6 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Replied</h3>
              <p className="text-2xl font-bold">{formatNumber(stats.repliedFeedback)}</p>
            </div>
            <div className="rounded-full bg-green-100 p-3 text-green-600">
              <CheckCircle className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Responses sent</p>
        </div>
      </div>
    </div>
  );
}
