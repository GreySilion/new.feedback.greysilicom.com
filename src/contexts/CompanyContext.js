import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const CompanyContext = createContext();

export const CompanyProvider = ({ children, initialCompanyId = null }) => {
  const [selectedCompany, setSelectedCompany] = useState(initialCompanyId);
  const [companies, setCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Load companies for the current user
  const loadCompanies = async (userId) => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/companies?userId=${userId}`);
      const data = await response.json();
      
      if (data.success) {
        setCompanies(data.data);
        // If no company is selected, select the first one
        if (data.data.length > 0 && !selectedCompany) {
          setSelectedCompany(data.data[0].id);
        }
      }
    } catch (error) {
      console.error('Error loading companies:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Update company and refresh data
  const selectCompany = (companyId) => {
    setSelectedCompany(companyId);
    // Store in localStorage for persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedCompanyId', companyId);
    }
    // Trigger a refresh of any data that depends on the company
    router.refresh();
  };

  // Load selected company from localStorage on initial load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCompanyId = localStorage.getItem('selectedCompanyId');
      if (savedCompanyId) {
        setSelectedCompany(savedCompanyId);
      }
    }
  }, []);

  return (
    <CompanyContext.Provider
      value={{
        selectedCompany,
        companies,
        isLoading,
        selectCompany,
        loadCompanies,
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
};

export const useCompany = () => {
  const context = useContext(CompanyContext);
  if (context === undefined) {
    throw new Error('useCompany must be used within a CompanyProvider');
  }
  return context;
};
