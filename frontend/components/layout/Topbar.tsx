'use client';

import React, { useState } from 'react';
import { Menu, Search, Sun, Moon, Sparkles, ChevronDown } from 'lucide-react';
import { useAuth, UserRole } from '@/store/AuthContext';
import { useTheme } from '@/store/ThemeContext';
import { Badge } from '@/components/ui/Badge';
import { GlobalSearchModal } from './GlobalSearchModal';

interface TopbarProps {
  onOpenMobileMenu: () => void;
  title?: string;
  subtitle?: string;
}

export const Topbar: React.FC<TopbarProps> = ({ onOpenMobileMenu, title, subtitle }) => {
  const { user, login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);

  // Demo personas for fast evaluation switching
  const demoAccounts = [
    { role: 'ADMIN' as UserRole, name: 'Admin Demo', email: 'admin@leadflow.com', pass: 'Admin@123' },
    { role: 'MANAGER' as UserRole, name: 'Rahul Sharma (Manager)', email: 'rahul@leadflow.com', pass: 'Manager@123' },
    { role: 'SALES_AGENT' as UserRole, name: 'Amit Verma (Agent)', email: 'amit@leadflow.com', pass: 'Agent@123' }
  ];

  const handleQuickSwitch = async (email: string, pass: string) => {
    try {
      setIsSwitching(true);
      setIsRoleMenuOpen(false);
      await login(email, pass);
    } catch (err) {
      console.error('Failed to switch role', err);
    } finally {
      setIsSwitching(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 bg-[#FFFDFC]/95 dark:bg-[#0C0A0F]/95 backdrop-blur-md border-b border-[#E5DCD5] dark:border-[#2A242D] transition-colors">
        {/* Left Section: Mobile Menu + Page Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-lg text-[#8A7F87] hover:bg-[#F8F2EE] dark:hover:bg-[#1A151D] focus:outline-none"
            aria-label="Open mobile menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <h1 className="text-sm sm:text-base font-semibold text-[#211A20] dark:text-[#F5F1F3] truncate">
              {title || 'CRM Operations'}
            </h1>
            {subtitle && (
              <p className="hidden sm:block text-[11px] text-[#8A7F87] dark:text-[#B8AEB9]">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right Section: Quick Search + Theme + Quick Role Switcher + Profile */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Quick Search Button */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 text-xs text-[#665C65] dark:text-[#B8AEB9] bg-[#F7F3F0] dark:bg-[#141117] border border-[#E5DCD5] dark:border-[#2A242D] rounded-lg hover:border-[#A9683F]/50 dark:hover:border-[#C08457]/50 transition-colors"
          >
            <Search className="w-3.5 h-3.5 text-[#8A7F87]" />
            <span>Search CRM...</span>
            <kbd className="text-[10px] bg-[#E5DCD5]/60 dark:bg-[#1A151D] px-1.5 py-0.5 rounded text-[#665C65] dark:text-[#B8AEB9] font-mono border border-[#E5DCD5] dark:border-[#2A242D]">
              ⌘K
            </kbd>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-[#665C65] dark:text-[#B8AEB9] hover:bg-[#F8F2EE] dark:hover:bg-[#1A151D] transition-colors"
            title="Toggle theme"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-[#D6A86C]" /> : <Moon className="w-4 h-4 text-[#704766]" />}
          </button>

          {/* Demo Quick Role Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
              disabled={isSwitching}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium bg-[#F3E3D7] dark:bg-[rgba(192,132,87,0.12)] text-[#79472B] dark:text-[#E0A978] border border-[#E9BF9F] dark:border-[rgba(192,132,87,0.25)] rounded-lg hover:bg-[#F3DAC9] dark:hover:bg-[rgba(192,132,87,0.2)] transition-colors active:scale-[0.98]"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#A9683F] dark:text-[#C08457]" />
              <span className="hidden sm:inline">Role:</span>
              <span className="font-semibold">{user?.role}</span>
              <ChevronDown className="w-3 h-3" />
            </button>

            {isRoleMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-[#FFFDFC] dark:bg-[#1A151D] border border-[#E5DCD5] dark:border-[#2A242D] rounded-xl shadow-modal p-1.5 z-50 animate-in fade-in zoom-in-95">
                <div className="px-2.5 py-1.5 text-[10px] font-semibold text-[#8A7F87] dark:text-[#817783] uppercase tracking-wider border-b border-[#E5DCD5] dark:border-[#2A242D]">
                  Switch Demo Persona
                </div>
                {demoAccounts.map((acc) => (
                  <button
                    key={acc.email}
                    onClick={() => handleQuickSwitch(acc.email, acc.pass)}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-xs transition-colors ${
                      user?.role === acc.role
                        ? 'bg-[#F0E5EE] dark:bg-[rgba(110,69,107,0.18)] font-medium text-[#211A20] dark:text-[#F5F1F3]'
                        : 'hover:bg-[#F8F2EE] dark:hover:bg-[#211B24] text-[#665C65] dark:text-[#B8AEB9]'
                    }`}
                  >
                    <div className="truncate pr-2">
                      <p className="font-medium text-[#211A20] dark:text-[#F5F1F3] truncate">{acc.name}</p>
                      <p className="text-[10px] text-[#8A7F87] dark:text-[#817783] truncate">{acc.email}</p>
                    </div>
                    <Badge type={acc.role} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User Profile Avatar */}
          <div className="flex items-center gap-2 pl-2 border-l border-[#E5DCD5] dark:border-[#2A242D]">
            <div className="w-8 h-8 rounded-full bg-[#F3E3D7] dark:bg-[#1A151D] border border-[#E5DCD5] dark:border-[#2A242D] flex items-center justify-center text-xs font-semibold text-[#79472B] dark:text-[#E0A978] uppercase">
              {user?.name?.slice(0, 2) || 'LF'}
            </div>
          </div>
        </div>
      </header>

      {/* Global Search Dialog Modal */}
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};
