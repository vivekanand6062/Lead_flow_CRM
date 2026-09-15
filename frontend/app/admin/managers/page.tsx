'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Users, Edit, Eye, Power } from 'lucide-react';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ManagerModal } from '@/components/crm/ManagerModal';
import api from '@/services/api';

export default function AdminManagersPage() {
  const [managers, setManagers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingManager, setEditingManager] = useState<any>(null);

  const fetchManagers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users/managers');
      setManagers(res.data.data || []);
    } catch (err) {
      console.error('Failed to load managers', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchManagers();
  }, []);

  const handleToggleStatus = async (manager: any) => {
    const nextStatus = manager.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const confirmMsg = `Are you sure you want to ${nextStatus === 'INACTIVE' ? 'deactivate' : 'activate'} Manager ${manager.name}?`;
    if (!confirm(confirmMsg)) return;

    try {
      await api.put(`/users/managers/${manager._id}`, { status: nextStatus });
      fetchManagers();
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const columns: Column<any>[] = [
    {
      key: 'name',
      header: 'Manager Name',
      sortable: true,
      render: (m) => (
        <div>
          <Link
            href={`/admin/managers/${m._id}`}
            className="font-semibold text-text-primary-light dark:text-text-primary-dark hover:text-copper-600 dark:hover:text-copper-400 transition-colors"
          >
            {m.name}
          </Link>
          <span className="block text-xs font-mono text-text-tertiary-light dark:text-text-tertiary-dark">{m.email}</span>
        </div>
      )
    },
    {
      key: 'department',
      header: 'Department / Territory',
      render: (m) => (
        <span className="text-text-secondary-light dark:text-text-secondary-dark font-medium">
          {m.department || 'Enterprise Sales'}
        </span>
      )
    },
    {
      key: 'agentCount',
      header: 'Team Agents',
      sortable: true,
      render: (m) => (
        <span className="inline-flex items-center gap-1.5 font-medium text-text-primary-light dark:text-text-primary-dark">
          <Users className="w-3.5 h-3.5 text-copper-400" />
          <span>{m.agentCount || 0} Agents</span>
        </span>
      )
    },
    {
      key: 'targetQuota',
      header: 'Team Quota',
      sortable: true,
      render: (m) => (
        <span className="font-mono text-text-secondary-light dark:text-text-secondary-dark">
          ₹{(m.targetQuota || 5000000).toLocaleString('en-IN')}
        </span>
      )
    },
    {
      key: 'teamRevenue',
      header: 'Team Won Revenue',
      sortable: true,
      render: (m) => (
        <span className="font-mono font-bold text-copper-600 dark:text-copper-400">
          ₹{(m.teamRevenue || 0).toLocaleString('en-IN')}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (m) => <Badge type={m.status} />
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (m) => (
        <div className="flex items-center justify-end gap-1">
          <Link
            href={`/admin/managers/${m._id}`}
            className="p-1.5 rounded-md text-text-tertiary-light dark:text-text-tertiary-dark hover:text-copper-600 dark:hover:text-copper-400 hover:bg-surface-muted-light dark:hover:bg-surface-dark transition-colors"
            title="View Team Overview"
          >
            <Eye className="w-4 h-4" />
          </Link>
          <button
            onClick={() => {
              setEditingManager(m);
              setIsModalOpen(true);
            }}
            className="p-1.5 rounded-md text-text-tertiary-light dark:text-text-tertiary-dark hover:text-copper-600 dark:hover:text-copper-400 hover:bg-surface-muted-light dark:hover:bg-surface-dark transition-colors cursor-pointer"
            title="Edit Manager"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleToggleStatus(m)}
            className={`p-1.5 rounded-md hover:bg-surface-muted-light dark:hover:bg-surface-dark transition-colors cursor-pointer ${
              m.status === 'ACTIVE'
                ? 'text-crimson-400 hover:text-crimson-500'
                : 'text-emerald-400 hover:text-emerald-500'
            }`}
            title={m.status === 'ACTIVE' ? 'Deactivate Manager' : 'Activate Manager'}
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
            Sales Managers Directory
          </h2>
          <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-0.5">
            Administers organizational managers. Each manager recruits and oversees their dedicated sales agent team.
          </p>
        </div>

        {/* CRITICAL: ONLY Add Manager is present */}
        <Button
          size="sm"
          onClick={() => {
            setEditingManager(null);
            setIsModalOpen(true);
          }}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Manager</span>
        </Button>
      </div>

      {/* Managers Data Table */}
      <DataTable
        data={managers}
        columns={columns}
        searchPlaceholder="Search managers by name or email..."
        searchKey="name"
        isLoading={loading}
        emptyTitle="No Managers Created Yet"
        emptyDescription="Create your first sales manager account to establish sales teams and assign regional quotas."
        emptyActionLabel="Add First Manager"
        onEmptyAction={() => {
          setEditingManager(null);
          setIsModalOpen(true);
        }}
      />

      {/* Add / Edit Manager Modal */}
      <ManagerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchManagers}
        manager={editingManager}
      />
    </div>
  );
}
