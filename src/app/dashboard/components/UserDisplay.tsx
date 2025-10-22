'use client';

import { useState, useEffect } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
  username: string;
}

interface UserDisplayProps {
  user: {
    name: string;
    email: string;
  } | null;
  size?: 'sm' | 'md' | 'lg';
}

export function UserDisplay({ user, size = 'md' }: UserDisplayProps) {
  const [initials, setInitials] = useState('UD');
  
  useEffect(() => {
    if (user?.name) {
      const nameInitials = user.name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
      setInitials(nameInitials);
    }
  }, [user]);

  const sizeClasses = {
    sm: { container: 'h-8 w-8 text-xs', text: 'text-xs' },
    md: { container: 'h-10 w-10 text-sm', text: 'text-sm' },
    lg: { container: 'h-12 w-12 text-base', text: 'text-base' },
  };

  if (!user) {
    return (
      <div className={`rounded-full bg-gray-200 flex items-center justify-center font-medium text-gray-700 ${sizeClasses[size].container}`}>
        UD
      </div>
    );
  }

  return (
    <div className="flex items-center">
      <div className={`rounded-full bg-blue-600 flex items-center justify-center text-white font-medium ${sizeClasses[size].container}`}>
        {initials}
      </div>
      {size !== 'sm' && (
        <div className="ml-3 text-left">
          <p className={`font-medium text-gray-900 ${sizeClasses[size].text}`}>{user.name}</p>
          <p className="text-xs text-gray-500">{user.email}</p>
        </div>
      )}
    </div>
  );
}
