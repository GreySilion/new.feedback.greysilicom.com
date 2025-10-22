'use client';

import { useEffect } from 'react';

export function MobileMenuButton() {
  useEffect(() => {
    const toggleSidebar = () => {
      const sidebar = document.getElementById('sidebar');
      const backdrop = document.getElementById('sidebar-backdrop');
      if (sidebar && backdrop) {
        sidebar.classList.toggle('-translate-x-full');
        backdrop.classList.toggle('hidden');
        document.body.classList.toggle('overflow-hidden');
      }
    };

    const openButton = document.getElementById('open-sidebar');
    openButton?.addEventListener('click', toggleSidebar);

    return () => {
      openButton?.removeEventListener('click', toggleSidebar);
    };
  }, []);

  return (
    <button
      type="button"
      className="lg:hidden text-gray-500 hover:text-gray-600 focus:outline-none"
      id="open-sidebar"
      aria-label="Open sidebar"
    >
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
  );
}
