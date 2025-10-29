'use client';
import { useState, useEffect } from 'react';
import { CompanyProvider } from '@/contexts/CompanyContext';
import { UserDropdown } from '@/components/dashboard/UserDropdown';

interface ClientLayoutProps {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    // Add other user properties as needed
  };
  children: React.ReactNode;
}

export default function ClientLayout({ user, children }: ClientLayoutProps) {
  const [isClient, setIsClient] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);

  // Set isClient to true after mounting to ensure we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load selected company from localStorage on the client side
  useEffect(() => {
    if (isClient) {
      const savedCompanyId = localStorage.getItem('selectedCompanyId');
      setSelectedCompanyId(savedCompanyId);
    }
  }, [isClient]);

  return (
    <CompanyProvider initialCompanyId={isClient ? selectedCompanyId : null}>
      <div className="flex-1 flex flex-col overflow-hidden">
        {children}
      </div>
    </CompanyProvider>
  );
}

// This component is used to wrap the header and pass the user ID to CompanySelector
interface DashboardHeaderProps {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
  };
  children: React.ReactNode;
}

export function DashboardHeader({ user, children }: DashboardHeaderProps) {
  return (
    <header className="bg-white shadow-sm z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {children}
          </div>
          <div className="flex items-center">
            <UserDropdown user={user} />
          </div>
        </div>
      </div>
    </header>
  );
}

