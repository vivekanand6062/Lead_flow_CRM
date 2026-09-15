'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Users, ArrowRight, Edit, Eye, Sparkles } from 'lucide-react';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LeadModal } from '@/components/crm/LeadModal';
import api from '@/services/api';

export default function SalesLeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<any>(null);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const res = await api.get('/leads');
      setLeads(res.data.data || []);
    } catch (err) {
      console.error('Failed to load my leads', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const columns: Column<any>[] = [
    {
      key: 'name',
      header: 'Lead & Company',
      sortable: true,
      render: (l) => (
        <div>
          <Link
            href={`/sales/leads/${l._id}`}
            className="font-semibold text-text-primary-light dark:text-text-primary-dark hover:text-copper-600 dark:hover:text-copper-400"
          >
            {l.name}
          </Link>
          <span className="block text-xs text-text-muted-light dark:text-text-muted-dark">{l.companyName}</span>
        </div>
      )
    },
    {
      key: 'email',
      header: 'Contact Details',
      render: (l) => (
        <div className="text-xs">
          <span className="text-text-secondary-light dark:text-text-secondary-dark block">{l.email || '—'}</span>
          <span className="text-text-muted-light dark:text-text-muted-dark font-mono">{l.phone || '—'}</span>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status Stage',
      render: (l) => <Badge type={l.status} />
    },
    {
      key: 'leadScore',
      header: 'AI Lead Score',
      sortable: true,
      render: (l) => (
        <div className="flex items-center gap-1.5">
          <span className={`text-xs font-bold font-mono ${
            l.leadScore >= 75 ? 'text-emerald-600 dark:text-emerald-400' : (l.leadScore >= 50 ? 'text-amber-600 dark:text-amber-400' : 'text-crimson-600 dark:text-crimson-400')
          }`}>
            {l.leadScore}/100
          </span>
          <Badge type={l.intentLevel} />
        </div>
      )
    },
    {
      key: 'estimatedValue',
      header: 'Est. Value',
      sortable: true,
      render: (l) => (
        <span className="font-mono text-text-secondary-light dark:text-text-secondary-dark font-medium text-xs">
          ₹{(l.estimatedValue || 0).toLocaleString('en-IN')}
        </span>
      )
    },
    {
      key: 'leadSource',
      header: 'Source',
      render: (l) => (
        <span className="text-xs text-text-muted-light dark:text-text-muted-dark">
          {l.leadSource || 'Website'}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (l) => (
        <div className="flex items-center justify-end gap-1">
          <Link
            href={`/sales/leads/${l._id}`}
            className="p-1.5 rounded-md text-text-muted-light dark:text-text-muted-dark hover:text-text-primary-light dark:hover:text-text-primary-dark hover:bg-surface-elevated-light dark:hover:bg-surface-elevated-dark"
            title="Open Detail & AI Tools"
          >
            <Eye className="w-4 h-4" />
          </Link>
          <button
            onClick={() => {
              setEditingLead(l);
              setIsModalOpen(true);
            }}
            className="p-1.5 rounded-md text-text-muted-light dark:text-text-muted-dark hover:text-text-primary-light dark:hover:text-text-primary-dark hover:bg-surface-elevated-light dark:hover:bg-surface-elevated-dark"
            title="Edit Lead"
          >
            <Edit className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  const filterTabs = [
    { label: 'All My Leads', value: 'ALL' },
    { label: 'Qualified', value: 'QUALIFIED', filterFn: (l: any) => l.status === 'QUALIFIED' },
    { label: 'Proposal', value: 'PROPOSAL', filterFn: (l: any) => l.status === 'PROPOSAL' },
    { label: 'Negotiation', value: 'NEGOTIATION', filterFn: (l: any) => l.status === 'NEGOTIATION' },
    { label: 'High Intent', value: 'HIGH_INTENT', filterFn: (l: any) => l.leadScore >= 75 }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-text-primary-light dark:text-text-primary-dark">
            My Leads
          </h2>
          <p className="text-xs text-text-muted-light dark:text-text-muted-dark mt-0.5">
            Prospect accounts assigned to you. Review AI qualification scores and next best actions.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => {
            setEditingLead(null);
            setIsModalOpen(true);
          }}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Lead</span>
        </Button>
      </div>

      {/* Leads Table */}
      <DataTable
        data={leads}
        columns={columns}
        searchPlaceholder="Search my leads..."
        searchKey="name"
        filterTabs={filterTabs}
        isLoading={loading}
        emptyTitle="No Leads Assigned Yet"
        emptyDescription="Create a new lead or ask your sales manager to distribute inquiries to your queue."
        emptyActionLabel="Create First Lead"
        onEmptyAction={() => {
          setEditingLead(null);
          setIsModalOpen(true);
        }}
      />

      {/* Lead Modal */}
      <LeadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchLeads}
        lead={editingLead}
      />
    </div>
  );
}
