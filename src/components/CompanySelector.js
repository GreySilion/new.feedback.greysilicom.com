'use client';

import { useCompany } from '@/contexts/CompanyContext';
import { useEffect } from 'react';

export default function CompanySelector({ userId }) {
  const { selectedCompany, companies, isLoading, selectCompany, loadCompanies } = useCompany();

  // Load companies when userId changes
  useEffect(() => {
    if (userId) {
      loadCompanies(userId);
    }
  }, [userId, loadCompanies]);

  if (isLoading) {
    return (
      <div className="animate-pulse flex items-center space-x-2">
        <div className="h-10 w-48 bg-gray-200 rounded-md"></div>
      </div>
    );
  }

  if (companies.length === 0) {
    return (
      <div className="flex items-center space-x-2">
        <span className="text-gray-600">No companies found</span>
        <a 
          href="/dashboard/companies/new" 
          className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
        >
          Create Company
        </a>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <label htmlFor="company-select" className="text-sm font-medium text-gray-700">
        Company:
      </label>
      <select
        id="company-select"
        value={selectedCompany || ''}
        onChange={(e) => selectCompany(e.target.value)}
        className="block w-64 rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
      >
        {companies.map((company) => (
          <option key={company.id} value={company.id}>
            {company.name} {company.status ? `(${company.status})` : ''}
          </option>
        ))}
      </select>
    </div>
  );
}
