'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, MessageSquare, BarChart2, Settings, LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';

interface SidebarProps {
  activeTab?: string;
}

export function Sidebar({ activeTab }: SidebarProps) {
  const pathname = usePathname();
  const navItems = [
    { id: 'dashboard', name: 'Dashboard', href: '/minDashboard', icon: Home },
    { id: 'reviews', name: 'Reviews', href: '/reviews', icon: MessageSquare },
    { id: 'analytics', name: 'Analytics', href: '/analytics', icon: BarChart2 },
    { id: 'settings', name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="w-64 flex flex-col border-r border-gray-200 bg-white">
        <div className="flex h-16 flex-shrink-0 items-center px-6">
          <h1 className="text-xl font-semibold text-gray-900">FeedbackPro</h1>
        </div>
        <div className="flex flex-1 flex-col overflow-y-auto">
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navItems.map((item) => {
              const isActive = activeTab ? activeTab === item.id : pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center rounded-md px-3 py-2 text-sm font-medium ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 flex-shrink-0 ${
                      isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className="flex flex-shrink-0 border-t border-gray-200 p-4">
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="group flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            >
              <LogOut className="mr-3 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-500" />
              Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
