
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Filter, Users, Table } from 'lucide-react';
import { KanbanBoard, DealItem } from '@/components/crm/KanbanBoard';
import { Button } from '@/components/ui/Button';
import { DealModal } from '@/components/crm/DealModal';
import api from '@/services/api';

export const ManagerPipelinePage: React.FC = () => {
  const [deals, setDeals] = useState<DealItem[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
      console.error('Failed to load team pipeline', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDealsAndAgents();
  }, []);

  const handleStageChange = async (dealId: string, newStage: DealItem['stage']) => {
    // Optimistic UI update
    setDeals(prev => prev.map(d => d._id === dealId ? { ...d, stage: newStage } : d));
    try {
      await api.put(`/deals/${dealId}`, { stage: newStage });
      fetchDealsAndAgents();
    } catch (err) {
      console.error('Failed to update deal stage', err);
      fetchDealsAndAgents();
    }
  };

  const filteredDeals = selectedAgent === 'ALL'
    ? deals
    : deals.filter(d => (d.assignedAgentId as any)?._id === selectedAgent);

  const totalPipelineValue = filteredDeals
    .filter(d => ['QUALIFIED', 'PROPOSAL', 'NEGOTIATION'].includes(d.stage))
    .reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold tracking-tight text-text-primary-light dark:text-text-primary-dark">
              Team Sales Pipeline
            </h2>
            <span className="text-xs px-2.5 py-1 rounded-full bg-copper-500/10 text-copper-600 dark:text-copper-400 font-semibold font-mono border border-copper-500/20">
              Active Value: ₹{totalPipelineValue.toLocaleString('en-IN')}
            </span>
          </div>
          <p className="text-xs text-text-muted-light dark:text-text-muted-dark mt-0.5">
            Interactive Kanban board showing deal distribution across team members.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Filter by Sales Agent */}
          <div className="flex items-center gap-1.5 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg px-2.5 py-1 text-xs">
            <Users className="w-3.5 h-3.5 text-text-muted-light dark:text-text-muted-dark" />
            <select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="bg-transparent text-xs text-text-secondary-light dark:text-text-secondary-dark focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Team Agents</option>
              {agents.map((a) => (
                <option key={a._id} value={a._id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          <Link to="/manager/deals">
            <Button variant="outline" size="sm">
              <Table className="w-3.5 h-3.5" />
              <span>Table</span>
            </Button>
          </Link>

          <Button size="sm" onClick={() => setIsModalOpen(true)}>
            <Plus className="w-3.5 h-3.5" />
            <span>Add Deal</span>
          </Button>
        </div>
      </div>

      {/* Kanban Board */}
      {loading ? (
        <div className="p-12 text-center text-text-muted-light dark:text-text-muted-dark">
          <div className="w-6 h-6 border-2 border-copper-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <span className="text-xs">Loading team pipeline board...</span>
        </div>
      ) : (
        <KanbanBoard
          deals={filteredDeals}
          onStageChange={handleStageChange}
          baseRoute="/manager/deals"
        />
      )}

      {/* Deal Modal */}
      <DealModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchDealsAndAgents}
        isManager={true}
        agentsList={agents.map(a => ({ id: a._id, name: a.name }))}
      />
    </div>
  );
}


export default ManagerPipelinePage;
