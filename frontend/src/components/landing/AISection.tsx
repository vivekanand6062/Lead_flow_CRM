'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Mail,
  Check,
  Copy,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Zap,
  Activity
} from 'lucide-react';

export const AISection: React.FC = () => {
  const [draftType, setDraftType] = useState<'email' | 'call_script'>('email');
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [scoreVal, setScoreVal] = useState(92);
  const [isScanning, setIsScanning] = useState(false);

  const emailSubject = 'Following up — Next steps for FinEdge Solutions & LeadFlow';
  const emailBody = `Hi Pooja,\n\nI hope you're having a productive week.\n\nFollowing our review of your security checklist, I've confirmed that all SOC2 compliance requirements are met for your team deployment.\n\nWould Wednesday at 2:00 PM work for a brief 15-minute call with your procurement lead to finalize contract execution?\n\nBest regards,\nPriya Mehta`;

  const callScript = `• Objective: Finalize procurement alignment for annual enterprise tier.\n• Opening: "Hi Pooja, I'm calling to follow up on the security review we wrapped up on Monday."\n• Value Anchor: Remind that annual prepayment includes dedicated onboarding & 15% rate lock.\n• Close: "Can we lock in Wednesday 2:00 PM for the digital signature walkthrough?"`;

  const handleCopy = () => {
    const textToCopy = draftType === 'email' ? `${emailSubject}\n\n${emailBody}` : callScript;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerateDraft = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
    }, 600);
  };

  const handleRescore = () => {
    setIsScanning(true);
    setScoreVal(70);
    setTimeout(() => {
      setScoreVal(94);
      setIsScanning(false);
    }, 700);
  };

  return (
    <section id="ai" className="py-16 sm:py-24 border-b border-border-light dark:border-border-dark bg-surface-canvas-light dark:bg-surface-canvas-dark scroll-reveal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-2xl mx-auto text-center mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-lavender-500/10 text-lavender-600 dark:text-lavender-400 border border-lavender-500/20 mb-3 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>Embedded Sales Intelligence</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-text-primary-light dark:text-text-primary-dark">
            AI that helps your team decide what to do next.
          </h2>
          <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-3 leading-relaxed">
            LeadFlow embeds analytical intelligence directly into your workflow to score leads, evaluate deal risk, and draft personalized outreach in seconds.
          </p>
        </div>

        {/* 3 Core AI Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card 1: AI Lead Scoring with Radar Scanning Animation */}
          <div className="relative rounded-2xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-elevated-dark p-6 flex flex-col justify-between shadow-card hover:border-lavender-500/40 hover:shadow-glow-lavender transition-all duration-300 overflow-hidden">
            {/* Top Scanning Beam */}
            <div className="absolute top-0 left-0 right-0 h-[2px] overflow-hidden pointer-events-none">
              <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-lavender-400 to-transparent animate-shimmer-sweep" />
            </div>

            <div>
              <div className="flex items-center justify-between pb-3 border-b border-border-light dark:border-border-dark">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-lavender-500/15 text-lavender-600 dark:text-lavender-400">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-text-primary-light dark:text-text-primary-dark">
                    AI Lead Scoring
                  </h3>
                </div>
                <button
                  onClick={handleRescore}
                  className="inline-flex items-center gap-1 text-[11px] font-mono text-lavender-600 dark:text-lavender-400 hover:underline cursor-pointer"
                  title="Simulate re-scoring"
                >
                  <RefreshCw className={`w-3 h-3 ${isScanning ? 'animate-spin' : ''}`} />
                  <span>Re-score</span>
                </button>
              </div>

              <div className="mt-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-text-primary-light dark:text-text-primary-dark">Arjun Nambiar</h4>
                    <p className="text-[11px] text-text-secondary-light dark:text-text-secondary-dark">XYZ Technologies • CTO</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-baseline justify-end gap-1">
                      <span className="text-2xl font-black text-emerald-500 dark:text-emerald-400 tabular-nums transition-all duration-500">
                        {scoreVal}
                      </span>
                      <span className="text-xs text-text-tertiary-light dark:text-text-tertiary-dark font-medium">/100</span>
                    </div>
                    <div className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                      High Intent
                    </div>
                  </div>
                </div>

                {/* Detected Buying Signals with Scanner Line */}
                <div className="relative mt-4 pt-3 border-t border-border-light dark:border-border-dark space-y-2 overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-semibold text-text-tertiary-light dark:text-text-tertiary-dark uppercase tracking-wider">
                      Detected Buying Signals:
                    </span>
                    <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">99.2% confidence</span>
                  </div>

                  <div className="space-y-1.5 text-xs text-text-secondary-light dark:text-text-secondary-dark">
                    <div className="flex items-center gap-2 p-1.5 rounded-lg bg-surface-muted-light dark:bg-surface-dark transition-colors hover:border-emerald-500/30">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>Visited pricing breakdown 5 times</span>
                    </div>
                    <div className="flex items-center gap-2 p-1.5 rounded-lg bg-surface-muted-light dark:bg-surface-dark transition-colors hover:border-emerald-500/30">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>Enterprise RFP document downloaded</span>
                    </div>
                    <div className="flex items-center gap-2 p-1.5 rounded-lg bg-surface-muted-light dark:bg-surface-dark transition-colors hover:border-emerald-500/30">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>Replied within 15 minutes of demo follow-up</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3 rounded-xl bg-surface-muted-light dark:bg-surface-dark border border-border-light dark:border-border-dark text-[11px] text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
                  <span className="font-semibold text-text-primary-light dark:text-text-primary-dark">AI Rationale: </span>
                  Lead exhibits strong qualification indicators based on verified enterprise domain, negotiation progression, and consistent stakeholder engagement.
                </div>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-border-light dark:border-border-dark flex items-center justify-between text-xs text-text-tertiary-light dark:text-text-tertiary-dark">
              <span>Automatic re-scoring on activity</span>
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
            </div>
          </div>

          {/* Card 2: AI Follow-up Generator with Realtime Typing Simulation */}
          <div className="relative rounded-2xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-elevated-dark p-6 flex flex-col justify-between shadow-card hover:border-copper-500/40 hover:shadow-glow-copper transition-all duration-300">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-border-light dark:border-border-dark">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-copper-500/15 text-copper-600 dark:text-copper-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-text-primary-light dark:text-text-primary-dark">
                    AI Follow-up Generator
                  </h3>
                </div>

                {/* Format Toggle Pill */}
                <div className="flex items-center bg-surface-muted-light dark:bg-surface-dark p-0.5 rounded-lg text-[11px] border border-border-light dark:border-border-dark">
                  <button
                    onClick={() => {
                      setDraftType('email');
                      handleRegenerateDraft();
                    }}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                      draftType === 'email'
                        ? 'bg-copper-600 text-white dark:bg-copper-500 font-semibold shadow-xs'
                        : 'text-text-secondary-light dark:text-text-secondary-dark hover:text-text-primary-light dark:hover:text-text-primary-dark'
                    }`}
                  >
                    Email
                  </button>
                  <button
                    onClick={() => {
                      setDraftType('call_script');
                      handleRegenerateDraft();
                    }}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                      draftType === 'call_script'
                        ? 'bg-copper-600 text-white dark:bg-copper-500 font-semibold shadow-xs'
                        : 'text-text-secondary-light dark:text-text-secondary-dark hover:text-text-primary-light dark:hover:text-text-primary-dark'
                    }`}
                  >
                    Call Script
                  </button>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-[11px] font-mono font-semibold text-text-tertiary-light dark:text-text-tertiary-dark uppercase tracking-wider">
                    {draftType === 'email' ? 'Drafted Follow-up Email:' : 'Call Talking Points:'}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleRegenerateDraft}
                      className="p-1 text-text-tertiary-light dark:text-text-tertiary-dark hover:text-copper-600 dark:hover:text-copper-400 transition-colors"
                      title="Regenerate"
                    >
                      <RefreshCw className={`w-3 h-3 ${isGenerating ? 'animate-spin text-copper-500' : ''}`} />
                    </button>
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-1 text-[11px] font-medium text-copper-600 dark:text-copper-400 hover:underline cursor-pointer"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                <div className={`p-3.5 rounded-xl border border-border-light dark:border-border-dark bg-surface-muted-light dark:bg-surface-dark font-mono text-[11px] text-text-secondary-light dark:text-text-secondary-dark leading-relaxed whitespace-pre-line transition-opacity duration-300 ${
                  isGenerating ? 'opacity-40' : 'opacity-100'
                }`}>
                  {draftType === 'email' ? (
                    <div>
                      <span className="font-bold text-text-primary-light dark:text-text-primary-dark">Subject: </span>
                      {emailSubject}
                      {'\n\n'}
                      {emailBody}
                    </div>
                  ) : (
                    <div>{callScript}</div>
                  )}
                  {isGenerating && (
                    <span className="inline-block w-2 h-4 ml-1 bg-copper-500 animate-pulse align-middle" />
                  )}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-border-light dark:border-border-dark flex items-center justify-between text-xs text-text-tertiary-light dark:text-text-tertiary-dark">
              <span>One-click save to Follow-up queue</span>
              <ArrowRight className="w-4 h-4 text-copper-500" />
            </div>
          </div>

          {/* Card 3: AI Deal Risk Analysis with Radar Pulse */}
          <div className="relative rounded-2xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-elevated-dark p-6 flex flex-col justify-between shadow-card hover:border-copper-500/40 transition-all duration-300">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-border-light dark:border-border-dark">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-amber-500/15 text-amber-500">
                    <Activity className="w-4 h-4 animate-pulse" />
                  </div>
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-text-primary-light dark:text-text-primary-dark">
                    Deal Risk Telemetry
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-text-tertiary-light dark:text-text-tertiary-dark">Real-time</span>
              </div>

              <div className="mt-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-text-primary-light dark:text-text-primary-dark">FinEdge Solutions</h4>
                    <p className="text-[11px] text-text-secondary-light dark:text-text-secondary-dark">SOC2 Platform • ₹18,00,000</p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    GOOD HEALTH
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex items-start gap-2 text-text-secondary-light dark:text-text-secondary-dark p-1.5 rounded-lg bg-surface-muted-light dark:bg-surface-dark">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Positive: Security questionnaire approved without exceptions</span>
                  </div>
                  <div className="flex items-start gap-2 text-text-secondary-light dark:text-text-secondary-dark p-1.5 rounded-lg bg-surface-muted-light dark:bg-surface-dark">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Positive: Verbal confirmation on standard net-30 terms</span>
                  </div>
                  <div className="flex items-start gap-2 text-amber-600 dark:text-amber-400 p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <span>Watch item: Procurement signature delayed by 2 days</span>
                  </div>
                </div>

                <div className="mt-4 p-3 rounded-xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-600 dark:text-amber-400">
                  <span className="font-semibold">Recommended Next Step: </span>
                  Send reminder email with executive summary attached and request direct vendor portal upload link.
                </div>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-border-light dark:border-border-dark flex items-center justify-between text-xs text-text-tertiary-light dark:text-text-tertiary-dark">
              <span>Calculated from stage duration &amp; notes</span>
              <Check className="w-4 h-4 text-emerald-500" />
            </div>
          </div>
        </div>

        {/* AI Sales Insights Banner Strip with Subtle Hover Elevation */}
        <div className="mt-8 rounded-2xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-elevated-dark p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-card hover:border-copper-500/30 transition-all">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-lavender-500/15 text-lavender-600 dark:text-lavender-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-text-primary-light dark:text-text-primary-dark uppercase tracking-wider font-mono">
                Strategic Sales Velocity Alerts
              </h4>
              <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-0.5">
                LeadFlow automatically flags stalled opportunities, surfaces high-intent leads, and generates next-best actions.
              </p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-copper-600 dark:text-copper-400 whitespace-nowrap self-end sm:self-center font-mono hover:translate-x-0.5 transition-transform">
            <span>Standard in all workspaces</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </section>
  );
};
