'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

type FeedbackParams = {
  uid: string;
};

export default function FeedbackPage() {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hover, setHover] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [userName, setUserName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [ratingError, setRatingError] = useState('');
  
  const router = useRouter();
  const params = useParams<FeedbackParams>();
  const uid = params?.uid ? (Array.isArray(params.uid) ? params.uid[0] : params.uid) : null;

  useEffect(() => {
    if (!uid) {
      setError('No UID provided');
      setIsLoading(false);
      return;
    }

    // Fetch user details using UID
    const fetchUserDetails = async () => {
      try {
        console.log('Fetching feedback for UID:', uid);
        const response = await fetch(`/api/feedback/${uid}`);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error response:', errorText);
          let errorData;
          try {
            errorData = JSON.parse(errorText);
          } catch (e) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          throw new Error(errorData.error || `Failed to fetch user details (${response.status})`);
        }
        
        const data = await response.json();
        console.log('Received feedback data:', data);
        
        // Use userName from the API response, fallback to 'Valued Customer'
        setUserName(data.userName || data.name || 'Valued Customer');
        
        // If already has a rating, pre-fill the form
        if (data.rating) {
          setRating(Number(data.rating));
          setComment(data.review || '');
          if (data.review) {
            setIsSubmitted(true);
          }
        }
        
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load feedback form';
        console.error('Error in fetchUserDetails:', errorMessage, err);
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserDetails();
  }, [uid]);

  // Handle rating change
  const handleRatingChange = (star: number) => {
    setRating(star);
    // Clear rating error when user selects a rating
    if (star > 0 && ratingError) {
      setRatingError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate rating
    if (rating === 0) {
      setRatingError('Please select a star rating before submitting your review.');
      // Scroll to the rating section for better UX
      document.getElementById('rating-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    setRatingError(''); // Clear any previous rating error
    
    try {
      console.log('Submitting feedback for UID:', uid);
      console.log('Payload:', { rating, review: comment.trim() || null });
      
      const response = await fetch(`/api/feedback/${uid}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating,
          review: comment.trim() || null
        }),
      });

      console.log('Response status:', response.status);
      
      // Get the response text first
      const responseText = await response.text();
      console.log('Raw response:', responseText);
      
      let responseData;
      try {
        // Try to parse the response as JSON
        responseData = responseText ? JSON.parse(responseText) : {};
      } catch (parseError) {
        console.error('Error parsing JSON response:', parseError);
        throw new Error('Invalid response format from server');
      }
      
      if (!response.ok) {
        console.error('Server error:', responseData);
        throw new Error(responseData.error || `Server responded with status ${response.status}`);
      }
      
      console.log('Feedback submitted successfully:', responseData);
      setIsSubmitted(true);
      
    } catch (err) {
      console.error('Error in handleSubmit:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading feedback form...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50 p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-red-500 text-5xl mb-4">!</div>
          <h2 className="text-xl font-semibold text-gray-800">Error</h2>
          <p className="text-gray-600 mt-2">{error}</p>
          <button
            onClick={() => window.location.href = '/feedback'}
            className="mt-6 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Go to Feedback Form
          </button>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50 p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-green-500 text-5xl mb-4">✓</div>
          <h2 className="text-xl font-semibold text-gray-800">Thank you for your feedback!</h2>
          <p className="text-gray-600 mt-2">We appreciate you taking the time to share your experience with us.</p>
          <button
            onClick={() => window.location.href = '/'}
            className="mt-6 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800">
              Hi {userName || 'there'}! 👋
            </h1>
            <p className="mt-2 text-gray-600">
              We'd love to hear about your experience
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                How would you rate your experience?
              </label>
              <div id="rating-section" className="flex flex-col items-center">
                <div className="flex justify-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={`text-3xl transition-transform duration-100 hover:scale-110 ${
                        star <= (hover || rating) ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                      onClick={() => handleRatingChange(star)}
                      onMouseEnter={() => setHover(star)}
                      onMouseLeave={() => setHover(rating)}
                      aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
                {ratingError && (
                  <p className="mt-2 text-sm text-red-500 flex items-center">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {ratingError}
                  </p>
                )}
              </div>
              <p className="mt-1 text-xs text-gray-500">
                {rating === 0 ? 'Select a rating' : 
                 rating <= 2 ? 'We appreciate your honesty' : 
                 'Thank you for your feedback!'}
              </p>
            </div>

            <div>
              <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                Your feedback (optional)
              </label>
              <textarea
                id="comment"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Share your thoughts..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${isSubmitting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
