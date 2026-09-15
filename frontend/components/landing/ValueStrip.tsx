import React from 'react';
import {
  Users,
  GitPullRequest,
  ShieldCheck,
  BarChart3,
  Sparkles,
  CalendarCheck
} from 'lucide-react';

const CAPABILITIES = [
  { label: 'Lead Management', icon: Users, color: 'text-copper-600 dark:text-copper-400' },
  { label: 'Deal Pipeline', icon: GitPullRequest, color: 'text-copper-600 dark:text-copper-400' },
  { label: 'Team Collaboration', icon: ShieldCheck, color: 'text-plum-600 dark:text-plum-300' },
  { label: 'Sales Analytics', icon: BarChart3, color: 'text-copper-600 dark:text-copper-400' },
  { label: 'AI Intelligence', icon: Sparkles, color: 'text-lavender-600 dark:text-lavender-400' },
  { label: 'Follow-up Tracking', icon: CalendarCheck, color: 'text-emerald-600 dark:text-emerald-400' }
];

export const ValueStrip: React.FC = () => {
  return (
    <div className="border-y border-border-light dark:border-border-dark bg-surface-muted-light dark:bg-[#141117] py-8 scroll-reveal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs font-mono font-semibold uppercase tracking-wider text-text-tertiary-light dark:text-text-tertiary-dark mb-6">
          Everything your sales team needs to move deals forward.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {CAPABILITIES.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="group flex items-center justify-center gap-2.5 p-2.5 rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-elevated-dark text-text-primary-light dark:text-text-primary-dark text-xs font-medium hover:border-copper-500/40 hover:-translate-y-0.5 hover:shadow-card shadow-xs transition-all duration-200"
              >
                <Icon className={`w-4 h-4 ${item.color} shrink-0 group-hover:scale-110 transition-transform`} />
                <span className="truncate">{item.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
