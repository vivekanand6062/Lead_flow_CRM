'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, ShieldCheck, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import api from '@/services/api';

export default function SetupPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [checkingSetup, setCheckingSetup] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    companyName: '',
    industry: 'Enterprise Software & SaaS',
    businessEmail: '',
    companyPhone: '',
    website: '',
    address: '',
    logo: '',
    adminName: '',
    adminEmail: '',
    adminPhone: '',
    password: '',
    confirmPassword: ''
  });

  // Verify setup status on mount: if already completed, permanently lock and redirect
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await api.get('/setup/status');
        if (res.data.setupCompleted) {
          router.replace('/login');
          return;
        }
      } catch (err) {
        console.error('Error verifying setup status', err);
      } finally {
        setCheckingSetup(false);
      }
    };
    checkStatus();
  }, [router]);

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName.trim() || !formData.businessEmail.trim()) {
      setError('Company Name and Business Email are required.');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.adminName.trim() || !formData.adminEmail.trim() || !formData.password) {
      setError('Admin Full Name, Email, and Password are required.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await api.post('/setup', formData);
      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 2500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to complete initial system setup.');
    } finally {
      setLoading(false);
    }
  };

  const handleSeedDemo = async () => {
    try {
      setLoading(true);
      setError('');
      await api.post('/setup/seed');
      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to seed demo data.');
    } finally {
      setLoading(false);
    }
  };

  if (checkingSetup) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-canvas-light dark:bg-surface-canvas-dark">
        <div className="w-8 h-8 rounded-full border-2 border-copper-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-surface-canvas-light dark:bg-surface-canvas-dark text-text-primary-light dark:text-text-primary-dark transition-colors relative overflow-hidden">
      {/* Subtle Background Radial Aura */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[320px] bg-[radial-gradient(ellipse_at_top,rgba(192,132,87,0.12),transparent_70%)] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-xl relative z-10">
        {/* Header Branding */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="mb-3">
            <Logo size="xl" imgOnly />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-text-primary-light dark:text-text-primary-dark">
            Initialize LeadFlow CRM
          </h2>
          <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-1 max-w-sm">
            One-time organization setup and primary Administrator account initialization.
          </p>

          {/* Stepper Wizard & Quick Seed */}
          <div className="flex items-center gap-3 mt-6">
            <div className={`flex items-center gap-2 text-xs font-semibold ${
              step === 1 ? 'text-copper-600 dark:text-copper-400' : 'text-text-tertiary-light dark:text-text-tertiary-dark'
            }`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold ${
                step === 1 ? 'bg-copper-500 text-white' : 'bg-surface-muted-light dark:bg-surface-dark text-text-tertiary-light dark:text-text-tertiary-dark'
              }`}>
                1
              </div>
              <span>Organization Details</span>
            </div>

            <div className="w-8 h-px bg-border-light dark:bg-border-dark" />

            <div className={`flex items-center gap-2 text-xs font-semibold ${
              step === 2 ? 'text-copper-600 dark:text-copper-400' : 'text-text-tertiary-light dark:text-text-tertiary-dark'
            }`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold ${
                step === 2 ? 'bg-copper-500 text-white' : 'bg-surface-muted-light dark:bg-surface-dark text-text-tertiary-light dark:text-text-tertiary-dark'
              }`}>
                2
              </div>
              <span>Admin Credentials</span>
            </div>
          </div>

          <div className="mt-4">
            <button
              type="button"
              onClick={handleSeedDemo}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-copper-500/10 border border-copper-500/25 text-copper-600 dark:text-copper-400 hover:bg-copper-500/15 transition-colors cursor-pointer"
            >
              <span>✨</span>
              <span>Load Full Demo Dataset (Admin, Managers, Agents &amp; Deals)</span>
            </button>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-surface-light dark:bg-surface-elevated-dark border border-border-light dark:border-border-dark rounded-2xl p-6 sm:p-8 shadow-card relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-copper-500/40 to-transparent" />

          {error && (
            <div className="mb-5 p-3.5 text-xs bg-crimson-500/10 text-crimson-400 border border-crimson-500/20 rounded-xl">
              {error}
            </div>
          )}

          {success ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-emerald-500/15 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-text-primary-light dark:text-text-primary-dark">
                Organization &amp; Admin Initialized!
              </h3>
              <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-1">
                System setup is now locked. Redirecting to sign in...
              </p>
            </div>
          ) : step === 1 ? (
            /* Step 1: Company Information */
            <form onSubmit={handleNextStep} className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-border-light dark:border-border-dark text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider font-mono">
                <Building2 className="w-4 h-4 text-copper-500 dark:text-copper-400" />
                <span>Step 1: Company Profile</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Company / Organization Name"
                  required
                  placeholder="e.g. Apex Enterprise Systems"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                />
                <Select
                  label="Industry Vertical"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                >
                  <option value="Enterprise Software & SaaS">Enterprise Software &amp; SaaS</option>
                  <option value="FinTech & Banking">FinTech &amp; Banking</option>
                  <option value="Healthcare & Life Sciences">Healthcare &amp; Life Sciences</option>
                  <option value="E-Commerce & Retail">E-Commerce &amp; Retail</option>
                  <option value="Manufacturing & Supply Chain">Manufacturing &amp; Supply Chain</option>
                  <option value="Consulting & Professional Services">Consulting &amp; Professional Services</option>
                </Select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Business Email"
                  type="email"
                  required
                  placeholder="contact@company.com"
                  value={formData.businessEmail}
                  onChange={(e) => setFormData({ ...formData, businessEmail: e.target.value })}
                />
                <Input
                  label="Phone Number"
                  placeholder="+91 80 4123 4567"
                  value={formData.companyPhone}
                  onChange={(e) => setFormData({ ...formData, companyPhone: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Company Website"
                  type="url"
                  placeholder="https://company.com"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                />
                <Input
                  label="Headquarters Address"
                  placeholder="Outer Ring Road, Bengaluru"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <div className="pt-4 flex justify-end">
                <Button type="submit">
                  <span>Continue to Admin Setup</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </form>
          ) : (
            /* Step 2: Admin Account Information */
            <form onSubmit={handleFinalSubmit} className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-border-light dark:border-border-dark text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider font-mono">
                <ShieldCheck className="w-4 h-4 text-copper-500 dark:text-copper-400" />
                <span>Step 2: Primary Administrator (Role: ADMIN)</span>
              </div>

              <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                This account will hold top-level organization authority and manage sales managers. Role is permanently assigned as <strong className="text-text-primary-light dark:text-text-primary-dark">ADMIN</strong>.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Admin Full Name"
                  required
                  placeholder="e.g. Vikram Singhania"
                  value={formData.adminName}
                  onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                />
                <Input
                  label="Admin Email Address"
                  type="email"
                  required
                  placeholder="admin@company.com"
                  value={formData.adminEmail}
                  onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                />
              </div>

              <Input
                label="Phone Number"
                placeholder="+91 98111 22334"
                value={formData.adminPhone}
                onChange={(e) => setFormData({ ...formData, adminPhone: e.target.value })}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Create Password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <Input
                  label="Confirm Password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                />
              </div>

              <div className="pt-4 flex items-center justify-between">
                <Button type="button" variant="outline" onClick={() => setStep(1)}>
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </Button>
                <Button type="submit" isLoading={loading}>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Complete Setup &amp; Initialize CRM</span>
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
