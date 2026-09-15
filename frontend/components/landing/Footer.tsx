'use client';

import React from 'react';
import Link from 'next/link';
import { useTheme } from '@/store/ThemeContext';
import { Moon, Sun } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';

export const Footer: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <footer className="border-t border-border-light dark:border-border-dark bg-surface-canvas-light dark:bg-surface-canvas-dark pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 pb-12 border-b border-border-light dark:border-border-dark">
          {/* Brand Info Column */}
          <div className="md:col-span-2 space-y-4">
            <Logo size="md" asLink href="/" subtitle="CRM" />
            <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark max-w-sm leading-relaxed">
              Midnight Plum × Copper B2B Enterprise CRM for managing sales operations, manager hierarchies, agent pipelines, structured follow-ups, and AI sales intelligence.
            </p>
            <div className="pt-2 flex items-center gap-2 text-[11px] font-mono text-text-tertiary-light dark:text-text-tertiary-dark">
              <span>Next.js 14</span>
              <span>•</span>
              <span>TypeScript</span>
              <span>•</span>
              <span>Express.js</span>
              <span>•</span>
              <span>MongoDB</span>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-text-primary-light dark:text-text-primary-dark mb-3">
              Product
            </h4>
            <ul className="space-y-2 text-xs text-text-secondary-light dark:text-text-secondary-dark">
              <li>
                <a
                  href="#features"
                  onClick={(e) => handleScroll(e, '#features')}
                  className="hover:text-copper-600 dark:hover:text-copper-400 transition-colors"
                >
                  Core Features
                </a>
              </li>
              <li>
                <a
                  href="#ai"
                  onClick={(e) => handleScroll(e, '#ai')}
                  className="hover:text-copper-600 dark:hover:text-copper-400 transition-colors"
                >
                  AI Copilot &amp; Scoring
                </a>
              </li>
              <li>
                <a
                  href="#pipeline"
                  onClick={(e) => handleScroll(e, '#pipeline')}
                  className="hover:text-copper-600 dark:hover:text-copper-400 transition-colors"
                >
                  Visual Kanban Pipeline
                </a>
              </li>
              <li>
                <a
                  href="#analytics"
                  onClick={(e) => handleScroll(e, '#analytics')}
                  className="hover:text-copper-600 dark:hover:text-copper-400 transition-colors"
                >
                  Sales Analytics
                </a>
              </li>
            </ul>
          </div>

          {/* Workspaces & Platform */}
          <div>
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-text-primary-light dark:text-text-primary-dark mb-3">
              Workspaces
            </h4>
            <ul className="space-y-2 text-xs text-text-secondary-light dark:text-text-secondary-dark">
              <li>
                <a
                  href="#roles"
                  onClick={(e) => handleScroll(e, '#roles')}
                  className="hover:text-copper-600 dark:hover:text-copper-400 transition-colors"
                >
                  Executive Admin Portal
                </a>
              </li>
              <li>
                <a
                  href="#roles"
                  onClick={(e) => handleScroll(e, '#roles')}
                  className="hover:text-copper-600 dark:hover:text-copper-400 transition-colors"
                >
                  Manager Operations
                </a>
              </li>
              <li>
                <a
                  href="#roles"
                  onClick={(e) => handleScroll(e, '#roles')}
                  className="hover:text-copper-600 dark:hover:text-copper-400 transition-colors"
                >
                  Sales Agent Workspace
                </a>
              </li>
              <li>
                <a
                  href="#security"
                  onClick={(e) => handleScroll(e, '#security')}
                  className="hover:text-copper-600 dark:hover:text-copper-400 transition-colors"
                >
                  Security &amp; RBAC
                </a>
              </li>
            </ul>
          </div>

          {/* Access & Utilities */}
          <div>
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-text-primary-light dark:text-text-primary-dark mb-3">
              Get Started
            </h4>
            <ul className="space-y-2 text-xs text-text-secondary-light dark:text-text-secondary-dark">
              <li>
                <Link href="/login" className="hover:text-copper-600 dark:hover:text-copper-400 transition-colors">
                  Sign In to CRM
                </Link>
              </li>
              <li>
                <Link href="/setup" className="hover:text-copper-600 dark:hover:text-copper-400 transition-colors">
                  Organization Setup
                </Link>
              </li>
              <li className="pt-2">
                <button
                  onClick={toggleTheme}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium border border-border-light dark:border-border-dark text-text-secondary-light dark:text-text-secondary-dark hover:text-copper-600 dark:hover:text-copper-400 hover:border-copper-500/40 transition-colors cursor-pointer"
                >
                  {theme === 'dark' ? <Sun className="w-3 h-3" /> : <Moon className="w-3 h-3" />}
                  <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright & Sub-bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-text-tertiary-light dark:text-text-tertiary-dark">
          <p>© {new Date().getFullYear()} LeadFlow Technologies. All rights reserved.</p>
          <p>Midnight Plum × Copper B2B CRM Architecture.</p>
        </div>
      </div>
    </footer>
  );
};
