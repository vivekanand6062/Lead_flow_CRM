'use client';

import React, { useState } from 'react';
import { Sparkles, Copy, Check, Send, PhoneCall, Mail } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import api from '@/services/api';

interface AIFollowUpGeneratorProps {
  leadId: string;
  leadName: string;
  companyName: string;
  onSavedAsFollowUp?: () => void;
}

export const AIFollowUpGenerator: React.FC<AIFollowUpGeneratorProps> = ({
  leadId,
  leadName,
  companyName,
  onSavedAsFollowUp
}) => {
  const [type, setType] = useState<'email' | 'call_script'>('email');
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleGenerate = async () => {
    try {
      setLoading(true);
      setSuccessMsg('');
      const res = await api.post('/ai/follow-up-draft', {
        leadId,
        type,
        recentNote: 'Follow-up discussion on product requirements'
      });
      setDraft(res.data.data.draft);
    } catch (err) {
      console.error('Failed to generate follow-up draft', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(draft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveAsFollowUp = async () => {
    if (!draft.trim()) return;
    try {
      setSaving(true);
      await api.post('/follow-ups', {
        contactName: `${leadName} (${companyName})`,
        title: type === 'email' ? 'Send follow-up email' : 'Follow-up call',
        type: type === 'email' ? 'EMAIL' : 'CALL',
        dueDate: new Date(),
        priority: 'HIGH',
        leadId,
        notes: draft
      });
      setSuccessMsg('Saved to your Follow-ups task board!');
      if (onSavedAsFollowUp) onSavedAsFollowUp();
    } catch (err) {
      console.error('Failed to save follow-up task', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-[#FFFDFC] dark:bg-[#141117] border border-[#E5DCD5] dark:border-[#2A242D] rounded-xl p-5 shadow-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#EEEAFB] dark:bg-[rgba(155,138,251,0.15)] text-[#705BC9] dark:text-[#9B8AFB] border border-[#DDD6FE] dark:border-[rgba(155,138,251,0.25)]">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-[#211A20] dark:text-[#F5F1F3] uppercase tracking-wider">
              AI Follow-up Generator
            </h4>
            <span className="text-[11px] text-[#8A7F87] dark:text-[#817783]">Contextual Outreach Drafting</span>
          </div>
        </div>

        {/* Format Selector */}
        <div className="flex items-center gap-1 bg-[#F1EBE7] dark:bg-[#1A151D] p-0.5 rounded-lg border border-[#E5DCD5] dark:border-[#2A242D]">
          <button
            onClick={() => setType('email')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs transition-all ${
              type === 'email'
                ? 'bg-[#FFFFFF] dark:bg-[#141117] text-[#211A20] dark:text-[#F5F1F3] shadow-xs font-semibold'
                : 'text-[#8A7F87] dark:text-[#817783] hover:text-[#211A20] dark:hover:text-[#F5F1F3]'
            }`}
          >
            <Mail className="w-3 h-3" />
            <span>Email</span>
          </button>
          <button
            onClick={() => setType('call_script')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs transition-all ${
              type === 'call_script'
                ? 'bg-[#FFFFFF] dark:bg-[#141117] text-[#211A20] dark:text-[#F5F1F3] shadow-xs font-semibold'
                : 'text-[#8A7F87] dark:text-[#817783] hover:text-[#211A20] dark:hover:text-[#F5F1F3]'
            }`}
          >
            <PhoneCall className="w-3 h-3" />
            <span>Call Script</span>
          </button>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {!draft ? (
          <div className="p-6 text-center border border-dashed border-[#E5DCD5] dark:border-[#2A242D] rounded-xl">
            <p className="text-xs text-[#665C65] dark:text-[#B8AEB9] mb-3">
              Generate a personalized {type === 'email' ? 'follow-up email' : 'call talking points script'} tailored to {leadName}.
            </p>
            <Button size="sm" onClick={handleGenerate} isLoading={loading}>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generate Follow-up</span>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Editable Draft Area */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[10px] font-semibold text-[#8A7F87] dark:text-[#817783] uppercase tracking-wider">
                  Review &amp; Edit Message:
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 text-[11px] text-[#665C65] hover:text-[#211A20] dark:text-[#B8AEB9] dark:hover:text-[#F5F1F3] transition-colors"
                  >
                    {copied ? <Check className="w-3 h-3 text-[#3FA77A]" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                  <button
                    onClick={handleGenerate}
                    disabled={loading}
                    className="text-[11px] text-[#A9683F] dark:text-[#C08457] hover:underline"
                  >
                    Regenerate
                  </button>
                </div>
              </div>
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={7}
                className="w-full text-xs font-mono p-3 rounded-lg border border-[#E5DCD5] dark:border-[#2A242D] bg-[#F7F3F0]/60 dark:bg-[#1A151D]/60 text-[#211A20] dark:text-[#F5F1F3] focus:outline-none focus:border-[#A9683F] dark:focus:border-[#C08457] focus:ring-1 focus:ring-[#A9683F] dark:focus:ring-[#C08457] leading-relaxed transition-all"
              />
            </div>

            {successMsg && (
              <p className="text-xs text-[#3FA77A] font-medium">
                {successMsg}
              </p>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleSaveAsFollowUp}
                isLoading={saving}
              >
                Save as Follow-up Task
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  handleCopy();
                  alert('Message copied to clipboard! Ready to send via email client.');
                }}
              >
                <Send className="w-3.5 h-3.5" />
                <span>Copy &amp; Dispatch</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
