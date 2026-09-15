
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Users, ArrowUpDown, UserCheck, Eye, Edit } from 'lucide-react';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LeadModal } from '@/components/crm/LeadModal';
import api from '@/services/api';

export const ManagerLeadsPage: React.FC = () => {
  const [leads, setLeads] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<any>(null);

  const fetchLeadsAndAgents = async () => {
    try {
      setLoading(true);
      const [leadsRes, agentsRes] = await Promise.all([
        api.get('/leads'),
        api.get('/users/sales-agents')
      ]);
      setLeads(leadsRes.data.data || []);
      setAgents(agentsRes.data.data || []);
    } catch (err) {
      console.error('Failed to load team leads', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeadsAndAgents();
  }, []);

  const handleQuickReassign = async (leadId: string, agentId: string) => {
    try {
      await api.put(`/leads/${leadId}`, { assignedAgentId: agentId || null });
      fetchLeadsAndAgents();
    } catch (err) {
      console.error('Failed to reassign lead', err);
    }
  };

  const columns: Column<any>[] = [
    {
      key: 'name',
      header: 'Lead Name & Company',
      sortable: true,
      render: (l) => (
        <div>
          <span className="font-semibold text-text-primary-light dark:text-text-primary-dark">{l.name}</span>
          <span className="block text-xs text-text-muted-light dark:text-text-muted-dark">{l.companyName}</span>
        </div>
      )
    },
    {
      key: 'email',
      header: 'Contact Info',
      render: (l) => (
        <div className="text-xs">
          <span className="text-text-secondary-light dark:text-text-secondary-dark block">{l.email || '—'}</span>
          <span className="text-text-muted-light dark:text-text-muted-dark font-mono">{l.phone || '—'}</span>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (l) => <Badge type={l.status} />
    },
    {
      key: 'leadScore',
      header: 'Lead Score',
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
      key: 'assignedAgentId',
      header: 'Assigned Sales Agent',
      render: (l) => (
        <select
          value={l.assignedAgentId?._id || ''}
          onChange={(e) => handleQuickReassign(l._id, e.target.value)}
          className="text-xs rounded-lg border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark px-2 py-1 text-text-primary-light dark:text-text-primary-dark focus:outline-none focus:ring-1 focus:ring-copper-500"
        >
          <option value="">Unassigned</option>
          {agents.map((a) => (
            <option key={a._id} value={a._id}>
              {a.name}
            </option>
          ))}
        </select>
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
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (l) => (
        <div className="flex items-center justify-end gap-1">
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
    { label: 'All Leads', value: 'ALL' },
    { label: 'Qualified', value: 'QUALIFIED', filterFn: (l: any) => l.status === 'QUALIFIED' },
    { label: 'Proposal', value: 'PROPOSAL', filterFn: (l: any) => l.status === 'PROPOSAL' },
    { label: 'Negotiation', value: 'NEGOTIATION', filterFn: (l: any) => l.status === 'NEGOTIATION' },
    { label: 'Won', value: 'WON', filterFn: (l: any) => l.status === 'WON' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-text-primary-light dark:text-text-primary-dark">
            Team Leads Management
          </h2>
          <p className="text-xs text-text-muted-light dark:text-text-muted-dark mt-0.5">
            Assign incoming inquiries, monitor lead qualification scores, and track stage progression.
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
        searchPlaceholder="Search leads by name, company, email..."
        searchKey="name"
        filterTabs={filterTabs}
        isLoading={loading}
        emptyTitle="No Leads Found"
        emptyDescription="Create a new lead to populate your team pipeline."
        emptyActionLabel="Add First Lead"
        onEmptyAction={() => {
          setEditingLead(null);
          setIsModalOpen(true);
        }}
      />

      {/* Lead Modal */}
      <LeadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchLeadsAndAgents}
        lead={editingLead}
        isManager={true}
        agentsList={agents.map(a => ({ id: a._id, name: a.name }))}
      />
    </div>
  );
}


export default ManagerLeadsPage;
