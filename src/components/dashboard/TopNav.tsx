'use client';

import { useState, ChangeEvent } from 'react';
import { Bell, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSession } from 'next-auth/react';
import { UserDropdown } from './UserDropdown';

interface TopNavProps {
  companyName: string;
}

export function TopNav({ companyName }: TopNavProps) {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-white shadow">
      <div className="flex flex-1 justify-between px-4">
        <div className="flex flex-1 items-center">
          <div className="flex w-full max-w-2xl items-center">
            <div className="relative w-full">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <Input
                id="search"
                name="search"
                className="block w-full rounded-md border-0 bg-white py-1.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6"
                placeholder="Search..."
                type="search"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
          </div>
        </div>
        <div className="ml-4 flex items-center md:ml-6
">
          <Button
            type="button"
            variant="ghost"
            className="rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <span className="sr-only">View notifications</span>
            <Bell className="h-6 w-6" aria-hidden="true" />
          </Button>
          
          {/* User dropdown */}
          {session?.user && (
            <UserDropdown user={{
              id: session.user.id,
              name: session.user.name || undefined,
              email: session.user.email || undefined
            }} />
          )}
        </div>
      </div>
    </header>
  );
}
