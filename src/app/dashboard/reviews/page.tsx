'use client';

import { useState, useEffect } from 'react';
import { useCompany } from '@/contexts/CompanyContext';
import { Star, MessageSquare, Calendar, Filter, Reply, CheckCircle } from 'lucide-react';

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
  replied_at?: string;
  status?: 'pending' | 'replied';
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
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const url = new URL('/api/reviews', window.location.origin);
        url.searchParams.append('userId', '1'); // Replace with actual user ID from auth
        
        if (selectedCompany) {
          url.searchParams.append('companyId', selectedCompany);
        }

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch reviews');
        }

        const data = await response.json();
        setReviews(data.data || []);
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setError('Failed to load reviews. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
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

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-red-700">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customer Reviews</h1>
          <div className="mt-1 flex items-center space-x-2 text-sm text-gray-500">
            <Filter className="h-4 w-4" />
            <span>
              {selectedCompany 
                ? `Showing ${filteredReviews.length} ${activeTab} reviews for selected company`
                : `Showing ${filteredReviews.length} ${activeTab} reviews`}
            </span>
          </div>
        </div>
        
        <div className="flex rounded-md shadow-sm" role="group">
          <button
            type="button"
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 text-sm font-medium rounded-l-lg border ${
              activeTab === 'pending' 
                ? 'bg-blue-50 text-blue-700 border-blue-300' 
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            Pending
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('replied')}
            className={`px-4 py-2 text-sm font-medium border-t border-b ${
              activeTab === 'replied' 
                ? 'bg-green-50 text-green-700 border-green-300' 
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            Replied
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 text-sm font-medium rounded-r-lg border ${
              activeTab === 'all' 
                ? 'bg-gray-100 text-gray-700 border-gray-300' 
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            All Reviews
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
                  <div className="flex items-center">
                    <Calendar className="mr-1.5 h-4 w-4" />
                    <span>Posted: {formatDate(review.created_at)}</span>
                    {review.replied_at && (
                      <span className="ml-3 flex items-center text-green-600">
                        <CheckCircle className="mr-1 h-4 w-4" />
                        Replied: {formatDate(review.replied_at)}
                      </span>
                    )}
                  </div>
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
  );
}
