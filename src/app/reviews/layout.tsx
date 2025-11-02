'use client';

import { Sidebar, TopNav } from '@/components/dashboard';
import { useCompany } from '@/contexts/CompanyContext';

export default function ReviewsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { selectedCompany, companies } = useCompany();
  const companyName = companies.find(c => c.id.toString() === selectedCompany)?.name || 'Reviews';

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeTab="reviews" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav companyName={companyName} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
