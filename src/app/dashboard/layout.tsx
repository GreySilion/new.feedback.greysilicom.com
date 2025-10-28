import { Inter } from 'next/font/google';
import { Sidebar } from './components/Sidebar';
import { MobileMenuButton } from './components/MobileMenuButton';
import { getCurrentUser } from '@/lib/server/auth';
import { redirect } from 'next/navigation';
import './dashboard.css';
import ClientLayout, { DashboardHeader } from './ClientLayout';

const inter = Inter({ subsets: ['latin'] });

interface User {
  id: number;
  name: string | null;
  email: string;
  username: string;
  // Add other user properties as needed
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
        {/* Sidebar */}
        <Sidebar user={sidebarUser} />
        
        {/* Main content wrapped in ClientLayout for client-side state */}
        <ClientLayout user={userWithStringId}>
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
