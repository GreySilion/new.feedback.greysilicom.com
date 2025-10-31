'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Review } from '@/types/review';
import { formatDate } from '@/lib/utils';
import { Star, MessageSquare, Reply } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface ReviewListProps {
  companyId: string | number;
  className?: string;
}

export function ReviewList({ companyId, className = '' }: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState<string | number | null>(null);
  const [replyText, setReplyText] = useState('');
  
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
    return review.status === 1;
  };

  useEffect(() => {
    const fetchReviews = async () => {
      if (!companyId) return;
      
      setLoading(true);
      try {
        const response = await fetch(`/api/reviews?companyId=${companyId}`);
        if (!response.ok) throw new Error('Failed to fetch reviews');
        
        const data = await response.json();
        
        if (data.success && Array.isArray(data.data)) {
          // Process and filter reviews
          const validReviews = data.data
            .filter((review: Review) => {
              const hasReview = review.review && review.review.trim() !== '';
              const hasRating = review.rating !== null;
              return hasReview || hasRating;
            })
            .map((review: Review) => ({
              ...review,
              // Ensure all required fields have proper values
              name: review.name || 'Anonymous',
              review: review.review || '',
              rating: review.rating || 0,
              status: review.status || 0,
              created_at: review.created_at || new Date().toISOString(),
              updated_at: review.updated_at || null
            }));
          
          setReviews(validReviews);
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [companyId]);

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
      <div className="text-center py-8">
        <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No reviews yet</h3>
        <p className="mt-1 text-sm text-gray-500">
          Customer reviews will appear here once they're submitted.
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <h2 className="text-lg font-medium">Customer Reviews</h2>
      
      <div className="space-y-4">
        {reviews.map((review) => (
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
        ))}
      </div>
    </div>
  );
}
