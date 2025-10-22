'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { UserDisplay } from './UserDisplay';

interface SidebarProps {
  user: {
    name: string;
    email: string;
  } | null;
}

export function Sidebar({ user }: SidebarProps) {
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Toggle sidebar state
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
    document.body.classList.toggle('sidebar-open', !isOpen);
  };

  // Close feedback dropdown when navigating away
  useEffect(() => {
    setIsFeedbackOpen(false);
  }, [pathname]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isFeedbackOpen && !target.closest('#feedback-dropdown') && !target.closest('#feedback-dropdown-button')) {
        setIsFeedbackOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isFeedbackOpen]);

  return (
    <>
      <div 
        id="sidebar-backdrop" 
        className="lg:hidden fixed inset-0 z-20 bg-black/50 hidden"
        onClick={toggleSidebar}
      />
      <aside 
        id="sidebar" 
        className={`fixed left-0 top-0 z-30 h-screen w-64 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} border-r border-gray-200 bg-white transition-transform duration-300 ease-in-out lg:translate-x-0`}
        aria-label="Sidebar"
      >
      <div className="flex h-full flex-col overflow-y-auto px-4 py-6">
        <div className="mb-8 flex items-center justify-between px-2">
          <span className="text-xl font-semibold text-gray-800">FeedbackPro</span>
            <button 
              type="button" 
              className="lg:hidden text-gray-500 hover:text-gray-600"
              onClick={toggleSidebar}
              aria-label="Close sidebar"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
        </div>
        
        <nav className="space-y-1">
          {/* Dashboard Link */}
          <a
            href="/dashboard"
            className="group flex items-center rounded-lg px-4 py-3 text-sm font-medium text-blue-600 bg-blue-50"
          >
            <svg 
              className="mr-3 h-5 w-5 text-blue-600" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Dashboard
          </a>

          {/* Feedback Dropdown */}
          <div className="space-y-1">
            <button 
              id="feedback-dropdown-button"
              className="group flex w-full items-center justify-between rounded-lg px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-blue-50 hover:text-blue-600"
              onClick={() => setIsFeedbackOpen(!isFeedbackOpen)}
              aria-expanded={isFeedbackOpen}
              aria-controls="feedback-dropdown"
            >
              <div className="flex items-center">
                <svg 
                  className="mr-3 h-5 w-5 text-gray-400 group-hover:text-blue-600" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <span>Feedback</span>
              </div>
              <svg 
                id="feedback-dropdown-icon"
                className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isFeedbackOpen ? 'rotate-180' : ''}`}
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            <div 
              id="feedback-dropdown" 
              className={`ml-8 space-y-1 transition-all duration-200 overflow-hidden ${isFeedbackOpen ? 'max-h-32 mt-2' : 'max-h-0 mt-0'}`}
            >
              <a
                href="/dashboard/feedback/pending"
                className="group flex items-center rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-blue-50 hover:text-blue-600"
              >
                <span className="mr-2 h-1.5 w-1.5 rounded-full bg-yellow-400"></span>
                Pending Replies
              </a>
              <a
                href="/dashboard/feedback/replied"
                className="group flex items-center rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-blue-50 hover:text-blue-600"
              >
                <span className="mr-2 h-1.5 w-1.5 rounded-full bg-green-400"></span>
                Replied
              </a>
            </div>
          </div>

          {/* Other Navigation Items */}
          {[
            { name: 'Analytics', href: '/dashboard/analytics', icon: 'BarChart3' },
            { name: 'Settings', href: '/dashboard/settings', icon: 'Settings' },
          ].map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="group flex items-center rounded-lg px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-blue-50 hover:text-blue-600"
            >
              <svg 
                className="mr-3 h-5 w-5 text-gray-400 group-hover:text-blue-600" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                {item.icon === 'BarChart3' && (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                )}
                {item.icon === 'Settings' && (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                )}
              </svg>
              {item.name}
            </a>
          ))}
        </nav>

        {/* User profile */}
        <div className="mt-auto pt-6">
          <div className="flex items-center rounded-lg bg-gray-50 p-3">
            <UserDisplay user={user} size="md" />
          </div>
        </div>
      </div>
      </aside>
    </>
  );
}
