import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { getServerSession } from 'next-auth';
import { authOptions } from './api/auth/config';
import { Providers } from '../providers';
import ClientLayout from './ClientLayout';
import Loading from './loading';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
  adjustFontFallback: true,
});

export const metadata: Metadata = {
  title: 'Grey Silicon Feedback System',
  description: 'Collect, analyze, and act on customer feedback with Grey Silicon\'s powerful feedback management platform.',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

// This is a workaround for a known Next.js issue with dynamic content
const DynamicClientLayout = dynamic(() => import('./ClientLayout'), { 
  ssr: false,
  loading: () => <Loading />
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" className={`${inter.variable} font-sans`} suppressHydrationWarning>
      <head />
      <body className="min-h-screen bg-white font-sans antialiased">
        <Providers session={session}>
          <Suspense fallback={<Loading />}>
            <DynamicClientLayout>
              {children}
            </DynamicClientLayout>
          </Suspense>
        </Providers>
      </body>
    </html>
  );
}
