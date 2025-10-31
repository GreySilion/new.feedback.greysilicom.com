'use client';

import { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';

export interface Company {
  id: string | number;
  name: string;
  status?: string;
  created_at?: string;
  [key: string]: any; // For any additional properties that might come from the API
}

interface CompanyContextType {
  selectedCompany: string | null | undefined;
  companies: Company[];
  isLoading: boolean;
  isInitialized: boolean;
  error?: string | null;
  selectCompany: (companyId: string | null) => Promise<void>;
  loadCompanies: (userId: string) => Promise<Company[]>;
  clearSelectedCompany: () => void;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

interface CompanyProviderProps {
  children: React.ReactNode;
  initialCompanyId?: string | null;
}

export function CompanyProvider({ children, initialCompanyId }: CompanyProviderProps) {
  const [state, setState] = useState<{
    selectedCompany: string | null | undefined;
    companies: Company[];
    isLoading: boolean;
    isInitialized: boolean;
    error?: string | null;
  }>({
    selectedCompany: initialCompanyId ?? undefined,
    companies: [],
    isLoading: true,
    isInitialized: false,
    error: null,
  });
  
  const { selectedCompany, companies, isLoading, isInitialized } = state;
  const router = useRouter();
  const initialLoadRef = useRef(false);

  const loadCompanies = useCallback(async (userId: string) => {
    console.log('Loading companies for user:', userId);
    
    // Skip if no userId is provided
    if (!userId) {
      console.log('No userId provided, skipping company load');
      setState(prev => ({
        ...prev,
        isLoading: false,
        isInitialized: true,
        error: 'User ID is required',
      }));
      return [];
    }
    
    console.log('Fetching companies from API...');
    setState(prev => ({ 
      ...prev, 
      isLoading: true,
      error: null // Reset error state on new load attempt
    }));
    
    try {
      const response = await fetch(`/api/companies?userId=${userId}`, {
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('API response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error response:', errorText);
        throw new Error(`Failed to load companies: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Companies data received:', data);
      
      if (!data) {
        throw new Error('No data received from server');
      }
      
      // Handle both response formats: { success, data } and direct array
      const companiesList = Array.isArray(data) ? data : (Array.isArray(data.data) ? data.data : []);
      console.log(`Loaded ${companiesList.length} companies`);
      
      setState(prev => ({
        ...prev,
        companies: companiesList,
        isLoading: false,
        isInitialized: true,
        error: null,
      }));
      
      return companiesList;
    } catch (error) {
      console.error('Error in loadCompanies:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load companies';
      
      setState(prev => ({
        ...prev,
        companies: [],
        isLoading: false,
        isInitialized: true,
        error: errorMessage,
      }));
      
      return [];
    }
  }, []);

  const loadCompaniesMemoized = useMemo(() => loadCompanies, [loadCompanies]);

  // Update selected company when initialCompanyId changes
  useEffect(() => {
    setState(prev => ({
      ...prev,
      selectedCompany: initialCompanyId
    }));
  }, [initialCompanyId]);

  // Save selected company to localStorage and update state
  const selectCompany = useCallback(async (companyId: string | null) => {
    try {
      if (companyId) {
        const companyIdStr = companyId.toString();
        // Store in localStorage for persistence
        localStorage.setItem('selectedCompanyId', companyIdStr);
        
        // Update state
        setState(prev => ({
          ...prev,
          selectedCompany: companyIdStr,
          error: null,
        }));
        
        // Use push for SPA navigation
        router.push(`/minDashboard?companyId=${companyIdStr}`, { scroll: false });
      } else {
        localStorage.removeItem('selectedCompanyId');
        setState(prev => ({
          ...prev,
          selectedCompany: null,
        }));
        router.push('/minDashboard', { scroll: false });
      }
    } catch (err) {
      console.error('Error selecting company:', err);
      setState(prev => ({
        ...prev,
        error: 'Failed to select company',
      }));
    }
  }, [router]);

  const clearSelectedCompany = useCallback(() => {
    localStorage.removeItem('selectedCompanyId');
    setState(prev => ({
      ...prev,
      selectedCompany: null,
    }));
  }, []);

  // Initialize company selection when companies are loaded
  useEffect(() => {
    if (typeof window === 'undefined' || companies.length === 0) return;

    const savedCompanyId = localStorage.getItem('selectedCompanyId');
    const companyExists = savedCompanyId && 
      companies.some(c => c.id.toString() === savedCompanyId);
    
    // Only update state if needed
    if (companyExists && savedCompanyId !== selectedCompany) {
      setState(prev => ({
        ...prev,
        selectedCompany: savedCompanyId,
      }));
    } else if (companies.length > 0 && !companyExists && !selectedCompany) {
      const firstCompanyId = companies[0].id.toString();
      selectCompany(firstCompanyId);
    }
  }, [companies, selectedCompany, selectCompany]);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      ...state,
      selectCompany,
      loadCompanies: loadCompaniesMemoized,
      clearSelectedCompany,
    }),
    [state, selectCompany, loadCompaniesMemoized, clearSelectedCompany]
  );

  return (
    <CompanyContext.Provider value={contextValue}>
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  const context = useContext(CompanyContext);
  if (context === undefined) {
    throw new Error('useCompany must be used within a CompanyProvider');
  }
  return context;
}
