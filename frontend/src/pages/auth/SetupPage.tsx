import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Building2, ShieldCheck, ArrowRight, Lock, Mail, User, Eye, EyeOff, ShieldAlert } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import api from '@/services/api';

export const SetupPage: React.FC = () => {
  const navigate = useNavigate();
  const [checkingSetup, setCheckingSetup] = useState(true);
  const [setupCompleted, setSetupCompleted] = useState(false);
  const [orgName, setOrgName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    companyName: '',
    adminName: '',
    adminEmail: '',
    password: '',
    confirmPassword: ''
  });

  // Verify setup status on mount: check if real organization already exists
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await api.get('/setup/status');
        if (res.data.setupCompleted) {
          setSetupCompleted(true);
          setOrgName(res.data.organizationName || 'Production Organization');
        } else {
          setSetupCompleted(false);
        }
      } catch (err) {
        console.error('Error verifying setup status', err);
      } finally {
        setCheckingSetup(false);
      }
    };
    checkStatus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.companyName.trim() || !formData.adminName.trim() || !formData.adminEmail.trim()) {
      setError('Please provide Organization Name, Admin Full Name, and Admin Email.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters in length.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please verify both fields.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const res = await api.post('/setup', {
        companyName: formData.companyName.trim(),
        adminName: formData.adminName.trim(),
        adminEmail: formData.adminEmail.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword
      });

      // Auto-authenticate newly created Admin
      if (res.data.token && res.data.user) {
        localStorage.setItem('leadflow_token', res.data.token);
        localStorage.setItem('leadflow_user', JSON.stringify(res.data.user));
      }

      // Directly redirect to Admin Dashboard
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to complete initial system setup.');
    } finally {
      setLoading(false);
    }
  };

  if (checkingSetup) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-canvas-light dark:bg-surface-canvas-dark text-text-primary-light dark:text-text-primary-dark">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-2 border-copper-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark font-mono">
            Verifying system initialization state...
          </p>
        </div>
      </div>
    );
  }

  // If real setup is already completed: LOCKED STATE
  if (setupCompleted) {
    return (
      <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-surface-canvas-light dark:bg-surface-canvas-dark text-text-primary-light dark:text-text-primary-dark transition-colors relative overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[320px] bg-[radial-gradient(ellipse_at_top,rgba(192,132,87,0.12),transparent_70%)] pointer-events-none" />
        <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="mb-3">
              <Logo size="xl" imgOnly />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-text-primary-light dark:text-text-primary-dark">
              Setup Locked
            </h2>
            <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-1 font-mono">
              LeadFlow CRM • System Initialized
            </p>
          </div>

          <div className="bg-surface-light dark:bg-surface-elevated-dark border border-border-light dark:border-border-dark rounded-2xl p-6 sm:p-8 shadow-card relative overflow-hidden text-center space-y-5">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-copper-500/10 text-copper-400 mx-auto border border-copper-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-semibold text-text-primary-light dark:text-text-primary-dark">
                Organization setup is already completed.
              </h3>
              <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-2 leading-relaxed">
                The primary organization <strong>{orgName}</strong> and its root administrator have already been established. Initial setup cannot be run again.
              </p>
            </div>

            <div className="p-3.5 bg-surface-canvas-light dark:bg-surface-canvas-dark border border-border-light dark:border-border-dark rounded-xl text-[11px] text-text-secondary-light dark:text-text-secondary-dark space-y-1 text-left">
              <p className="font-medium text-text-primary-light dark:text-text-primary-dark">Access Guidance:</p>
              <p>• To access the system, please log in with your primary Admin credentials.</p>
              <p>• If you forgot your password, use the password reset flow on the sign-in page.</p>
            </div>

            <div className="pt-2">
              <Link to="/login">
                <Button className="w-full text-xs">
                  <span>Go to Login</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Setup Form View
  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-surface-canvas-light dark:bg-surface-canvas-dark text-text-primary-light dark:text-text-primary-dark transition-colors relative overflow-hidden">
      {/* Background Copper & Plum Aura */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[320px] bg-[radial-gradient(ellipse_at_top,rgba(192,132,87,0.15),transparent_70%)] pointer-events-none" />
      <div className="absolute -bottom-32 right-1/4 w-[400px] h-[300px] bg-[radial-gradient(ellipse_at_bottom,rgba(155,138,251,0.06),transparent_70%)] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="mb-3">
            <Logo size="xl" imgOnly />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-text-primary-light dark:text-text-primary-dark">
            Initialize Real Organization
          </h2>
          <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-1 font-mono">
            One-time setup • Creates your primary organization & root Admin
          </p>
        </div>

        <div className="bg-surface-light dark:bg-surface-elevated-dark border border-border-light dark:border-border-dark rounded-2xl p-6 sm:p-8 shadow-card relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-copper-500/50 to-transparent" />

          {error && (
            <div className="mb-5 p-3.5 text-xs bg-crimson-500/10 text-crimson-400 border border-crimson-500/20 rounded-xl flex items-start space-x-2">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                label="Organization Name"
                required
                placeholder="Acme Global Technologies"
                icon={<Building2 className="w-4 h-4" />}
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              />
            </div>

            <div>
              <Input
                label="Admin Full Name"
                required
                placeholder="Alex Morgan"
                icon={<User className="w-4 h-4" />}
                value={formData.adminName}
                onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
              />
            </div>

            <div>
              <Input
                label="Admin Work Email"
                type="email"
                required
                placeholder="alex@acmeglobal.com"
                icon={<Mail className="w-4 h-4" />}
                value={formData.adminEmail}
                onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark">
                  Password <span className="text-crimson-400">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[11px] font-medium text-text-tertiary-light dark:text-text-tertiary-dark hover:text-copper-500 flex items-center space-x-1"
                >
                  {showPassword ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>Hide</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5" />
                      <span>Show</span>
                    </>
                  )}
                </button>
              </div>
              <Input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                icon={<Lock className="w-4 h-4" />}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark mb-1.5">
                Confirm Password <span className="text-crimson-400">*</span>
              </label>
              <Input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                icon={<Lock className="w-4 h-4" />}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              />
            </div>

            {/* Permanent Role Indicator */}
            <div className="p-3 bg-surface-canvas-light dark:bg-surface-canvas-dark border border-border-light dark:border-border-dark rounded-xl flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-copper-500" />
                <span className="text-xs font-medium text-text-primary-light dark:text-text-primary-dark">
                  Assigned Role
                </span>
              </div>
              <span className="text-[10px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-copper-500/10 text-copper-400 border border-copper-500/20">
                Primary Administrator (Fixed)
              </span>
            </div>

            <Button type="submit" className="w-full mt-2" isLoading={loading}>
              <span>Complete Setup & Launch Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-border-light dark:border-border-dark text-center">
            <Link
              to="/login"
              className="text-xs font-medium text-copper-600 dark:text-copper-400 hover:underline"
            >
              Already have an account? Sign in →
            </Link>
          </div>
        </div>

        <p className="text-center text-[11px] text-text-tertiary-light dark:text-text-tertiary-dark mt-6 font-mono">
          Strict single-admin architecture • Database unique constraint • Demo data preserved
        </p>
      </div>
    </div>
  );
};

export default SetupPage;
