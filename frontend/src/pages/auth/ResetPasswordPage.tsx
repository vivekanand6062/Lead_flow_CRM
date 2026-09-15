import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowRight, ArrowLeft, KeyRound } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import api from '@/services/api';

function ResetPasswordForm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // If token is missing from the URL
  if (!token) {
    return (
      <div className="bg-surface-light dark:bg-surface-elevated-dark border border-border-light dark:border-border-dark rounded-2xl p-6 sm:p-8 shadow-card relative overflow-hidden text-center space-y-5">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-crimson-500/10 text-crimson-400 mx-auto border border-crimson-500/20">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">
            Invalid or Missing Reset Link
          </h3>
          <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-2 leading-relaxed">
            No valid reset token was detected in your link. Please request a new password reset link.
          </p>
        </div>
        <div className="pt-2">
          <Link to="/forgot-password">
            <Button className="w-full text-xs">
              <span>Request a new reset link</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Success view
  if (success) {
    return (
      <div className="bg-surface-light dark:bg-surface-elevated-dark border border-border-light dark:border-border-dark rounded-2xl p-6 sm:p-8 shadow-card relative overflow-hidden text-center space-y-5">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 mx-auto border border-emerald-500/20">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">
            Password reset successfully.
          </h3>
          <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-2 leading-relaxed">
            You can now log in with your new password. All previously issued sessions have been safely invalidated.
          </p>
        </div>
        <div className="pt-2">
          <Link to="/login">
            <Button className="w-full text-xs">
              <span>Back to Login</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const isLengthValid = newPassword.length >= 8;
  const isMatchValid = newPassword.length > 0 && newPassword === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLengthValid) {
      setError('Password must be at least 8 characters in length.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please verify both fields.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      await api.post('/auth/reset-password', {
        token: token.trim(),
        newPassword
      });

      setSuccess(true);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'This password reset link is invalid or has expired.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const isTokenError = error.toLowerCase().includes('expired') || error.toLowerCase().includes('already been used') || error.toLowerCase().includes('invalid');

  return (
    <div className="bg-surface-light dark:bg-surface-elevated-dark border border-border-light dark:border-border-dark rounded-2xl p-6 sm:p-8 shadow-card relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-copper-500/50 to-transparent" />

      {error && (
        <div className="mb-5 p-3.5 text-xs bg-crimson-500/10 text-crimson-400 border border-crimson-500/20 rounded-xl flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p>{error}</p>
            {isTokenError && (
              <div className="pt-1">
                <Link
                  to="/forgot-password"
                  className="font-medium text-copper-500 dark:text-copper-400 underline hover:opacity-80"
                >
                  Request a new reset link →
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark">
              New Password <span className="text-crimson-400">*</span>
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
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark mb-1.5">
            Confirm New Password <span className="text-crimson-400">*</span>
          </label>
          <Input
            type={showPassword ? 'text' : 'password'}
            required
            placeholder="••••••••"
            icon={<KeyRound className="w-4 h-4" />}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        {/* Live Validation Rules */}
        <div className="p-3 bg-surface-canvas-light dark:bg-surface-canvas-dark border border-border-light dark:border-border-dark rounded-xl text-[11px] space-y-1">
          <div className={`flex items-center space-x-2 ${isLengthValid ? 'text-emerald-500 dark:text-emerald-400' : 'text-text-tertiary-light dark:text-text-tertiary-dark'}`}>
            <span className="text-xs">{isLengthValid ? '✓' : '○'}</span>
            <span>At least 8 characters</span>
          </div>
          <div className={`flex items-center space-x-2 ${isMatchValid ? 'text-emerald-500 dark:text-emerald-400' : 'text-text-tertiary-light dark:text-text-tertiary-dark'}`}>
            <span className="text-xs">{isMatchValid ? '✓' : '○'}</span>
            <span>Passwords match</span>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full mt-2"
          isLoading={loading}
          disabled={!isLengthValid || !isMatchValid}
        >
          <span>Reset Password</span>
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
    </div>
  );
}

export const ResetPasswordPage: React.FC = () => {
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
            Set New Password
          </h2>
          <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-1 font-mono">
            Midnight Plum × Copper B2B Enterprise CRM
          </p>
        </div>

        <ResetPasswordForm />

        {/* Security Note */}
        <p className="text-center text-[11px] text-text-tertiary-light dark:text-text-tertiary-dark mt-6 font-mono">
          Bcrypt hashing • Session revocation • Organization-scoped security
        </p>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
