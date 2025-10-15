import { MessageSquare, CheckCircle, Search, Filter, ChevronDown, MoreHorizontal } from 'lucide-react';

export default function RepliedFeedbackPage() {
  // Mock data - will be replaced with real data
  const repliedFeedback = [
    {
      id: 1,
      name: 'Sarah Williams',
      email: 'sarah@example.com',
      rating: 5,
      comment: 'Amazing customer service! The issue was resolved quickly.',
      reply: 'Thank you for your kind words, Sarah! We\'re thrilled to hear about your positive experience with our support team.',
      date: '2023-10-14T10:30:00Z',
      replyDate: '2023-10-14T11:15:00Z',
      source: 'Website',
      status: 'resolved'
    },
    {
      id: 2,
      name: 'Michael Brown',
      email: 'michael@example.com',
      rating: 3,
      comment: 'Product quality is good but the delivery was delayed.',
      reply: 'We apologize for the delay in delivery, Michael. We\'ve issued a 10% discount on your next purchase as compensation.',
      date: '2023-10-13T09:15:00Z',
      replyDate: '2023-10-13T10:45:00Z',
      source: 'Mobile App',
      status: 'resolved'
    },
    {
      id: 3,
      name: 'Emily Chen',
      email: 'emily@example.com',
      rating: 4,
      comment: 'Good experience overall, but the mobile app could use some improvements.',
      reply: 'Thank you for your feedback, Emily! We\'ve shared your suggestions with our development team for future updates.',
      date: '2023-10-12T16:45:00Z',
      replyDate: '2023-10-12T17:30:00Z',
      source: 'Website',
      status: 'acknowledged'
    }
  ];

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
                        <p className="text-sm text-gray-500">{feedback.email}</p>
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
