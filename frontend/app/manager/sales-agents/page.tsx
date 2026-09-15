'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Users, Edit, Eye, Power } from 'lucide-react';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SalesAgentModal } from '@/components/crm/SalesAgentModal';
import api from '@/services/api';

export default function ManagerSalesAgentsPage() {
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<any>(null);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users/sales-agents');
      setAgents(res.data.data || []);
    } catch (err) {
      console.error('Failed to load sales agents', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const handleToggleStatus = async (agent: any) => {
    const nextStatus = agent.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const confirmMsg = `Are you sure you want to ${nextStatus === 'INACTIVE' ? 'deactivate' : 'activate'} Sales Agent ${agent.name}?`;
    if (!confirm(confirmMsg)) return;

    try {
      await api.put(`/users/sales-agents/${agent._id}`, { status: nextStatus });
      fetchAgents();
    } catch (err) {
      console.error('Failed to update agent status', err);
    }
  };

  const columns: Column<any>[] = [
    {
      key: 'name',
      header: 'Agent Name',
      sortable: true,
      render: (a) => (
        <div>
          <Link
            href={`/manager/sales-agents/${a._id}`}
            className="font-semibold text-text-primary-light dark:text-text-primary-dark hover:text-copper-600 dark:hover:text-copper-400"
          >
            {a.name}
          </Link>
          <span className="block text-xs text-text-muted-light dark:text-text-muted-dark">{a.email}</span>
        </div>
      )
    },
    {
      key: 'department',
      header: 'Role / Territory',
      render: (a) => (
        <span className="text-text-secondary-light dark:text-text-secondary-dark font-medium">
          {a.department || 'Enterprise AE'}
        </span>
      )
    },
    {
      key: 'assignedLeadsCount',
      header: 'Assigned Leads',
      sortable: true,
      render: (a) => (
        <span className="font-mono font-medium text-text-primary-light dark:text-text-primary-dark">
          {a.assignedLeadsCount || 0} Leads
        </span>
      )
    },
    {
      key: 'wonDealsCount',
      header: 'Deals Won',
      sortable: true,
      render: (a) => (
        <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
          {a.wonDealsCount || 0} Won
        </span>
      )
    },
    {
      key: 'targetQuota',
      header: 'Monthly Quota',
      sortable: true,
      render: (a) => (
        <span className="font-mono text-text-muted-light dark:text-text-muted-dark">
          ₹{(a.targetQuota || 2500000).toLocaleString('en-IN')}
        </span>
      )
    },
    {
      key: 'wonRevenue',
      header: 'Won Revenue',
      sortable: true,
      render: (a) => (
        <span className="font-mono font-bold text-text-primary-light dark:text-text-primary-dark">
          ₹{(a.wonRevenue || 0).toLocaleString('en-IN')}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (a) => <Badge type={a.status} />
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (a) => (
        <div className="flex items-center justify-end gap-1">
          <Link
            href={`/manager/sales-agents/${a._id}`}
            className="p-1.5 rounded-md text-text-muted-light dark:text-text-muted-dark hover:text-text-primary-light dark:hover:text-text-primary-dark hover:bg-surface-elevated-light dark:hover:bg-surface-elevated-dark"
            title="View Agent Profile"
          >
            <Eye className="w-4 h-4" />
          </Link>
          <button
            onClick={() => {
              setEditingAgent(a);
              setIsModalOpen(true);
            }}
            className="p-1.5 rounded-md text-text-muted-light dark:text-text-muted-dark hover:text-text-primary-light dark:hover:text-text-primary-dark hover:bg-surface-elevated-light dark:hover:bg-surface-elevated-dark"
            title="Edit Agent"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleToggleStatus(a)}
            className={`p-1.5 rounded-md hover:bg-surface-elevated-light dark:hover:bg-surface-elevated-dark ${
              a.status === 'ACTIVE'
                ? 'text-crimson-500 hover:text-crimson-600'
                : 'text-emerald-500 hover:text-emerald-600'
            }`}
            title={a.status === 'ACTIVE' ? 'Deactivate Agent' : 'Activate Agent'}
          >
            <Power className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-text-primary-light dark:text-text-primary-dark">
            Sales Agent Team
          </h2>
          <p className="text-xs text-text-muted-light dark:text-text-muted-dark mt-0.5">
            Recruit, assign quotas, and manage sales representatives on your direct team.
          </p>
        </div>

        {/* Manager CAN create Sales Agents */}
        <Button
          size="sm"
          onClick={() => {
            setEditingAgent(null);
            setIsModalOpen(true);
          }}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Sales Agent</span>
        </Button>
      </div>

      {/* Sales Agents Table */}
      <DataTable
        data={agents}
        columns={columns}
        searchPlaceholder="Search sales agents by name..."
        searchKey="name"
        isLoading={loading}
        emptyTitle="No Sales Agents on Your Team"
        emptyDescription="Add your first sales agent rep to start distributing leads and monitoring pipeline velocity."
        emptyActionLabel="Add First Sales Agent"
        onEmptyAction={() => {
          setEditingAgent(null);
          setIsModalOpen(true);
        }}
      />

      {/* Add / Edit Sales Agent Modal */}
      <SalesAgentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchAgents}
        agent={editingAgent}
      />
    </div>
  );
}
