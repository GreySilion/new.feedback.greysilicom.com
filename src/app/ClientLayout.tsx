'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Loading from './loading';
import { CompanyProvider } from '@/contexts/CompanyContext';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const path = `${pathname}${searchParams}`;

  // Handle route changes
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [path]);

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
