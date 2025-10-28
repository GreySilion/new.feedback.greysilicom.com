'use client';
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { CompanyProvider } from '@/contexts/CompanyContext';
import { CompanySelector } from '@/components/dashboard/CompanySelector';
import { User } from 'lucide-react';

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
          <div className="flex items-center space-x-6">
            <div className="hidden md:block">
              <CompanySelector userId={user.id} />
            </div>
            <div className="ml-4 flex items-center md:ml-6">
              <UserDisplay user={user} size="sm" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

// UserDisplay component (simplified for the example)
function UserDisplay({ user, size = 'md' }: { user: any; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-base',
    lg: 'h-12 w-12 text-lg',
  };
  
  const initial = user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U';

  return (
    <div className="flex items-center">
      <div className={`${sizeClasses[size]} rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium`}>
        {initial}
      </div>
      <div className="ml-3 hidden md:block">
        <p className="text-sm font-medium text-gray-700">{user?.name || user?.email || 'User'}</p>
        {user?.email && user.name && (
          <p className="text-xs text-gray-500 truncate max-w-[180px]">{user.email}</p>
        )}
      </div>
    </div>
  );
}
