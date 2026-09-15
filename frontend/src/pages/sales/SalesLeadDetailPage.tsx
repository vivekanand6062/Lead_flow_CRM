
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  Calendar,
  Clock,
  Award
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { AILeadScoreCard } from '@/components/ai/AILeadScoreCard';
import { AILeadSummaryCard } from '@/components/ai/AILeadSummaryCard';
import { AIFollowUpGenerator } from '@/components/ai/AIFollowUpGenerator';
import { ActivityTimeline } from '@/components/crm/ActivityTimeline';
import { ActivityModal } from '@/components/crm/ActivityModal';
import { FollowUpModal } from '@/components/crm/FollowUpModal';
import { DealModal } from '@/components/crm/DealModal';
import api from '@/services/api';

export const SalesLeadDetailPage: React.FC = () => {
  const params = useParams();
  const navigate = useNavigate();
  const leadId = params.id as string;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [notes, setNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  // Modals
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
  const [isDealModalOpen, setIsDealModalOpen] = useState(false);

  const fetchLeadData = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/leads/${leadId}`);
      setData(res.data.data);
      setNotes(res.data.data.lead?.notes || '');
    } catch (err) {
      console.error('Failed to load lead details', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (leadId) fetchLeadData();
  }, [leadId]);

  const handleStatusChange = async (newStatus: string) => {
    try {
      setUpdatingStatus(true);
      await api.put(`/leads/${leadId}`, { status: newStatus });
      fetchLeadData();
    } catch (err) {
      console.error('Failed to update status', err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleSaveNotes = async () => {
    try {
      setSavingNotes(true);
      await api.put(`/leads/${leadId}`, { notes });
      alert('Notes saved successfully.');
    } catch (err) {
      console.error('Failed to save notes', err);
    } finally {
      setSavingNotes(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="p-12 text-center text-[#8A7F87] dark:text-[#817783]">
        <div className="w-6 h-6 border-2 border-[#A9683F] dark:border-[#C08457] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <span className="text-xs">Loading complete lead CRM profile...</span>
      </div>
    );
  }

  const { lead, activities = [], deals = [] } = data;

  return (
    <div className="space-y-6">
      {/* Top Navigation & Actions Bar */}
      <div>
        <Link to="/sales/leads"
          className="inline-flex items-center gap-1.5 text-xs text-[#8A7F87] hover:text-[#211A20] dark:hover:text-[#F5F1F3] mb-3 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to My Leads</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold tracking-tight text-[#211A20] dark:text-[#F5F1F3]">
                {lead.name}
              </h2>
              <Badge type={lead.status} />
              <span className="text-xs font-mono font-bold text-[#8A7F87] dark:text-[#817783] tabular-nums">
                Score: {lead.leadScore}/100
              </span>
            </div>
            <p className="text-xs text-[#8A7F87] dark:text-[#817783] mt-1 flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5 text-[#8A7F87]" />
              <span className="font-semibold text-[#665C65] dark:text-[#B8AEB9]">{lead.companyName}</span>
              <span>•</span>
              <span>Source: {lead.leadSource}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsFollowUpModalOpen(true)}>
              <Calendar className="w-3.5 h-3.5" />
              <span>Schedule Follow-up</span>
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsActivityModalOpen(true)}>
              <Clock className="w-3.5 h-3.5" />
              <span>Log Activity</span>
            </Button>
            <Button size="sm" onClick={() => setIsDealModalOpen(true)}>
              <Award className="w-3.5 h-3.5" />
              <span>Convert to Deal</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Details & Right AI Intelligence */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Details, Notes, Deals, and Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Info & Lifecycle Stage Progression */}
          <div className="bg-[#FFFDFC] dark:bg-[#141117] border border-[#E5DCD5] dark:border-[#2A242D] rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5DCD5] dark:border-[#2A242D]">
              <span className="text-xs font-semibold text-[#8A7F87] dark:text-[#817783] uppercase tracking-wider">
                Lifecycle Stage Status
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#8A7F87] dark:text-[#817783]">Current:</span>
                <select
                  value={lead.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  disabled={updatingStatus}
                  className="text-xs font-semibold rounded-lg border border-[#E5DCD5] dark:border-[#2A242D] bg-[#FFFFFF] dark:bg-[#141117] px-2.5 py-1 text-[#211A20] dark:text-[#F5F1F3] focus:outline-none focus:ring-1 focus:ring-[#A9683F] dark:focus:ring-[#C08457] cursor-pointer"
                >
                  <option value="NEW">NEW</option>
                  <option value="CONTACTED">CONTACTED</option>
                  <option value="QUALIFIED">QUALIFIED</option>
                  <option value="PROPOSAL">PROPOSAL</option>
                  <option value="NEGOTIATION">NEGOTIATION</option>
                  <option value="WON">WON</option>
                  <option value="LOST">LOST</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-[#8A7F87] dark:text-[#817783] block mb-1">Email Address</span>
                <span className="font-medium text-[#211A20] dark:text-[#F5F1F3] font-mono">
                  {lead.email || '—'}
                </span>
              </div>
              <div>
                <span className="text-[#8A7F87] dark:text-[#817783] block mb-1">Phone Number</span>
                <span className="font-medium text-[#211A20] dark:text-[#F5F1F3] font-mono">
                  {lead.phone || '—'}
                </span>
              </div>
              <div>
                <span className="text-[#8A7F87] dark:text-[#817783] block mb-1">Est. Opportunity Value</span>
                <span className="font-bold text-[#211A20] dark:text-[#F5F1F3] font-mono tabular-nums">
                  ₹{(lead.estimatedValue || 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* Notes Section */}
          <div className="bg-[#FFFDFC] dark:bg-[#141117] border border-[#E5DCD5] dark:border-[#2A242D] rounded-xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-[#8A7F87] dark:text-[#817783] uppercase tracking-wider">
                Discovery &amp; Account Notes
              </h3>
              <Button size="sm" variant="ghost" onClick={handleSaveNotes} isLoading={savingNotes}>
                Save Notes
              </Button>
            </div>
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Record strategic account background, tech stack requirements, competitor mentions..."
              className="w-full text-xs font-sans p-3 rounded-lg border border-[#E5DCD5] dark:border-[#2A242D] bg-[#F7F3F0]/60 dark:bg-[#1A151D]/60 text-[#211A20] dark:text-[#F5F1F3] focus:outline-none focus:border-[#A9683F] dark:focus:border-[#C08457] focus:ring-1 focus:ring-[#A9683F] dark:focus:ring-[#C08457] leading-relaxed transition-all"
            />
          </div>

          {/* Associated Deals */}
          {deals.length > 0 && (
            <div className="bg-[#FFFDFC] dark:bg-[#141117] border border-[#E5DCD5] dark:border-[#2A242D] rounded-xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-[#8A7F87] dark:text-[#817783] uppercase tracking-wider">
                  Associated Deals ({deals.length})
                </h3>
              </div>
              <div className="space-y-2">
                {deals.map((d: any) => (
                  <Link key={d._id}
                    to={`/sales/deals/${d._id}`}
                    className="flex items-center justify-between p-3 rounded-lg border border-[#E5DCD5] dark:border-[#2A242D] bg-[#F7F3F0]/60 dark:bg-[#1A151D]/40 hover:border-[#A9683F]/50 dark:hover:border-[#C08457]/50 transition-colors text-xs"
                  >
                    <div>
                      <span className="font-semibold text-[#211A20] dark:text-[#F5F1F3]">{d.title}</span>
                      <span className="text-[#8A7F87] dark:text-[#817783] block text-[11px] tabular-nums">
                        ₹{d.value?.toLocaleString('en-IN')} • {d.probability}% probability
                      </span>
                    </div>
                    <Badge type={d.stage} />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Chronological Activity Timeline */}
          <div className="bg-[#FFFDFC] dark:bg-[#141117] border border-[#E5DCD5] dark:border-[#2A242D] rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-[#211A20] dark:text-[#F5F1F3]">
                  Customer History Timeline
                </h3>
                <p className="text-xs text-[#8A7F87] dark:text-[#817783]">
                  Chronological record of touchpoints, calls, emails, and notes
                </p>
              </div>
              <Button size="sm" variant="outline" onClick={() => setIsActivityModalOpen(true)}>
                <span>Log Event</span>
              </Button>
            </div>

            <ActivityTimeline activities={activities} />
          </div>
        </div>

        {/* Right Column: AI Sales Assistance Stack */}
        <div className="space-y-6">
          {/* AI Lead Scoring */}
          <AILeadScoreCard
            leadId={lead._id}
            initialScore={lead.leadScore}
            initialIntent={lead.intentLevel}
            initialSignals={lead.scoreSignals}
            initialReasoning={lead.scoreReasoning}
            onUpdated={(newScore, newIntent) => {
              setData((prev: any) => ({
                ...prev,
                lead: { ...prev.lead, leadScore: newScore, intentLevel: newIntent }
              }));
            }}
          />

          {/* AI CRM Summary */}
          <AILeadSummaryCard leadId={lead._id} />

          {/* AI Follow-up Message Generator */}
          <AIFollowUpGenerator
            leadId={lead._id}
            leadName={lead.name}
            companyName={lead.companyName}
            onSavedAsFollowUp={fetchLeadData}
          />
        </div>
      </div>

      {/* Modals */}
      <ActivityModal
        isOpen={isActivityModalOpen}
        onClose={() => setIsActivityModalOpen(false)}
        onSuccess={fetchLeadData}
        leadId={lead._id}
        defaultCustomer={`${lead.name} (${lead.companyName})`}
      />

      <FollowUpModal
        isOpen={isFollowUpModalOpen}
        onClose={() => setIsFollowUpModalOpen(false)}
        onSuccess={fetchLeadData}
        leadId={lead._id}
        defaultContact={`${lead.name} (${lead.companyName})`}
      />

      <DealModal
        isOpen={isDealModalOpen}
        onClose={() => setIsDealModalOpen(false)}
        onSuccess={fetchLeadData}
        deal={{
          leadId: lead._id,
          companyName: lead.companyName,
          title: `${lead.companyName} — Enterprise License`,
          value: lead.estimatedValue || 500000
        }}
      />
    </div>
  );
}


export default SalesLeadDetailPage;
