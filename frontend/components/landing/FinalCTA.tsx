import React from 'react';
import Link from 'next/link';
import { ArrowRight, Layers } from 'lucide-react';

export const FinalCTA: React.FC = () => {
  return (
    <section className="py-20 sm:py-28 relative overflow-hidden bg-surface-canvas-light dark:bg-surface-canvas-dark border-t border-border-light dark:border-border-dark scroll-reveal">
      {/* Background Copper Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[250px] bg-[radial-gradient(ellipse_at_center,rgba(192,132,87,0.18),transparent_70%)] pointer-events-none animate-pulse-glow" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="w-12 h-12 rounded-xl bg-copper-600 dark:bg-copper-500 flex items-center justify-center text-white mx-auto mb-6 shadow-glow-copper border border-copper-400/30 animate-float-slow">
          <Layers className="w-6 h-6" />
        </div>

        <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-text-primary-light dark:text-text-primary-dark">
          Give your sales team one place to move deals forward.
        </h2>

        <p className="mt-4 text-base sm:text-lg text-text-secondary-light dark:text-text-secondary-dark max-w-2xl mx-auto leading-relaxed">
          Manage leads, understand your pipeline, and act on the opportunities that matter.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <Link
            href="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-copper-600 hover:bg-copper-700 active:bg-copper-800 dark:bg-copper-500 dark:hover:bg-copper-600 rounded-lg shadow-sm shadow-copper-500/20 transition-all active:scale-[0.98]"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark bg-surface-light dark:bg-surface-elevated-dark hover:bg-surface-muted-light dark:hover:bg-surface-dark border border-border-light dark:border-border-dark hover:border-copper-500/40 rounded-lg transition-colors"
          >
            <span>Sign In to Workspace</span>
          </Link>
        </div>

        <p className="text-xs font-mono text-text-tertiary-light dark:text-text-tertiary-dark mt-5">
          Unified authentication with instant demo account evaluation.
        </p>
      </div>
    </section>
  );
};
