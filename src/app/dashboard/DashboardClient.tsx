'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  MessageSquare, 
  Star, 
  Clock,
  CheckCircle,
  ChevronDown
} from 'lucide-react';

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

export default function DashboardClient({ initialStats, companies, initialCompanyId }: { 
  initialStats: DashboardStats;
  companies: Company[];
  initialCompanyId: string;
}) {
  const [selectedCompanyId, setSelectedCompanyId] = useState(initialCompanyId);
  const [stats, setStats] = useState(initialStats);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchStats = async () => {
      if (!selectedCompanyId) return;
      
      setLoading(true);
      try {
        const response = await fetch(`/api/dashboard/stats?companyId=${selectedCompanyId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setStats(data.data);
          }
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [selectedCompanyId]);

  const handleCompanyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCompanyId(e.target.value);
    // Update URL without page reload
    const url = new URL(window.location.href);
    url.searchParams.set('companyId', e.target.value);
    window.history.pushState({}, '', url.toString());
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>
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
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Average Rating</p>
                <p className="text-2xl font-semibold">{stats.averageRating}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
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
              <div className="p-3 rounded-full bg-green-100 text-green-600">
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
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <CheckCircle className="h-6 w-6" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
