import React from 'react';
import { Outlet } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';

export const AdminLayout: React.FC = () => {
  return (
    <AppShell
      requiredRole="ADMIN"
      title="Organization Administration"
      subtitle="Executive oversight, manager leadership, and organization-wide revenue operations"
    >
      <Outlet />
    </AppShell>
  );
};

export default AdminLayout;
