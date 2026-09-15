'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Users, TrendingUp, DollarSign, UserCheck } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { MetricCard } from '@/components/ui/MetricCard';
import api from '@/services/api';

export default function AdminManagerDetailPage() {
  const params = useParams();
  const managerId = params.id as string;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchManagerDetail = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/users/managers/${managerId}`);
      setData(res.data.data);
    } catch (err) {
      console.error('Failed to load manager details', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (managerId) fetchManagerDetail();
  }, [managerId]);

  if (loading || !data) {
    return (
      <div className="p-8 text-center text-[#8A7F87] dark:text-[#817783]">
        <div className="w-6 h-6 border-2 border-[#A9683F] dark:border-[#C08457] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <span className="text-xs">Loading manager team profile...</span>
      </div>
    );
  }

  const { manager, agents = [], stats = {} } = data;
  const attainment = manager.targetQuota > 0 ? Math.round((stats.wonRevenue / manager.targetQuota) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Back button & Breadcrumb */}
      <div>
        <Link
          href="/admin/managers"
          className="inline-flex items-center gap-1.5 text-xs text-[#8A7F87] hover:text-[#211A20] dark:hover:text-[#F5F1F3] mb-3 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Managers</span>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl font-bold tracking-tight text-[#211A20] dark:text-[#F5F1F3]">
                {manager.name}
              </h2>
              <Badge type={manager.role} />
              <Badge type={manager.status} />
            </div>
            <p className="text-xs text-[#8A7F87] dark:text-[#B8AEB9] mt-0.5">
              {manager.email} • {manager.department || 'Enterprise Sales'} • {manager.phone || 'No phone'}
            </p>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <MetricCard
          title="Team Won Revenue"
          value={`₹${(stats.wonRevenue || 0).toLocaleString('en-IN')}`}
          icon={<DollarSign className="w-4 h-4 text-[#3FA77A]" />}
        />
        <MetricCard
          title="Team Quota"
          value={`₹${(manager.targetQuota || 5000000).toLocaleString('en-IN')}`}
          subtitle={`${attainment}% Attainment`}
          icon={<TrendingUp className="w-4 h-4 text-[#A9683F] dark:text-[#C08457]" />}
        />
        <MetricCard
          title="Assigned Agents"
          value={agents.length}
          subtitle="Direct Reps"
          icon={<Users className="w-4 h-4 text-[#704766] dark:text-[#8B5C86]" />}
        />
        <MetricCard
          title="Team Deals"
          value={stats.dealsCount || 0}
          subtitle="All Stages"
          icon={<UserCheck className="w-4 h-4 text-[#7E9FD6]" />}
        />
      </div>

      {/* Sales Agent Team Roster (Admin can view team composition) */}
      <div className="bg-[#FFFDFC] dark:bg-[#141117] border border-[#E5DCD5] dark:border-[#2A242D] rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-[#211A20] dark:text-[#F5F1F3]">
              Team Roster: Sales Agents
            </h3>
            <p className="text-xs text-[#8A7F87] dark:text-[#817783] mt-0.5">
              Sales Agents reporting directly to {manager.name}
            </p>
          </div>
        </div>

        {agents.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-[#E5DCD5] dark:border-[#2A242D] rounded-lg text-xs text-[#8A7F87] dark:text-[#817783]">
            No sales agents have been recruited by this manager yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E5DCD5] dark:border-[#2A242D] text-[10px] uppercase tracking-wider text-[#8A7F87] dark:text-[#817783] font-semibold">
                  <th className="pb-2.5">Agent Name</th>
                  <th className="pb-2.5">Role / Focus</th>
                  <th className="pb-2.5">Monthly Quota</th>
                  <th className="pb-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5DCD5]/70 dark:divide-[#2A242D]/80">
                {agents.map((agent: any) => (
                  <tr key={agent._id} className="hover:bg-[#F8F2EE] dark:hover:bg-[#211B24] transition-colors">
                    <td className="py-3 font-semibold text-[#211A20] dark:text-[#F5F1F3]">
                      {agent.name}
                      <span className="block text-[11px] text-[#8A7F87] dark:text-[#817783] font-normal">
                        {agent.email}
                      </span>
                    </td>
                    <td className="py-3 text-[#665C65] dark:text-[#B8AEB9] font-medium">
                      {agent.department || 'Enterprise AE'}
                    </td>
                    <td className="py-3 font-mono text-[#8A7F87] dark:text-[#817783] tabular-nums">
                      ₹{(agent.targetQuota || 2500000).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3">
                      <Badge type={agent.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
