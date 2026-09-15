import React from 'react';
import { Outlet } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';

export const SalesLayout: React.FC = () => {
  return (
    <AppShell
      requiredRole="SALES_AGENT"
      title="Sales Representative Hub"
      subtitle="Personal lead execution, pipeline opportunity progression, AI sales intelligence, and client follow-ups"
    >
      <Outlet />
    </AppShell>
  );
};

export default SalesLayout;
