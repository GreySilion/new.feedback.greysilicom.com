'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Building2, ArrowRight, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCompany } from '@/contexts/CompanyContext';

// Use the Company type from the context
import type { Company } from '@/contexts/CompanyContext';

export default function CompaniesPage() {
  const router = useRouter();
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      console.log('Not authenticated, redirecting to login');
      router.push('/login');
    },
  });

  const { companies, isLoading: companiesLoading, selectCompany, loadCompanies, isInitialized } = useCompany();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasFetched = useRef(false);

  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      if (!session?.user?.email) {
        console.log('No user email found in session');
        if (isMounted) {
          setIsLoading(false);
        }
        return;
      }

      try {
        if (!isInitialized && !hasFetched.current) {
          if (isMounted) {
            setIsLoading(true);
          }
          await loadCompanies(session.user.email);
          hasFetched.current = true;
        }
      } catch (err) {
        console.error('Error loading companies:', err);
        if (isMounted) {
          setError('Failed to load companies. Please try again later.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();
    
    return () => {
      isMounted = false;
    };
  }, [session?.user?.email, loadCompanies, isInitialized]);

  const handleCompanySelect = useCallback(async (companyId: string | number) => {
    const idString = companyId.toString();
    console.log('Selecting company:', idString);
    
    try {
      // Use the context's selectCompany which handles both state and navigation
      await selectCompany(idString);
      
      // Force navigation to minDashboard with the selected company ID
      router.push(`/minDashboard?companyId=${idString}`);
    } catch (error) {
      console.error('Error selecting company:', error);
      setError('Failed to select company. Please try again.');
    }
    
    return false;
  }, [selectCompany, router]);

  // Check if we're still loading or if we need to show a loading state
  const showLoading = status === 'loading' || isLoading || companiesLoading;
  
  if (showLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  // Animation variants for framer-motion
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
          <div className="text-center md:text-left mb-6 md:mb-0">
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              Your Companies
            </h1>
            <p className="mt-3 text-gray-600 max-w-xl">
              Select a company to manage its reviews and access detailed analytics and feedback.
            </p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="group relative inline-flex items-center px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 transform hover:-translate-y-0.5"
          >
            <span className="mr-2">Sign Out</span>
            <svg className="w-4 h-4 transition-transform duration-300 transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
        
        {companies.length > 0 ? (
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={container}
            initial="hidden"
            animate="show"
          >

            {companies.map((company) => (
              <motion.div
                key={company.id}
                variants={item}
                className="relative group"
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl opacity-0 group-hover:opacity-100 blur transition duration-500 group-hover:duration-200"></div>
                <Card
                  className="relative h-full flex flex-col cursor-pointer bg-white dark:bg-gray-800 overflow-hidden transition-all duration-300 group-hover:shadow-xl border-0"
                  onClick={() => handleCompanySelect(company.id)}
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
                  <CardHeader className="pb-3">
                    <div className="flex items-center mb-2">
                      <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                        <Building2 className="h-6 w-6" />
                      </div>
                      <div className="ml-4">
                        <CardTitle className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {company.name}
                        </CardTitle>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mt-1">
                          {company.status || 'Active'}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 pt-0">
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      <div className="flex items-center mb-1">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        <span>Created: {company.created_at ? new Date(company.created_at).toLocaleDateString() : 'N/A'}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button
                      variant="ghost"
                      className="mt-2 w-full group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCompanySelect(company.id);
                      }}
                    >
                      <span className="mr-2">View Dashboard</span>
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}

            {/* Add New Company Card */}
            <motion.div
              variants={item}
              className="relative group"
              whileHover={{ y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <div 
                className="h-full border-2 border-dashed border-gray-300 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors group"
                onClick={() => router.push('/companies/new')}
              >
                <div className="p-3 bg-blue-50 dark:bg-blue-900/10 rounded-full mb-4 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/20 transition-colors">
                  <Plus className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">Add New Company</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">Set up a new company to get started</p>
              </div>
            </motion.div>
          </motion.div>
        ) : (
          <div className="text-center py-12">
            <div className="mx-auto h-24 w-24 text-gray-300 mb-4">
              <Building2 className="w-full h-full" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No companies found</h3>
            <p className="text-gray-500 mb-6">You don&apos;t have any companies yet.</p>
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
              <Plus className="mr-2 h-4 w-4" /> Add Company
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
