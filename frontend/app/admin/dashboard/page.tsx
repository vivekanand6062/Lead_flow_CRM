'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  UserCheck,
  TrendingUp,
  DollarSign,
  Percent,
  Layers,
  ArrowRight,
  Clock,
  Plus
} from 'lucide-react';
import { MetricCard } from '@/components/ui/MetricCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { ManagerModal } from '@/components/crm/ManagerModal';
import api from '@/services/api';

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAddManagerOpen, setIsAddManagerOpen] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/analytics/dashboard');
      setData(res.data);
    } catch (err) {
      console.error('Failed to load admin dashboard', err);
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
          <Skeleton className="h-9 w-32" />
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
          <Skeleton className="h-72 rounded-xl" />
          <Skeleton className="lg:col-span-2 h-72 rounded-xl" />
        </div>
      </div>
    );
  }

  const metrics = data?.metrics || {};
  const funnel = data?.funnel || {};
  const managers = data?.managerLeaderboard || [];
  const activities = data?.recentActivities || [];

  return (
    <div className="space-y-6">
      {/* Top Welcome & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#211A20] dark:text-[#F5F1F3]">
            Executive Revenue Overview
          </h2>
          <p className="text-xs text-[#8A7F87] dark:text-[#B8AEB9] mt-0.5">
            Organization-wide sales operations, manager quotas, and pipeline velocity.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Admin CAN create Managers. Cannot create Sales Agents. */}
          <Button size="sm" onClick={() => setIsAddManagerOpen(true)}>
            <Plus className="w-3.5 h-3.5" />
            <span>Add Manager</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Revenue"
          value={`₹${(metrics.totalRevenue || 0).toLocaleString('en-IN')}`}
          subtitle="Closed Won Deals"
          icon={<DollarSign className="w-4 h-4 text-[#3FA77A]" />}
          trend={{ value: '+18.4%', isPositive: true }}
        />
        <MetricCard
          title="Active Pipeline"
          value={`₹${(metrics.pipelineValue || 0).toLocaleString('en-IN')}`}
          subtitle={`${metrics.activeDealsCount || 0} Open Deals`}
          icon={<TrendingUp className="w-4 h-4 text-[#A9683F] dark:text-[#C08457]" />}
        />
        <MetricCard
          title="Win Conversion Rate"
          value={`${metrics.conversionRate || 0}%`}
          subtitle="Opportunities Won"
          icon={<Percent className="w-4 h-4 text-[#A9683F] dark:text-[#C08457]" />}
          trend={{ value: '+4.2%', isPositive: true }}
        />
        <MetricCard
          title="Total Leads"
          value={metrics.totalLeads || 0}
          subtitle={`${metrics.wonDealsCount || 0} converted won`}
          icon={<Layers className="w-4 h-4 text-[#8A7F87] dark:text-[#817783]" />}
        />
      </div>

      {/* Secondary Org Headcount */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 bg-[#FFFDFC] dark:bg-[#141117] border border-[#E5DCD5] dark:border-[#2A242D] rounded-xl flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-[#F0E5EE] dark:bg-[rgba(110,69,107,0.18)] text-[#704766] dark:text-[#DBB8D5] border border-[#DBB8D5] dark:border-[rgba(110,69,107,0.3)]">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-[#8A7F87] dark:text-[#817783] uppercase tracking-wider block">
                Sales Managers
              </span>
              <span className="text-xl font-bold text-[#211A20] dark:text-[#F5F1F3] tabular-nums">
                {metrics.totalManagers || 0}
              </span>
            </div>
          </div>
          <Link
            href="/admin/managers"
            className="text-xs text-[#A9683F] dark:text-[#C08457] hover:underline flex items-center gap-1 font-medium"
          >
            <span>Manage</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="p-4 bg-[#FFFDFC] dark:bg-[#141117] border border-[#E5DCD5] dark:border-[#2A242D] rounded-xl flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-[rgba(63,167,122,0.12)] text-[#3FA77A] border border-[rgba(63,167,122,0.25)]">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-[#8A7F87] dark:text-[#817783] uppercase tracking-wider block">
                Total Sales Agents (Across Teams)
              </span>
              <span className="text-xl font-bold text-[#211A20] dark:text-[#F5F1F3] tabular-nums">
                {metrics.totalSalesAgents || 0}
              </span>
            </div>
          </div>
          <span className="text-xs text-[#8A7F87] dark:text-[#817783]">
            Managed by Teams
          </span>
        </div>
      </div>

      {/* Grid: Funnel & Managers Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lead Funnel Breakdown */}
        <div className="bg-[#FFFDFC] dark:bg-[#141117] border border-[#E5DCD5] dark:border-[#2A242D] rounded-xl p-5 shadow-xs">
          <h3 className="text-sm font-semibold text-[#211A20] dark:text-[#F5F1F3] mb-1">
            Lead Lifecycle Funnel
          </h3>
          <p className="text-xs text-[#8A7F87] dark:text-[#817783] mb-4">
            Progress of leads through 7 core operational stages
          </p>

          <div className="space-y-3">
            {[
              { stage: 'NEW', count: funnel.NEW || 0, color: 'bg-[#E0A978]' },
              { stage: 'CONTACTED', count: funnel.CONTACTED || 0, color: 'bg-[#D39A6B]' },
              { stage: 'QUALIFIED', count: funnel.QUALIFIED || 0, color: 'bg-[#C08457]' },
              { stage: 'PROPOSAL', count: funnel.PROPOSAL || 0, color: 'bg-[#D29A4A]' },
              { stage: 'NEGOTIATION', count: funnel.NEGOTIATION || 0, color: 'bg-[#8B5C86]' },
              { stage: 'WON', count: funnel.WON || 0, color: 'bg-[#3FA77A]' },
              { stage: 'LOST', count: funnel.LOST || 0, color: 'bg-[#D76565]' }
            ].map((st) => {
              const maxVal = Math.max(...Object.values(funnel).map(v => Number(v) || 1), 1);
              const percentage = Math.round(((st.count || 0) / maxVal) * 100);

              return (
                <div key={st.stage} className="text-xs">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-[#665C65] dark:text-[#B8AEB9]">{st.stage}</span>
                    <span className="font-mono font-semibold text-[#211A20] dark:text-[#F5F1F3] tabular-nums">{st.count}</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#F1EBE7] dark:bg-[#1A151D] rounded-full overflow-hidden border border-[#E5DCD5]/50 dark:border-[#2A242D]/50">
                    <div
                      className={`h-full ${st.color} rounded-full transition-all duration-300`}
                      style={{ width: `${Math.max(percentage, 4)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Manager Quota Performance Leaderboard */}
        <div className="lg:col-span-2 bg-[#FFFDFC] dark:bg-[#141117] border border-[#E5DCD5] dark:border-[#2A242D] rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-[#211A20] dark:text-[#F5F1F3]">
                Sales Managers Quota Performance
              </h3>
              <p className="text-xs text-[#8A7F87] dark:text-[#817783] mt-0.5">
                Team target attainment and revenue contribution
              </p>
            </div>
            <Link
              href="/admin/managers"
              className="text-xs text-[#A9683F] dark:text-[#C08457] hover:underline font-medium"
            >
              View All
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E5DCD5] dark:border-[#2A242D] text-[#8A7F87] dark:text-[#817783] font-semibold uppercase tracking-wider text-[10px]">
                  <th className="pb-2.5">Manager</th>
                  <th className="pb-2.5">Team Size</th>
                  <th className="pb-2.5">Team Target</th>
                  <th className="pb-2.5">Won Revenue</th>
                  <th className="pb-2.5">Attainment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5DCD5]/70 dark:divide-[#2A242D]/80">
                {managers.map((m: any) => (
                  <tr key={m.id} className="hover:bg-[#F8F2EE] dark:hover:bg-[#211B24] transition-colors">
                    <td className="py-3 font-semibold text-[#211A20] dark:text-[#F5F1F3]">
                      <Link href={`/admin/managers/${m.id}`} className="hover:text-[#A9683F] dark:hover:text-[#C08457]">
                        {m.name}
                      </Link>
                      <span className="block text-[11px] text-[#8A7F87] dark:text-[#817783] font-normal">
                        {m.department}
                      </span>
                    </td>
                    <td className="py-3 text-[#665C65] dark:text-[#B8AEB9] font-medium">
                      {m.agentCount} Agents
                    </td>
                    <td className="py-3 font-mono text-[#8A7F87] dark:text-[#817783] tabular-nums">
                      ₹{m.quota?.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 font-mono font-bold text-[#211A20] dark:text-[#F5F1F3] tabular-nums">
                      ₹{m.revenue?.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold font-mono tabular-nums ${
                        m.attainment >= 70
                          ? 'bg-[rgba(63,167,122,0.12)] text-[#3FA77A]'
                          : 'bg-[rgba(210,154,74,0.12)] text-[#D29A4A]'
                      }`}>
                        {m.attainment}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Recent Activity Timeline */}
      <div className="bg-[#FFFDFC] dark:bg-[#141117] border border-[#E5DCD5] dark:border-[#2A242D] rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#A9683F] dark:text-[#C08457]" />
            <h3 className="text-sm font-semibold text-[#211A20] dark:text-[#F5F1F3]">
              Recent Organization Activity Feed
            </h3>
          </div>
        </div>

        <div className="space-y-2.5">
          {activities.length === 0 ? (
            <p className="text-xs text-[#8A7F87] dark:text-[#817783] py-4 text-center">No recent activity logged.</p>
          ) : (
            activities.map((a: any) => (
              <div
                key={a._id}
                className="flex items-center justify-between p-2.5 rounded-lg bg-[#F7F3F0]/60 dark:bg-[#1A151D]/50 border border-[#E5DCD5] dark:border-[#2A242D] text-xs transition-colors"
              >
                <div>
                  <span className="font-semibold text-[#211A20] dark:text-[#F5F1F3]">{a.title}</span>
                  {a.relatedCustomer && (
                    <span className="text-[#8A7F87] dark:text-[#817783] ml-2">— {a.relatedCustomer}</span>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] text-[#8A7F87] dark:text-[#817783] font-mono tabular-nums">
                    {new Date(a.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </span>
                  <Badge type={a.type || 'TASK'} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Manager Modal */}
      <ManagerModal
        isOpen={isAddManagerOpen}
        onClose={() => setIsAddManagerOpen(false)}
        onSuccess={fetchDashboardData}
      />
    </div>
  );
}
