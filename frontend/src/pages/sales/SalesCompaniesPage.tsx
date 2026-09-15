
import React, { useState, useEffect } from 'react';
import { Building2, Users } from 'lucide-react';
import { DataTable, Column } from '@/components/ui/DataTable';
import api from '@/services/api';

export const SalesCompaniesPage: React.FC = () => {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const res = await api.get('/companies');
      setCompanies(res.data.data || []);
    } catch (err) {
      console.error('Failed to load companies', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const columns: Column<any>[] = [
    {
      key: 'name',
      header: 'Company Name',
      sortable: true,
      render: (c) => (
        <div>
          <span className="font-semibold text-text-primary-light dark:text-text-primary-dark">{c.name}</span>
          <span className="block text-xs text-text-muted-light dark:text-text-muted-dark">{c.website || 'No website'}</span>
        </div>
      )
    },
    {
      key: 'industry',
      header: 'Industry',
      render: (c) => (
        <span className="text-text-secondary-light dark:text-text-secondary-dark font-medium">
          {c.industry || 'Technology'}
        </span>
      )
    },
    {
      key: 'employeeCount',
      header: 'Employee Count',
      sortable: true,
      render: (c) => (
        <span className="font-mono text-text-muted-light dark:text-text-muted-dark text-xs">
          {c.employeeCount || 50} employees
        </span>
      )
    },
    {
      key: 'contactsCount',
      header: 'Contacts',
      render: (c) => (
        <span className="text-text-muted-light dark:text-text-muted-dark text-xs">
          {c.contactsCount || 0} Stakeholders
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-text-primary-light dark:text-text-primary-dark">
          Target Accounts &amp; Companies
        </h2>
        <p className="text-xs text-text-muted-light dark:text-text-muted-dark mt-0.5">
          Enterprise company accounts associated with your active deals and leads.
        </p>
      </div>

      <DataTable
        data={companies}
        columns={columns}
        searchPlaceholder="Search companies by name..."
        searchKey="name"
        isLoading={loading}
        emptyTitle="No Companies Found"
        emptyDescription="Companies will appear as you create accounts and deals."
      />
    </div>
  );
}


export default SalesCompaniesPage;
