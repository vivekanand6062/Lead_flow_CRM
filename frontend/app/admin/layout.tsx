'use client';

import React from 'react';
import { AppShell } from '@/components/layout/AppShell';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell
      requiredRole="ADMIN"
      title="Organization Administration"
      subtitle="Executive oversight, manager leadership, and organization-wide revenue operations"
    >
      {children}
    </AppShell>
  );
}
