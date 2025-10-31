'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Loading from './loading';
import { CompanyProvider } from '@/contexts/CompanyContext';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const path = `${pathname}${searchParams}`;

  // Set isMounted to true after component mounts
  useEffect(() => {
    setIsMounted(true);
    setIsLoading(false);
    
    return () => {
      setIsMounted(false);
      setIsLoading(true);
    };
  }, []);

  // Handle route changes
  useEffect(() => {
    if (!isMounted) return;
    
    const handleStart = () => {
      setIsLoading(true);
    };
    
    const handleComplete = () => {
      setIsLoading(false);
    };

    // Simulate loading state for route changes
    if (isMounted) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 100);
      
      return () => {
        clearTimeout(timer);
      };
    }
  }, [path, isMounted]);

  // Don't render anything on the server
  if (!isMounted) {
    return null;
  }

  return (
    <CompanyProvider>
      {isLoading ? (
        <Loading />
      ) : (
        <div className="min-h-screen">
          {children}
        </div>
      )}
    </CompanyProvider>
  );
}
