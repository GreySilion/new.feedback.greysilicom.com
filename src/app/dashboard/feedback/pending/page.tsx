import { MessageSquare, Clock, Search, Filter, ChevronDown, MoreHorizontal } from 'lucide-react';

export default function PendingFeedbackPage() {
  // Mock data - will be replaced with real data
  const pendingFeedback = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      rating: 4,
      comment: 'Great service, but the delivery was a bit late.',
      date: '2023-10-14T14:30:00Z',
      source: 'Website'
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane@example.com',
      rating: 2,
      comment: 'Product was damaged on arrival. Very disappointed.',
      date: '2023-10-13T09:15:00Z',
      source: 'Mobile App'
    },
    {
      id: 3,
      name: 'Alex Johnson',
      email: 'alex@example.com',
      rating: 5,
      comment: 'Excellent product quality and fast shipping!',
      date: '2023-10-12T16:45:00Z',
      source: 'Website'
    }
  ];

  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <span key={i} className={i < rating ? 'text-yellow-400' : 'text-gray-300'}>
        ★
      </span>
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-yellow-100 text-yellow-800 text-sm font-medium mr-2">
            {pendingFeedback.length}
          </span>
          Pending Replies
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
          {pendingFeedback.map((feedback) => (
            <li key={feedback.id} className="px-4 py-6 sm:px-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                      {feedback.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{feedback.name}</p>
                      <p className="text-sm text-gray-500">{feedback.email}</p>
                    </div>
                  </div>
                  
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    <div className="mr-2">
                      {renderStars(feedback.rating)}
                    </div>
                    <span className="mx-1">•</span>
                    <time dateTime={feedback.date} className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {new Date(feedback.date).toLocaleDateString()}
                    </time>
                    <span className="mx-1">•</span>
                    <span>{feedback.source}</span>
                  </div>
                  
                  <p className="mt-2 text-sm text-gray-700">{feedback.comment}</p>
                </div>
                
                <div className="ml-4 flex-shrink-0 flex">
                  <button className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    Reply
                  </button>
                  <button className="ml-2 p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    <MoreHorizontal className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
        
        {pendingFeedback.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No pending feedback</h3>
            <p className="mt-1 text-sm text-gray-500">All caught up! Check back later for new feedback.</p>
          </div>
        )}
      </div>
    </div>
  );
}
