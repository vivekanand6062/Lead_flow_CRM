import React from 'react';
import { Building2, Users2, CheckCircle2 } from 'lucide-react';

const STEPS = [
  {
    step: '01',
    title: 'Complete your organization setup',
    icon: Building2,
    description: 'Initialize your company profile, currency preferences, and primary administrator account through the guided setup wizard.'
  },
  {
    step: '02',
    title: 'Create and manage sales teams',
    icon: Users2,
    description: 'Add sales managers and organize sales agents into focused teams with customized quota targets and clear territory assignments.'
  },
  {
    step: '03',
    title: 'Turn pipeline activity into action',
    icon: CheckCircle2,
    description: 'Capture inbound leads, qualify them with AI-assisted scoring, and maintain momentum using structured follow-up tracking.'
  }
];

export const HowItWorks: React.FC = () => {
  return (
    <section className="py-16 sm:py-24 border-b border-border-light dark:border-border-dark bg-surface-canvas-light dark:bg-surface-canvas-dark scroll-reveal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center mb-14">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-copper-600 dark:text-copper-400">
            Operational Roadmap
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-text-primary-light dark:text-text-primary-dark mt-2">
            Simple to adopt. Built to scale.
          </h2>
          <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-3 leading-relaxed">
            Get your sales organization up and running without bloated setup cycles or complex IT provisioning.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {STEPS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="relative rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-elevated-dark p-6 sm:p-8 flex flex-col justify-between shadow-card hover:border-copper-500/30 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-2xl font-black text-copper-600 dark:text-copper-400 tracking-tight font-mono tabular-nums">
                      {item.step}
                    </span>
                    <div className="w-10 h-10 rounded-lg bg-surface-muted-light dark:bg-surface-dark flex items-center justify-center text-copper-500 dark:text-copper-400 border border-border-light dark:border-border-dark">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-text-primary-light dark:text-text-primary-dark mb-2">
                    {item.title}
                  </h3>

                  <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-border-light dark:border-border-dark text-[11px] font-mono text-text-tertiary-light dark:text-text-tertiary-dark">
                  Time to value: Instant
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
