
import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, DollarSign, Layers, PieChart } from 'lucide-react';
import { MetricCard } from '@/components/ui/MetricCard';
import api from '@/services/api';

export const AdminAnalyticsPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await api.get('/analytics/dashboard');
        setData(res.data);
      } catch (err) {
        console.error('Failed to load org analytics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading || !data) {
    return (
      <div className="p-12 text-center text-text-tertiary-dark">
        <div className="w-7 h-7 border-2 border-copper-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <span className="text-xs font-mono tracking-wide">Loading analytics reports...</span>
      </div>
    );
  }

  const { metrics = {}, funnel = {}, managerLeaderboard = [] } = data;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-text-primary-light dark:text-text-primary-dark">
          Organization Revenue Analytics
        </h2>
        <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-0.5">
          High-level business intelligence, funnel velocity, and quota attainment reports.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Gross Won Revenue"
          value={`₹${(metrics.totalRevenue || 0).toLocaleString('en-IN')}`}
          subtitle="Closed Bookings"
          icon={<DollarSign className="w-4 h-4 text-emerald-400" />}
        />
        <MetricCard
          title="Active Pipeline Value"
          value={`₹${(metrics.pipelineValue || 0).toLocaleString('en-IN')}`}
          subtitle="Weighted Potential"
          icon={<TrendingUp className="w-4 h-4 text-copper-400" />}
        />
        <MetricCard
          title="Conversion Rate"
          value={`${metrics.conversionRate || 0}%`}
          subtitle="Opportunity-to-Close"
          icon={<BarChart3 className="w-4 h-4 text-lavender-400" />}
        />
        <MetricCard
          title="Total Leads"
          value={metrics.totalLeads || 0}
          subtitle="All Time Acquired"
          icon={<Layers className="w-4 h-4 text-copper-400" />}
        />
      </div>

      {/* Funnel Table & Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface-light dark:bg-surface-elevated-dark border border-border-light dark:border-border-dark rounded-xl p-5 shadow-xs">
          <h3 className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark mb-1">
            Stage Conversion Distribution
          </h3>
          <p className="text-xs text-text-tertiary-light dark:text-text-tertiary-dark mb-4 font-mono">
            Current volumes across all active pipeline stages
          </p>

          <div className="space-y-2.5">
            {Object.entries(funnel).map(([stage, count]: [string, any]) => (
              <div key={stage} className="flex items-center justify-between p-2.5 rounded-lg bg-surface-muted-light dark:bg-surface-dark border border-border-light dark:border-border-dark text-xs">
                <span className="font-semibold text-text-secondary-light dark:text-text-secondary-dark">{stage}</span>
                <span className="font-mono font-bold text-copper-600 dark:text-copper-400">{count} leads</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-surface-light dark:bg-surface-elevated-dark border border-border-light dark:border-border-dark rounded-xl p-5 shadow-xs">
          <h3 className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark mb-1">
            Manager Contribution Breakdown
          </h3>
          <p className="text-xs text-text-tertiary-light dark:text-text-tertiary-dark mb-4 font-mono">
            Won deal revenue aggregated by manager team
          </p>

          <div className="space-y-4">
            {managerLeaderboard.map((m: any) => (
              <div key={m.id} className="space-y-1.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-text-primary-light dark:text-text-primary-dark">{m.name} ({m.department})</span>
                  <span className="font-mono font-bold text-text-primary-light dark:text-text-primary-dark">
                    ₹{m.revenue?.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="w-full h-2 bg-surface-muted-light dark:bg-surface-dark rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-copper-500 to-copper-400 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(m.attainment, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-text-tertiary-light dark:text-text-tertiary-dark">
                  <span>Quota: ₹{m.quota?.toLocaleString('en-IN')}</span>
                  <span className="text-copper-500 dark:text-copper-400 font-bold">{m.attainment}% achieved</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


export default AdminAnalyticsPage;
