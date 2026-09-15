
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  UserCheck,
  DollarSign,
  TrendingUp,
  Percent,
  AlertTriangle,
  Plus
} from 'lucide-react';
import { MetricCard } from '@/components/ui/MetricCard';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { SalesAgentModal } from '@/components/crm/SalesAgentModal';
import api from '@/services/api';

export const ManagerDashboardPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAddAgentOpen, setIsAddAgentOpen] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/analytics/dashboard');
      setData(res.data);
    } catch (err) {
      console.error('Failed to load manager dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading && !data) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-6 w-56" />
            <Skeleton className="h-4 w-80" />
          </div>
          <Skeleton className="h-9 w-36" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-5 rounded-xl border border-[#E5DCD5] dark:border-[#2A242D] bg-[#FFFDFC] dark:bg-[#141117] space-y-3">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-8 w-36" />
              <Skeleton className="h-3 w-28" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="lg:col-span-2 h-72 rounded-xl" />
          <Skeleton className="h-72 rounded-xl" />
        </div>
      </div>
    );
  }

  const metrics = data?.metrics || {};
  const pipeline = data?.pipeline || {};
  const agents = data?.agentLeaderboard || [];

  return (
    <div className="space-y-6">
      {/* Top Welcome & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#211A20] dark:text-[#F5F1F3]">
            Team Sales Dashboard
          </h2>
          <p className="text-xs text-[#8A7F87] dark:text-[#B8AEB9] mt-0.5">
            Monitor agent quotas, qualified lead velocity, and team pipeline execution.
          </p>
        </div>

        {/* Manager CAN create Sales Agents */}
        <Button size="sm" onClick={() => setIsAddAgentOpen(true)}>
          <Plus className="w-3.5 h-3.5" />
          <span>Add Sales Agent</span>
        </Button>
      </div>

      {/* Overdue Follow-ups Alert Banner if any */}
      {metrics.overdueFollowUpsCount > 0 && (
        <div className="p-3.5 bg-[rgba(210,154,74,0.12)] border border-[rgba(210,154,74,0.25)] rounded-xl flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5 text-xs text-[#A87228] dark:text-[#E5B56E]">
            <AlertTriangle className="w-4 h-4 text-[#D29A4A] shrink-0" />
            <span>
              <strong>Action Required:</strong> {metrics.overdueFollowUpsCount} overdue follow-up tasks on your team require immediate rep attention.
            </span>
          </div>
          <Link to="/manager/follow-ups"
            className="text-xs font-semibold text-[#A87228] dark:text-[#E5B56E] hover:underline shrink-0"
          >
            Review Follow-ups
          </Link>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Team Won Revenue"
          value={`₹${(metrics.teamRevenue || 0).toLocaleString('en-IN')}`}
          subtitle="Closed Deals This Cycle"
          icon={<DollarSign className="w-4 h-4 text-[#3FA77A]" />}
          trend={{ value: '+22.5%', isPositive: true }}
        />
        <MetricCard
          title="Team Pipeline Value"
          value={`₹${(metrics.pipelineValue || 0).toLocaleString('en-IN')}`}
          subtitle={`${metrics.activeDealsCount || 0} Opportunities`}
          icon={<TrendingUp className="w-4 h-4 text-[#A9683F] dark:text-[#C08457]" />}
        />
        <MetricCard
          title="Team Conversion Rate"
          value={`${metrics.conversionRate || 0}%`}
          subtitle="Won / Closed Ratio"
          icon={<Percent className="w-4 h-4 text-[#A9683F] dark:text-[#C08457]" />}
        />
        <MetricCard
          title="Sales Agents"
          value={metrics.totalSalesAgents || 0}
          subtitle="Active Team Reps"
          icon={<UserCheck className="w-4 h-4 text-[#8A7F87] dark:text-[#817783]" />}
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-[#FFFDFC] dark:bg-[#141117] border border-[#E5DCD5] dark:border-[#2A242D] rounded-xl flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[11px] font-semibold text-[#8A7F87] dark:text-[#817783] uppercase tracking-wider block">
              Team Leads
            </span>
            <span className="text-xl font-bold text-[#211A20] dark:text-[#F5F1F3] tabular-nums">
              {metrics.teamLeadsCount || 0}
            </span>
          </div>
          <span className="text-xs text-[#8A7F87] dark:text-[#817783]">
            {metrics.qualifiedLeadsCount || 0} Qualified
          </span>
        </div>

        <div className="p-4 bg-[#FFFDFC] dark:bg-[#141117] border border-[#E5DCD5] dark:border-[#2A242D] rounded-xl flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[11px] font-semibold text-[#8A7F87] dark:text-[#817783] uppercase tracking-wider block">
              Won Deals
            </span>
            <span className="text-xl font-bold text-[#3FA77A] tabular-nums">
              {metrics.wonDealsCount || 0} Deals
            </span>
          </div>
          <span className="text-xs text-[#8A7F87] dark:text-[#817783]">
            Closed Bookings
          </span>
        </div>

        <div className="p-4 bg-[#FFFDFC] dark:bg-[#141117] border border-[#E5DCD5] dark:border-[#2A242D] rounded-xl flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[11px] font-semibold text-[#8A7F87] dark:text-[#817783] uppercase tracking-wider block">
              Pending Follow-ups
            </span>
            <span className="text-xl font-bold text-[#211A20] dark:text-[#F5F1F3] tabular-nums">
              {metrics.pendingFollowUpsCount || 0}
            </span>
          </div>
          <span className="text-xs text-[#D29A4A] font-semibold tabular-nums">
            {metrics.overdueFollowUpsCount || 0} Overdue
          </span>
        </div>
      </div>

      {/* Grid: Sales Agent Leaderboard & Team Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Agent Leaderboard */}
        <div className="lg:col-span-2 bg-[#FFFDFC] dark:bg-[#141117] border border-[#E5DCD5] dark:border-[#2A242D] rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-[#211A20] dark:text-[#F5F1F3]">
                Sales Agent Quota Attainment Leaderboard
              </h3>
              <p className="text-xs text-[#8A7F87] dark:text-[#817783] mt-0.5">
                Monthly revenue contribution and quota target performance
              </p>
            </div>
            <Link to="/manager/sales-agents"
              className="text-xs text-[#A9683F] dark:text-[#C08457] hover:underline font-medium"
            >
              Manage Agents
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E5DCD5] dark:border-[#2A242D] text-[10px] uppercase tracking-wider text-[#8A7F87] dark:text-[#817783] font-semibold">
                  <th className="pb-2.5">Agent Name</th>
                  <th className="pb-2.5">Assigned Leads</th>
                  <th className="pb-2.5">Deals Won</th>
                  <th className="pb-2.5">Target Quota</th>
                  <th className="pb-2.5">Won Revenue</th>
                  <th className="pb-2.5">Attainment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5DCD5]/70 dark:divide-[#2A242D]/80">
                {agents.map((agent: any) => (
                  <tr key={agent.id} className="hover:bg-[#F8F2EE] dark:hover:bg-[#211B24] transition-colors">
                    <td className="py-3 font-semibold text-[#211A20] dark:text-[#F5F1F3]">
                      <Link to={`/manager/sales-agents/${agent.id}`} className="hover:text-[#A9683F] dark:hover:text-[#C08457]">
                        {agent.name}
                      </Link>
                      <span className="block text-[11px] text-[#8A7F87] dark:text-[#817783] font-normal">
                        {agent.email}
                      </span>
                    </td>
                    <td className="py-3 text-[#665C65] dark:text-[#B8AEB9] font-medium">
                      {agent.leadsCount} Leads
                    </td>
                    <td className="py-3 text-[#665C65] dark:text-[#B8AEB9] font-medium">
                      {agent.wonCount} Deals
                    </td>
                    <td className="py-3 font-mono text-[#8A7F87] dark:text-[#817783] tabular-nums">
                      ₹{(agent.quota || 2500000).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 font-mono font-bold text-[#211A20] dark:text-[#F5F1F3] tabular-nums">
                      ₹{(agent.revenue || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold font-mono tabular-nums ${
                        agent.attainment >= 70
                          ? 'bg-[rgba(63,167,122,0.12)] text-[#3FA77A]'
                          : 'bg-[rgba(210,154,74,0.12)] text-[#D29A4A]'
                      }`}>
                        {agent.attainment}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Team Pipeline Preview */}
        <div className="bg-[#FFFDFC] dark:bg-[#141117] border border-[#E5DCD5] dark:border-[#2A242D] rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#211A20] dark:text-[#F5F1F3]">
              Team Pipeline Stages
            </h3>
            <Link to="/manager/pipeline"
              className="text-xs text-[#A9683F] dark:text-[#C08457] hover:underline font-medium"
            >
              Open Kanban
            </Link>
          </div>

          <div className="space-y-2.5">
            {[
              { stage: 'QUALIFIED', label: 'Qualified', count: pipeline.QUALIFIED || 0, color: 'bg-[#C08457]' },
              { stage: 'PROPOSAL', label: 'Proposal', count: pipeline.PROPOSAL || 0, color: 'bg-[#D29A4A]' },
              { stage: 'NEGOTIATION', label: 'Negotiation', count: pipeline.NEGOTIATION || 0, color: 'bg-[#8B5C86]' },
              { stage: 'WON', label: 'Closed Won', count: pipeline.WON || 0, color: 'bg-[#3FA77A]' },
              { stage: 'LOST', label: 'Closed Lost', count: pipeline.LOST || 0, color: 'bg-[#D76565]' }
            ].map((st) => (
              <div key={st.stage} className="p-2.5 rounded-lg bg-[#F7F3F0]/60 dark:bg-[#1A151D]/50 border border-[#E5DCD5] dark:border-[#2A242D] flex items-center justify-between text-xs transition-colors">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${st.color}`} />
                  <span className="font-semibold text-[#211A20] dark:text-[#F5F1F3]">{st.label}</span>
                </div>
                <span className="font-mono font-bold text-[#211A20] dark:text-[#F5F1F3] tabular-nums">
                  {st.count} Deals
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Sales Agent Modal */}
      <SalesAgentModal
        isOpen={isAddAgentOpen}
        onClose={() => setIsAddAgentOpen(false)}
        onSuccess={fetchDashboardData}
      />
    </div>
  );
}


export default ManagerDashboardPage;
