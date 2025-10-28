'use client';

import { useCompany } from '@/contexts/CompanyContext';
import { useEffect, useState, memo } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { useRef, useMemo, useCallback } from 'react';

interface Company {
  id: string | number;
  name: string;
  status?: string;
}

interface CompanySelectorProps {
  userId: string;
  className?: string;
}

function CompanySelectorComponent({ userId, className = '' }: CompanySelectorProps) {
  // All hooks must be called unconditionally at the top level
  const [isOpen, setIsOpen] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const loadAttempted = useRef(false);
  const prevUserId = useRef<string | null>(null);
  
  const { 
    selectedCompany, 
    companies, 
    isLoading, 
    isInitialized, 
    error,
    selectCompany, 
    loadCompanies,
    clearSelectedCompany 
  } = useCompany();
  
  // Memoize the selected company name to prevent unnecessary re-renders
  const selectedCompanyName = useMemo(() => {
    if (!selectedCompany) return 'No company selected';
    const company = companies.find((c: Company) => c.id.toString() === selectedCompany);
    return company?.name || 'Select a company';
  }, [companies, selectedCompany]);

  // Memoize the dropdown items to prevent unnecessary re-renders
  const dropdownItems = useMemo(() => {
    return companies.map((company: Company) => ({
      id: company.id.toString(),
      name: company.name || 'Unnamed Company',
      isSelected: selectedCompany === company.id.toString(),
    }));
  }, [companies, selectedCompany]);

  // Load companies when component mounts or userId changes
  useEffect(() => {
    // Skip if no userId
    if (!userId) {
      console.log('No userId provided, skipping company load');
      setIsInitialLoad(false);
      return;
    }

    // Reset load attempt if userId changes
    if (prevUserId.current !== userId) {
      loadAttempted.current = false;
      prevUserId.current = userId;
    }

    // Load companies if not already loaded or if userId changed
    if (!loadAttempted.current) {
      console.log('Initiating company load for user:', userId);
      loadAttempted.current = true;
      
      loadCompanies(userId)
        .then((loadedCompanies) => {
          console.log('Companies loaded successfully:', loadedCompanies);
          // If there are companies and none is selected, select the first one
          if (loadedCompanies.length > 0 && !selectedCompany) {
            const firstCompany = loadedCompanies[0];
            if (firstCompany && firstCompany.id) {
              console.log('Auto-selecting first company:', firstCompany.id);
              selectCompany(firstCompany.id.toString());
            }
          } else if (loadedCompanies.length === 0) {
            console.log('No companies found for user');
          }
        })
        .catch((err: Error) => {
          console.error('Error loading companies:', err);
        })
        .finally(() => {
          console.log('Company load attempt completed');
          setIsInitialLoad(false);
        });
    } else {
      console.log('Companies already loaded or loading in progress');
      setIsInitialLoad(false);
    }
  }, [userId, loadCompanies]);

  // Track when companies are loaded
  const companiesLength = useRef(companies.length);
  
  useEffect(() => {
    if (companies.length > 0 && companies.length !== companiesLength.current) {
      console.log(`Companies count changed from ${companiesLength.current} to ${companies.length}`);
      companiesLength.current = companies.length;
    }
  }, [companies.length]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isOpen && !target.closest('.company-selector-container')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Render different states based on the current state
  const renderContent = () => {
    // Show error state
    if (error) {
      console.log('Rendering error state:', error);
      return (
        <div className="flex flex-col space-y-2 p-2">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-red-600">Error loading companies</span>
            <button
              onClick={() => {
                console.log('Retry button clicked');
                loadAttempted.current = false;
                loadCompanies(userId);
              }}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Retry
            </button>
          </div>
          <div className="text-xs text-red-500">
            {typeof error === 'string' ? error : 'An unknown error occurred'}
          </div>
        </div>
      );
    }

    // Show empty state
    if (companies.length === 0) {
      console.log('No companies found for user');
      return (
        <div className="flex flex-col space-y-2 p-2">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">No companies found</span>
            <a
              href="/dashboard/companies/new"
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={(e) => {
                e.preventDefault();
                console.log('Navigating to create company page');
                window.location.href = '/dashboard/companies/new';
              }}
            >
              Create Company
            </a>
          </div>
          <div className="text-xs text-gray-500">
            You need to create a company to get started
          </div>
        </div>
      );
    }

    // Show loading state
    if (isLoading || isInitialLoad) {
      return (
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500"></div>
          <span>Loading...</span>
        </div>
      );
    }

    // Show company selector
    return (
      <div className="relative">
        <button
          type="button"
          onClick={toggleDropdown}
          className={`inline-flex justify-between w-full rounded-md border ${
            selectedCompany ? 'border-gray-300' : 'border-yellow-400 bg-yellow-50'
          } shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
          aria-haspopup="listbox"
          aria-expanded="true"
          aria-labelledby="company-selector-label"
        >
          <span className="truncate">{selectedCompanyName}</span>
          <ChevronDown className="ml-2 h-5 w-5 text-gray-400" aria-hidden="true" />
        </button>

        {isOpen && (
          <div className="absolute z-10 mt-1 w-full rounded-md bg-white shadow-lg">
            <ul
              className="max-h-60 overflow-auto rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
              tabIndex={-1}
              role="listbox"
              aria-labelledby="company-selector-label"
            >
              {dropdownItems.map((item) => (
                <li
                  key={item.id}
                  className={`${
                    item.isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
                  } text-gray-900 cursor-default select-none relative py-2 pl-3 pr-9`}
                  onClick={() => handleCompanySelect(item.id)}
                  role="option"
                  aria-selected={item.isSelected}
                >
                  <div className="flex items-center">
                    <span className={`${item.isSelected ? 'font-semibold' : 'font-normal'} block truncate`}>
                      {item.name}
                    </span>
                  </div>
                  {item.isSelected && (
                    <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-blue-600">
                      <Check className="h-5 w-5" aria-hidden="true" />
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  const toggleDropdown = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleCompanySelect = useCallback((companyId: string | null) => {
    if (companyId !== selectedCompany) {
      selectCompany(companyId);
    }
    setIsOpen(false);
  }, [selectedCompany, selectCompany]);

  // Only re-render if necessary
  return (
    <div 
      className={`relative company-selector-container ${className}`} 
      data-testid="company-selector"
      data-selected={!!selectedCompany}
    >
      <button
        type="button"
        onClick={toggleDropdown}
        className={`inline-flex justify-between w-full rounded-md border ${
          selectedCompany ? 'border-gray-300' : 'border-yellow-400 bg-yellow-50'
        } shadow-sm px-4 py-2 bg-white text-sm font-medium ${
          selectedCompany ? 'text-gray-700' : 'text-yellow-700'
        } hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
        id="company-selector"
        aria-haspopup="listbox"
        aria-expanded="true"
        disabled={isLoading}
      >
        <span className="truncate">{selectedCompanyName}</span>
        <svg className="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 011.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      {isOpen && (
        <div 
          className="absolute z-10 mt-1 w-full rounded-md bg-white shadow-lg"
          role="listbox"
          onBlur={closeDropdown}
          tabIndex={-1}
        >
          <ul className="max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
            <li
              key="no-company"
              onClick={() => handleCompanySelect(null)}
              className={`cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-100 ${
                !selectedCompany ? 'bg-blue-50 text-blue-900' : 'text-gray-900'
              }`}
              role="option"
              aria-selected={!selectedCompany}
            >
              <div className="flex items-center">
                <span className={`block truncate ${!selectedCompany ? 'font-semibold' : 'font-normal'}`}>
                  No Company
                </span>
              </div>
              {!selectedCompany && (
                <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-blue-600">
                  <Check className="h-5 w-5" aria-hidden="true" />
                </span>
              )}
            </li>
            {dropdownItems.map((item: { id: string; name: string; isSelected: boolean }) => (
              <li
                key={item.id}
                onClick={() => handleCompanySelect(item.id)}
                className={`cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-100 ${
                  item.isSelected ? 'bg-blue-50 text-blue-900' : 'text-gray-900'
                }`}
                role="option"
                aria-selected={item.isSelected}
              >
                <div className="flex items-center">
                  <span className={`block truncate ${
                    item.isSelected ? 'font-semibold' : 'font-normal'
                  }`}>
                    {item.name}
                  </span>
                </div>

                {item.isSelected && (
                  <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-blue-600">
                    <Check className="h-5 w-5" aria-hidden="true" />
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
      {isLoading && (
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
    </div>
  );
}

// Memoize the component to prevent unnecessary re-renders
export const CompanySelector = memo(CompanySelectorComponent);
