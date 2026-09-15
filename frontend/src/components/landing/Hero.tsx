import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ChevronRight,
  Check,
  TrendingUp,
  Sparkles,
  Award,
  PhoneCall
} from 'lucide-react';
import { DashboardPreview } from './DashboardPreview';

export const Hero: React.FC = () => {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const handleScrollToFeatures = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = document.querySelector('#features');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="product" className="relative pt-10 pb-20 sm:pt-14 sm:pb-28 overflow-hidden">
      {/* Dynamic Atmospheric Lighting Glow (Behind Hero) */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[500px] -z-10 pointer-events-none">
        {/* Warm Copper Aura */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-copper-500/18 via-plum-600/10 to-transparent dark:from-copper-500/22 dark:via-plum-600/15 dark:to-transparent blur-3xl animate-pulse-glow" />
        {/* Soft Lavender Intelligence Accent */}
        <div className="absolute top-8 right-16 w-80 h-80 bg-lavender-500/15 dark:bg-lavender-500/10 rounded-full blur-3xl animate-float-delayed" />
      </div>

      {/* Subtle Blueprint Radial Grid Pattern */}
      <div className="absolute inset-0 -z-10 flex items-center justify-center opacity-35 dark:opacity-20 pointer-events-none">
        <div className="w-full h-full bg-[radial-gradient(#c08457_1px,transparent_1px)] dark:bg-[radial-gradient(#8e8292_1px,transparent_1px)] [background-size:28px_28px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Outer relative wrapper: sized so floating telemetry cards flank the sides with perfect symmetry */}
        <div className="relative max-w-4xl mx-auto">
          {/* ========================================================================= */}
          {/* FLOATING UI TELEMETRY CARDS (Symmetrically flanking, zero collision)      */}
          {/* ========================================================================= */}

          {/* Floating Card 1: Top-Left Flank — Live Closed Deal */}
          <div
            onMouseEnter={() => setHoveredCard('deal')}
            onMouseLeave={() => setHoveredCard(null)}
            className={`hidden xl:flex absolute -left-16 2xl:-left-22 top-10 z-20 items-center gap-3 p-3 rounded-xl border border-border-light dark:border-border-dark bg-surface-light/95 dark:bg-surface-elevated-dark/95 backdrop-blur-md shadow-elevated transition-all duration-300 animate-float-slow ${
              hoveredCard === 'deal' ? 'scale-105 border-copper-500/60 shadow-glow-copper' : ''
            }`}
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-500 shrink-0">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Deal Won
                </span>
                <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="text-xs font-bold text-text-primary-light dark:text-text-primary-dark">
                ₹18,50,000
              </div>
              <span className="text-[10px] text-text-tertiary-light dark:text-text-tertiary-dark truncate max-w-[130px] block font-mono">
                Apex Cloudworks • Enterprise
              </span>
            </div>
          </div>

          {/* Floating Card 2: Top-Right Flank — AI Deal Copilot Score */}
          <div
            onMouseEnter={() => setHoveredCard('ai')}
            onMouseLeave={() => setHoveredCard(null)}
            className={`hidden xl:flex absolute -right-16 2xl:-right-22 top-10 z-20 items-center gap-3 p-3 rounded-xl border border-border-light dark:border-border-dark bg-surface-light/95 dark:bg-surface-elevated-dark/95 backdrop-blur-md shadow-elevated transition-all duration-300 animate-float-delayed ${
              hoveredCard === 'ai' ? 'scale-105 border-lavender-500/60 shadow-glow-lavender' : ''
            }`}
          >
            <div className="w-9 h-9 rounded-lg bg-lavender-500/15 border border-lavender-500/30 flex items-center justify-center text-lavender-500 shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-lavender-600 dark:text-lavender-400">
                  AI Lead Score
                </span>
                <span className="text-[10px] font-mono font-black px-1.5 py-0.2 rounded bg-lavender-500/15 text-lavender-600 dark:text-lavender-400">
                  96/100
                </span>
              </div>
              <div className="text-xs font-bold text-text-primary-light dark:text-text-primary-dark">
                High Buying Intent
              </div>
              <span className="text-[10px] text-text-tertiary-light dark:text-text-tertiary-dark font-mono">
                ⚡ Follow-up draft ready
              </span>
            </div>
          </div>

          {/* Floating Card 3: Bottom-Left Flank — Realtime Rep Activity */}
          <div
            className="hidden xl:flex absolute -left-14 2xl:-left-18 bottom-12 z-20 items-center gap-3 px-3.5 py-2.5 rounded-xl border border-border-light dark:border-border-dark bg-surface-light/95 dark:bg-surface-elevated-dark/95 backdrop-blur-md shadow-card transition-all duration-300 animate-float-reverse hover:scale-105"
          >
            <div className="w-8 h-8 rounded-lg bg-copper-500/15 border border-copper-500/25 flex items-center justify-center text-copper-600 dark:text-copper-400 shrink-0">
              <PhoneCall className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-[9px] font-mono uppercase tracking-wider font-bold text-copper-600 dark:text-copper-400">
                Activity Feed
              </div>
              <div className="text-[11px] text-text-secondary-light dark:text-text-secondary-dark font-medium whitespace-nowrap">
                <span className="font-semibold text-text-primary-light dark:text-text-primary-dark">Priya M.</span> completed demo call
              </div>
              <span className="text-[9px] font-mono text-text-tertiary-light dark:text-text-tertiary-dark">
                Acme Corp • 2m ago
              </span>
            </div>
          </div>

          {/* Floating Card 4: Bottom-Right Flank — Team Quota Attainment */}
          <div
            className="hidden xl:flex absolute -right-14 2xl:-right-18 bottom-12 z-20 items-center gap-3 px-3.5 py-2.5 rounded-xl border border-border-light dark:border-border-dark bg-surface-light/95 dark:bg-surface-elevated-dark/95 backdrop-blur-md shadow-card transition-all duration-300 animate-float-slow hover:scale-105"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-500 shrink-0">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-[9px] font-mono uppercase text-emerald-600 dark:text-emerald-400 font-bold tracking-wider">
                Quota Velocity
              </div>
              <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                +38.4% this month
              </div>
              <span className="text-[9px] font-mono text-text-tertiary-light dark:text-text-tertiary-dark">
                Paced ahead of Q3 goal
              </span>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* MIDNIGHT PLUM × COPPER ARCHITECTURAL HERO CARD                            */}
          {/* ========================================================================= */}
          <div className="relative rounded-3xl p-8 sm:p-12 lg:py-16 lg:px-14 border border-copper-500/30 dark:border-copper-500/35 bg-gradient-to-b from-white/95 via-copper-50/20 to-plum-50/20 dark:from-[#141117]/95 dark:via-[#1A151D]/90 dark:to-[#0C0A0F]/95 shadow-card overflow-hidden backdrop-blur-xs transition-all duration-500 hover:border-copper-500/50">
            {/* Animated Shimmer Sweep Top Border Beam */}
            <div className="absolute top-0 left-0 right-0 h-[2px] overflow-hidden pointer-events-none">
              <div className="w-1/3 h-full bg-gradient-to-r from-transparent via-copper-400 to-transparent animate-shimmer-sweep" />
            </div>

            {/* Corner Architectural Registration Marks — Crisp, 100% visible, unobstructed */}
            <div className="absolute top-4 left-4 w-3.5 h-3.5 border-t-2 border-l-2 border-copper-500/60 dark:border-copper-400/70 pointer-events-none z-10" />
            <div className="absolute top-4 right-4 w-3.5 h-3.5 border-t-2 border-r-2 border-copper-500/60 dark:border-copper-400/70 pointer-events-none z-10" />
            <div className="absolute bottom-4 left-4 w-3.5 h-3.5 border-b-2 border-l-2 border-copper-500/60 dark:border-copper-400/70 pointer-events-none z-10" />
            <div className="absolute bottom-4 right-4 w-3.5 h-3.5 border-b-2 border-r-2 border-copper-500/60 dark:border-copper-400/70 pointer-events-none z-10" />

            {/* Geometric Crosshair Grid Pattern with Radial Vignette Mask */}
            <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
              {/* Subtle Inner Glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-80 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-copper-500/20 via-plum-500/10 to-transparent dark:from-copper-500/25 dark:via-plum-600/15 dark:to-transparent blur-2xl" />

              <svg className="w-full h-full opacity-60 dark:opacity-35" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="executive-grid" width="36" height="36" patternUnits="userSpaceOnUse">
                    {/* Grid Lines */}
                    <path d="M 36 0 L 0 0 0 36" fill="none" stroke="currentColor" strokeWidth="0.75" className="text-copper-900/15 dark:text-copper-400/20" strokeDasharray="3 3" />
                    {/* Micro Intersection Crosshairs */}
                    <path d="M -3 0 L 3 0 M 0 -3 L 0 3" fill="none" stroke="currentColor" strokeWidth="1" className="text-copper-600/40 dark:text-copper-400/60" />
                    {/* Center Node Dot */}
                    <circle cx="18" cy="18" r="0.75" fill="currentColor" className="text-copper-600/30 dark:text-copper-400/40" />
                  </pattern>
                  <radialGradient id="panel-vignette" cx="50%" cy="45%" r="55%">
                    <stop offset="0%" stopColor="white" stopOpacity="1" />
                    <stop offset="70%" stopColor="white" stopOpacity="0.65" />
                    <stop offset="100%" stopColor="white" stopOpacity="0" />
                  </radialGradient>
                  <mask id="panel-mask">
                    <rect width="100%" height="100%" fill="url(#panel-vignette)" />
                  </mask>
                </defs>
                <rect width="100%" height="100%" fill="url(#executive-grid)" mask="url(#panel-mask)" />
              </svg>
            </div>

            {/* Hero Copy Content — Constrained max-width guarantees zero collision with side cards */}
            <div className="relative max-w-xl mx-auto text-center z-10 px-2 sm:px-4">
              {/* Trust Pill with live radar ping */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-surface-light/95 dark:bg-surface-elevated-dark/95 text-text-secondary-light dark:text-text-secondary-dark border border-copper-300/70 dark:border-border-dark mb-6 shadow-xs backdrop-blur-sm animate-fade-in-up">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span>Built for modern B2B sales teams</span>
                <ChevronRight className="w-3 h-3 text-text-tertiary-light dark:text-text-tertiary-dark" />
              </div>

              {/* Headline with physical typography and guaranteed two-line clean wrap */}
              <h1 className="text-3xl sm:text-4xl lg:text-[46px] font-extrabold tracking-tight text-text-primary-light dark:text-text-primary-dark leading-[1.18] animate-fade-in-up">
                <span className="block">Turn Every Lead Into a</span>
                <span className="text-copper-600 dark:text-copper-400 bg-gradient-to-r from-copper-600 via-copper-500 to-copper-400 dark:from-copper-400 dark:to-copper-300 bg-clip-text text-transparent block mt-1.5">
                  Clear Next Step.
                </span>
              </h1>

              {/* Subheading */}
              <p className="mt-5 text-base sm:text-lg text-text-secondary-light dark:text-text-secondary-dark leading-relaxed max-w-lg mx-auto animate-fade-in-up" style={{ animationDelay: '150ms' }}>
                LeadFlow brings your leads, deals, pipeline, team activity, and AI-powered sales intelligence into one focused workspace.
              </p>

              {/* Action CTAs */}
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5 animate-fade-in-up" style={{ animationDelay: '250ms' }}>
                <Link
                  to="/login"
                  className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-copper-600 hover:bg-copper-700 active:bg-copper-800 dark:bg-copper-500 dark:hover:bg-copper-600 rounded-lg shadow-sm shadow-copper-500/25 hover:shadow-glow-copper transition-all active:scale-[0.98]"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>

                <a
                  href="#features"
                  onClick={handleScrollToFeatures}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark bg-surface-light/80 dark:bg-surface-elevated-dark/80 hover:bg-surface-light dark:hover:bg-surface-dark border border-border-light dark:border-border-dark hover:border-copper-500/40 rounded-lg transition-all active:scale-[0.98] backdrop-blur-sm"
                >
                  <span>Explore the CRM</span>
                </a>
              </div>

              {/* Trust Guarantees Checklist Row */}
              <div className="mt-8 pt-2 flex flex-wrap items-center justify-center gap-y-2.5 gap-x-6 text-xs text-text-tertiary-light dark:text-text-tertiary-dark animate-fade-in-up" style={{ animationDelay: '350ms' }}>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Full 3-tier role visibility</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-lavender-500" />
                  <span>Embedded AI sales insights</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Organization-scoped data access</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Dashboard Preview Card with scroll reveal */}
        <div className="mt-14 sm:mt-18 scroll-reveal">
          <DashboardPreview />
        </div>
      </div>
    </section>
  );
};

