'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Users, TrendingUp, DollarSign, Award, Target, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { MetricCard } from '@/components/ui/MetricCard';
import api from '@/services/api';

export default function ManagerSalesAgentDetailPage() {
  const params = useParams();
  const agentId = params.id as string;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgentDetail = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/users/sales-agents/${agentId}`);
        setData(res.data.data);
      } catch (err) {
        console.error('Failed to load agent detail', err);
      } finally {
        setLoading(false);
      }
    };
    if (agentId) fetchAgentDetail();
  }, [agentId]);

  if (loading || !data) {
    return (
      <div className="p-12 text-center text-text-tertiary-dark">
        <div className="w-7 h-7 border-2 border-copper-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <span className="text-xs font-mono tracking-wide">Loading sales agent metrics...</span>
      </div>
    );
  }

  const { agent, stats = {} } = data;
  const attainment = agent.targetQuota > 0 ? Math.round((stats.wonRevenue / agent.targetQuota) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Breadcrumb Header */}
      <div>
        <Link
          href="/manager/sales-agents"
          className="inline-flex items-center gap-1.5 text-xs text-text-secondary-light dark:text-text-secondary-dark hover:text-copper-600 dark:hover:text-copper-400 transition-colors mb-3 group"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
          <span>Back to Sales Agents</span>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl font-bold tracking-tight text-text-primary-light dark:text-text-primary-dark">
                {agent.name}
              </h2>
              <Badge type={agent.role} />
              <Badge type={agent.status} />
            </div>
            <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-1">
              {agent.email} • {agent.department || 'Enterprise AE'} • {agent.phone || 'No phone'}
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <MetricCard
          title="Won Revenue"
          value={`₹${(stats.wonRevenue || 0).toLocaleString('en-IN')}`}
          icon={<DollarSign className="w-4 h-4 text-emerald-400" />}
        />
        <MetricCard
          title="Monthly Target"
          value={`₹${(agent.targetQuota || 2500000).toLocaleString('en-IN')}`}
          subtitle={`${attainment}% Attained`}
          icon={<TrendingUp className="w-4 h-4 text-copper-400" />}
        />
        <MetricCard
          title="Assigned Leads"
          value={stats.leadsCount || 0}
          subtitle="Direct Accounts"
          icon={<Users className="w-4 h-4 text-lavender-400" />}
        />
        <MetricCard
          title="Pipeline Deals"
          value={stats.dealsCount || 0}
          subtitle="Opportunities"
          icon={<Award className="w-4 h-4 text-copper-400" />}
        />
      </div>

      {/* Quota Progress Bar */}
      <div className="bg-surface-light dark:bg-surface-elevated-dark border border-border-light dark:border-border-dark rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-copper-400" />
            <span className="text-xs font-semibold text-text-primary-light dark:text-text-primary-dark">
              Target Quota Attainment
            </span>
          </div>
          <span className="text-xs font-mono font-bold text-copper-500 dark:text-copper-400">
            {attainment}%
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-surface-muted-light dark:bg-surface-dark overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-copper-500 to-copper-400 transition-all duration-500"
            style={{ width: `${Math.min(attainment, 100)}%` }}
          />
        </div>
      </div>

      {/* Coaching Notes */}
      <div className="bg-surface-light dark:bg-surface-elevated-dark border border-border-light dark:border-border-dark rounded-xl p-5 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-copper-500/40 to-transparent" />
        <h3 className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark mb-2 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-copper-400" />
          Manager Coaching &amp; Quota Review
        </h3>
        <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
          {agent.name} is currently tracking at <strong className="text-text-primary-light dark:text-text-primary-dark font-mono">{attainment}%</strong> of their ₹{(agent.targetQuota || 2500000).toLocaleString('en-IN')} target quota. Ensure active pipeline deals in negotiation stage receive executive sponsorship to accelerate Q3 closing velocity.
        </p>
      </div>
    </div>
  );
}
