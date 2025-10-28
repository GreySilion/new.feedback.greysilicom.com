'use client';

import { useState, useEffect } from 'react';
import { useCompany } from '@/contexts/CompanyContext';
import { Star, MessageSquare, Calendar, Filter } from 'lucide-react';

interface Review {
  id: string;
  title: string;
  comment: string;
  rating: number;
  created_at: string;
  customer_name?: string;
  company_name?: string;
  company_id: string | number;
}

export default function ReviewsPage() {
  const { selectedCompany } = useCompany();
  const [reviews, setReviews] = useState<Review[]>([]);
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
    });
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Customer Reviews</h1>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Filter className="h-4 w-4" />
          <span>
            {selectedCompany 
              ? `Showing reviews for selected company`
              : 'Showing all reviews'}
          </span>
        </div>
      </div>

      {reviews.length === 0 ? (
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
          {reviews.map((review) => (
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
              
              <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center">
                  <Calendar className="mr-1.5 h-4 w-4" />
                  <span>{formatDate(review.created_at)}</span>
                </div>
                <div>
                  <span className="font-medium">{review.customer_name || 'Anonymous'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
