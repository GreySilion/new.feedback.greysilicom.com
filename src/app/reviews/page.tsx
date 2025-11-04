'use client';

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useCompany } from '@/contexts/CompanyContext';
import { ReviewList } from '@/components/dashboard/ReviewList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ReviewsPage() {
  const router = useRouter();
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/login');
    },
  });

  const { selectedCompany, companies } = useCompany();
  const companyObj = companies.find(c => c.id.toString() === selectedCompany);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Please sign in to access reviews</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>
        {!selectedCompany && (
          <Button onClick={() => router.push('/companies')}>
            Select a Company
          </Button>
        )}
      </div>

      {!selectedCompany ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-600 mb-4">Please select a company to view reviews</p>
            <Button onClick={() => router.push('/companies')}>
              Select a Company
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Customer Feedback</CardTitle>
              <p className="text-sm text-gray-500">
                {companyObj?.name}
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <ReviewList companyId={selectedCompany} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
