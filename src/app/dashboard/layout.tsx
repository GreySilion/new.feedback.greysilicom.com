import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './dashboard.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Feedback Dashboard | Greysilicon',
  description: 'Manage and analyze customer feedback',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${inter.className} bg-gray-50`}>
      <div className="flex h-screen overflow-hidden">
          {/* Mobile sidebar backdrop */}
          <div className="lg:hidden fixed inset-0 z-20 bg-black/50 hidden" id="sidebar-backdrop"></div>
          
          {/* Sidebar */}
          <aside 
            id="sidebar" 
            className="fixed left-0 top-0 z-30 h-screen w-64 -translate-x-full border-r border-gray-200 bg-white transition-transform lg:translate-x-0"
            aria-label="Sidebar"
          >
            <div className="flex h-full flex-col overflow-y-auto px-4 py-6">
              <div className="mb-8 flex items-center justify-between px-2">
                <span className="text-xl font-semibold text-gray-800">FeedbackPro</span>
                <button 
                  type="button" 
                  className="lg:hidden text-gray-500 hover:text-gray-600"
                  id="close-sidebar"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <nav className="space-y-1">
                {[
                  { name: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
                  { name: 'Feedback', href: '/dashboard/feedback', icon: 'MessageSquare' },
                  { name: 'Analytics', href: '/dashboard/analytics', icon: 'BarChart3' },
                  { name: 'Settings', href: '/dashboard/settings', icon: 'Settings' },
                ].map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center rounded-lg px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-blue-50 hover:text-blue-600 ${item.name === 'Dashboard' ? 'bg-blue-50 text-blue-600' : ''}`}
                  >
                    <svg 
                      className={`mr-3 h-5 w-5 transition-colors ${item.name === 'Dashboard' ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-600'}`} 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      {item.icon === 'LayoutDashboard' && (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      )}
                      {item.icon === 'MessageSquare' && (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      )}
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
              
              <div className="mt-auto pt-4">
                <div className="rounded-lg bg-gray-50 p-4">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">JD</span>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-700">John Doe</p>
                      <p className="text-xs text-gray-500">Admin</p>
                    </div>
                    <button className="ml-auto text-gray-400 hover:text-gray-500">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
            {/* Top header */}
            <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center">
                  <button 
                    type="button" 
                    className="mr-2 rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
                    id="open-sidebar"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                  <h1 className="text-xl font-semibold text-gray-800">Dashboard</h1>
                </div>
                
                <div className="flex items-center space-x-4">
                  <button className="rounded-full p-2 text-gray-500 hover:bg-gray-100">
                    <span className="sr-only">View notifications</span>
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </button>
                  
                  <div className="relative">
                    <button className="flex items-center rounded-full p-1 text-sm text-gray-500 hover:bg-gray-100 focus:outline-none">
                      <span className="sr-only">Open user menu</span>
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">JD</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </header>

            {/* Main content area */}
            <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6">
              {children}
            </main>
          </div>
      </div>
      
      {/* Sidebar toggle script */}
      <script dangerouslySetInnerHTML={{ __html: `
        document.addEventListener('DOMContentLoaded', function() {
          const sidebar = document.getElementById('sidebar');
          const sidebarBackdrop = document.getElementById('sidebar-backdrop');
          const openSidebarBtn = document.getElementById('open-sidebar');
          const closeSidebarBtn = document.getElementById('close-sidebar');
          
          function openSidebar() {
            sidebar.classList.remove('-translate-x-full');
            sidebarBackdrop.classList.remove('hidden');
            document.body.classList.add('overflow-hidden');
          }
          
          function closeSidebar() {
            sidebar.classList.add('-translate-x-full');
            sidebarBackdrop.classList.add('hidden');
            document.body.classList.remove('overflow-hidden');
          }
          
          openSidebarBtn?.addEventListener('click', openSidebar);
          closeSidebarBtn?.addEventListener('click', closeSidebar);
          sidebarBackdrop?.addEventListener('click', closeSidebar);
          
          // Close sidebar when clicking outside on mobile
          document.addEventListener('click', function(event) {
            const isClickInside = sidebar?.contains(event.target) || openSidebarBtn?.contains(event.target);
            if (!isClickInside && !sidebar?.classList.contains('-translate-x-full')) {
              closeSidebar();
            }
          });
          
          // Close sidebar when pressing Escape key
          document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape' && !sidebar?.classList.contains('-translate-x-full')) {
              closeSidebar();
            }
          });
        });
      ` }} />
    </div>
  );
}
