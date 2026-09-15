'use client';

import React, { useState } from 'react';
import { Sparkles, RefreshCw, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import api from '@/services/api';

interface AILeadScoreCardProps {
  leadId: string;
  initialScore?: number;
  initialIntent?: 'HIGH' | 'MEDIUM' | 'LOW';
  initialSignals?: string[];
  initialReasoning?: string;
  onUpdated?: (score: number, intent: 'HIGH' | 'MEDIUM' | 'LOW') => void;
}

export const AILeadScoreCard: React.FC<AILeadScoreCardProps> = ({
  leadId,
  initialScore = 70,
  initialIntent = 'MEDIUM',
  initialSignals = [],
  initialReasoning = '',
  onUpdated
}) => {
  const [score, setScore] = useState(initialScore);
  const [intent, setIntent] = useState<'HIGH' | 'MEDIUM' | 'LOW'>(initialIntent);
  const [signals, setSignals] = useState<string[]>(initialSignals);
  const [reasoning, setReasoning] = useState(initialReasoning);
  const [loading, setLoading] = useState(false);

  const handleRecalculate = async () => {
    try {
      setLoading(true);
      const res = await api.post('/ai/lead-score', { leadId });
      const data = res.data.data;
      setScore(data.leadScore);
      setIntent(data.intentLevel);
      setSignals(data.scoreSignals || []);
      setReasoning(data.scoreReasoning || '');
      if (onUpdated) onUpdated(data.leadScore, data.intentLevel);
    } catch (err) {
      console.error('Failed to recalculate lead score', err);
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
              AI Lead Scoring
            </h4>
            <span className="text-[11px] text-[#8A7F87] dark:text-[#817783]">Predictive Purchase Intent</span>
          </div>
        </div>

        <button
          onClick={handleRecalculate}
          disabled={loading}
          className="flex items-center gap-1 text-xs text-[#665C65] dark:text-[#B8AEB9] hover:text-[#211A20] dark:hover:text-[#F5F1F3] p-1.5 rounded-lg hover:bg-[#F8F2EE] dark:hover:bg-[#1A151D] transition-colors disabled:opacity-50"
          title="Recalculate AI Score"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#705BC9] dark:text-[#9B8AFB]' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Score and Intent Meter */}
      <div className="mt-4 flex items-center justify-between p-3.5 rounded-xl bg-[#F7F3F0] dark:bg-[#1A151D]/60 border border-[#E5DCD5] dark:border-[#2A242D]">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold tracking-tight text-[#211A20] dark:text-[#F5F1F3] tabular-nums font-mono">
            {score}
          </span>
          <span className="text-xs text-[#8A7F87] dark:text-[#817783] font-medium">/ 100</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#8A7F87] dark:text-[#817783]">Intent:</span>
          <Badge type={intent} />
        </div>
      </div>

      {/* Reasoning */}
      {reasoning && (
        <p className="mt-3 text-xs text-[#665C65] dark:text-[#B8AEB9] leading-relaxed">
          {reasoning}
        </p>
      )}

      {/* Signals List */}
      {signals && signals.length > 0 && (
        <div className="mt-3.5 pt-3 border-t border-[#E5DCD5] dark:border-[#2A242D]">
          <span className="text-[10px] font-semibold text-[#8A7F87] dark:text-[#817783] uppercase tracking-wider block mb-2">
            Detected Signals
          </span>
          <ul className="space-y-1.5">
            {signals.map((sig, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-[#211A20] dark:text-[#F5F1F3]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#3FA77A] shrink-0 mt-0.5" />
                <span>{sig}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
