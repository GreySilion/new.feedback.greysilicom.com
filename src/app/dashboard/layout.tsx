import { Inter } from 'next/font/google';
import { Sidebar } from './components/Sidebar';
import { MobileMenuButton } from './components/MobileMenuButton';
import { getCurrentUser } from '@/lib/server/auth';
import { redirect, useSearchParams } from 'next/navigation';
import './dashboard.css';
import ClientLayout, { DashboardHeader } from './ClientLayout';
import { cookies } from 'next/headers';

const inter = Inter({ subsets: ['latin'] });

interface User {
  id: number;
  name: string | null;
  email: string;
  username: string;
  // Add other user properties as needed
}

interface Company {
  id: string | number;
  name: string;
  status?: string;
  created_at: string;
}

async function getCompanies(userId: string): Promise<Company[]> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/companies?userId=${userId}`,
      {
        next: { revalidate: 60 }, // Revalidate every 60 seconds
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.error('Failed to fetch companies');
      return [];
    }

    const data = await response.json();
    return Array.isArray(data) ? data : data.data || [];
  } catch (error) {
    console.error('Error fetching companies:', error);
    return [];
  }
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser() as User | null;

  if (!user) {
    redirect('/login');
  }

  // Get company ID from URL or cookies
  const cookieStore = cookies();
  const selectedCompanyId = cookieStore.get('selectedCompanyId')?.value;
  
  // If no company is selected, redirect to companies page
  if (!selectedCompanyId) {
    redirect('/companies');
  }

  // Fetch companies to verify the selected company exists
  const companies = await getCompanies(user.id.toString());
  const selectedCompany = companies.find(c => c.id.toString() === selectedCompanyId);
  
  // If the selected company doesn't exist or user doesn't have access, clear selection and redirect
  if (!selectedCompany) {
    const response = new Response(null, {
      status: 307,
      headers: {
        Location: '/companies',
        'Set-Cookie': 'selectedCompanyId=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT',
      },
    });
    return response;
  }

  // Convert user ID to string for compatibility with the client-side
  const userWithStringId = {
    ...user,
    id: user.id.toString(),
  };

  // Create a user object with non-null values for the Sidebar
  const sidebarUser = {
    ...user,
    name: user.name || user.email?.split('@')[0] || 'User',
    email: user.email || '',
  };

  return (
    <div className={`${inter.className} bg-gray-50`}>
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar with company context */}
        <Sidebar user={sidebarUser} companyId={selectedCompanyId} />
        
        {/* Main content wrapped in ClientLayout for client-side state */}
        <ClientLayout user={userWithStringId} company={selectedCompany}>
          {/* Top Navigation with Company Selector */}
          <DashboardHeader user={userWithStringId}>
            <MobileMenuButton />
          </DashboardHeader>
          
          {/* Page content */}
          <main className="flex-1 overflow-y-auto bg-gray-50 focus:outline-none">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              {children}
            </div>
          </main>
        </ClientLayout>
      </div>
    </div>
  );
}
