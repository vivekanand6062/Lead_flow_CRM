'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from '@/store/ThemeContext';
import { Moon, Sun, Menu, X, ArrowRight } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';

const NAV_LINKS = [
  { label: 'Product', href: '#product' },
  { label: 'Features', href: '#features' },
  { label: 'AI Intelligence', href: '#ai' },
  { label: 'Pipeline', href: '#pipeline' },
  { label: 'Analytics', href: '#analytics' },
  { label: 'Security', href: '#security' }
];

export const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
        setMobileMenuOpen(false);
      }
    }
  };

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-200 ${
        scrolled
          ? 'bg-surface-light/90 dark:bg-[#0C0A0F]/90 backdrop-blur-md border-b border-border-light dark:border-border-dark shadow-xs'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Brand Logo & Wordmark */}
          <Logo size="md" asLink href="/" subtitle="CRM" />

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-7">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                className="text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark hover:text-copper-600 dark:hover:text-copper-400 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Actions: Theme Toggle, Sign In & Get Started */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-lg text-text-secondary-light hover:text-text-primary-light dark:text-text-secondary-dark dark:hover:text-text-primary-dark hover:bg-surface-muted-light dark:hover:bg-surface-elevated-dark transition-colors cursor-pointer"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <Link
              href="/login"
              className="px-3 py-1.5 text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark hover:text-copper-600 dark:hover:text-copper-400 transition-colors"
            >
              Sign In
            </Link>

            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-copper-600 hover:bg-copper-700 active:bg-copper-800 dark:bg-copper-500 dark:hover:bg-copper-600 rounded-lg shadow-xs transition-all active:scale-[0.98]"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-lg text-text-secondary-light dark:text-text-secondary-dark"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              className="p-2 rounded-lg text-text-secondary-light dark:text-text-secondary-dark hover:bg-surface-muted-light dark:hover:bg-surface-elevated-dark"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-b border-border-light dark:border-border-dark bg-surface-light/95 dark:bg-[#141117]/95 backdrop-blur-md px-4 pt-3 pb-6 space-y-3">
          <nav className="flex flex-col space-y-2">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                className="px-3 py-2 rounded-lg text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark hover:bg-surface-muted-light dark:hover:bg-surface-elevated-dark hover:text-copper-600 dark:hover:text-copper-400"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="pt-3 border-t border-border-light dark:border-border-dark flex flex-col gap-2">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-2 text-center text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark border border-border-light dark:border-border-dark rounded-lg"
            >
              Sign In
            </Link>
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-2 text-center text-xs font-semibold text-white bg-copper-600 hover:bg-copper-700 active:bg-copper-800 dark:bg-copper-500 dark:hover:bg-copper-600 rounded-lg"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
