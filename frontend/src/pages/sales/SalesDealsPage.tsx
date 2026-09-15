
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, TrendingUp, Calendar, Edit, Eye, Kanban } from 'lucide-react';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DealModal } from '@/components/crm/DealModal';
import api from '@/services/api';

export const SalesDealsPage: React.FC = () => {
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<any>(null);

  const fetchDeals = async () => {
    try {
      setLoading(true);
      const res = await api.get('/deals');
      setDeals(res.data.data || []);
    } catch (err) {
      console.error('Failed to load my deals', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, []);

  const columns: Column<any>[] = [
    {
      key: 'title',
      header: 'Deal Title & Company',
      sortable: true,
      render: (d) => (
        <div>
          <Link to={`/sales/deals/${d._id}`}
            className="font-semibold text-text-primary-light dark:text-text-primary-dark hover:text-copper-600 dark:hover:text-copper-400"
          >
            {d.title}
          </Link>
          <span className="block text-xs text-text-muted-light dark:text-text-muted-dark">{d.companyName}</span>
        </div>
      )
    },
    {
      key: 'value',
      header: 'Value (₹)',
      sortable: true,
      render: (d) => (
        <span className="font-mono font-bold text-text-primary-light dark:text-text-primary-dark text-sm">
          ₹{d.value?.toLocaleString('en-IN')}
        </span>
      )
    },
    {
      key: 'stage',
      header: 'Pipeline Stage',
      render: (d) => <Badge type={d.stage} />
    },
    {
      key: 'probability',
      header: 'Probability',
      sortable: true,
      render: (d) => (
        <span className="font-mono text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark">
          {d.probability}%
        </span>
      )
    },
    {
      key: 'expectedCloseDate',
      header: 'Close Date',
      sortable: true,
      render: (d) => (
        <span className="font-mono text-xs text-text-muted-light dark:text-text-muted-dark">
          {new Date(d.expectedCloseDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
        </span>
      )
    },
    {
      key: 'riskHealth',
      header: 'Health',
      render: (d) => d.riskHealth ? <Badge type={d.riskHealth} /> : null
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (d) => (
        <div className="flex items-center justify-end gap-1">
          <Link to={`/sales/deals/${d._id}`}
            className="p-1.5 rounded-md text-text-muted-light dark:text-text-muted-dark hover:text-text-primary-light dark:hover:text-text-primary-dark hover:bg-surface-elevated-light dark:hover:bg-surface-elevated-dark"
            title="Open Deal Detail"
          >
            <Eye className="w-4 h-4" />
          </Link>
          <button
            onClick={() => {
              setEditingDeal(d);
              setIsModalOpen(true);
            }}
            className="p-1.5 rounded-md text-text-muted-light dark:text-text-muted-dark hover:text-text-primary-light dark:hover:text-text-primary-dark hover:bg-surface-elevated-light dark:hover:bg-surface-elevated-dark"
            title="Edit Deal"
          >
            <Edit className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-text-primary-light dark:text-text-primary-dark">
            My Deals Pipeline
          </h2>
          <p className="text-xs text-text-muted-light dark:text-text-muted-dark mt-0.5">
            Active sales opportunities assigned to you across qualification, proposal, and negotiation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/sales/pipeline">
            <Button variant="outline" size="sm">
              <Kanban className="w-3.5 h-3.5" />
              <span>Kanban Board</span>
            </Button>
          </Link>
          <Button
            size="sm"
            onClick={() => {
              setEditingDeal(null);
              setIsModalOpen(true);
            }}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Deal</span>
          </Button>
        </div>
      </div>

      <DataTable
        data={deals}
        columns={columns}
        searchPlaceholder="Search my deals..."
        searchKey="title"
        isLoading={loading}
        emptyTitle="No Deals Found"
        emptyDescription="Convert an assigned lead or create an opportunity to start building your personal pipeline."
        emptyActionLabel="Create First Deal"
        onEmptyAction={() => {
          setEditingDeal(null);
          setIsModalOpen(true);
        }}
      />

      <DealModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchDeals}
        deal={editingDeal}
      />
    </div>
  );
}


export default SalesDealsPage;
