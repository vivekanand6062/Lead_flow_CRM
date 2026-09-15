'use client';

import React from 'react';
import {
  TrendingUp,
  DollarSign,
  CheckCircle2,
  Calendar,
  Sparkles,
  AlertTriangle,
  Building2,
  ArrowUpRight
} from 'lucide-react';

export const DashboardPreview: React.FC = () => {
  return (
    <div className="relative rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark shadow-card overflow-hidden">
      {/* Window Titlebar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-light dark:border-border-dark bg-surface-muted-light dark:bg-surface-elevated-dark">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-border-light dark:bg-border-dark" />
            <span className="w-2.5 h-2.5 rounded-full bg-border-light dark:bg-border-dark" />
            <span className="w-2.5 h-2.5 rounded-full bg-border-light dark:bg-border-dark" />
          </div>
          <span className="text-[11px] font-mono font-medium text-text-tertiary-light dark:text-text-tertiary-dark ml-2 hidden sm:inline">
            LeadFlow CRM • Executive Pipeline Overview
          </span>
        </div>

        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-copper-500/10 text-copper-600 dark:text-copper-400 border border-copper-500/25">
          <span className="w-1.5 h-1.5 rounded-full bg-copper-500 animate-pulse" />
          <span>Demo workspace • Illustrative data</span>
        </div>
      </div>

      {/* CRM Dashboard Inner Workspace */}
      <div className="p-4 sm:p-6 space-y-5">
        {/* Top Metric Cards Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-lg border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-elevated-dark">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-text-secondary-light dark:text-text-secondary-dark">Quarterly Closed</span>
              <div className="p-1 rounded-md bg-emerald-500/10 text-emerald-400">
                <DollarSign className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-lg sm:text-xl font-bold tabular-nums text-text-primary-light dark:text-text-primary-dark">₹1.24 Cr</span>
              <span className="text-[11px] font-semibold tabular-nums text-emerald-400 flex items-center">
                <TrendingUp className="w-3 h-3 mr-0.5" /> +18.4%
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-lg border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-elevated-dark">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-text-secondary-light dark:text-text-secondary-dark">Active Pipeline</span>
              <div className="p-1 rounded-md bg-copper-500/10 text-copper-400">
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-lg sm:text-xl font-bold tabular-nums text-text-primary-light dark:text-text-primary-dark">₹4.85 Cr</span>
              <span className="text-[11px] text-text-tertiary-light dark:text-text-tertiary-dark">14 deals</span>
            </div>
          </div>

          <div className="p-3.5 rounded-lg border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-elevated-dark">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-text-secondary-light dark:text-text-secondary-dark">Conversion Rate</span>
              <div className="p-1 rounded-md bg-plum-500/10 text-plum-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-lg sm:text-xl font-bold tabular-nums text-text-primary-light dark:text-text-primary-dark">68.2%</span>
              <span className="text-[11px] tabular-nums text-emerald-400 font-medium">+4.1%</span>
            </div>
          </div>

          <div className="p-3.5 rounded-lg border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-elevated-dark">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-text-secondary-light dark:text-text-secondary-dark">Follow-ups Today</span>
              <div className="p-1 rounded-md bg-amber-500/10 text-amber-400">
                <Calendar className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-lg sm:text-xl font-bold tabular-nums text-text-primary-light dark:text-text-primary-dark">4 Due</span>
              <span className="text-[11px] text-amber-400 font-medium">1 High Priority</span>
            </div>
          </div>
        </div>

        {/* Two Column Split: Active Deals & Embedded AI Intelligence */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Active Deals Table Preview */}
          <div className="lg:col-span-7 rounded-lg border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-elevated-dark p-4">
            <div className="flex items-center justify-between pb-3 border-b border-border-light dark:border-border-dark">
              <div>
                <h4 className="text-xs font-bold text-text-primary-light dark:text-text-primary-dark uppercase tracking-wider font-mono">
                  Active Pipeline Deals
                </h4>
                <p className="text-[11px] text-text-secondary-light dark:text-text-secondary-dark">Weighted forecast by probability</p>
              </div>
              <span className="text-[11px] text-copper-600 dark:text-copper-400 font-medium flex items-center gap-1">
                View Kanban <ArrowUpRight className="w-3 h-3" />
              </span>
            </div>

            <div className="mt-3 space-y-2.5">
              <div className="p-2.5 rounded-lg border border-border-light dark:border-border-dark bg-surface-canvas-light dark:bg-surface-dark flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-copper-400 shrink-0" />
                    <span className="text-xs font-semibold text-text-primary-light dark:text-text-primary-dark truncate">
                      XYZ Technologies — Enterprise Deployment
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-text-secondary-light dark:text-text-secondary-dark">
                    <span>AE: Amit Verma</span>
                    <span>•</span>
                    <span>Close: 21 Sep</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-bold tabular-nums text-text-primary-light dark:text-text-primary-dark">₹15,00,000</span>
                  <div>
                    <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-plum-500/10 text-plum-400">
                      NEGOTIATION (75%)
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-2.5 rounded-lg border border-border-light dark:border-border-dark bg-surface-canvas-light dark:bg-surface-dark flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-copper-400 shrink-0" />
                    <span className="text-xs font-semibold text-text-primary-light dark:text-text-primary-dark truncate">
                      Nova Systems — Sales Automation
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-text-secondary-light dark:text-text-secondary-dark">
                    <span>AE: Priya Mehta</span>
                    <span>•</span>
                    <span>Close: 30 Sep</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-bold tabular-nums text-text-primary-light dark:text-text-primary-dark">₹8,50,000</span>
                  <div>
                    <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-400">
                      PROPOSAL (60%)
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-2.5 rounded-lg border border-border-light dark:border-border-dark bg-surface-canvas-light dark:bg-surface-dark flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-copper-400 shrink-0" />
                    <span className="text-xs font-semibold text-text-primary-light dark:text-text-primary-dark truncate">
                      FinEdge Solutions — SOC2 Platform
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-text-secondary-light dark:text-text-secondary-dark">
                    <span>AE: Priya Mehta</span>
                    <span>•</span>
                    <span>Close: 28 Sep</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-bold tabular-nums text-text-primary-light dark:text-text-primary-dark">₹18,00,000</span>
                  <div>
                    <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400">
                      NEGOTIATION (80%)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Intelligence Live Preview Card */}
          <div className="lg:col-span-5 rounded-lg border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-elevated-dark p-4 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-border-light dark:border-border-dark">
                <div className="flex items-center gap-1.5 text-lavender-400">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span className="text-xs font-bold uppercase tracking-wider font-mono">AI Copilot Analysis</span>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-lavender-500/10 text-lavender-400 border border-lavender-500/20 tabular-nums">
                  Score: 92/100
                </span>
              </div>

              <div className="mt-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-text-primary-light dark:text-text-primary-dark">Arjun Nambiar</span>
                  <span className="text-[10px] uppercase font-bold text-lavender-400 font-mono">
                    High Intent Level
                  </span>
                </div>
                <p className="text-[11px] text-text-secondary-light dark:text-text-secondary-dark mt-1 line-clamp-2">
                  Legal approved standard MSA. High response frequency with 3 active stakeholders engaged.
                </p>

                <div className="mt-3 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[11px] text-text-secondary-light dark:text-text-secondary-dark">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span>Cleared enterprise security checklist</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-text-secondary-light dark:text-text-secondary-dark">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span>Executive sponsor engaged in final pricing</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Velocity Warning Pill */}
            <div className="p-2.5 rounded-lg bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 flex items-start gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
              <div className="text-[11px] text-amber-400">
                <span className="font-semibold">Deal Velocity Alert: </span>
                <span>Nova Systems proposal has been awaiting review for 5 days. Recommended: Send customized ROI summary.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
