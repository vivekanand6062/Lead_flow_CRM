
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, AlertTriangle, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import api from '@/services/api';

export const SalesAIPage: React.FC = () => {
  const [insights, setInsights] = useState<any[]>([]);
  const [highIntentLeads, setHighIntentLeads] = useState<any[]>([]);
  const [stalledDeals, setStalledDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAIData = async () => {
      try {
        setLoading(true);
        const [insightsRes, leadsRes, dealsRes] = await Promise.all([
          api.get('/ai/sales-insights'),
          api.get('/leads'),
          api.get('/deals')
        ]);
        setInsights(insightsRes.data.data || []);
        const leads = leadsRes.data.data || [];
        const deals = dealsRes.data.data || [];

        setHighIntentLeads(leads.filter((l: any) => l.leadScore >= 75 && l.status !== 'WON'));
        setStalledDeals(deals.filter((d: any) => d.riskHealth === 'AT_RISK' || d.riskHealth === 'MODERATE'));
      } catch (err) {
        console.error('Failed to load AI intelligence', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAIData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl">
        <div className="space-y-2">
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-72 rounded-xl" />
          <Skeleton className="h-72 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#EEEAFB] dark:bg-[rgba(155,138,251,0.15)] text-[#705BC9] dark:text-[#9B8AFB] border border-[#DDD6FE] dark:border-[rgba(155,138,251,0.25)]">
            <Sparkles className="w-4 h-4" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#211A20] dark:text-[#F5F1F3]">
            AI Sales Copilot &amp; Intelligence Radar
          </h2>
        </div>
        <p className="text-xs text-[#8A7F87] dark:text-[#B8AEB9] mt-1">
          Automated deal slippage warnings, purchase intent prioritization, and executive engagement recommendations.
        </p>
      </div>

      {/* Strategic Insights Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {insights.map((item) => (
          <div
            key={item.id}
            className={`p-4 rounded-xl border transition-all ${
              item.severity === 'warning'
                ? 'bg-[rgba(210,154,74,0.08)] border-[rgba(210,154,74,0.25)]'
                : item.severity === 'success'
                ? 'bg-[rgba(63,167,122,0.08)] border-[rgba(63,167,122,0.25)]'
                : 'bg-[#EEEAFB]/60 dark:bg-[rgba(155,138,251,0.08)] border-[#DDD6FE] dark:border-[rgba(155,138,251,0.2)]'
            }`}
          >
            <span className="text-[10px] font-bold uppercase tracking-wider block mb-1 text-[#8A7F87] dark:text-[#817783]">
              {item.title}
            </span>
            <p className="text-xs font-semibold text-[#211A20] dark:text-[#F5F1F3] mb-2">
              {item.message}
            </p>
            <span className="text-[11px] font-medium text-[#A9683F] dark:text-[#C08457]">
              {item.action}
            </span>
          </div>
        ))}
      </div>

      {/* Grid: High Intent Leads & Stalled Deals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* High Purchase Intent Leads */}
        <div className="bg-[#FFFDFC] dark:bg-[#141117] border border-[#E5DCD5] dark:border-[#2A242D] rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#3FA77A]" />
              <h3 className="text-sm font-semibold text-[#211A20] dark:text-[#F5F1F3]">
                High Purchase Intent Leads ({highIntentLeads.length})
              </h3>
            </div>
            <span className="text-[11px] text-[#8A7F87] dark:text-[#817783] font-mono">Score &gt; 75</span>
          </div>
          <p className="text-xs text-[#8A7F87] dark:text-[#817783] mb-4">
            Accounts demonstrating high engagement signals ready for proposal conversion.
          </p>

          <div className="space-y-2.5">
            {highIntentLeads.length === 0 ? (
              <p className="text-xs text-[#8A7F87] dark:text-[#817783] p-4 text-center border border-dashed border-[#E5DCD5] dark:border-[#2A242D] rounded-xl">
                No high intent leads detected today.
              </p>
            ) : (
              highIntentLeads.map((lead: any) => (
                <Link key={lead._id}
                  to={`/sales/leads/${lead._id}`}
                  className="flex items-center justify-between p-3 rounded-lg border border-[#E5DCD5] dark:border-[#2A242D] bg-[#F7F3F0]/60 dark:bg-[#1A151D]/40 hover:border-[#A9683F]/50 dark:hover:border-[#C08457]/50 transition-colors text-xs"
                >
                  <div>
                    <span className="font-semibold text-[#211A20] dark:text-[#F5F1F3]">{lead.name}</span>
                    <span className="text-[#8A7F87] dark:text-[#817783] ml-2">({lead.companyName})</span>
                    <p className="text-[11px] text-[#665C65] dark:text-[#B8AEB9] mt-0.5 line-clamp-1">
                      {lead.scoreReasoning}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono font-bold text-[#3FA77A] tabular-nums">
                      {lead.leadScore}/100
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#8A7F87]" />
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Stalled / At Risk Deals */}
        <div className="bg-[#FFFDFC] dark:bg-[#141117] border border-[#E5DCD5] dark:border-[#2A242D] rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#D76565]" />
              <h3 className="text-sm font-semibold text-[#211A20] dark:text-[#F5F1F3]">
                Pipeline Velocity Risk Radar ({stalledDeals.length})
              </h3>
            </div>
            <span className="text-[11px] text-[#8A7F87] dark:text-[#817783]">At Risk / Stalled</span>
          </div>
          <p className="text-xs text-[#8A7F87] dark:text-[#817783] mb-4">
            Opportunities with stalled cadence or risk signals requiring immediate intervention.
          </p>

          <div className="space-y-2.5">
            {stalledDeals.length === 0 ? (
              <p className="text-xs text-[#8A7F87] dark:text-[#817783] p-4 text-center border border-dashed border-[#E5DCD5] dark:border-[#2A242D] rounded-xl">
                All pipeline opportunities are maintaining healthy velocity.
              </p>
            ) : (
              stalledDeals.map((deal: any) => (
                <Link key={deal._id}
                  to={`/sales/deals/${deal._id}`}
                  className="flex items-center justify-between p-3 rounded-lg border border-[#E5DCD5] dark:border-[#2A242D] bg-[#F7F3F0]/60 dark:bg-[#1A151D]/40 hover:border-[#A9683F]/50 dark:hover:border-[#C08457]/50 transition-colors text-xs"
                >
                  <div>
                    <span className="font-semibold text-[#211A20] dark:text-[#F5F1F3]">{deal.title}</span>
                    <span className="text-[#8A7F87] dark:text-[#817783] block text-[11px] font-mono tabular-nums">
                      ₹{deal.value?.toLocaleString('en-IN')} • {deal.stage}
                    </span>
                    <p className="text-[11px] text-[#D76565] mt-0.5 line-clamp-1">
                      {deal.recommendedAction}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge type={deal.riskHealth} />
                    <ArrowRight className="w-3.5 h-3.5 text-[#8A7F87]" />
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


export default SalesAIPage;
