'use client';

import { useState, useEffect } from 'react';
import { useCompany } from '@/contexts/CompanyContext';
import { Star, MessageSquare, Calendar, Reply, CheckCircle, BarChart2, PieChart, StarHalf } from 'lucide-react';

type ReviewStatus = 'all' | 'pending' | 'replied';

interface Review {
  id: string;
  title: string;
  comment: string;
  rating: number;
  created_at: string;
  customer_name?: string;
  company_name?: string;
  company_id: string | number;
  reply?: string;
  replied_at?: string | null;
  status?: 'pending' | 'replied';
  email?: string | null;
  phone?: string | null;
}

interface StatsData {
  totalReviews: number;
  averageRating: string;
  ratingDistribution: Record<number, number>;
  statusDistribution: Record<string, number>;
  recentReviews: Array<{
    id: number;
    rating: number;
    review: string | null;
    title: string | null;
    created_at: string;
    company_name: string;
    name: string | null;
    email: string | null;
    phone: string | null;
  }>;
  companies: Array<{
    id: number;
    name: string;
    reviewCount: number;
    averageRating: string;
  }>;
  feedbackStats: {
    total: number;
    sent: number;
    pending: number;
  };
}

export default function ReviewsPage() {
  const { selectedCompany } = useCompany();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const [activeTab, setActiveTab] = useState<ReviewStatus>('pending');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState<StatsData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setLoadingStats(true);
        
        // Fetch reviews
        const reviewsUrl = new URL('/api/reviews', window.location.origin);
        if (selectedCompany) {
          reviewsUrl.searchParams.append('companyId', selectedCompany);
        }

        // Fetch stats
        const statsUrl = new URL('/api/stats', window.location.origin);
        if (selectedCompany) {
          statsUrl.searchParams.append('companyId', selectedCompany);
        }

        const [reviewsRes, statsRes] = await Promise.all([
          fetch(reviewsUrl),
          fetch(statsUrl)
        ]);

        if (!reviewsRes.ok) throw new Error('Failed to fetch reviews');
        if (!statsRes.ok) throw new Error('Failed to fetch stats');

        const reviewsData = await reviewsRes.json();
        const statsData = await statsRes.json();

        setReviews(reviewsData.data || []);
        setStats(statsData.data || null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again.');
      } finally {
        setLoading(false);
        setLoadingStats(false);
      }
    };

    fetchData();
  }, [selectedCompany]);

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'No date';
    
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter reviews based on active tab
  useEffect(() => {
    if (activeTab === 'all') {
      setFilteredReviews(reviews);
    } else {
      setFilteredReviews(reviews.filter(review => 
        activeTab === 'pending' 
          ? !review.reply 
          : review.reply
      ));
    }
  }, [activeTab, reviews]);

  const handleReply = (reviewId: string) => {
    setReplyingTo(replyingTo === reviewId ? null : reviewId);
    if (replyingTo !== reviewId) {
      setReplyText('');
    }
  };

  const submitReply = async (reviewId: string) => {
    if (!replyText.trim()) return;
    
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/reviews/${reviewId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reply: replyText,
          userId: '1' // Replace with actual user ID from auth
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit reply');
      }

      // Refresh reviews after successful reply
      const updatedReviews = reviews.map(review => {
        if (review.id === reviewId) {
          return {
            ...review,
            reply: replyText,
            status: 'replied' as const,
            replied_at: new Date().toISOString(),
            updated_at: new Date().toISOString() // Ensure updated_at is set
          };
        }
        return review;
      });
      
      setReviews(updatedReviews);
      setReplyingTo(null);
      setReplyText('');
    } catch (err) {
      console.error('Error submitting reply:', err);
      setError('Failed to submit reply. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate percentage for progress bars
  const getRatingPercentage = (rating: number) => {
    if (!stats) return 0;
    const total = Object.values(stats.ratingDistribution).reduce((a, b) => a + b, 0);
    return total > 0 ? Math.round((stats.ratingDistribution[rating] || 0) / total * 100) : 0;
  };

  if (loadingStats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {stats && (
        <>
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Reviews Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                  <BarChart2 size={24} />
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Total Reviews</p>
                  <p className="text-2xl font-bold">{stats.totalReviews}</p>
                </div>
              </div>
            </div>
            
            {/* Average Rating Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
                  <StarHalf size={24} />
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Average Rating</p>
                  <div className="flex items-center">
                    <span className="text-2xl font-bold">{parseFloat(stats.averageRating).toFixed(1)}</span>
                    <span className="ml-1 text-gray-500">/ 5</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Replied Reviews Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                  <CheckCircle size={24} />
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Replied</p>
                  <p className="text-2xl font-bold">
                    {stats.statusDistribution?.replied || 0}
                    <span className="text-sm font-normal text-gray-500 ml-1">
                      / {stats.totalReviews}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Pending Reviews Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
                  <PieChart size={24} />
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Pending</p>
                  <p className="text-2xl font-bold">
                    {stats.statusDistribution?.pending || 0}
                    <span className="text-sm font-normal text-gray-500 ml-1">
                      / {stats.totalReviews}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-lg font-semibold mb-4">Rating Distribution</h2>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center">
                  <span className="w-8 text-gray-600">{rating}★</span>
                  <div className="flex-1 h-4 bg-gray-200 rounded-full mx-2">
                    <div
                      className="h-full bg-yellow-400 rounded-full"
                      style={{ width: `${getRatingPercentage(rating)}%` }}
                    ></div>
                  </div>
                  <span className="w-10 text-right text-sm text-gray-500">
                    {stats.ratingDistribution[rating] || 0}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Reviews Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h2 className="text-xl font-bold mb-4 sm:mb-0">Customer Reviews</h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-lg text-sm ${
                activeTab === 'all' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              All Reviews
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-4 py-2 rounded-lg text-sm ${
                activeTab === 'pending'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setActiveTab('replied')}
              className={`px-4 py-2 rounded-lg text-sm ${
                activeTab === 'replied'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              Replied
            </button>
          </div>
        </div>

        {filteredReviews.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
            <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No reviews yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              {selectedCompany 
                ? 'This company has not received any reviews yet.'
                : 'No reviews found for your companies.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReviews.map((review) => (
              <div key={review.id} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{review.title || 'No Title'}</h3>
                    {!selectedCompany && (
                      <p className="mt-1 text-sm text-gray-500">{review.company_name}</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${
                            i < (review.rating || 0) ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                          fill={i < (review.rating || 0) ? 'currentColor' : 'none'}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium text-gray-900">{review.rating}.0</span>
                  </div>
                </div>
                
                <p className="mt-3 text-gray-600">{review.comment || 'No comment provided.'}</p>
                
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>{formatDate(review.created_at)}</span>
                      </div>
                      {review.email && (
                        <div className="flex items-center">
                          <span className="ml-2 sm:ml-0">•</span>
                          <a href={`mailto:${review.email}`} className="ml-2 text-blue-600 hover:underline">
                            {review.email}
                          </a>
                        </div>
                      )}
                      {review.phone && (
                        <div className="flex items-center">
                          <span className="ml-2">•</span>
                          <a href={`tel:${review.phone}`} className="ml-2 text-blue-600 hover:underline">
                            {review.phone}
                          </a>
                        </div>
                      )}
                    </div>
                    {review.replied_at && (
                      <span className="ml-3 flex items-center text-green-600">
                        <CheckCircle className="mr-1 h-4 w-4" />
                        Replied: {formatDate(review.replied_at)}
                      </span>
                    )}
                    <div>
                      <span className="font-medium">{review.customer_name || 'Anonymous'}</span>
                    </div>
                  </div>

                  {review.reply && (
                    <div className="mt-3 rounded-lg bg-gray-50 p-4 text-sm">
                      <div className="flex items-center text-sm font-medium text-gray-700">
                        <span className="mr-2">Your reply:</span>
                        <button 
                          onClick={() => handleReply(review.id)}
                          className="flex items-center text-blue-600 hover:text-blue-800"
                        >
                          <Reply className="mr-1 h-3.5 w-3.5" />
                          Edit
                        </button>
                      </div>
                      <p className="mt-1 text-gray-600">{review.reply}</p>
                    </div>
                  )}

                  {(replyingTo === review.id || !review.reply) && (
                    <div className="mt-3">
                      <label htmlFor={`reply-${review.id}`} className="block text-sm font-medium text-gray-700">
                        {review.reply ? 'Update your reply' : 'Write a reply'}
                      </label>
                      <div className="mt-1">
                        <textarea
                          id={`reply-${review.id}`}
                          rows={3}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          placeholder="Type your response here..."
                          value={replyText || review.reply || ''}
                          onChange={(e) => setReplyText(e.target.value)}
                        />
                      </div>
                      <div className="mt-2 flex justify-end space-x-2">
                        <button
                          type="button"
                          onClick={() => setReplyingTo(null)}
                          className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => submitReply(review.id)}
                          disabled={!replyText.trim() || isSubmitting}
                          className={`inline-flex items-center rounded-md border border-transparent px-3 py-2 text-sm font-medium text-white shadow-sm ${
                            !replyText.trim() || isSubmitting
                              ? 'cursor-not-allowed bg-blue-300'
                              : 'bg-blue-600 hover:bg-blue-700'
                          }`}
                        >
                          {isSubmitting ? 'Sending...' : 'Send Reply'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
