'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Contact, Building2, Phone, Mail, User } from 'lucide-react';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/Button';
import api from '@/services/api';

export default function ManagerContactsPage() {
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
      header: 'Company / Account',
      render: (c) => (
        <span className="font-medium text-text-secondary-light dark:text-text-secondary-dark">
          {c.companyName || c.companyId?.name || '—'}
        </span>
      )
    },
    {
      key: 'email',
      header: 'Email',
      render: (c) => (
        <span className="text-text-secondary-light dark:text-text-secondary-dark font-mono text-xs">
          {c.email || '—'}
        </span>
      )
    },
    {
      key: 'phone',
      header: 'Phone',
      render: (c) => (
        <span className="text-text-muted-light dark:text-text-muted-dark font-mono text-xs">
          {c.phone || '—'}
        </span>
      )
    },
    {
      key: 'assignedAgentId',
      header: 'Owner',
      render: (c) => (
        <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
          {c.assignedAgentId?.name || 'Unassigned'}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-text-primary-light dark:text-text-primary-dark">
            Team Contacts
          </h2>
          <p className="text-xs text-text-muted-light dark:text-text-muted-dark mt-0.5">
            Key business stakeholders, executives, and champions across customer accounts.
          </p>
        </div>
      </div>

      <DataTable
        data={contacts}
        columns={columns}
        searchPlaceholder="Search contacts by name or email..."
        searchKey="name"
        isLoading={loading}
        emptyTitle="No Contacts Found"
        emptyDescription="Contacts will appear here as leads and enterprise accounts are created."
      />
    </div>
  );
}
