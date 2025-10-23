'use client';

import { MessageSquare, CheckCircle, Search, Filter, ChevronDown, MoreHorizontal } from 'lucide-react';
import { useState, useEffect } from 'react';

interface FeedbackItem {
  id: number;
  name: string;
  email: string;
  rating: number;
  comment: string;
  created_at: string;
  replied_at: string;
  reply: string;
  source: string;
  user_id: number;
}

export default function RepliedFeedbackPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [repliedFeedback, setRepliedFeedback] = useState<FeedbackItem[]>([]);
  
  useEffect(() => {
    const fetchRepliedFeedback = async () => {
      try {
        const response = await fetch('/api/feedback/replied');
        if (!response.ok) {
          throw new Error('Failed to fetch replied feedback');
        }
        const data = await response.json();
        setRepliedFeedback(data);
      } catch (error) {
        console.error('Error fetching replied feedback:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRepliedFeedback();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <span key={i} className={i < rating ? 'text-yellow-400' : 'text-gray-300'}>
        ★
      </span>
    ));
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { text: string; bg: string; textColor: string }> = {
      resolved: { text: 'Resolved', bg: 'bg-green-100', textColor: 'text-green-800' },
      acknowledged: { text: 'Acknowledged', bg: 'bg-blue-100', textColor: 'text-blue-800' },
      pending: { text: 'Pending', bg: 'bg-yellow-100', textColor: 'text-yellow-800' },
    };
    
    const statusInfo = statusMap[status] || statusMap.pending;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.bg} ${statusInfo.textColor}`}>
        {statusInfo.text}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
          Replied Feedback
        </h3>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Search feedback..."
            />
          </div>
          
          <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <Filter className="-ml-0.5 mr-2 h-4 w-4" />
            Filter
            <ChevronDown className="ml-2 -mr-1 h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <ul className="divide-y divide-gray-200">
          {repliedFeedback.map((feedback) => (
            <li key={feedback.id} className="px-4 py-6 sm:px-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                        {feedback.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{feedback.name}</p>
                        <span className="text-sm text-gray-500">{formatDate(feedback.created_at)}</span>
                      </div>
                    </div>
                    {getStatusBadge(feedback.status)}
                  </div>
                  
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    <div className="mr-2">
                      {renderStars(feedback.rating)}
                    </div>
                    <span className="mx-1">•</span>
                    <time dateTime={feedback.date}>
                      {new Date(feedback.date).toLocaleDateString()}
                    </time>
                    <span className="mx-1">•</span>
                    <span>{feedback.source}</span>
                  </div>
                  
                  <div className="mt-4 space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Feedback:</p>
                      <p className="mt-1 text-sm text-gray-700">{feedback.comment}</p>
                    </div>
                    
                    <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-blue-600 text-sm font-medium">You</span>
                          </div>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">Your Reply</p>
                          <div className="mt-1 text-sm text-gray-700">
                            <p>{feedback.reply}</p>
                          </div>
                          <div className="mt-2 text-xs text-gray-500">
                            Replied on {new Date(feedback.replyDate).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="ml-4 flex-shrink-0">
                  <button className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    <MoreHorizontal className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
        
        {repliedFeedback.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No replied feedback</h3>
            <p className="mt-1 text-sm text-gray-500">All your replies will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
