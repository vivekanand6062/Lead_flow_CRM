'use client';

import React, { useState } from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';
import api from '@/services/api';

interface AILeadSummaryCardProps {
  leadId: string;
  initialSummary?: string;
}

export const AILeadSummaryCard: React.FC<AILeadSummaryCardProps> = ({
  leadId,
  initialSummary
}) => {
  const [summary, setSummary] = useState(initialSummary || '');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    try {
      setLoading(true);
      const res = await api.post('/ai/lead-summary', { leadId });
      setSummary(res.data.data.summary);
    } catch (err) {
      console.error('Failed to generate AI summary', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#FFFDFC] dark:bg-[#141117] border border-[#E5DCD5] dark:border-[#2A242D] rounded-xl p-5 shadow-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#EEEAFB] dark:bg-[rgba(155,138,251,0.15)] text-[#705BC9] dark:text-[#9B8AFB] border border-[#DDD6FE] dark:border-[rgba(155,138,251,0.25)]">
            <Sparkles className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-semibold text-[#211A20] dark:text-[#F5F1F3] uppercase tracking-wider">
            AI CRM Intelligence Summary
          </h4>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="flex items-center gap-1 text-xs text-[#A9683F] dark:text-[#C08457] hover:text-[#8F5734] dark:hover:text-[#D39A6B] font-medium p-1 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#705BC9] dark:text-[#9B8AFB]' : ''}`} />
          <span>{summary ? 'Regenerate' : 'Generate'}</span>
        </button>
      </div>

      <div className="mt-3">
        {summary ? (
          <p className="text-xs text-[#211A20] dark:text-[#F5F1F3] bg-[#F7F3F0] dark:bg-[#1A151D]/60 p-3 rounded-lg border border-[#E5DCD5] dark:border-[#2A242D] leading-relaxed">
            {summary}
          </p>
        ) : (
          <div className="p-4 text-center border border-dashed border-[#E5DCD5] dark:border-[#2A242D] rounded-xl text-xs text-[#8A7F87] dark:text-[#817783]">
            Click &ldquo;Generate&rdquo; to synthesize lead interaction history into an executive summary.
          </div>
        )}
      </div>
    </div>
  );
};
