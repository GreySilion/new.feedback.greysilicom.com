'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Company } from '@prisma/client';
import { useCompany } from '@/contexts/CompanyContext';
import { UserDropdown } from '@/components/dashboard/UserDropdown';
import { Button } from '@/components/ui/button';
import { Building2, ChevronDown } from 'lucide-react';

interface ClientLayoutProps {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
  };
  company: Company;
  children: React.ReactNode;
}

export default function ClientLayout({ user, company, children }: ClientLayoutProps) {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const { companies, selectCompany } = useCompany();
  
  // Set isClient to true after mounting to ensure we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Update company selection when company prop changes
  useEffect(() => {
    if (company?.id) {
      selectCompany(company.id.toString());
    }
  }, [company?.id, selectCompany]);

  const handleCompanyChange = useCallback((companyId: string) => {
    // Update the URL with the new company ID
    router.push(`/dashboard?companyId=${companyId}`);
    // The middleware will handle the cookie and redirection
  }, [router]);

  if (!isClient) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        {children}
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="relative">
        {/* Company Switcher in Header */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
          <div className="flex items-center space-x-2 bg-white rounded-full shadow-md px-4 py-1.5">
            <Building2 className="h-4 w-4 text-blue-600" />
            <span className="font-medium text-sm">{company?.name || 'Select Company'}</span>
            {companies.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => router.push('/companies?from=dashboard')}
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}

// This component is used to wrap the header and pass the user ID to UserDropdown
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

