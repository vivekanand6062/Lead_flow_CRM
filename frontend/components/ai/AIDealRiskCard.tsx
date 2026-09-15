'use client';

import React, { useState } from 'react';
import { Sparkles, ShieldCheck, AlertTriangle, RefreshCw, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import api from '@/services/api';

interface AIDealRiskCardProps {
  dealId: string;
  initialHealth?: 'GOOD' | 'MODERATE' | 'AT_RISK';
  initialPositiveSignals?: string[];
  initialRiskSignals?: string[];
  initialRecommendedAction?: string;
}

export const AIDealRiskCard: React.FC<AIDealRiskCardProps> = ({
  dealId,
  initialHealth = 'GOOD',
  initialPositiveSignals = [],
  initialRiskSignals = [],
  initialRecommendedAction = ''
}) => {
  const [health, setHealth] = useState<'GOOD' | 'MODERATE' | 'AT_RISK'>(initialHealth);
  const [positiveSignals, setPositiveSignals] = useState<string[]>(initialPositiveSignals);
  const [riskSignals, setRiskSignals] = useState<string[]>(initialRiskSignals);
  const [recommendedAction, setRecommendedAction] = useState(initialRecommendedAction);
  const [loading, setLoading] = useState(false);

  const handleRefresh = async () => {
    try {
      setLoading(true);
      const res = await api.post('/ai/deal-risk', { dealId });
      const data = res.data.data;
      setHealth(data.riskHealth);
      setPositiveSignals(data.positiveSignals || []);
      setRiskSignals(data.riskSignals || []);
      setRecommendedAction(data.recommendedAction || '');
    } catch (err) {
      console.error('Failed to evaluate deal risk', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#FFFDFC] dark:bg-[#141117] border border-[#E5DCD5] dark:border-[#2A242D] rounded-xl p-5 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#EEEAFB] dark:bg-[rgba(155,138,251,0.15)] text-[#705BC9] dark:text-[#9B8AFB] border border-[#DDD6FE] dark:border-[rgba(155,138,251,0.25)]">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-[#211A20] dark:text-[#F5F1F3] uppercase tracking-wider">
              AI Deal Health &amp; Risk Engine
            </h4>
            <span className="text-[11px] text-[#8A7F87] dark:text-[#817783]">Pipeline Velocity &amp; Slippage Radar</span>
          </div>
        </div>

        <button
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center gap-1 text-xs text-[#665C65] dark:text-[#B8AEB9] hover:text-[#211A20] dark:hover:text-[#F5F1F3] p-1.5 rounded-lg hover:bg-[#F8F2EE] dark:hover:bg-[#1A151D] transition-colors disabled:opacity-50"
          title="Refresh Analysis"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#705BC9] dark:text-[#9B8AFB]' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Health Status Indicator */}
      <div className="mt-4 flex items-center justify-between p-3.5 rounded-xl bg-[#F7F3F0] dark:bg-[#1A151D]/60 border border-[#E5DCD5] dark:border-[#2A242D]">
        <div className="flex items-center gap-2">
          {health === 'GOOD' && <ShieldCheck className="w-5 h-5 text-[#3FA77A]" />}
          {health === 'MODERATE' && <AlertTriangle className="w-5 h-5 text-[#D29A4A]" />}
          {health === 'AT_RISK' && <AlertTriangle className="w-5 h-5 text-[#D76565]" />}
          <span className="text-sm font-semibold text-[#211A20] dark:text-[#F5F1F3]">
            Deal Health Assessment
          </span>
        </div>
        <Badge type={health} />
      </div>

      {/* Recommended Next Action */}
      {recommendedAction && (
        <div className="mt-3 p-3 rounded-lg bg-[#F3E3D7]/60 dark:bg-[rgba(192,132,87,0.1)] border border-[#E9BF9F] dark:border-[rgba(192,132,87,0.25)] text-xs">
          <span className="font-semibold text-[#79472B] dark:text-[#E0A978] block mb-1">
            Recommended Action:
          </span>
          <p className="text-[#211A20] dark:text-[#F5F1F3]">
            {recommendedAction}
          </p>
        </div>
      )}

      {/* Signals Breakdown */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        {/* Positive Signals */}
        <div className="p-3 rounded-lg border border-[#E5DCD5] dark:border-[#2A242D] bg-[#F7F3F0]/60 dark:bg-[#1A151D]/40">
          <span className="text-[10px] font-semibold text-[#3FA77A] uppercase tracking-wider block mb-2">
            Positive Signals
          </span>
          {positiveSignals.length > 0 ? (
            <ul className="space-y-1.5">
              {positiveSignals.map((sig, i) => (
                <li key={i} className="flex items-start gap-1.5 text-[#211A20] dark:text-[#F5F1F3]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#3FA77A] shrink-0 mt-0.5" />
                  <span>{sig}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[#8A7F87] dark:text-[#817783] text-[11px]">No distinct positive momentum signals.</p>
          )}
        </div>

        {/* Risk Signals */}
        <div className="p-3 rounded-lg border border-[#E5DCD5] dark:border-[#2A242D] bg-[#F7F3F0]/60 dark:bg-[#1A151D]/40">
          <span className="text-[10px] font-semibold text-[#D76565] uppercase tracking-wider block mb-2">
            Risk Factors
          </span>
          {riskSignals.length > 0 ? (
            <ul className="space-y-1.5">
              {riskSignals.map((sig, i) => (
                <li key={i} className="flex items-start gap-1.5 text-[#211A20] dark:text-[#F5F1F3]">
                  <AlertTriangle className="w-3.5 h-3.5 text-[#D76565] shrink-0 mt-0.5" />
                  <span>{sig}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[#8A7F87] dark:text-[#817783] text-[11px]">No critical risk bottlenecks identified.</p>
          )}
        </div>
      </div>
    </div>
  );
};
