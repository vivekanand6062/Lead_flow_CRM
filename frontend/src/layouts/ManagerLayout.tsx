import React from 'react';
import { Outlet } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';

export const ManagerLayout: React.FC = () => {
  return (
    <AppShell
      requiredRole="MANAGER"
      title="Sales Team Management"
      subtitle="Team quota execution, sales agent management, lead assignment, and pipeline coaching"
    >
      <Outlet />
    </AppShell>
  );
};

export default ManagerLayout;
