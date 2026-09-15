'use client';

import React from 'react';
import { AppShell } from '@/components/layout/AppShell';

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell
      requiredRole="MANAGER"
      title="Sales Team Management"
      subtitle="Team quota execution, sales agent management, lead assignment, and pipeline coaching"
    >
      {children}
    </AppShell>
  );
}
