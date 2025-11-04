import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Select Company - Feedback System',
  description: 'Select a company to manage your feedback',};

type CompaniesLayoutProps = {
  children: React.ReactNode;
};

export default function CompaniesLayout({ children }: CompaniesLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
