import React from 'react';
import {
  ShieldAlert,
  Users2,
  Briefcase,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

const ROLES = [
  {
    role: 'ADMIN',
    tagline: 'See the entire organization.',
    badgeColor: 'bg-copper-500/10 text-copper-600 dark:text-copper-400 border-copper-500/25',
    icon: ShieldAlert,
    capabilities: [
      'Executive dashboard tracking total closed revenue and pipeline distribution',
      'Create and manage sales managers and set department quotas',
      'Organization settings, currency selection, and company profile',
      'Administrative activity logging for operational accountability',
      'Strict security boundary: Admins oversee managers, not individual reps'
    ]
  },
  {
    role: 'MANAGER',
    tagline: 'Run your sales team.',
    badgeColor: 'bg-plum-500/10 text-plum-600 dark:text-plum-300 border-plum-500/25',
    icon: Users2,
    capabilities: [
      'Team quota attainment bar, aggregate pipeline, and revenue velocity',
      'Create and manage sales agents within assigned team rosters',
      'Reassign inbound leads and balance agent workload across stages',
      'Team-wide Kanban pipeline board and deal progress visibility',
      'Monitor overdue and upcoming team follow-up commitments'
    ]
  },
  {
    role: 'SALES AGENT',
    tagline: 'Focus on the deals that matter.',
    badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25',
    icon: Briefcase,
    capabilities: [
      'Personal "My Leads" view focused strictly on assigned customer accounts',
      'Personal visual pipeline board with stage probability weighting',
      'Structured follow-up tracking with Overdue, Today, and Upcoming queues',
      'Activity timeline logging for calls, meetings, and email communication',
      'AI Sales Copilot for real-time lead scoring and contextual follow-up drafting'
    ]
  }
];

export const RoleWorkspaces: React.FC = () => {
  return (
    <section id="roles" className="py-16 sm:py-24 border-b border-border-light dark:border-border-dark bg-surface-canvas-light dark:bg-surface-canvas-dark scroll-reveal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center mb-14">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-copper-600 dark:text-copper-400">
            Role-Based Workspaces
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-text-primary-light dark:text-text-primary-dark mt-2">
            Tailored workspaces for every sales role.
          </h2>
          <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-3 leading-relaxed">
            LeadFlow automatically configures the interface based on your position—giving executives visibility, managers control, and agents focus.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {ROLES.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.role}
                className="rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-elevated-dark p-6 sm:p-7 flex flex-col justify-between shadow-card hover:border-copper-500/40 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold uppercase tracking-wider border ${item.badgeColor}`}>
                      {item.role}
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-surface-muted-light dark:bg-surface-dark flex items-center justify-center text-text-secondary-light dark:text-text-secondary-dark border border-border-light dark:border-border-dark">
                      <Icon className="w-4 h-4 text-copper-400" />
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark mt-1">
                    {item.tagline}
                  </h3>

                  <div className="mt-6 space-y-3">
                    {item.capabilities.map((cap, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
                          {cap}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-border-light dark:border-border-dark flex items-center justify-between">
                  <span className="text-xs font-mono text-text-tertiary-light dark:text-text-tertiary-dark">Scoped access</span>
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-copper-600 dark:text-copper-400 hover:underline"
                  >
                    <span>Try {item.role.toLowerCase()} demo</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
