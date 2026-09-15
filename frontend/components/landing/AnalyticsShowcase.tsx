'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import { TrendingUp, BarChart3, Target, Trophy } from 'lucide-react';

const REVENUE_DATA = [
  { month: 'Apr', revenue: 42, target: 35 },
  { month: 'May', revenue: 58, target: 45 },
  { month: 'Jun', revenue: 64, target: 55 },
  { month: 'Jul', revenue: 78, target: 70 },
  { month: 'Aug', revenue: 95, target: 85 },
  { month: 'Sep', revenue: 124, target: 100 }
];

const STAGE_DISTRIBUTION = [
  { stage: 'Qualified', count: 18, value: 42 },
  { stage: 'Proposal', count: 12, value: 85 },
  { stage: 'Negotiation', count: 9, value: 165 },
  { stage: 'Won', count: 15, value: 124 }
];

export const AnalyticsShowcase: React.FC = () => {
  return (
    <section id="analytics" className="py-16 sm:py-24 border-b border-border-light dark:border-border-dark scroll-reveal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-copper-600 dark:text-copper-400">
            Performance &amp; Visibility
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-text-primary-light dark:text-text-primary-dark mt-2">
            Clarity on pipeline velocity, quota attainment, and revenue.
          </h2>
          <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-3 leading-relaxed">
            Eliminate spreadsheet forecasting. LeadFlow provides instant telemetry on conversion rates, revenue trends, and team targets.
          </p>
        </div>

        {/* Analytics Workspace Container */}
        <div className="rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark p-6 sm:p-8 shadow-card">
          {/* Header Strip */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-border-light dark:border-border-dark">
            <div>
              <h3 className="text-sm font-bold text-text-primary-light dark:text-text-primary-dark uppercase tracking-wider">
                Sales Operations Executive Dashboard
              </h3>
              <p className="text-xs text-text-muted-light dark:text-text-muted-dark mt-0.5">Real-time revenue metrics vs. quarterly quota targets</p>
            </div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-surface-elevated-light dark:bg-surface-elevated-dark text-text-secondary-light dark:text-text-secondary-dark border border-border-light dark:border-border-dark self-start sm:self-auto">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Demo workspace • Illustrative data</span>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-b border-border-light dark:border-border-dark">
            <div>
              <span className="text-[11px] font-medium text-text-muted-light dark:text-text-muted-dark">Quarterly Realized</span>
              <div className="text-lg sm:text-xl font-bold tabular-nums text-text-primary-light dark:text-text-primary-dark mt-0.5">
                ₹1.24 Cr
              </div>
              <span className="text-[10px] font-semibold tabular-nums text-emerald-600 dark:text-emerald-400 flex items-center mt-0.5">
                <TrendingUp className="w-3 h-3 mr-0.5" /> +24% vs Q2
              </span>
            </div>

            <div>
              <span className="text-[11px] font-medium text-text-muted-light dark:text-text-muted-dark">Average Deal Size</span>
              <div className="text-lg sm:text-xl font-bold tabular-nums text-text-primary-light dark:text-text-primary-dark mt-0.5">
                ₹8,25,000
              </div>
              <span className="text-[10px] font-mono text-text-muted-light dark:text-text-muted-dark font-medium">B2B Enterprise AE tier</span>
            </div>

            <div>
              <span className="text-[11px] font-medium text-text-secondary-light dark:text-text-secondary-dark">Team Quota Attainment</span>
              <div className="text-lg sm:text-xl font-bold tabular-nums text-text-primary-light dark:text-text-primary-dark mt-0.5">
                88.5%
              </div>
              <span className="text-[10px] font-mono font-semibold text-copper-600 dark:text-copper-400">
                ₹1.40 Cr Target
              </span>
            </div>

            <div>
              <span className="text-[11px] font-medium text-text-secondary-light dark:text-text-secondary-dark">Win Rate</span>
              <div className="text-lg sm:text-xl font-bold tabular-nums text-text-primary-light dark:text-text-primary-dark mt-0.5">
                68.2%
              </div>
              <span className="text-[10px] text-emerald-400 font-medium tabular-nums">
                15 Won / 22 Evaluated
              </span>
            </div>
          </div>

          {/* Dual Chart Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6">
            {/* Area Chart: Revenue Velocity */}
            <div className="lg:col-span-7">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-copper-600 dark:text-copper-400" />
                  <h4 className="text-xs font-bold text-text-primary-light dark:text-text-primary-dark uppercase tracking-wider font-mono">
                    Monthly Closed Revenue (in Lakhs INR)
                  </h4>
                </div>
                <div className="flex items-center gap-3 text-[11px]">
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded bg-copper-500" />
                    <span className="text-text-tertiary-light dark:text-text-tertiary-dark font-mono">Revenue</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-0.5 bg-border-light dark:bg-border-dark" />
                    <span className="text-text-tertiary-light dark:text-text-tertiary-dark font-mono">Quota</span>
                  </div>
                </div>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={REVENUE_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#C08457" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#C08457" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2A242D" strokeOpacity={0.5} />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#8E8292" />
                    <YAxis tick={{ fontSize: 11 }} stroke="#8E8292" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1A151D',
                        borderColor: '#2A242D',
                        borderRadius: '8px',
                        fontSize: '12px',
                        color: '#F5F1F3'
                      }}
                      formatter={(val: number) => [`₹${val} Lakhs`, 'Revenue']}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#C08457"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#revenueGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bar Chart: Stage Pipeline Volume */}
            <div className="lg:col-span-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-copper-600 dark:text-copper-400" />
                  <h4 className="text-xs font-bold text-text-primary-light dark:text-text-primary-dark uppercase tracking-wider font-mono">
                    Pipeline Volume by Stage (Lakhs INR)
                  </h4>
                </div>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={STAGE_DISTRIBUTION} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2A242D" strokeOpacity={0.5} />
                    <XAxis dataKey="stage" tick={{ fontSize: 11 }} stroke="#8E8292" />
                    <YAxis tick={{ fontSize: 11 }} stroke="#8E8292" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1A151D',
                        borderColor: '#2A242D',
                        borderRadius: '8px',
                        fontSize: '12px',
                        color: '#F5F1F3'
                      }}
                      formatter={(val: number) => [`₹${val} Lakhs`, 'Pipeline Value']}
                    />
                    <Bar dataKey="value" fill="#C08457" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
