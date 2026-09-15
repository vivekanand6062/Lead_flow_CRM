import React from 'react';
import {
  KeyRound,
  ShieldCheck,
  Building2,
  FileText,
  Lock,
  Server
} from 'lucide-react';

const SECURITY_PILLARS = [
  {
    icon: KeyRound,
    title: 'Stateless JWT Authentication',
    description: 'Cryptographically signed JSON Web Tokens with configurable expiration (7-day default) and strict header bearer verification on every API request.'
  },
  {
    icon: ShieldCheck,
    title: 'Server-Enforced Role Guards',
    description: 'Express.js authorization middleware strictly enforces role boundaries (Admin, Manager, Sales Agent) before any controller executes.'
  },
  {
    icon: Building2,
    title: 'Organization-Scoped Access',
    description: 'Every database query automatically verifies and scopes records by organization identifier, ensuring complete separation of operational data.'
  },
  {
    icon: FileText,
    title: 'Administrative Activity Logging',
    description: 'Key executive actions—such as manager onboarding, credential updates, and status toggles—are recorded into a centralized audit log with timestamps.'
  }
];

export const SecuritySection: React.FC = () => {
  return (
    <section id="security" className="py-16 sm:py-24 border-b border-border-light dark:border-border-dark bg-surface-canvas-light dark:bg-surface-canvas-dark scroll-reveal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-surface-light dark:bg-surface-elevated-dark text-text-secondary-light dark:text-text-secondary-dark border border-border-light dark:border-border-dark mb-3 shadow-xs font-mono">
            <Lock className="w-3.5 h-3.5 text-copper-600 dark:text-copper-400" />
            <span>Enterprise Security Architecture</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-text-primary-light dark:text-text-primary-dark">
            Engineered with strict access discipline.
          </h2>
          <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-3 leading-relaxed">
            LeadFlow implements modern security best practices at the API, authentication, and database layers to ensure data integrity and organizational boundaries.
          </p>
        </div>

        {/* 4 Security Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {SECURITY_PILLARS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-elevated-dark p-6 flex flex-col justify-between shadow-card hover:border-copper-500/40 transition-colors"
              >
                <div>
                  <div className="w-10 h-10 rounded-lg bg-copper-500/10 text-copper-600 dark:text-copper-400 border border-copper-500/25 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5" />
                  </div>

                  <h3 className="text-sm font-bold text-text-primary-light dark:text-text-primary-dark">
                    {item.title}
                  </h3>

                  <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 pt-3 border-t border-border-light dark:border-border-dark flex items-center justify-between text-[11px] font-mono text-text-tertiary-light dark:text-text-tertiary-dark">
                  <span>Backend Verified</span>
                  <Server className="w-3.5 h-3.5 text-copper-400" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
