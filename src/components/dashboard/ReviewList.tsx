'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Review } from '@/types/review';
import { formatDate } from '@/lib/utils';
import { Star, MessageSquare, Reply, MailCheck, MailQuestion } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface ReviewListProps {
  companyId: string | number;
  className?: string;
}

type ReviewTab = 'pending' | 'replied';

export function ReviewList({ companyId, className = '' }: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [activeTab, setActiveTab] = useState<ReviewTab>('pending');
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState<string | number | null>(null);
  const [replyText, setReplyText] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  });
  
  const handleReplyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setReplyText(e.target.value);
  };
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Format reviewer name - use name field from the database
  const getReviewerName = (review: Review) => {
    if (review.name && review.name.trim() !== '') {
      return review.name;
    }
    return 'Anonymous Customer';
  };
  
  // Get review text from the review field
  const getReviewText = (review: Review) => {
    return review.review || 'No review content available.';
  };
  
  // Check if a review has been replied to
  const isReplied = (review: Review) => {
    return review.reply != null && review.reply.trim() !== '';
  };
  
  // Format date for display
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const fetchReviews = async (page = 1) => {
    if (!companyId) return;
    
    setLoading(true);
    try {
      console.log(`Fetching page ${page} of reviews for company:`, companyId);
      const response = await fetch(
        `/api/reviews?companyId=${companyId}` + 
        `&page=${page}` + 
        `&limit=${pagination.limit}` +
        `&status=${activeTab}`
      );
      
      if (!response.ok) throw new Error('Failed to fetch reviews');
      
      const data = await response.json();
      console.log('API Response:', data);
      
      if (data.success && Array.isArray(data.data)) {
        // Process reviews with proper fallback values
        const validReviews = data.data.map((review: Review) => ({
          ...review,
          // Ensure all required fields have proper values
          name: review.name || 'Anonymous',
          review: review.review || '',
          rating: review.rating ?? 0,
          status: review.status ?? 0,
          created_at: review.created_at || new Date().toISOString(),
          updated_at: review.updated_at || null
        }));
        
        console.log(`Processed ${validReviews.length} reviews`);
        setReviews(validReviews);
        
        // Update pagination
        if (data.pagination) {
          setPagination({
            page: data.pagination.page,
            limit: data.pagination.limit,
            total: data.pagination.total,
            totalPages: data.pagination.totalPages
          });
        }
      } else {
        console.error('Unexpected API response format:', data);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch reviews when companyId or activeTab changes
  useEffect(() => {
    fetchReviews(1);
  }, [companyId, activeTab]);
  
  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchReviews(newPage);
    }
  };

  const handleReply = async (reviewId: string | number) => {
    if (!replyText.trim() || !replyingTo) return;
    
    setIsSubmitting(true);
    try {
      const url = `/api/reviews/${reviewId}/reply`;
      const requestBody = {
        reply: replyText,
        userId: 1 // In a real app, you would get this from your auth context
      };

      console.log('Sending request to:', url);
      console.log('Request body:', requestBody);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestBody),
        credentials: 'same-origin',
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
          console.error('Error response:', errorData);
        } catch (e) {
          console.error('Failed to parse error response:', e);
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        throw new Error(errorData.error || errorData.message || 'Failed to submit reply');
      }

      const responseData = await response.json();
      console.log('Response data:', responseData);

      // Update the local state to reflect the reply
      setReviews(prevReviews => 
        prevReviews.map(review => 
          review.id.toString() === reviewId.toString()
            ? { 
                ...review, 
                reply: replyText, 
                status: 1, 
                updated_at: new Date().toISOString() 
              } 
            : review
        )
      );
      const formatDate = (dateString: string | null | undefined) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      };    
      setReplyingTo(null);
      setReplyText('');
    } catch (error) {
      console.error('Error submitting reply:', error);
      // In a real app, you might want to show an error message to the user
      alert(error instanceof Error ? error.message : 'Failed to submit reply');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 border rounded-lg">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
            <Skeleton className="h-16 mt-4 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8">
          <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No reviews found</h3>
          <p className="mt-1 text-sm text-gray-500">
            No reviews were found in the database for this company.
          </p>
        </div>
        
        {/* Debug information */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-sm text-gray-700 mb-2">Debug Information</h4>
            <pre className="text-xs bg-white p-3 rounded overflow-auto max-h-60">
              Company ID: {companyId}
              
              {loading ? (
                'Loading...'
              ) : (
                `Found ${reviews.length} reviews in the database.\n\n` +
                'First few reviews (if any):\n' +
                JSON.stringify(reviews.slice(0, 3), null, 2)
              )}
            </pre>
          </div>
        )}
      </div>
    );
  }

  // All reviews from the API are already filtered to have content and match the active tab
  const filteredReviews = reviews;

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-medium">Customer Reviews</h2>
          {!loading && (
            <p className="text-sm text-gray-500 mt-1">
              Showing {filteredReviews.length} of {pagination.total} reviews (page {pagination.page} of {pagination.totalPages})
            </p>
          )}
        </div>
        <div className="inline-flex rounded-md shadow-sm" role="group">
          <button
            type="button"
            onClick={() => setActiveTab('pending')}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-l-lg border',
              activeTab === 'pending' 
                ? 'bg-blue-50 text-blue-700 border-blue-300' 
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            )}
          >
            <div className="flex items-center gap-2">
              <MailQuestion className="h-4 w-4" />
              <span>Pending</span>
              {reviews.filter(r => !isReplied(r)).length > 0 && (
                <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800">
                  {reviews.filter(r => !isReplied(r)).length}
                </span>
              )}
            </div>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('replied')}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-r-lg border-t border-b border-r',
              activeTab === 'replied' 
                ? 'bg-green-50 text-green-700 border-green-300' 
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            )}
          >
            <div className="flex items-center gap-2">
              <MailCheck className="h-4 w-4" />
              <span>Replied</span>
              {reviews.filter(r => isReplied(r)).length > 0 && (
                <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-800">
                  {reviews.filter(r => isReplied(r)).length}
                </span>
              )}
            </div>
          </button>
        </div>
      </div>
      
      <div className="space-y-4 transition-opacity duration-200">
        {filteredReviews.length === 0 ? (
          <div className="text-center py-8 border rounded-lg bg-gray-50">
            <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {activeTab === 'pending' 
                ? 'No pending reviews' 
                : 'No replied reviews yet'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {activeTab === 'pending'
                ? 'All caught up! No pending reviews at the moment.'
                : 'Replied reviews will appear here.'}
            </p>
          </div>
        ) : (
          filteredReviews.map((review) => (
          <div key={review.id} className="border rounded-lg overflow-hidden">
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900">
                      {getReviewerName(review)}
                    </h3>
                    <span className="text-sm text-gray-500">
                      {review.created_at && formatDate(review.created_at)}
                    </span>
                  </div>
                  <div className="flex items-center mt-1">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            review.rating !== null && i < (review.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                      {review.rating !== null && (
                        <span className="ml-2 text-sm text-gray-600">
                          {review.rating.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {isReplied(review) ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Replied
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Pending Reply
                  </span>
                )}
              </div>
              
              {review.title && (
                <h4 className="mt-3 text-base font-medium text-gray-900">
                  {review.title}
                </h4>
              )}
              <div className="mt-2 text-gray-700 whitespace-pre-line">
                {getReviewText(review)}
              </div>
            </div>
            
            {review.reply ? (
              <div className="bg-gray-50 p-4 border-t">
                <div className="flex items-center text-sm font-medium text-gray-900 mb-1">
                  <span>Your reply</span>
                  {review.updated_at && (
                    <span className="ml-2 text-xs text-gray-500">
                      {formatDate(review.updated_at)}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-700">{review.reply}</p>
              </div>
            ) : replyingTo === review.id ? (
              <div className="bg-gray-50 p-4 border-t">
                <Textarea
                  value={replyText}
                  onChange={handleReplyChange}
                  placeholder="Write your reply..."
                  className="min-h-[100px] mb-2"
                />
                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setReplyingTo(null)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={() => handleReply(review.id)}
                    disabled={!replyText.trim() || isSubmitting}
                  >
                    {isSubmitting ? 'Sending...' : 'Send Reply'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 p-4 border-t">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setReplyingTo(review.id);
                    setReplyText('');
                  }}
                >
                  <Reply className="h-4 w-4 mr-2" />
                  Reply to Review
                </Button>
              </div>
            )}
          </div>
          ))
        )}
      </div>
      
      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page <= 1 || loading}
            className="px-4 py-2 border rounded-md text-sm font-medium disabled:opacity-50"
          >
            Previous
          </button>
          
          <div className="text-sm text-gray-700">
            Page {pagination.page} of {pagination.totalPages}
          </div>
          
          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages || loading}
            className="px-4 py-2 border rounded-md text-sm font-medium disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
