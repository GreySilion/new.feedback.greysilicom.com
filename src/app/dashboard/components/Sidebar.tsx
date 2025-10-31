'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { UserDisplay } from './UserDisplay';
import { useCompany } from '@/contexts/CompanyContext';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { 
  Home, 
  MessageSquare, 
  BarChart, 
  Settings, 
  Users, 
  LogOut, 
  ChevronDown, 
  ChevronRight, 
  Building2,
  Plus,
  Menu
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  username?: string;
}

interface Company {
  id: string;
  name: string;
  status?: string;
  created_at?: string;
}

interface SidebarProps {
  user: User | null;
  companyId?: string;
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Reviews', href: '/dashboard/reviews', icon: MessageSquare },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart },
  { name: 'Team', href: '/dashboard/team', icon: Users },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export function Sidebar({ user, companyId }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { companies, selectedCompany } = useCompany();
  const [isCompaniesOpen, setIsCompaniesOpen] = useState(false);

  // Toggle sidebar state
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
    document.body.classList.toggle('sidebar-open', !isOpen);
  };

  // Close sidebar when navigating on mobile
  useEffect(() => {
    if (isOpen) {
      setIsOpen(false);
      document.body.classList.remove('sidebar-open');
    }
  }, [pathname]);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const sidebar = document.getElementById('sidebar');
      const toggleButton = document.getElementById('sidebar-toggle');
      
      if (isOpen && sidebar && !sidebar.contains(target) && toggleButton && !toggleButton.contains(target)) {
        setIsOpen(false);
        document.body.classList.remove('sidebar-open');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleCompanySelect = (companyId: string) => {
    router.push(`/dashboard?companyId=${companyId}`);
  };

  const handleLogout = async () => {
    // Clear any company selection
    localStorage.removeItem('selectedCompanyId');
    // Redirect to login
    router.push('/login');
  };

  return (
    <>
      {/* Mobile backdrop */}
      <div 
        id="sidebar-backdrop" 
        className={cn(
          'fixed inset-0 z-20 bg-black/50 transition-opacity duration-300 lg:hidden',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={() => {
          setIsOpen(false);
          document.body.classList.remove('sidebar-open');
        }}
      />
      
      {/* Sidebar */}
      <aside
        id="sidebar"
        className={cn(
          'fixed top-0 left-0 z-30 w-64 h-screen bg-white border-r border-gray-200 transition-transform duration-300',
          'lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full overflow-y-auto">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
            <div className="flex items-center">
              <span className="text-xl font-bold text-blue-600">Feedback</span>
            </div>
            <button
              type="button"
              className="p-1 rounded-md text-gray-500 hover:text-gray-600 lg:hidden"
              onClick={() => {
                setIsOpen(false);
                document.body.classList.remove('sidebar-open');
              }}
            >
              <span className="sr-only">Close sidebar</span>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Company Selector */}
          <div className="px-4 py-4 border-b border-gray-200">
            <button
              onClick={() => setIsCompaniesOpen(!isCompaniesOpen)}
              className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-left text-gray-700 bg-gray-50 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <div className="flex items-center">
                <Building2 className="w-4 h-4 mr-2 text-gray-500" />
                <span className="truncate">
                  {selectedCompany && 'name' in selectedCompany ? selectedCompany.name : 'Select Company'}
                </span>
              </div>
              {isCompaniesOpen ? (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-500" />
              )}
            </button>

            {/* Company Dropdown */}
            {isCompaniesOpen && companies.length > 0 && (
              <div className="mt-2 space-y-1">
                {companies.map((company) => (
                  <button
                    key={company.id}
                    onClick={() => handleCompanySelect(company.id.toString())}
                    className={cn(
                      'flex items-center w-full px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100',
                      selectedCompany && 'id' in selectedCompany && 
                      selectedCompany.id === company.id && 'bg-blue-50 text-blue-600'
                    )}
                  >
                    <span className="truncate">{company.name}</span>
                  </button>
                ))}
                <Link
                  href="/companies"
                  className="flex items-center px-3 py-2 text-sm text-blue-600 rounded-md hover:bg-blue-50"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Company
                </Link>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.name}
                  href={companyId ? `${item.href}?companyId=${companyId}` : item.href}
                  className={cn(
                    'flex items-center px-3 py-2 text-sm font-medium rounded-md',
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  <Icon
                    className={cn(
                      'mr-3 h-5 w-5 flex-shrink-0',
                      isActive ? 'text-blue-500' : 'text-gray-400'
                    )}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="p-4 mt-auto border-t border-gray-200">
            <div className="flex items-center justify-between">
              {user && <UserDisplay user={user} />}
              <button
                onClick={handleLogout}
                className="p-2 text-gray-500 rounded-full hover:bg-gray-100"
                title="Sign out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile menu button */}
      <button
        id="sidebar-toggle"
        type="button"
        className="fixed bottom-4 right-4 z-20 p-3 text-white bg-blue-600 rounded-full shadow-lg lg:hidden"
        onClick={toggleSidebar}
      >
        <span className="sr-only">Open sidebar</span>
        <Menu className="w-6 h-6" />
      </button>
    </>
  );
}
