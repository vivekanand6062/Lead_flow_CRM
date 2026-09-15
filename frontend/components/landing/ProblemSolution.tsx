import React from 'react';
import {
  FileSpreadsheet,
  Clock,
  EyeOff,
  ArrowRight,
  Layers,
  CheckCircle2
} from 'lucide-react';

const PROBLEMS = [
  {
    icon: FileSpreadsheet,
    title: 'Leads get lost in silos',
    description: 'Inbound inquiries and partner referrals scatter across personal inboxes and spreadsheets with zero central tracking.'
  },
  {
    icon: Clock,
    title: 'Follow-ups are missed',
    description: 'Deals stall because reps lack a structured daily task board, forgetting crucial callback commitments and timing.'
  },
  {
    icon: EyeOff,
    title: 'Managers lack visibility',
    description: 'Sales leadership relies on guesswork during pipeline reviews rather than seeing real stage velocity and quota attainment.'
  }
];

const SOLUTIONS = [
  '7-stage unified qualification workflow from inquiry to close',
  'Strict role-based boundaries keeping agents focused on their accounts',
  'Structured follow-up board with Overdue, Today, and Upcoming tasks',
  'AI-assisted deal risk scoring that surfaces stalled opportunities early'
];

export const ProblemSolution: React.FC = () => {
  return (
    <section className="py-16 sm:py-24 border-b border-border-light dark:border-border-dark bg-surface-canvas-light dark:bg-surface-canvas-dark scroll-reveal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center mb-12 sm:mb-16">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-copper-600 dark:text-copper-400">
            The Workflow Friction
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-text-primary-light dark:text-text-primary-dark mt-2">
            Sales shouldn&apos;t live across spreadsheets, inboxes, and disconnected tools.
          </h2>
          <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-3">
            Fragmented sales operations lead to dropped deals, delayed responses, and blind revenue forecasting.
          </p>
        </div>

        {/* Comparison Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Fragmented Workflow Box (The Problem) */}
          <div className="lg:col-span-6 rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-elevated-dark p-6 sm:p-8 flex flex-col justify-between shadow-card">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-xs font-semibold text-crimson-400 bg-crimson-500/10 border border-crimson-500/20 mb-6 font-mono">
                <span>The Fragmented Reality</span>
              </div>

              <div className="space-y-6">
                {PROBLEMS.map((prob) => {
                  const Icon = prob.icon;
                  return (
                    <div key={prob.title} className="flex items-start gap-4">
                      <div className="p-2 rounded-lg bg-crimson-500/10 text-crimson-400 shrink-0 mt-0.5">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">
                          {prob.title}
                        </h4>
                        <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-1 leading-relaxed">
                          {prob.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-border-light dark:border-border-dark text-xs text-text-tertiary-light dark:text-text-tertiary-dark font-medium">
              Result: Inconsistent rep performance and unpredictable quarter-end results.
            </div>
          </div>

          {/* LeadFlow Solution Box */}
          <div className="lg:col-span-6 rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-elevated-dark p-6 sm:p-8 flex flex-col justify-between shadow-card hover:border-copper-500/30 transition-colors">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-xs font-semibold text-copper-600 dark:text-copper-400 bg-copper-500/10 border border-copper-500/25 mb-6 font-mono">
                <Layers className="w-3.5 h-3.5" />
                <span>The LeadFlow Approach</span>
              </div>

              <h3 className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark mb-3">
                One focused operations engine for your entire revenue team.
              </h3>
              <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark leading-relaxed mb-6">
                From the moment a lead enters the pipeline to contract execution, LeadFlow ensures every opportunity has an assigned agent, clear qualification signals, and an immediate next action.
              </p>

              <div className="space-y-3.5">
                {SOLUTIONS.map((sol) => (
                  <div key={sol} className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-copper-600 dark:text-copper-400 shrink-0 mt-0.5" />
                    <span className="text-xs text-text-primary-light dark:text-text-primary-dark font-medium">
                      {sol}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-border-light dark:border-border-dark flex items-center justify-between">
              <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark font-medium">
                Clarity for leadership • Momentum for reps
              </span>
              <div className="flex items-center gap-1 text-xs font-semibold text-copper-600 dark:text-copper-400">
                <span>Unified execution</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
