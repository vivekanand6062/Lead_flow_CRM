
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, TrendingUp, Calendar, User, Edit } from 'lucide-react';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DealModal } from '@/components/crm/DealModal';
import api from '@/services/api';

export const ManagerDealsPage: React.FC = () => {
  const [deals, setDeals] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<any>(null);

  const fetchDealsAndAgents = async () => {
    try {
      setLoading(true);
      const [dealsRes, agentsRes] = await Promise.all([
        api.get('/deals'),
        api.get('/users/sales-agents')
      ]);
      setDeals(dealsRes.data.data || []);
      setAgents(agentsRes.data.data || []);
    } catch (err) {
      console.error('Failed to load deals', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDealsAndAgents();
  }, []);

  const columns: Column<any>[] = [
    {
      key: 'title',
      header: 'Deal Title & Account',
      sortable: true,
      render: (d) => (
        <div>
          <span className="font-semibold text-text-primary-light dark:text-text-primary-dark">{d.title}</span>
          <span className="block text-xs text-text-muted-light dark:text-text-muted-dark">{d.companyName}</span>
        </div>
      )
    },
    {
      key: 'value',
      header: 'Deal Value',
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
      header: 'Win Probability',
      sortable: true,
      render: (d) => (
        <span className="font-mono text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark">
          {d.probability}%
        </span>
      )
    },
    {
      key: 'assignedAgentId',
      header: 'Assigned Agent',
      render: (d) => (
        <span className="text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark">
          {d.assignedAgentId?.name || 'Unassigned'}
        </span>
      )
    },
    {
      key: 'expectedCloseDate',
      header: 'Expected Close',
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
        <div className="flex items-center justify-end">
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
            Team Deals Pipeline
          </h2>
          <p className="text-xs text-text-muted-light dark:text-text-muted-dark mt-0.5">
            Monitor sales opportunity values, forecast probabilities, and deal health across team reps.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/manager/pipeline">
            <Button variant="outline" size="sm">
              View Kanban Board
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
            <span>Create Deal</span>
          </Button>
        </div>
      </div>

      <DataTable
        data={deals}
        columns={columns}
        searchPlaceholder="Search deals by title or company..."
        searchKey="title"
        isLoading={loading}
        emptyTitle="No Pipeline Deals Found"
        emptyDescription="Create a deal to begin tracking pipeline probability and revenue."
        emptyActionLabel="Create First Deal"
        onEmptyAction={() => {
          setEditingDeal(null);
          setIsModalOpen(true);
        }}
      />

      <DealModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchDealsAndAgents}
        deal={editingDeal}
        isManager={true}
        agentsList={agents.map(a => ({ id: a._id, name: a.name }))}
      />
    </div>
  );
}


export default ManagerDealsPage;
