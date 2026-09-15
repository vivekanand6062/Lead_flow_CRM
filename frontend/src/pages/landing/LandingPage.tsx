import React from 'react';
import { SessionBanner } from '@/components/landing/SessionBanner';
import { Navbar } from '@/components/landing/Navbar';
import { Hero } from '@/components/landing/Hero';
import { ValueStrip } from '@/components/landing/ValueStrip';
import { ProblemSolution } from '@/components/landing/ProblemSolution';
import { FeaturesGrid } from '@/components/landing/FeaturesGrid';
import { AISection } from '@/components/landing/AISection';
import { PipelineShowcase } from '@/components/landing/PipelineShowcase';
import { RoleWorkspaces } from '@/components/landing/RoleWorkspaces';
import { AnalyticsShowcase } from '@/components/landing/AnalyticsShowcase';
import { SecuritySection } from '@/components/landing/SecuritySection';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { FinalCTA } from '@/components/landing/FinalCTA';
import { Footer } from '@/components/landing/Footer';
import { ScrollRevealObserver } from '@/components/landing/ScrollRevealObserver';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-surface-canvas-light dark:bg-surface-canvas-dark text-text-primary-light dark:text-text-primary-dark flex flex-col selection:bg-copper-500 selection:text-white">
      {/* Scroll Reveal Intersection Controller */}
      <ScrollRevealObserver />

      {/* Client Session Detection Banner (Mounts only if user is already logged in) */}
      <SessionBanner />

      {/* Floating Sticky Navigation Bar */}
      <Navbar />

      {/* Main Landing Sections */}
      <main className="flex-1">
        {/* 1. Hero with Live Product Preview */}
        <Hero />

        {/* 2. Value Capabilities Strip */}
        <ValueStrip />

        {/* 3. Fragmented Workflow vs. LeadFlow Solution */}
        <ProblemSolution />

        {/* 4. Core CRM Features Grid */}
        <FeaturesGrid />

        {/* 5. Embedded AI Intelligence (Scoring, Follow-up Generator, Deal Risk) */}
        <AISection />

        {/* 6. Visual Sales Pipeline with Responsive Kanban */}
        <PipelineShowcase />

        {/* 7. 3-Tier Role Workspaces (Admin, Manager, Agent) */}
        <RoleWorkspaces />

        {/* 8. Live Recharts Analytics Telemetry */}
        <AnalyticsShowcase />

        {/* 9. Verified Security & Org-Scoped Access */}
        <SecuritySection />

        {/* 10. Simple 3-Step Operations Workflow */}
        <HowItWorks />

        {/* 11. Final High-Impact Conversion CTA */}
        <FinalCTA />
      </main>

      {/* 12. Modern Production Footer */}
      <Footer />
    </div>
  );
};

export default LandingPage;
