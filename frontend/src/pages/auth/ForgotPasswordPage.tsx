import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import api from '@/services/api';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your work email address.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      // API call to POST /api/auth/forgot-password
      await api.post('/auth/forgot-password', { email: email.trim() });
      // Generic success regardless of whether email exists
      setSubmitted(true);
    } catch (err: any) {
      if (err.response?.status === 429) {
        setError(err.response?.data?.message || 'Too many reset requests. Please wait a few minutes before trying again.');
      } else {
        setError(err.response?.data?.message || 'Failed to send reset link. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-surface-canvas-light dark:bg-surface-canvas-dark text-text-primary-light dark:text-text-primary-dark transition-colors relative overflow-hidden">
      {/* Background Copper & Plum Auras */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[320px] bg-[radial-gradient(ellipse_at_top,rgba(192,132,87,0.12),transparent_70%)] pointer-events-none" />
      <div className="absolute -bottom-32 right-1/4 w-[400px] h-[300px] bg-[radial-gradient(ellipse_at_bottom,rgba(155,138,251,0.06),transparent_70%)] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* Logo and Brand */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="mb-3">
            <Logo size="xl" imgOnly />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-text-primary-light dark:text-text-primary-dark">
            Reset Your Password
          </h2>
          <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-1 font-mono">
            Midnight Plum × Copper B2B Enterprise CRM
          </p>
        </div>

        {/* Card */}
        <div className="bg-surface-light dark:bg-surface-elevated-dark border border-border-light dark:border-border-dark rounded-2xl p-6 sm:p-8 shadow-card relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-copper-500/50 to-transparent" />

          {submitted ? (
            <div className="space-y-5 animate-in fade-in duration-300">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 mx-auto border border-emerald-500/20">
                <CheckCircle2 className="w-6 h-6" />
              </div>

              <div className="text-center">
                <h3 className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">
                  Instructions Dispatched
                </h3>
                <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-2 leading-relaxed">
                  If an account exists with this email, password reset instructions have been sent.
                </p>
              </div>

              <div className="p-3.5 bg-surface-canvas-light dark:bg-surface-canvas-dark border border-border-light dark:border-border-dark rounded-xl text-[11px] text-text-secondary-light dark:text-text-secondary-dark space-y-1.5">
                <p className="font-medium text-text-primary-light dark:text-text-primary-dark">Security Notice:</p>
                <p>• The reset link expires in <strong>15 minutes</strong>.</p>
                <p>• Check your spam or quarantine folder if you don't see it shortly.</p>
                <p>• The link is single-use and will be invalidated once used.</p>
              </div>

              <div className="pt-2 flex flex-col space-y-2.5">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full text-xs"
                  onClick={() => {
                    setSubmitted(false);
                    setEmail('');
                  }}
                >
                  <span>Try another email</span>
                </Button>

                <Link
                  to="/login"
                  className="flex items-center justify-center text-xs font-medium text-copper-600 dark:text-copper-400 hover:underline py-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-5 p-3.5 text-xs bg-crimson-500/10 text-crimson-400 border border-crimson-500/20 rounded-xl flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mb-5 leading-relaxed">
                Enter your work email address below. We'll generate a secure, single-use link for you to set a new password.
              </p>

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

                <Button type="submit" className="w-full mt-2" isLoading={loading}>
                  <span>Send Reset Link</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </form>

              <div className="mt-6 pt-5 border-t border-border-light dark:border-border-dark text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center text-xs font-medium text-copper-600 dark:text-copper-400 hover:underline transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Security Note */}
        <p className="text-center text-[11px] text-text-tertiary-light dark:text-text-tertiary-dark mt-6 font-mono">
          Anti-enumeration protection • SHA-256 token hashing • Single-use link
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
