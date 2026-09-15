'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Calendar, User } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

export interface DealItem {
  _id: string;
  title: string;
  companyName: string;
  value: number;
  probability: number;
  stage: 'QUALIFIED' | 'PROPOSAL' | 'NEGOTIATION' | 'WON' | 'LOST';
  expectedCloseDate: string | Date;
  assignedAgentId?: {
    _id?: string;
    name?: string;
    avatar?: string;
  };
  riskHealth?: 'GOOD' | 'MODERATE' | 'AT_RISK';
}

interface KanbanBoardProps {
  deals: DealItem[];
  onStageChange: (dealId: string, newStage: DealItem['stage']) => void;
  baseRoute?: string;
}

const STAGES: { key: DealItem['stage']; label: string; accentColor: string }[] = [
  { key: 'QUALIFIED', label: 'Qualified', accentColor: '#C08457' },
  { key: 'PROPOSAL', label: 'Proposal', accentColor: '#D29A4A' },
  { key: 'NEGOTIATION', label: 'Negotiation', accentColor: '#8B5C86' },
  { key: 'WON', label: 'Closed Won', accentColor: '#3FA77A' },
  { key: 'LOST', label: 'Closed Lost', accentColor: '#D76565' }
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  deals,
  onStageChange,
  baseRoute = '/sales/deals'
}) => {
  const router = useRouter();
  const [mobileActiveStage, setMobileActiveStage] = useState<string>('ALL');

  const handlePrevStage = (deal: DealItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const currentIndex = STAGES.findIndex(s => s.key === deal.stage);
    if (currentIndex > 0) {
      onStageChange(deal._id, STAGES[currentIndex - 1].key);
    }
  };

  const handleNextStage = (deal: DealItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const currentIndex = STAGES.findIndex(s => s.key === deal.stage);
    if (currentIndex < STAGES.length - 1) {
      onStageChange(deal._id, STAGES[currentIndex + 1].key);
    }
  };

  const displayedStages = mobileActiveStage === 'ALL'
    ? STAGES
    : STAGES.filter(s => s.key === mobileActiveStage);

  return (
    <div className="w-full space-y-3">
      {/* Mobile Stage Selector Tabs (visible on small screens < 1024px) */}
      <div className="lg:hidden flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setMobileActiveStage('ALL')}
          className={`px-3 py-1 rounded-md text-xs font-medium transition-all shrink-0 ${
            mobileActiveStage === 'ALL'
              ? 'bg-[#A9683F] dark:bg-[#C08457] text-white shadow-xs font-semibold'
              : 'text-[#665C65] dark:text-[#B8AEB9] bg-[#F1EBE7] dark:bg-[#1A151D]'
          }`}
        >
          All Stages ({deals.length})
        </button>
        {STAGES.map((s) => {
          const count = deals.filter(d => d.stage === s.key).length;
          return (
            <button
              key={s.key}
              onClick={() => setMobileActiveStage(s.key)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all shrink-0 ${
                mobileActiveStage === s.key
                  ? 'bg-[#A9683F] dark:bg-[#C08457] text-white shadow-xs font-semibold'
                  : 'text-[#665C65] dark:text-[#B8AEB9] bg-[#F1EBE7] dark:bg-[#1A151D]'
              }`}
            >
              {s.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Kanban Columns Grid */}
      <div className="w-full overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-[1000px] lg:min-w-0">
          {displayedStages.map((col) => {
            const columnDeals = deals.filter(d => d.stage === col.key);
            const totalValue = columnDeals.reduce((sum, d) => sum + d.value, 0);

            return (
              <div
                key={col.key}
                className="flex-1 min-w-[280px] bg-[#F7F3F0]/60 dark:bg-[#141117]/60 border border-[#E5DCD5] dark:border-[#2A242D] rounded-xl flex flex-col max-h-[calc(100vh-220px)] shadow-xs"
              >
                {/* Column Header */}
                <div className="p-3.5 border-b border-[#E5DCD5] dark:border-[#2A242D] bg-[#FFFFFF] dark:bg-[#141117] rounded-t-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: col.accentColor }}
                      />
                      <span className="font-semibold text-xs text-[#211A20] dark:text-[#F5F1F3] uppercase tracking-wider">
                        {col.label}
                      </span>
                      <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-[#F1EBE7] dark:bg-[#1A151D] text-[#665C65] dark:text-[#B8AEB9] font-mono tabular-nums">
                        {columnDeals.length}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-[#211A20] dark:text-[#F5F1F3] font-mono tabular-nums">
                      ₹{totalValue.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Column Cards List */}
                <div className="flex-1 p-2.5 space-y-2.5 overflow-y-auto">
                  {columnDeals.length === 0 ? (
                    <div className="h-28 flex items-center justify-center border border-dashed border-[#E5DCD5] dark:border-[#2A242D] rounded-lg text-xs text-[#8A7F87] dark:text-[#817783]">
                      No deals in {col.label}
                    </div>
                  ) : (
                    columnDeals.map((deal) => {
                      const closeDateStr = new Date(deal.expectedCloseDate).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short'
                      });

                      const stageIndex = STAGES.findIndex(s => s.key === deal.stage);

                      return (
                        <div
                          key={deal._id}
                          onClick={() => router.push(`${baseRoute}/${deal._id}`)}
                          className="p-3.5 bg-[#FFFFFF] dark:bg-[#141117] border border-[#E5DCD5] dark:border-[#2A242D] hover:border-[#A9683F]/50 dark:hover:border-[#C08457]/50 rounded-xl shadow-xs hover:shadow-card transition-all duration-150 cursor-pointer group"
                        >
                          {/* Title & Health Indicator */}
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-xs font-semibold text-[#211A20] dark:text-[#F5F1F3] line-clamp-2 group-hover:text-[#A9683F] dark:group-hover:text-[#C08457] transition-colors">
                              {deal.title}
                            </h4>
                            {deal.riskHealth && (
                              <Badge type={deal.riskHealth} />
                            )}
                          </div>

                          {/* Company */}
                          <p className="text-[11px] text-[#665C65] dark:text-[#B8AEB9] mt-1 truncate">
                            {deal.companyName}
                          </p>

                          {/* Value & Probability */}
                          <div className="mt-2.5 flex items-center justify-between">
                            <span className="text-sm font-bold text-[#211A20] dark:text-[#F5F1F3] tabular-nums font-mono">
                              ₹{deal.value.toLocaleString('en-IN')}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#F7F3F0] dark:bg-[#1A151D] text-[#665C65] dark:text-[#B8AEB9] font-mono tabular-nums border border-[#E5DCD5] dark:border-[#2A242D]">
                              {deal.probability}% win
                            </span>
                          </div>

                          {/* Meta: Rep & Date */}
                          <div className="mt-3 pt-2.5 border-t border-[#E5DCD5]/70 dark:border-[#2A242D]/70 flex items-center justify-between text-[11px] text-[#8A7F87] dark:text-[#817783]">
                            <div className="flex items-center gap-1.5 truncate">
                              <User className="w-3 h-3 text-[#8A7F87]" />
                              <span className="truncate">{deal.assignedAgentId?.name || 'Agent'}</span>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <Calendar className="w-3 h-3 text-[#8A7F87]" />
                              <span className="tabular-nums">{closeDateStr}</span>
                            </div>
                          </div>

                          {/* Stage Shift Controls */}
                          <div className="mt-2.5 pt-2 border-t border-dashed border-[#E5DCD5] dark:border-[#2A242D] flex items-center justify-between opacity-75 group-hover:opacity-100 transition-opacity">
                            <button
                              disabled={stageIndex === 0}
                              onClick={(e) => handlePrevStage(deal, e)}
                              className="p-1 rounded text-[#8A7F87] hover:text-[#211A20] dark:hover:text-[#F5F1F3] hover:bg-[#F8F2EE] dark:hover:bg-[#1A151D] disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                              title="Move to previous stage"
                            >
                              <ChevronLeft className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-[10px] text-[#8A7F87] dark:text-[#817783] font-medium">
                              Shift Stage
                            </span>
                            <button
                              disabled={stageIndex === STAGES.length - 1}
                              onClick={(e) => handleNextStage(deal, e)}
                              className="p-1 rounded text-[#8A7F87] hover:text-[#211A20] dark:hover:text-[#F5F1F3] hover:bg-[#F8F2EE] dark:hover:bg-[#1A151D] disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                              title="Move to next stage"
                            >
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
