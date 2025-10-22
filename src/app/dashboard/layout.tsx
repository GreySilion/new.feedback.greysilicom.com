import { Inter } from 'next/font/google';
import { Sidebar } from './components/Sidebar';
import { UserDisplay } from './components/UserDisplay';
import { MobileMenuButton } from './components/MobileMenuButton';
import { getCurrentUser } from '@/lib/server/auth';
import { redirect } from 'next/navigation';
import './dashboard.css';

const inter = Inter({ subsets: ['latin'] });

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className={`${inter.className} bg-gray-50`}>
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <Sidebar user={user} />
        
        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Navigation */}
          <header className="bg-white shadow-sm z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex justify-between items-center">
                <MobileMenuButton />
                
                <div className="flex-1 flex justify-end">
                  <UserDisplay user={user} size="sm" />
                </div>
              </div>
            </div>
          </header>
          
          {/* Page content */}
          <main className="flex-1 overflow-y-auto bg-gray-50 focus:outline-none">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
