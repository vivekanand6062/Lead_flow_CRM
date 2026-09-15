'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  GitPullRequest,
  Building2,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Zap,
  CheckCircle2,
  Flame,
  ArrowRight
} from 'lucide-react';

interface Deal {
  id: string;
  title: string;
  company: string;
  value: string;
  probability: number;
  closeDate: string;
  risk: 'GOOD' | 'MODERATE' | 'AT_RISK';
  agent: string;
  highlighted?: boolean;
}

interface DemoStage {
  id: string;
  name: string;
  color: string;
  deals: Deal[];
}

const INITIAL_STAGES: DemoStage[] = [
  {
    id: 'NEW',
    name: 'New Inquiry',
    color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20',
    deals: [
      {
        id: 'd-1',
        title: 'Retail Store Dispatch Suite',
        company: 'Starlight Retail',
        value: '₹3,50,000',
        probability: 20,
        closeDate: '15 Oct',
        risk: 'GOOD',
        agent: 'Rohan Gupta'
      }
    ]
  },
  {
    id: 'CONTACTED',
    name: 'Contacted',
    color: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20',
    deals: [
      {
        id: 'd-2',
        title: 'Regional Fleet Tracking',
        company: 'Zenith Logistics',
        value: '₹7,50,000',
        probability: 35,
        closeDate: '08 Oct',
        risk: 'GOOD',
        agent: 'Amit Verma'
      }
    ]
  },
  {
    id: 'QUALIFIED',
    name: 'Qualified',
    color: 'bg-copper-500/10 text-copper-600 dark:text-copper-400 border border-copper-500/20',
    deals: [
      {
        id: 'd-3',
        title: 'Pipeline Quota Tracker',
        company: 'Apex Cloudworks',
        value: '₹4,20,000',
        probability: 50,
        closeDate: '02 Oct',
        risk: 'GOOD',
        agent: 'Rohan Gupta'
      }
    ]
  },
  {
    id: 'PROPOSAL',
    name: 'Proposal Sent',
    color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
    deals: [
      {
        id: 'd-4',
        title: 'Sales Automation Engine',
        company: 'Nova Systems',
        value: '₹8,50,000',
        probability: 60,
        closeDate: '30 Sep',
        risk: 'MODERATE',
        agent: 'Priya Mehta'
      }
    ]
  },
  {
    id: 'NEGOTIATION',
    name: 'Negotiation',
    color: 'bg-plum-500/15 text-plum-600 dark:text-plum-300 border border-plum-500/25',
    deals: [
      {
        id: 'd-5',
        title: 'Enterprise CRM Deployment',
        company: 'XYZ Technologies',
        value: '₹15,00,000',
        probability: 75,
        closeDate: '21 Sep',
        risk: 'GOOD',
        agent: 'Amit Verma',
        highlighted: true
      },
      {
        id: 'd-6',
        title: 'SOC2 Security Platform',
        company: 'FinEdge Solutions',
        value: '₹18,00,000',
        probability: 80,
        closeDate: '28 Sep',
        risk: 'GOOD',
        agent: 'Priya Mehta'
      }
    ]
  },
  {
    id: 'WON',
    name: 'Closed Won',
    color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
    deals: [
      {
        id: 'd-7',
        title: 'Multi-Brand CRM License',
        company: 'Acme Digital',
        value: '₹12,00,000',
        probability: 100,
        closeDate: '12 Sep',
        risk: 'GOOD',
        agent: 'Amit Verma'
      },
      {
        id: 'd-8',
        title: 'Growth Tier Annual',
        company: 'CloudMatrix Global',
        value: '₹6,00,000',
        probability: 100,
        closeDate: '10 Sep',
        risk: 'GOOD',
        agent: 'Ananya Desai'
      }
    ]
  }
];

export const PipelineShowcase: React.FC = () => {
  const [stages, setStages] = useState<DemoStage[]>(INITIAL_STAGES);
  const [activeStageId, setActiveStageId] = useState<string>('PROPOSAL');
  const [animatingDealId, setAnimatingDealId] = useState<string | null>(null);
  const [justAdvanced, setJustAdvanced] = useState<string | null>('⚡ Live continuous deal flow active');
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(true);
  const [stepCounter, setStepCounter] = useState<number>(0);
  const stepRef = useRef<number>(0);

  // Core progression step for continuous automated deal movement
  const advancePipelineStep = useCallback(() => {
    stepRef.current = (stepRef.current + 1) % 6;
    const nextStep = stepRef.current;
    setStepCounter(nextStep);

    setStages(prevStages => {
      // Deep copy of stages to avoid state mutations
      const newStages: DemoStage[] = prevStages.map(stage => ({
        ...stage,
        deals: stage.deals.map(d => ({ ...d, highlighted: false }))
      }));

      if (nextStep === 1) {
        // STEP 1: Move XYZ Technologies from Negotiation -> Closed Won (Celebration)
        const negStage = newStages.find(s => s.id === 'NEGOTIATION');
        const wonStage = newStages.find(s => s.id === 'WON');
        const xyzDeal = negStage?.deals.find(d => d.id === 'd-5');

        if (negStage && wonStage && xyzDeal) {
          negStage.deals = negStage.deals.filter(d => d.id !== 'd-5');
          const updatedDeal: Deal = {
            ...xyzDeal,
            probability: 100,
            highlighted: true
          };
          wonStage.deals = [updatedDeal, ...wonStage.deals];
          setAnimatingDealId('d-5');
          setJustAdvanced('🎉 Deal Won! XYZ Technologies closed at ₹15,00,000');
        }
      } else if (nextStep === 2) {
        // STEP 2: Advance Nova Systems from Proposal Sent -> Negotiation
        const propStage = newStages.find(s => s.id === 'PROPOSAL');
        const negStage = newStages.find(s => s.id === 'NEGOTIATION');
        const novaDeal = propStage?.deals.find(d => d.id === 'd-4');

        if (propStage && negStage && novaDeal) {
          propStage.deals = propStage.deals.filter(d => d.id !== 'd-4');
          const updatedDeal: Deal = {
            ...novaDeal,
            probability: 80,
            highlighted: true
          };
          negStage.deals = [updatedDeal, ...negStage.deals];
          setAnimatingDealId('d-4');
          setJustAdvanced('⚡ AI recommended Nova Systems -> Stage: Negotiation (80% prob)');
        }
      } else if (nextStep === 3) {
        // STEP 3: Advance Apex Cloudworks from Qualified -> Proposal Sent
        const qualStage = newStages.find(s => s.id === 'QUALIFIED');
        const propStage = newStages.find(s => s.id === 'PROPOSAL');
        const apexDeal = qualStage?.deals.find(d => d.id === 'd-3');

        if (qualStage && propStage && apexDeal) {
          qualStage.deals = qualStage.deals.filter(d => d.id !== 'd-3');
          const updatedDeal: Deal = {
            ...apexDeal,
            probability: 65,
            highlighted: true
          };
          propStage.deals = [updatedDeal, ...propStage.deals];
          setAnimatingDealId('d-3');
          setJustAdvanced('📋 Proposal delivered to Apex Cloudworks (₹4,20,000)');
        }
      } else if (nextStep === 4) {
        // STEP 4: Advance Zenith Logistics from Contacted -> Qualified
        const contactStage = newStages.find(s => s.id === 'CONTACTED');
        const qualStage = newStages.find(s => s.id === 'QUALIFIED');
        const zenithDeal = contactStage?.deals.find(d => d.id === 'd-2');

        if (contactStage && qualStage && zenithDeal) {
          contactStage.deals = contactStage.deals.filter(d => d.id !== 'd-2');
          const updatedDeal: Deal = {
            ...zenithDeal,
            probability: 50,
            highlighted: true
          };
          qualStage.deals = [updatedDeal, ...qualStage.deals];
          setAnimatingDealId('d-2');
          setJustAdvanced('✓ Zenith Logistics budget verified by Rohan Gupta');
        }
      } else if (nextStep === 5) {
        // STEP 5: Inbound enterprise deal arrives in New Inquiry
        const newStage = newStages.find(s => s.id === 'NEW');
        if (newStage && !newStage.deals.some(d => d.id === 'd-inbound')) {
          const inboundDeal: Deal = {
            id: 'd-inbound',
            title: 'OmniPulse AI Orchestration',
            company: 'OmniPulse Global',
            value: '₹22,50,000',
            probability: 25,
            closeDate: '24 Nov',
            risk: 'GOOD',
            agent: 'Priya Mehta',
            highlighted: true
          };
          newStage.deals = [inboundDeal, ...newStage.deals];
          setAnimatingDealId('d-inbound');
          setJustAdvanced('✨ Inbound enterprise lead captured • OmniPulse Global (₹22,50,000)');
        }
      } else {
        // STEP 0: Reset cycle back to initial simulation cleanly
        setJustAdvanced('🔄 Pipeline cycle refreshed • Continuous simulation active');
        return INITIAL_STAGES.map(s => ({
          ...s,
          deals: s.deals.map(d => ({ ...d }))
        }));
      }

      return newStages;
    });

    setTimeout(() => setAnimatingDealId(null), 850);
  }, []);

  // Continuous Automatic Motion Interval (runs continuously every 2.8s without pause)
  useEffect(() => {
    if (!isAutoPlaying) return;

    const timer = setInterval(() => {
      advancePipelineStep();
    }, 2800);

    return () => clearInterval(timer);
  }, [isAutoPlaying, advancePipelineStep]);

  // Manual Trigger: Step Next
  const handleManualAdvance = () => {
    advancePipelineStep();
  };

  // Manual Reset
  const handleResetPipeline = () => {
    stepRef.current = 0;
    setStages(INITIAL_STAGES);
    setStepCounter(0);
    setJustAdvanced('Pipeline reset to initial simulation state');
    setTimeout(() => setJustAdvanced(null), 2500);
  };

  return (
    <section id="pipeline" className="py-16 sm:py-24 border-b border-border-light dark:border-border-dark bg-surface-canvas-light dark:bg-surface-canvas-dark scroll-reveal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-copper-500/10 text-copper-600 dark:text-copper-400 border border-copper-500/20 mb-3 shadow-xs">
            <GitPullRequest className="w-3.5 h-3.5" />
            <span>Continuous Autonomous Pipeline</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-text-primary-light dark:text-text-primary-dark">
            Visual kanban with real-time deal motion.
          </h2>
          <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-3 leading-relaxed">
            Every deal moves automatically across defined lifecycle stages, backed by weighted probability metrics and instant health telemetry.
          </p>
        </div>

        {/* Mobile Stage Selector Tabs */}
        <div className="md:hidden flex items-center gap-1.5 overflow-x-auto pb-3 mb-4 no-scrollbar">
          {stages.map((st) => (
            <button
              key={st.id}
              onClick={() => setActiveStageId(st.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                activeStageId === st.id
                  ? 'bg-copper-600 text-white dark:bg-copper-500 font-semibold shadow-xs'
                  : 'bg-surface-light dark:bg-surface-elevated-dark text-text-secondary-light dark:text-text-secondary-dark border border-border-light dark:border-border-dark'
              }`}
            >
              {st.name} ({st.deals.length})
            </button>
          ))}
        </div>

        {/* Full Kanban Board Container — Continuous Autonomous Motion */}
        <div className="relative rounded-2xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-elevated-dark p-4 sm:p-6 shadow-card overflow-hidden">
          {/* Continuous Velocity Shimmer Beam */}
          <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-border-light/40 dark:border-border-dark/40 overflow-hidden pointer-events-none">
            <div className="w-1/3 h-full bg-gradient-to-r from-copper-500 via-amber-400 to-emerald-500 animate-shimmer-sweep" />
          </div>

          {/* Header Controls & Interactive Simulation Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border-light dark:border-border-dark text-xs">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                </span>
                <span className="font-bold text-text-primary-light dark:text-text-primary-dark uppercase tracking-wider font-mono">
                  Enterprise Pipeline Board
                </span>
              </div>

              {/* Status Ticker Badge */}
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono border bg-surface-muted-light dark:bg-surface-dark border-border-light dark:border-border-dark">
                {isAutoPlaying ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <Zap className="w-2.5 h-2.5 fill-current animate-pulse" />
                    Live Continuous Motion
                  </span>
                ) : (
                  <span className="text-text-tertiary-light dark:text-text-tertiary-dark font-semibold">
                    Simulation Paused
                  </span>
                )}
              </div>

              {justAdvanced && (
                <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 animate-fade-in-up">
                  <CheckCircle2 className="w-3 h-3 shrink-0 text-emerald-500" />
                  <span className="truncate max-w-[280px] lg:max-w-md">{justAdvanced}</span>
                </span>
              )}
            </div>

            {/* Simulation Playback & Action Controls */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              {/* Play / Pause Toggle Button */}
              <button
                onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                  isAutoPlaying
                    ? 'border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-elevated-dark text-text-secondary-light dark:text-text-secondary-dark hover:border-copper-500/50'
                    : 'border-emerald-500/50 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                }`}
                title={isAutoPlaying ? 'Pause continuous auto-motion' : 'Resume continuous auto-motion'}
              >
                {isAutoPlaying ? (
                  <>
                    <Pause className="w-3 h-3 fill-current" />
                    <span className="hidden sm:inline">Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3 fill-current" />
                    <span className="hidden sm:inline">Resume</span>
                  </>
                )}
              </button>

              {/* Manual Next Step Button */}
              <button
                onClick={handleManualAdvance}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-copper-600 hover:bg-copper-700 active:bg-copper-800 dark:bg-copper-500 dark:hover:bg-copper-600 shadow-xs transition-all active:scale-[0.98] cursor-pointer"
                title="Advance the next deal in the sequence"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Simulate Step</span>
              </button>

              {/* Reset Button */}
              <button
                onClick={handleResetPipeline}
                className="p-1.5 rounded-lg border border-border-light dark:border-border-dark bg-surface-muted-light dark:bg-surface-dark hover:bg-surface-light dark:hover:bg-surface-elevated-dark text-text-secondary-light dark:text-text-secondary-dark transition-colors cursor-pointer"
                title="Reset simulation to initial state"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <span className="hidden lg:inline text-[11px] font-mono text-text-tertiary-light dark:text-text-tertiary-dark ml-1">
                Demo workspace
              </span>
            </div>
          </div>

          {/* Desktop & Tablet: Horizontal Swimlane Grid */}
          <div className="mt-5 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3.5 overflow-x-auto pb-2">
            {stages.map((stage) => {
              const isHiddenOnMobile = stage.id !== activeStageId;

              return (
                <div
                  key={stage.id}
                  className={`flex flex-col rounded-xl border border-border-light dark:border-border-dark bg-surface-canvas-light dark:bg-surface-dark p-3 min-w-[200px] transition-all duration-300 ${
                    isHiddenOnMobile ? 'hidden md:flex' : 'flex'
                  }`}
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-border-light dark:border-border-dark">
                    <span className="text-xs font-bold text-text-primary-light dark:text-text-primary-dark truncate">
                      {stage.name}
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded transition-transform ${stage.color}`}>
                      {stage.deals.length}
                    </span>
                  </div>

                  {/* Cards inside column with animated entrance and status highlight */}
                  <div className="space-y-2.5 flex-1 min-h-[200px]">
                    {stage.deals.map((deal) => {
                      const isHighlighted = deal.highlighted;
                      const isAnimating = animatingDealId === deal.id;

                      return (
                        <div
                          key={deal.id}
                          className={`group rounded-lg border p-2.5 transition-all duration-500 cursor-pointer ${
                            isHighlighted
                              ? 'border-copper-500 bg-surface-light dark:bg-surface-elevated-dark shadow-glow-copper scale-[1.02] ring-1 ring-copper-500/40'
                              : 'border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-elevated-dark hover:border-copper-500/40 hover:-translate-y-0.5 hover:shadow-card'
                          } ${isAnimating ? 'animate-pulse ring-2 ring-copper-400 scale-[1.03]' : ''}`}
                        >
                          <div className="flex items-center justify-between text-[11px] font-semibold text-text-secondary-light dark:text-text-secondary-dark truncate">
                            <div className="flex items-center gap-1.5 truncate">
                              <Building2 className="w-3 h-3 text-copper-500 shrink-0" />
                              <span className="truncate">{deal.company}</span>
                            </div>
                            {isHighlighted && (
                              <span className="flex h-2 w-2 relative shrink-0">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-copper-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-copper-500" />
                              </span>
                            )}
                          </div>

                          <h4 className="text-xs font-bold text-text-primary-light dark:text-text-primary-dark mt-1 line-clamp-1 group-hover:text-copper-600 dark:group-hover:text-copper-400 transition-colors">
                            {deal.title}
                          </h4>

                          <div className="mt-2.5 flex items-baseline justify-between text-xs">
                            <span className="font-bold text-text-primary-light dark:text-text-primary-dark tabular-nums">
                              {deal.value}
                            </span>
                            <span className="text-[10px] text-text-tertiary-light dark:text-text-tertiary-dark font-mono font-medium">
                              {deal.probability}% win prob
                            </span>
                          </div>

                          {/* Dynamic Probability Bar with Smooth Width Transition */}
                          <div className="w-full h-1.5 bg-surface-muted-light dark:bg-surface-dark rounded-full mt-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-700 ease-out ${
                                deal.probability >= 80
                                  ? 'bg-emerald-500'
                                  : deal.probability >= 50
                                  ? 'bg-copper-500'
                                  : 'bg-amber-500'
                              }`}
                              style={{ width: `${deal.probability}%` }}
                            />
                          </div>

                          <div className="mt-2.5 pt-2 border-t border-border-light dark:border-border-dark flex items-center justify-between text-[10px] text-text-tertiary-light dark:text-text-tertiary-dark">
                            <span className="truncate">{deal.agent}</span>
                            <span
                              className={`px-1.5 py-0.5 rounded font-mono font-semibold ${
                                deal.risk === 'GOOD'
                                  ? 'text-emerald-500 bg-emerald-500/10'
                                  : deal.risk === 'MODERATE'
                                  ? 'text-amber-500 bg-amber-500/10'
                                  : 'text-crimson-500 bg-crimson-500/10'
                              }`}
                            >
                              {deal.risk}
                            </span>
                          </div>
                        </div>
                      );
                    })}

                    {stage.deals.length === 0 && (
                      <div className="h-full flex items-center justify-center border border-dashed border-border-light dark:border-border-dark rounded-lg p-4 text-[11px] text-text-tertiary-light dark:text-text-tertiary-dark text-center">
                        Drop deals here
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

