
import React, { useState, useEffect } from 'react';
import { Contact, Mail, Phone, Building2 } from 'lucide-react';
import { DataTable, Column } from '@/components/ui/DataTable';
import api from '@/services/api';

export const SalesContactsPage: React.FC = () => {
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/contacts');
      setContacts(res.data.data || []);
    } catch (err) {
      console.error('Failed to load contacts', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const columns: Column<any>[] = [
    {
      key: 'name',
      header: 'Contact Name',
      sortable: true,
      render: (c) => (
        <div>
          <span className="font-semibold text-text-primary-light dark:text-text-primary-dark">{c.name}</span>
          <span className="block text-xs text-text-muted-light dark:text-text-muted-dark">{c.designation || 'Decision Maker'}</span>
        </div>
      )
    },
    {
      key: 'companyName',
      header: 'Company Account',
      render: (c) => (
        <span className="font-medium text-text-secondary-light dark:text-text-secondary-dark">
          {c.companyName || c.companyId?.name || '—'}
        </span>
      )
    },
    {
      key: 'email',
      header: 'Work Email',
      render: (c) => (
        <span className="text-text-secondary-light dark:text-text-secondary-dark font-mono text-xs">
          {c.email || '—'}
        </span>
      )
    },
    {
      key: 'phone',
      header: 'Phone Number',
      render: (c) => (
        <span className="text-text-muted-light dark:text-text-muted-dark font-mono text-xs">
          {c.phone || '—'}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-text-primary-light dark:text-text-primary-dark">
          My Contacts Directory
        </h2>
        <p className="text-xs text-text-muted-light dark:text-text-muted-dark mt-0.5">
          Key decision makers, champions, and executives at your assigned customer accounts.
        </p>
      </div>

      <DataTable
        data={contacts}
        columns={columns}
        searchPlaceholder="Search contacts by name or email..."
        searchKey="name"
        isLoading={loading}
        emptyTitle="No Contacts Found"
        emptyDescription="Contacts linked to your assigned leads will populate here."
      />
    </div>
  );
}


export default SalesContactsPage;
