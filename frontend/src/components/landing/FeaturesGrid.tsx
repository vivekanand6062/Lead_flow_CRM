import React from 'react';
import {
  Users,
  Target,
  Kanban,
  Building2,
  CalendarCheck,
  UserCheck,
  BarChart3,
  ShieldCheck
} from 'lucide-react';

const FEATURES = [
  {
    icon: Users,
    title: 'Lead Management',
    tag: '7 Qualification Stages',
    description: 'Capture, qualify, score, and reassign leads across seven stages from initial contact to won or lost.'
  },
  {
    icon: Target,
    title: 'Deal Management',
    tag: 'Probability & Value Tracking',
    description: 'Track deals with expected close dates, revenue amounts, win probabilities, and associated client accounts.'
  },
  {
    icon: Kanban,
    title: 'Visual Sales Pipeline',
    tag: 'Interactive Kanban Board',
    description: 'Monitor pipeline momentum with responsive stage-by-stage swimlanes and real-time revenue summaries.'
  },
  {
    icon: Building2,
    title: 'Contact & Company Directory',
    tag: '360° Account Context',
    description: 'Centralize stakeholder directories, decision-maker roles, company headcounts, and annual revenues in one view.'
  },
  {
    icon: CalendarCheck,
    title: 'Activities & Follow-ups',
    tag: 'Structured Follow-up Tracking',
    description: 'Log sales calls, meetings, and emails with categorized follow-up task queues split into Overdue, Today, and Upcoming.'
  },
  {
    icon: UserCheck,
    title: 'Team Management',
    tag: 'Manager-to-Agent Hierarchy',
    description: 'Create and manage sales agents, establish individual quota targets, and reassign stalled leads seamlessly.'
  },
  {
    icon: BarChart3,
    title: 'Sales Analytics',
    tag: 'Pipeline Velocity Metrics',
    description: 'Evaluate win/loss trends, stage conversion rates, quarterly revenue forecasts, and rep leaderboards.'
  },
  {
    icon: ShieldCheck,
    title: 'Role-Based Access Control',
    tag: 'Organization-Scoped Access',
    description: 'Maintain strict boundaries across Admin, Manager, and Sales Agent workspaces with server-enforced role guards.'
  }
];

export const FeaturesGrid: React.FC = () => {
  return (
    <section id="features" className="py-16 sm:py-24 border-b border-border-light dark:border-border-dark bg-surface-canvas-light dark:bg-surface-canvas-dark scroll-reveal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center mb-14">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-copper-600 dark:text-copper-400">
            Platform Capabilities
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-text-primary-light dark:text-text-primary-dark mt-2">
            Built for modern sales operations.
          </h2>
          <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-3">
            Every tool needed to run outbound pipelines, manage rep activity, and forecast revenue reliably.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className="group relative rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-elevated-dark p-5 flex flex-col justify-between hover:border-copper-500/50 hover:-translate-y-1 hover:shadow-glow-copper shadow-card transition-all duration-300"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-9 h-9 rounded-lg bg-surface-muted-light dark:bg-surface-dark border border-border-light dark:border-border-dark flex items-center justify-center text-text-secondary-light dark:text-text-secondary-dark group-hover:bg-copper-500/10 group-hover:text-copper-500 dark:group-hover:text-copper-400 transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-surface-muted-light dark:bg-surface-dark text-text-secondary-light dark:text-text-secondary-dark border border-border-light dark:border-border-dark">
                      {feat.tag}
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark group-hover:text-copper-600 dark:group-hover:text-copper-400 transition-colors">
                    {feat.title}
                  </h3>

                  <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-2 leading-relaxed">
                    {feat.description}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-border-light dark:border-border-dark flex items-center justify-between text-[11px] font-mono text-text-tertiary-light dark:text-text-tertiary-dark">
                  <span>Production Ready</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
