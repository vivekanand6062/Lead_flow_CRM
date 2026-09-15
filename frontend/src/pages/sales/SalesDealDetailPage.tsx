
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Building2, Clock, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { AIDealRiskCard } from '@/components/ai/AIDealRiskCard';
import { ActivityTimeline } from '@/components/crm/ActivityTimeline';
import { ActivityModal } from '@/components/crm/ActivityModal';
import api from '@/services/api';

const STAGES = ['QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST'];

export const SalesDealDetailPage: React.FC = () => {
  const params = useParams();
  const dealId = params.id as string;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStage, setUpdatingStage] = useState(false);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);

  const fetchDeal = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/deals/${dealId}`);
      setData(res.data.data);
    } catch (err) {
      console.error('Failed to load deal detail', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (dealId) fetchDeal();
  }, [dealId]);

  const handleStageChange = async (newStage: string) => {
    try {
      setUpdatingStage(true);
      await api.put(`/deals/${dealId}`, { stage: newStage });
      fetchDeal();
    } catch (err) {
      console.error('Failed to update stage', err);
    } finally {
      setUpdatingStage(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="p-12 text-center text-[#8A7F87] dark:text-[#817783]">
        <div className="w-6 h-6 border-2 border-[#A9683F] dark:border-[#C08457] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <span className="text-xs">Loading deal opportunity data...</span>
      </div>
    );
  }

  const { deal, activities = [] } = data;
  const currentStageIndex = STAGES.indexOf(deal.stage);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <Link to="/sales/deals"
          className="inline-flex items-center gap-1.5 text-xs text-[#8A7F87] hover:text-[#211A20] dark:hover:text-[#F5F1F3] mb-3 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to My Deals</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold tracking-tight text-[#211A20] dark:text-[#F5F1F3]">
                {deal.title}
              </h2>
              <Badge type={deal.stage} />
              {deal.riskHealth && <Badge type={deal.riskHealth} />}
            </div>
            <p className="text-xs text-[#8A7F87] dark:text-[#817783] mt-1 flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5 text-[#8A7F87]" />
              <span className="font-semibold text-[#665C65] dark:text-[#B8AEB9]">{deal.companyName}</span>
              <span>•</span>
              <span>Assigned Rep: {deal.assignedAgentId?.name || 'You'}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" onClick={() => setIsActivityModalOpen(true)}>
              <Clock className="w-3.5 h-3.5" />
              <span>Log Activity</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Stage Progression Stepper Bar */}
      <div className="bg-[#FFFDFC] dark:bg-[#141117] border border-[#E5DCD5] dark:border-[#2A242D] rounded-xl p-4 shadow-xs">
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
          {STAGES.map((st, idx) => {
            const isCurrent = deal.stage === st;
            const isCompleted = currentStageIndex > idx && deal.stage !== 'LOST';
            const isLost = deal.stage === 'LOST' && st === 'LOST';

            return (
              <button
                key={st}
                onClick={() => handleStageChange(st)}
                disabled={updatingStage}
                className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-lg text-xs font-semibold text-center transition-all border ${
                  isLost
                    ? 'bg-[rgba(215,101,101,0.12)] text-[#D76565] border-[rgba(215,101,101,0.3)]'
                    : isCurrent
                    ? 'bg-[#A9683F] dark:bg-[#C08457] text-white border-[#A9683F] dark:border-[#C08457] shadow-xs'
                    : isCompleted
                    ? 'bg-[#F0E5EE] dark:bg-[rgba(110,69,107,0.18)] text-[#704766] dark:text-[#DBB8D5] border-[#E5DCD5] dark:border-[#2A242D]'
                    : 'bg-[#F7F3F0]/60 dark:bg-[#1A151D]/30 text-[#8A7F87] dark:text-[#817783] border-[#E5DCD5]/60 dark:border-[#2A242D]/60 hover:border-[#A9683F]/50 dark:hover:border-[#C08457]/50'
                }`}
              >
                {st}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid: Deal Info & AI Risk Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Financials, Notes & Activities */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#FFFDFC] dark:bg-[#141117] border border-[#E5DCD5] dark:border-[#2A242D] rounded-xl p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-semibold text-[#8A7F87] dark:text-[#817783] uppercase tracking-wider pb-2 border-b border-[#E5DCD5] dark:border-[#2A242D]">
              Financial &amp; Milestone Data
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-[#8A7F87] dark:text-[#817783] block mb-1">Opportunity Value</span>
                <span className="text-lg font-bold text-[#211A20] dark:text-[#F5F1F3] font-mono tabular-nums">
                  ₹{deal.value?.toLocaleString('en-IN')}
                </span>
              </div>
              <div>
                <span className="text-[#8A7F87] dark:text-[#817783] block mb-1">Win Probability</span>
                <span className="text-lg font-bold text-[#211A20] dark:text-[#F5F1F3] font-mono tabular-nums">
                  {deal.probability}%
                </span>
              </div>
              <div>
                <span className="text-[#8A7F87] dark:text-[#817783] block mb-1">Expected Close Date</span>
                <span className="font-semibold text-[#211A20] dark:text-[#F5F1F3] font-mono tabular-nums">
                  {new Date(deal.expectedCloseDate).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </span>
              </div>
            </div>

            {deal.notes && (
              <div className="pt-3 border-t border-[#E5DCD5] dark:border-[#2A242D]">
                <span className="text-[11px] font-semibold text-[#8A7F87] dark:text-[#817783] uppercase tracking-wider block mb-1">
                  Strategy Notes
                </span>
                <p className="text-xs text-[#665C65] dark:text-[#B8AEB9] bg-[#F7F3F0] dark:bg-[#1A151D]/40 p-3 rounded-lg leading-relaxed">
                  {deal.notes}
                </p>
              </div>
            )}
          </div>

          {/* Deal Activity History */}
          <div className="bg-[#FFFDFC] dark:bg-[#141117] border border-[#E5DCD5] dark:border-[#2A242D] rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-[#211A20] dark:text-[#F5F1F3]">
                  Deal Milestone History
                </h3>
                <p className="text-xs text-[#8A7F87] dark:text-[#817783]">
                  Negotiation touchpoints and progress updates
                </p>
              </div>
              <Button size="sm" variant="outline" onClick={() => setIsActivityModalOpen(true)}>
                <Plus className="w-3.5 h-3.5" />
                <span>Log Event</span>
              </Button>
            </div>

            <ActivityTimeline activities={activities} />
          </div>
        </div>

        {/* Right Column: AI Deal Health & Risk Radar */}
        <div>
          <AIDealRiskCard
            dealId={deal._id}
            initialHealth={deal.riskHealth}
            initialPositiveSignals={deal.positiveSignals}
            initialRiskSignals={deal.riskSignals}
            initialRecommendedAction={deal.recommendedAction}
          />
        </div>
      </div>

      {/* Activity Modal */}
      <ActivityModal
        isOpen={isActivityModalOpen}
        onClose={() => setIsActivityModalOpen(false)}
        onSuccess={fetchDeal}
        dealId={deal._id}
        defaultCustomer={`${deal.title} (${deal.companyName})`}
      />
    </div>
  );
}


export default SalesDealDetailPage;
