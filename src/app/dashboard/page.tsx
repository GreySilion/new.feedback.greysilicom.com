'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getCurrentUser } from '@/app/actions/auth';
import { Clock, CheckCircle, MessageSquare, Star, BarChart3 } from 'lucide-react';

interface Company {
  id: string;
  name: string;
  status: string;
  created_at: string;
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
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [stats, setStats] = useState<DashboardStats>({
    averageRating: '0.0',
    totalFeedback: 0,
    pendingReplies: 0,
    repliedFeedback: 0
  });
  const [loading, setLoading] = useState(true);

  // Get current user on component mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
          router.push('/login');
          return;
        }
        setUser(currentUser);
        // Ensure the ID is treated as a string
        const userId = String(currentUser.id);
        await fetchCompanies(userId);
      } catch (error) {
        console.error('Error fetching user:', error);
        router.push('/login');
      }
    };

    fetchUser();
  }, [router]);

  // Fetch companies for the current user
  const fetchCompanies = async (userId: string) => {
    try {
      const response = await fetch(`/api/companies?userId=${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch companies');
      }
      const data = await response.json();
      if (data.success) {
        setCompanies(data.data);
        // Set the selected company from URL params or default to the first company
        const companyId = searchParams.get('companyId') || (data.data[0]?.id || '');
        setSelectedCompanyId(companyId);
        if (companyId) {
          await fetchDashboardStats(companyId);
        }
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch dashboard stats for the selected company
  const fetchDashboardStats = async (companyId: string) => {
    if (!companyId) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/dashboard/stats?companyId=${companyId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStats(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle company selection change
  const handleCompanyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCompanyId = e.target.value;
    setSelectedCompanyId(newCompanyId);
    
    // Update URL with the selected company ID
    const params = new URLSearchParams(searchParams.toString());
    params.set('companyId', newCompanyId);
    router.push(`?${params.toString()}`, { scroll: false });
    
    // Fetch stats for the selected company
    fetchDashboardStats(newCompanyId);
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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Average Rating</p>
              <p className="text-2xl font-semibold">{stats.averageRating}</p>
            </div>
            <div className="p-3 rounded-full bg-amber-100 text-amber-600">
              <Star className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Feedback</p>
              <p className="text-2xl font-semibold">{stats.totalFeedback?.toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <MessageSquare className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Pending Replies</p>
              <p className="text-2xl font-semibold">{stats.pendingReplies?.toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <Clock className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Replied</p>
              <p className="text-2xl font-semibold">{stats.repliedFeedback?.toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <CheckCircle className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
