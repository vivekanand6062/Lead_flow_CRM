
import React, { useState, useEffect } from 'react';
import { Building2, Users, DollarSign } from 'lucide-react';
import { DataTable, Column } from '@/components/ui/DataTable';
import api from '@/services/api';

export const ManagerCompaniesPage: React.FC = () => {
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
      header: 'Company / Organization',
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
      header: 'Employees',
      sortable: true,
      render: (c) => (
        <span className="text-text-muted-light dark:text-text-muted-dark font-mono text-xs">
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
    },
    {
      key: 'totalValue',
      header: 'Pipeline / Won Value',
      sortable: true,
      render: (c) => (
        <span className="font-mono font-bold text-text-primary-light dark:text-text-primary-dark text-xs">
          ₹{(c.totalValue || 0).toLocaleString('en-IN')}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-text-primary-light dark:text-text-primary-dark">
            Company Accounts
          </h2>
          <p className="text-xs text-text-muted-light dark:text-text-muted-dark mt-0.5">
            Enterprise accounts, aggregated opportunity values, and corporate stakeholders.
          </p>
        </div>
      </div>

      <DataTable
        data={companies}
        columns={columns}
        searchPlaceholder="Search companies by name..."
        searchKey="name"
        isLoading={loading}
        emptyTitle="No Companies Found"
        emptyDescription="Company accounts will aggregate as deals and leads are converted."
      />
    </div>
  );
}


export default ManagerCompaniesPage;
