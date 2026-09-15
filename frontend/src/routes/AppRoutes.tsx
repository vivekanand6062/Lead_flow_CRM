import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import { AdminLayout } from '@/layouts/AdminLayout';
import { ManagerLayout } from '@/layouts/ManagerLayout';
import { SalesLayout } from '@/layouts/SalesLayout';

// Public & Auth Pages
import { LandingPage } from '@/pages/landing/LandingPage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { SetupPage } from '@/pages/auth/SetupPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage';

// Admin Pages
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage';
import { AdminManagersPage } from '@/pages/admin/AdminManagersPage';
import { AdminManagerDetailPage } from '@/pages/admin/AdminManagerDetailPage';
import { AdminAnalyticsPage } from '@/pages/admin/AdminAnalyticsPage';
import { AdminSettingsPage } from '@/pages/admin/AdminSettingsPage';
import { AdminProfilePage } from '@/pages/admin/AdminProfilePage';

// Manager Pages
import { ManagerDashboardPage } from '@/pages/manager/ManagerDashboardPage';
import { ManagerSalesAgentsPage } from '@/pages/manager/ManagerSalesAgentsPage';
import { ManagerSalesAgentDetailPage } from '@/pages/manager/ManagerSalesAgentDetailPage';
import { ManagerLeadsPage } from '@/pages/manager/ManagerLeadsPage';
import { ManagerContactsPage } from '@/pages/manager/ManagerContactsPage';
import { ManagerCompaniesPage } from '@/pages/manager/ManagerCompaniesPage';
import { ManagerDealsPage } from '@/pages/manager/ManagerDealsPage';
import { ManagerPipelinePage } from '@/pages/manager/ManagerPipelinePage';
import { ManagerActivitiesPage } from '@/pages/manager/ManagerActivitiesPage';
import { ManagerFollowUpsPage } from '@/pages/manager/ManagerFollowUpsPage';
import { ManagerAnalyticsPage } from '@/pages/manager/ManagerAnalyticsPage';
import { ManagerProfilePage } from '@/pages/manager/ManagerProfilePage';

// Sales Agent Pages
import { SalesDashboardPage } from '@/pages/sales/SalesDashboardPage';
import { SalesLeadsPage } from '@/pages/sales/SalesLeadsPage';
import { SalesLeadDetailPage } from '@/pages/sales/SalesLeadDetailPage';
import { SalesDealsPage } from '@/pages/sales/SalesDealsPage';
import { SalesDealDetailPage } from '@/pages/sales/SalesDealDetailPage';
import { SalesContactsPage } from '@/pages/sales/SalesContactsPage';
import { SalesCompaniesPage } from '@/pages/sales/SalesCompaniesPage';
import { SalesPipelinePage } from '@/pages/sales/SalesPipelinePage';
import { SalesActivitiesPage } from '@/pages/sales/SalesActivitiesPage';
import { SalesFollowUpsPage } from '@/pages/sales/SalesFollowUpsPage';
import { SalesAIPage } from '@/pages/sales/SalesAIPage';
import { SalesProfilePage } from '@/pages/sales/SalesProfilePage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/setup" element={<SetupPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Admin Protected Hierarchy */}
      <Route element={<AdminLayout />}>
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        <Route path="/admin/managers" element={<AdminManagersPage />} />
        <Route path="/admin/managers/:id" element={<AdminManagerDetailPage />} />
        <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
        <Route path="/admin/settings" element={<AdminSettingsPage />} />
        <Route path="/admin/profile" element={<AdminProfilePage />} />
      </Route>

      {/* Manager Protected Hierarchy */}
      <Route element={<ManagerLayout />}>
        <Route path="/manager/dashboard" element={<ManagerDashboardPage />} />
        <Route path="/manager/sales-agents" element={<ManagerSalesAgentsPage />} />
        <Route path="/manager/sales-agents/:id" element={<ManagerSalesAgentDetailPage />} />
        <Route path="/manager/leads" element={<ManagerLeadsPage />} />
        <Route path="/manager/contacts" element={<ManagerContactsPage />} />
        <Route path="/manager/companies" element={<ManagerCompaniesPage />} />
        <Route path="/manager/deals" element={<ManagerDealsPage />} />
        <Route path="/manager/pipeline" element={<ManagerPipelinePage />} />
        <Route path="/manager/activities" element={<ManagerActivitiesPage />} />
        <Route path="/manager/follow-ups" element={<ManagerFollowUpsPage />} />
        <Route path="/manager/analytics" element={<ManagerAnalyticsPage />} />
        <Route path="/manager/profile" element={<ManagerProfilePage />} />
      </Route>

      {/* Sales Agent Protected Hierarchy */}
      <Route element={<SalesLayout />}>
        <Route path="/sales/dashboard" element={<SalesDashboardPage />} />
        <Route path="/sales/leads" element={<SalesLeadsPage />} />
        <Route path="/sales/leads/:id" element={<SalesLeadDetailPage />} />
        <Route path="/sales/deals" element={<SalesDealsPage />} />
        <Route path="/sales/deals/:id" element={<SalesDealDetailPage />} />
        <Route path="/sales/contacts" element={<SalesContactsPage />} />
        <Route path="/sales/companies" element={<SalesCompaniesPage />} />
        <Route path="/sales/pipeline" element={<SalesPipelinePage />} />
        <Route path="/sales/activities" element={<SalesActivitiesPage />} />
        <Route path="/sales/follow-ups" element={<SalesFollowUpsPage />} />
        <Route path="/sales/ai" element={<SalesAIPage />} />
        <Route path="/sales/profile" element={<SalesProfilePage />} />
      </Route>

      {/* Fallback Catch-All */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
