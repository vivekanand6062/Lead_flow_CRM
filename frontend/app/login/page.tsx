'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ArrowRight, Shield, Users, UserCheck } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/store/AuthContext';
import api from '@/services/api';

export default function LoginPage() {
  const router = useRouter();
  const { login, user, loading: authLoading, getDashboardPath } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [forgotModal, setForgotModal] = useState(false);

  // If already authenticated, redirect to role dashboard
  useEffect(() => {
    if (!authLoading && user) {
      router.replace(getDashboardPath(user.role));
    }
  }, [authLoading, user, router, getDashboardPath]);

  // If setup not completed, redirect to /setup
  useEffect(() => {
    const checkSetup = async () => {
      try {
        const res = await api.get('/setup/status');
        if (!res.data.setupCompleted) {
          router.replace('/setup');
        }
      } catch (err) {
        // Ignore in local dev
      }
    };
    checkSetup();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please enter both your work email and password.');
    } else {
      try {
        setLoading(true);
        setError('');
        await login(email, password);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Invalid email or password. Please check your credentials.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleFillDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-surface-canvas-light dark:bg-surface-canvas-dark text-text-primary-light dark:text-text-primary-dark transition-colors relative overflow-hidden">
      {/* Background Copper Aura */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[320px] bg-[radial-gradient(ellipse_at_top,rgba(192,132,87,0.12),transparent_70%)] pointer-events-none" />
      <div className="absolute -bottom-32 right-1/4 w-[400px] h-[300px] bg-[radial-gradient(ellipse_at_bottom,rgba(155,138,251,0.06),transparent_70%)] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* Logo and Brand */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="mb-3">
            <Logo size="xl" imgOnly />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-text-primary-light dark:text-text-primary-dark">
            Sign in to LeadFlow
          </h2>
          <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-1 font-mono">
            Midnight Plum × Copper B2B Enterprise CRM
          </p>
        </div>

        {/* Login Form Card */}
        <div className="bg-surface-light dark:bg-surface-elevated-dark border border-border-light dark:border-border-dark rounded-2xl p-6 sm:p-8 shadow-card relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-copper-500/50 to-transparent" />

          {error && (
            <div className="mb-5 p-3.5 text-xs bg-crimson-500/10 text-crimson-400 border border-crimson-500/20 rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Work Email Address"
              type="email"
              required
              placeholder="user@leadflow.com"
              icon={<Mail className="w-4 h-4" />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark">
                  Password <span className="text-crimson-400">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setForgotModal(true)}
                  className="text-[11px] font-medium text-copper-600 dark:text-copper-400 hover:underline transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <Input
                type="password"
                required
                placeholder="••••••••"
                icon={<Lock className="w-4 h-4" />}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <Button type="submit" className="w-full mt-2" isLoading={loading}>
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          {/* Development Demo Quick-Fill Accounts */}
          <div className="mt-6 pt-5 border-t border-border-light dark:border-border-dark">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[10px] font-semibold text-text-tertiary-light dark:text-text-tertiary-dark uppercase tracking-wider font-mono">
                Evaluation Personas (1-Click Fill)
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleFillDemo('admin@leadflow.com', 'Admin@123')}
                className="flex flex-col items-center justify-center p-2.5 rounded-lg border border-copper-500/25 bg-copper-500/5 hover:bg-copper-500/10 text-copper-500 dark:text-copper-400 transition-all active:scale-[0.98]"
              >
                <Shield className="w-4 h-4 mb-1" />
                <span className="text-[11px] font-semibold">Admin</span>
              </button>

              <button
                type="button"
                onClick={() => handleFillDemo('rahul@leadflow.com', 'Manager@123')}
                className="flex flex-col items-center justify-center p-2.5 rounded-lg border border-plum-500/30 bg-plum-500/5 hover:bg-plum-500/10 text-plum-400 dark:text-plum-300 transition-all active:scale-[0.98]"
              >
                <Users className="w-4 h-4 mb-1" />
                <span className="text-[11px] font-semibold">Manager</span>
              </button>

              <button
                type="button"
                onClick={() => handleFillDemo('amit@leadflow.com', 'Agent@123')}
                className="flex flex-col items-center justify-center p-2.5 rounded-lg border border-emerald-500/25 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 transition-all active:scale-[0.98]"
              >
                <UserCheck className="w-4 h-4 mb-1" />
                <span className="text-[11px] font-semibold">Sales Agent</span>
              </button>
            </div>
          </div>
        </div>

        {/* Security Note */}
        <p className="text-center text-[11px] text-text-tertiary-light dark:text-text-tertiary-dark mt-6 font-mono">
          Organization-scoped access • JWT authentication • Role-based access control
        </p>
      </div>

      {/* Forgot Password Modal */}
      {forgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-surface-light dark:bg-surface-elevated-dark border border-border-light dark:border-border-dark rounded-2xl p-6 max-w-sm w-full shadow-modal animate-in fade-in zoom-in-95 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-copper-500/40 to-transparent" />
            <h3 className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">
              Reset Your Password
            </h3>
            <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-2 leading-relaxed">
              For security reasons in this CRM deployment, please contact your Sales Manager or Administrator to reset your password.
            </p>
            <div className="mt-4 flex justify-end">
              <Button size="sm" onClick={() => setForgotModal(false)}>
                Understood
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
