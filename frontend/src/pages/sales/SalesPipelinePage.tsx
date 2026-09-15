
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Table } from 'lucide-react';
import { KanbanBoard, DealItem } from '@/components/crm/KanbanBoard';
import { Button } from '@/components/ui/Button';
import { DealModal } from '@/components/crm/DealModal';
import api from '@/services/api';

export const SalesPipelinePage: React.FC = () => {
  const [deals, setDeals] = useState<DealItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchDeals = async () => {
    try {
      setLoading(true);
      const res = await api.get('/deals');
      setDeals(res.data.data || []);
    } catch (err) {
      console.error('Failed to load my pipeline deals', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, []);

  const handleStageChange = async (dealId: string, newStage: DealItem['stage']) => {
    setDeals(prev => prev.map(d => d._id === dealId ? { ...d, stage: newStage } : d));
    try {
      await api.put(`/deals/${dealId}`, { stage: newStage });
      fetchDeals();
    } catch (err) {
      console.error('Failed to update stage', err);
      fetchDeals();
    }
  };

  const totalActiveValue = deals
    .filter(d => ['QUALIFIED', 'PROPOSAL', 'NEGOTIATION'].includes(d.stage))
    .reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold tracking-tight text-text-primary-light dark:text-text-primary-dark">
              My Sales Pipeline
            </h2>
            <span className="text-xs px-2.5 py-1 rounded-full bg-copper-500/10 text-copper-600 dark:text-copper-400 font-semibold font-mono border border-copper-500/20">
              Active Value: ₹{totalActiveValue.toLocaleString('en-IN')}
            </span>
          </div>
          <p className="text-xs text-text-muted-light dark:text-text-muted-dark mt-0.5">
            Manage personal deal progress across Qualified, Proposal, Negotiation, Won, and Lost stages.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/sales/deals">
            <Button variant="outline" size="sm">
              <Table className="w-3.5 h-3.5" />
              <span>Table</span>
            </Button>
          </Link>
          <Button size="sm" onClick={() => setIsModalOpen(true)}>
            <Plus className="w-3.5 h-3.5" />
            <span>New Deal</span>
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-text-muted-light dark:text-text-muted-dark">
          <div className="w-6 h-6 border-2 border-copper-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <span className="text-xs">Loading personal pipeline board...</span>
        </div>
      ) : (
        <KanbanBoard
          deals={deals}
          onStageChange={handleStageChange}
          baseRoute="/sales/deals"
        />
      )}

      <DealModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchDeals}
      />
    </div>
  );
}


export default SalesPipelinePage;
