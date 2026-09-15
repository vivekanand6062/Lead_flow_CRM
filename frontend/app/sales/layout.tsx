'use client';

import React from 'react';
import { AppShell } from '@/components/layout/AppShell';

export default function SalesLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell
      requiredRole="SALES_AGENT"
      title="Sales Representative Hub"
      subtitle="Personal lead execution, pipeline opportunity progression, AI sales intelligence, and client follow-ups"
    >
      {children}
    </AppShell>
  );
}
