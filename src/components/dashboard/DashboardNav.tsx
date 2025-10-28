'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, MessageSquare, BarChart, Settings, Star } from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Reviews', href: '/dashboard/reviews', icon: Star },
  { name: 'Feedback', href: '/dashboard/feedback', icon: MessageSquare },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export function DashboardNav() {
  const pathname = usePathname() || '';

  // Ensure pathname is always a string
  const isActive = (href: string) => {
    if (!pathname) return false;
    return pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
  };

  return (
    <nav className="grid items-start gap-2">
      {navigation.map((item) => {
        const active = isActive(item.href);
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground',
              active ? 'bg-accent' : 'transparent',
              'transition-colors duration-200'
            )}
          >
            <item.icon className={cn(
              'mr-3 h-4 w-4',
              active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground',
              'transition-colors duration-200'
            )} />
            <span>{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
