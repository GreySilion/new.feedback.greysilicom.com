'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Clock, CheckCircle, MessageSquare, Star, BarChart3 } from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamically import the DashboardCharts component with SSR disabled
const DashboardCharts = dynamic(
  () => import('@/components/dashboard/DashboardCharts'),
  { ssr: false }
);

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
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    averageRating: '0.0',
    totalFeedback: 0,
    pendingReplies: 0,
    repliedFeedback: 0
  });
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showPending, setShowPending] = useState(true);
  const [hasMounted, setHasMounted] = useState(false);

  // Set company ID from URL on mount and when searchParams change
  useEffect(() => {
    setHasMounted(true);
    const urlCompanyId = searchParams.get('companyId');
    if (urlCompanyId && urlCompanyId !== companyId) {
      setCompanyId(urlCompanyId);
      // Store in localStorage for persistence
      localStorage.setItem('selectedCompanyId', urlCompanyId);
    }
  }, [searchParams, companyId]);

  // Handle browser back/forward navigation
  useEffect(() => {
    if (!hasMounted) return;
    
    const handleRouteChange = (url: string) => {
      const urlObj = new URL(url, window.location.origin);
      const companyIdFromUrl = urlObj.searchParams.get('companyId');
      if (companyIdFromUrl !== companyId) {
        setCompanyId(companyIdFromUrl);
      }
    };

    window.addEventListener('popstate', () => handleRouteChange(window.location.href));
    return () => window.removeEventListener('popstate', () => handleRouteChange(window.location.href));
  }, [hasMounted, companyId]);

  // Fetch companies for the current user
  const fetchCompanies = useCallback(async () => {
    try {
      const session = MOCK_SESSION; // Replace with actual session in production
      
      const response = await fetch('/api/companies', {
        headers: {
          'Authorization': `Bearer ${session.user.accessToken}`,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        cache: 'no-store'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch companies');
      }
      
      const companiesData = await response.json();
      setCompanies(companiesData);
      return companiesData;
    } catch (error) {
      console.error('Error fetching companies:', error);
      return [];
    }
  }, []);

  // Function to load dashboard data for a company
  const loadDashboardData = useCallback(async (companyId: string | null) => {
    if (!companyId) {
      setStats({
        averageRating: '0.0',
        totalFeedback: 0,
        pendingReplies: 0,
        repliedFeedback: 0
      });
      setReviews([]);
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Save to localStorage for persistence
      if (typeof window !== 'undefined') {
        localStorage.setItem('selectedCompanyId', companyId);
      }
      
      // Update URL without triggering a navigation
      const params = new URLSearchParams(window.location.search);
      params.set('companyId', companyId);
      window.history.replaceState({}, '', `${window.location.pathname}?${params}`);
      
      // Fetch data for the selected company
      await Promise.all([
        fetchDashboardStats(companyId),
        fetchReviews(companyId, showPending)
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [showPending]);

  // Initialize company ID from URL or localStorage
  useEffect(() => {
    const urlCompanyId = searchParams.get('companyId');
    const storedCompanyId = typeof window !== 'undefined' ? localStorage.getItem('selectedCompanyId') : null;
    
    // Set companyId from URL or localStorage
    const initialCompanyId = urlCompanyId || storedCompanyId;
    setCompanyId(initialCompanyId);
    
    // Mark as initialized after setting the initial companyId
    setIsInitialized(true);
  }, [searchParams]);

  // Fetch companies and handle company selection
  useEffect(() => {
    let isMounted = true;

    const initializeDashboard = async () => {
      if (!isInitialized) return;
      
      try {
        setUser(MOCK_SESSION.user);
        setIsLoading(true);
        
        // Fetch companies
        const companiesData = await fetchCompanies();
        if (!isMounted) return;
        
        setCompanies(companiesData);

        // If no companies, redirect to companies page
        if (companiesData.length === 0) {
          router.push('/companies');
          return;
        }

        // Determine which company to select
        let targetCompanyId = companyId;
        
        // If no company ID is set, use the first company
        if (!targetCompanyId && companiesData.length > 0) {
          targetCompanyId = companiesData[0].id.toString();
          setCompanyId(targetCompanyId);
          
                  // Update URL and localStorage to reflect the selected company
          if (targetCompanyId) {
            const params = new URLSearchParams(window.location.search);
            params.set('companyId', targetCompanyId);
            window.history.replaceState({}, '', `${window.location.pathname}?${params}`);
            
            if (typeof window !== 'undefined') {
              localStorage.setItem('selectedCompanyId', targetCompanyId);
            }
          }
        }
        
        // Validate the company ID
        if (targetCompanyId) {
          const companyExists = companiesData.some((c: Company) => c.id.toString() === targetCompanyId);
          
          if (!companyExists && companiesData.length > 0) {
            // If the current companyId is invalid, use the first company
            const firstCompanyId = companiesData[0].id.toString();
            setCompanyId(firstCompanyId);
            
            // Update URL and localStorage
            const params = new URLSearchParams(window.location.search);
            params.set('companyId', firstCompanyId);
            window.history.replaceState({}, '', `${window.location.pathname}?${params}`);
            
            if (typeof window !== 'undefined') {
              localStorage.setItem('selectedCompanyId', firstCompanyId);
            }
            
            // Load data for the first company
            loadDashboardData(firstCompanyId);
          } else if (companyExists) {
            // Load data for the valid company
            loadDashboardData(targetCompanyId);
          }
        }
      } catch (error) {
        console.error('Error initializing dashboard:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    initializeDashboard();
    
    return () => {
      isMounted = false;
    };
  }, [isInitialized, companyId]);
  
  // Handle redirects when no valid company is available
  useEffect(() => {
    if (!isInitialized || isLoading) return;
    
    // If we have companies but no valid companyId, redirect to companies page
    if (companies.length > 0 && !companyId) {
      router.push('/companies');
    }
  }, [isInitialized, isLoading, companies, companyId]);
  

  // Handle company selection changes
  const handleCompanyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCompanyId = e.target.value;
    if (!newCompanyId || newCompanyId === companyId) return;
    
    // Update URL with the new company ID
    const params = new URLSearchParams(window.location.search);
    params.set('companyId', newCompanyId);
    router.push(`/dashboard?${params.toString()}`);
  };

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
      setIsLoading(false);
    }
  };


  // Toggle between showing all reviews and pending only
  const toggleShowPending = () => {
    const newShowPending = !showPending;
    setShowPending(newShowPending);
    if (companyId) {
      fetchReviews(companyId, newShowPending);
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

  if (!isInitialized) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Show loading state for the content while data is being loaded
  const loadingOverlay = isLoading && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="flex items-center space-x-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <span>Loading company data...</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 relative">
      {loadingOverlay}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        {companies.length > 0 && (
          <div className="relative">
            <select
              value={companyId || ''}
              onChange={handleCompanyChange}
              className="appearance-none bg-white border border-gray-300 rounded-md py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
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

      {/* Charts Section */}
      <div className="mt-8">
        <DashboardCharts stats={stats} />
      </div>
    </div>
  );
}
