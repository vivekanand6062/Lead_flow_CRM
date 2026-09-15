'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Building2,
  Contact,
  TrendingUp,
  Kanban,
  Clock,
  CheckSquare,
  Sparkles,
  BarChart3,
  Settings,
  User,
  LogOut,
  Layers
} from 'lucide-react';
import { useAuth } from '@/store/AuthContext';
import { Badge } from '@/components/ui/Badge';
import { Logo } from '@/components/ui/Logo';

interface SidebarProps {
  isOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onCloseMobile }) => {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  if (!user) return null;

  // Exact navigation item specifications per role
  const getNavItems = () => {
    switch (user.role) {
      case 'ADMIN':
        return [
          { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
          { label: 'Managers', href: '/admin/managers', icon: Users },
          { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
          { label: 'Settings', href: '/admin/settings', icon: Settings },
          { label: 'Profile', href: '/admin/profile', icon: User }
        ];
      case 'MANAGER':
        return [
          { label: 'Dashboard', href: '/manager/dashboard', icon: LayoutDashboard },
          { label: 'Sales Agents', href: '/manager/sales-agents', icon: UserCheck },
          { label: 'Leads', href: '/manager/leads', icon: Users },
          { label: 'Contacts', href: '/manager/contacts', icon: Contact },
          { label: 'Companies', href: '/manager/companies', icon: Building2 },
          { label: 'Deals', href: '/manager/deals', icon: TrendingUp },
          { label: 'Pipeline', href: '/manager/pipeline', icon: Kanban },
          { label: 'Activities', href: '/manager/activities', icon: Clock },
          { label: 'Follow-ups', href: '/manager/follow-ups', icon: CheckSquare },
          { label: 'Analytics', href: '/manager/analytics', icon: BarChart3 },
          { label: 'Profile', href: '/manager/profile', icon: User }
        ];
      case 'SALES_AGENT':
        return [
          { label: 'Dashboard', href: '/sales/dashboard', icon: LayoutDashboard },
          { label: 'My Leads', href: '/sales/leads', icon: Users },
          { label: 'Contacts', href: '/sales/contacts', icon: Contact },
          { label: 'Companies', href: '/sales/companies', icon: Building2 },
          { label: 'My Deals', href: '/sales/deals', icon: TrendingUp },
          { label: 'Pipeline', href: '/sales/pipeline', icon: Kanban },
          { label: 'Activities', href: '/sales/activities', icon: Clock },
          { label: 'Follow-ups', href: '/sales/follow-ups', icon: CheckSquare },
          { label: 'AI Assistant', href: '/sales/ai', icon: Sparkles },
          { label: 'Profile', href: '/sales/profile', icon: User }
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/65 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-64 border-r border-[#E5DCD5] dark:border-[#2A242D] bg-[#FFFDFC] dark:bg-[#0C0A0F] transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Brand Header */}
          <div className="flex items-center justify-between px-5 h-16 border-b border-[#E5DCD5] dark:border-[#2A242D]">
            <Logo size="md" asLink href="/" subtitle="CRM Enterprise" />
          </div>

          {/* User Role Indicator Card */}
          <div className="px-4 py-3 border-b border-[#E5DCD5] dark:border-[#2A242D] bg-[#F7F3F0] dark:bg-[#141117]">
            <div className="flex items-center justify-between gap-2">
              <div className="truncate">
                <p className="text-xs font-semibold text-[#211A20] dark:text-[#F5F1F3] truncate">
                  {user.name}
                </p>
                <p className="text-[11px] text-[#8A7F87] dark:text-[#817783] truncate">
                  {user.email}
                </p>
              </div>
              <Badge type={user.role} />
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onCloseMobile}
                  className={`flex items-center gap-3 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all duration-150 ${
                    isActive
                      ? 'bg-[#F0E5EE] dark:bg-[rgba(110,69,107,0.18)] text-[#211A20] dark:text-[#F5F1F3] font-semibold border-l-2 border-[#A9683F] dark:border-[#C08457] rounded-l-none pl-2.5'
                      : 'text-[#665C65] dark:text-[#B8AEB9] hover:bg-[#F8F2EE] dark:hover:bg-[#1A151D] hover:text-[#211A20] dark:hover:text-[#F5F1F3]'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive
                        ? 'text-[#A9683F] dark:text-[#C08457]'
                        : 'text-[#8A7F87] dark:text-[#817783]'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer with Logout */}
          <div className="p-3 border-t border-[#E5DCD5] dark:border-[#2A242D]">
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg text-[#D76565] dark:text-[#F08E8E] hover:bg-[rgba(215,101,101,0.12)] transition-colors active:scale-[0.98]"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
