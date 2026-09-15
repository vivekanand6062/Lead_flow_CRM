'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  DollarSign,
  TrendingUp,
  Percent,
  Sparkles,
  ArrowRight,
  Plus
} from 'lucide-react';
import { MetricCard } from '@/components/ui/MetricCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { LeadModal } from '@/components/crm/LeadModal';
import { DealModal } from '@/components/crm/DealModal';
import api from '@/services/api';

export default function SalesDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [isDealModalOpen, setIsDealModalOpen] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/analytics/dashboard');
      setData(res.data);
    } catch (err) {
      console.error('Failed to load sales dashboard', err);
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
          <div className="flex gap-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-24" />
          </div>
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-72 rounded-xl" />
          <Skeleton className="h-72 rounded-xl" />
        </div>
      </div>
    );
  }

  const metrics = data?.metrics || {};
  const pipeline = data?.pipeline || {};
  const todayActivities = data?.todayActivities || [];
  const aiRecommendations = data?.aiRecommendations || [];

  return (
    <div className="space-y-6">
      {/* Welcome & Fast Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#211A20] dark:text-[#F5F1F3]">
            My Sales Hub
          </h2>
          <p className="text-xs text-[#8A7F87] dark:text-[#B8AEB9] mt-0.5">
            Your personal revenue targets, qualified accounts, and daily follow-up commitments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => setIsLeadModalOpen(true)}>
            <Plus className="w-3.5 h-3.5" />
            <span>Add Lead</span>
          </Button>
          <Button size="sm" onClick={() => setIsDealModalOpen(true)}>
            <Plus className="w-3.5 h-3.5" />
            <span>New Deal</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="My Won Revenue"
          value={`₹${(metrics.myRevenue || 0).toLocaleString('en-IN')}`}
          subtitle={`${metrics.myWonDeals || 0} Closed Deals`}
          icon={<DollarSign className="w-4 h-4 text-[#3FA77A]" />}
          trend={{ value: '+14.2%', isPositive: true }}
        />
        <MetricCard
          title="My Active Pipeline"
          value={`₹${(metrics.pipelineValue || 0).toLocaleString('en-IN')}`}
          subtitle={`${metrics.activeDealsCount || 0} Opportunities`}
          icon={<TrendingUp className="w-4 h-4 text-[#A9683F] dark:text-[#C08457]" />}
        />
        <MetricCard
          title="My Conversion Rate"
          value={`${metrics.conversionRate || 0}%`}
          subtitle="Opportunities Won"
          icon={<Percent className="w-4 h-4 text-[#A9683F] dark:text-[#C08457]" />}
        />
        <MetricCard
          title="Assigned Leads"
          value={metrics.myLeadsCount || 0}
          subtitle={`${metrics.qualifiedLeadsCount || 0} Qualified`}
          icon={<Users className="w-4 h-4 text-[#8A7F87] dark:text-[#817783]" />}
        />
      </div>

      {/* AI Sales Recommendations Alert Panel */}
      {aiRecommendations.length > 0 && (
        <div className="p-4 rounded-xl bg-[#EEEAFB]/60 dark:bg-[rgba(155,138,251,0.08)] border border-[#DDD6FE] dark:border-[rgba(155,138,251,0.2)] shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1 rounded-md bg-[#705BC9] dark:bg-[#9B8AFB] text-white">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <h4 className="text-xs font-bold text-[#5B45B3] dark:text-[#B7AAFF] uppercase tracking-wider">
              AI Sales Intelligence Insights
            </h4>
          </div>
          <ul className="space-y-1.5 text-xs text-[#211A20] dark:text-[#F5F1F3]">
            {aiRecommendations.map((rec: string, i: number) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-[#705BC9] dark:text-[#9B8AFB] font-bold">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Grid: Personal Pipeline & Today's Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pipeline Distribution */}
        <div className="bg-[#FFFDFC] dark:bg-[#141117] border border-[#E5DCD5] dark:border-[#2A242D] rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-[#211A20] dark:text-[#F5F1F3]">
                My Pipeline Distribution
              </h3>
              <p className="text-xs text-[#8A7F87] dark:text-[#817783] mt-0.5">
                Current active deals across stages
              </p>
            </div>
            <Link
              href="/sales/pipeline"
              className="text-xs text-[#A9683F] dark:text-[#C08457] hover:underline flex items-center gap-1 font-medium"
            >
              <span>Kanban</span>
              <ArrowRight className="w-3.5 h-3.5" />
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
              <div
                key={st.stage}
                className="flex items-center justify-between p-2.5 rounded-lg bg-[#F7F3F0]/60 dark:bg-[#1A151D]/50 border border-[#E5DCD5] dark:border-[#2A242D] text-xs transition-colors"
              >
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

        {/* Today's Activities & Follow-ups */}
        <div className="bg-[#FFFDFC] dark:bg-[#141117] border border-[#E5DCD5] dark:border-[#2A242D] rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-[#211A20] dark:text-[#F5F1F3]">
                Recent Customer Activities
              </h3>
              <p className="text-xs text-[#8A7F87] dark:text-[#817783] mt-0.5">
                Calls, meetings, and notes logged by you
              </p>
            </div>
            <Link
              href="/sales/activities"
              className="text-xs text-[#A9683F] dark:text-[#C08457] hover:underline flex items-center gap-1 font-medium"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {todayActivities.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-[#E5DCD5] dark:border-[#2A242D] rounded-xl text-xs text-[#8A7F87] dark:text-[#817783]">
                No recent activities logged today.
              </div>
            ) : (
              todayActivities.map((a: any) => (
                <div
                  key={a._id}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-[#F7F3F0]/60 dark:bg-[#1A151D]/50 border border-[#E5DCD5] dark:border-[#2A242D] text-xs transition-colors"
                >
                  <div>
                    <span className="font-semibold text-[#211A20] dark:text-[#F5F1F3]">{a.title}</span>
                    {a.relatedCustomer && (
                      <span className="text-[#8A7F87] dark:text-[#817783] ml-1.5">• {a.relatedCustomer}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[#8A7F87] dark:text-[#817783] font-mono tabular-nums">
                      {new Date(a.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                    <Badge type={a.type || 'CALL'} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <LeadModal
        isOpen={isLeadModalOpen}
        onClose={() => setIsLeadModalOpen(false)}
        onSuccess={fetchDashboardData}
      />
      <DealModal
        isOpen={isDealModalOpen}
        onClose={() => setIsDealModalOpen(false)}
        onSuccess={fetchDashboardData}
      />
    </div>
  );
}
