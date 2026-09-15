'use client';

import React, { useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, UserRole } from '@/store/AuthContext';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { ShieldAlert, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface AppShellProps {
  children: ReactNode;
  requiredRole?: UserRole | UserRole[];
  title?: string;
  subtitle?: string;
}

export const AppShell: React.FC<AppShellProps> = ({
  children,
  requiredRole,
  title,
  subtitle
}) => {
  const { user, loading, getDashboardPath } = useAuth();
  const router = useRouter();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F3F0] dark:bg-[#0C0A0F]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-7 h-7 text-[#A9683F] dark:text-[#C08457] animate-spin" />
          <p className="text-xs text-[#665C65] dark:text-[#B8AEB9] font-medium">
            Loading LeadFlow CRM...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Role verification check
  const allowedRoles = Array.isArray(requiredRole) ? requiredRole : (requiredRole ? [requiredRole] : null);
  const isAuthorized = !allowedRoles || allowedRoles.includes(user.role);

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F3F0] dark:bg-[#0C0A0F] p-6">
        <div className="max-w-md w-full text-center bg-[#FFFDFC] dark:bg-[#141117] border border-[#E5DCD5] dark:border-[#2A242D] rounded-2xl p-8 shadow-modal">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[rgba(215,101,101,0.12)] dark:bg-[rgba(215,101,101,0.15)] flex items-center justify-center text-[#D76565] dark:text-[#F08E8E]">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-base font-bold text-[#211A20] dark:text-[#F5F1F3]">
            403 — Unauthorized Access
          </h2>
          <p className="text-xs text-[#665C65] dark:text-[#B8AEB9] mt-2 mb-6 leading-relaxed">
            Your account role (<span className="font-semibold text-[#A9683F] dark:text-[#C08457]">{user.role}</span>) does not have permission to view this section.
          </p>
          <Button onClick={() => router.push(getDashboardPath(user.role))}>
            Return to My Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F3F0] dark:bg-[#0C0A0F] text-[#211A20] dark:text-[#F5F1F3] transition-colors">
      {/* Sidebar */}
      <Sidebar
        isOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <Topbar
          onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
          title={title}
          subtitle={subtitle}
        />

        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
