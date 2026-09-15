
import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, DollarSign, Users, Award } from 'lucide-react';
import { MetricCard } from '@/components/ui/MetricCard';
import api from '@/services/api';

export const ManagerAnalyticsPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await api.get('/analytics/dashboard');
        setData(res.data);
      } catch (err) {
        console.error('Failed to load team analytics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading || !data) {
    return (
      <div className="p-8 text-center text-text-muted-light dark:text-text-muted-dark">
        <div className="w-6 h-6 border-2 border-copper-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <span className="text-xs">Loading team quota reports...</span>
      </div>
    );
  }

  const { metrics = {}, pipeline = {}, agentLeaderboard = [] } = data;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-text-primary-light dark:text-text-primary-dark">
          Team Performance Analytics
        </h2>
        <p className="text-xs text-text-muted-light dark:text-text-muted-dark mt-0.5">
          Sales agent quota tracking, pipeline velocity, and conversion rate reports.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Team Won Revenue"
          value={`₹${(metrics.teamRevenue || 0).toLocaleString('en-IN')}`}
          subtitle="Closed Bookings"
          icon={<DollarSign className="w-4 h-4 text-emerald-500" />}
        />
        <MetricCard
          title="Team Pipeline"
          value={`₹${(metrics.pipelineValue || 0).toLocaleString('en-IN')}`}
          subtitle="Active Opportunities"
          icon={<TrendingUp className="w-4 h-4 text-copper-500" />}
        />
        <MetricCard
          title="Team Conversion"
          value={`${metrics.conversionRate || 0}%`}
          subtitle="Won / Closed Ratio"
          icon={<BarChart3 className="w-4 h-4 text-lavender-500" />}
        />
        <MetricCard
          title="Total Team Leads"
          value={metrics.teamLeadsCount || 0}
          subtitle={`${metrics.qualifiedLeadsCount || 0} Qualified`}
          icon={<Users className="w-4 h-4 text-copper-400" />}
        />
      </div>

      {/* Leaderboard Table */}
      <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl p-5 shadow-xs">
        <h3 className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark mb-1">
          Sales Agent Quota Attainment Breakdown
        </h3>
        <p className="text-xs text-text-muted-light dark:text-text-muted-dark mb-4">
          Individual progress towards monthly booking targets
        </p>

        <div className="space-y-4">
          {agentLeaderboard.map((agent: any) => (
            <div key={agent.id} className="space-y-1.5 text-xs">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-semibold text-text-primary-light dark:text-text-primary-dark">{agent.name}</span>
                  <span className="text-text-muted-light dark:text-text-muted-dark ml-2">({agent.leadsCount} leads • {agent.wonCount} won)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-text-primary-light dark:text-text-primary-dark">
                    ₹{agent.revenue?.toLocaleString('en-IN')}
                  </span>
                  <span className="text-text-muted-light dark:text-text-muted-dark font-mono">/ ₹{agent.quota?.toLocaleString('en-IN')}</span>
                </div>
              </div>
              <div className="w-full h-2.5 bg-surface-elevated-light dark:bg-surface-elevated-dark rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    agent.attainment >= 70 ? 'bg-emerald-500' : 'bg-copper-500'
                  }`}
                  style={{ width: `${Math.min(agent.attainment, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-text-muted-light dark:text-text-muted-dark">
                <span>Target: ₹{agent.quota?.toLocaleString('en-IN')}</span>
                <span className="font-semibold text-text-secondary-light dark:text-text-secondary-dark">{agent.attainment}% Achieved</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


export default ManagerAnalyticsPage;
