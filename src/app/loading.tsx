'use client';

import { useEffect, useState } from 'react';

export default function Loading() {
  const [isVisible, setIsVisible] = useState(false);

  // This ensures the loading state is shown immediately on the client
  useEffect(() => {
    setIsVisible(true);
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center min-h-screen bg-white">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
        <div 
          className="absolute top-0 left-0 w-16 h-16 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"
          style={{
            borderTopColor: 'hsl(222.2, 47.4%, 11.2%)', // Using a darker color for better visibility
            borderWidth: '4px',
          }}
        ></div>
      </div>
      <p className="mt-4 text-gray-600 text-lg font-medium animate-pulse">Loading your page...</p>
    </div>
  );
}
