'use client';

import { useState } from 'react';
import SimpleFooter from './components/SimpleFooter';

const FeedbackPage = () => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hover, setHover] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ rating, comment });
    setIsSubmitted(true);
    // Reset form
    setTimeout(() => {
      setRating(0);
      setComment('');
      setIsSubmitted(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-blue-50">
      <main className="flex-grow flex flex-col items-center justify-center p-4">
        {/* Company Logo/Image */}
        <div className="mb-8 text-center">
          <img 
            src="/images/banners/we are open pic.jpg" 
            alt="Company Logo" 
            className="mx-auto h-24 w-auto object-contain"
          />
        </div>
        
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
            We value your feedback ✨
          </h1>
          
          {isSubmitted ? (
            <div className="text-center py-8">
              <div className="text-green-500 text-5xl mb-4">✓</div>
              <h2 className="text-xl font-semibold text-gray-800">Thank you!</h2>
              <p className="text-gray-600 mt-2">Your feedback has been submitted.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rate your experience
                </label>
                <div className="flex justify-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={`text-3xl ${star <= (hover || rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHover(star)}
                      onMouseLeave={() => setHover(rating)}
                      aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                  Share more about your experience
                </label>
                <textarea
                  id="comment"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Your feedback helps us improve..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Submit Feedback
              </button>
              </form>
          )}
        </div>
      </main>
      <SimpleFooter />
    </div>
  );
};

export default FeedbackPage;
