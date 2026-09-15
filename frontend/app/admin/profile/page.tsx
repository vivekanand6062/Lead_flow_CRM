'use client';

import React, { useState } from 'react';
import { User, Lock, CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/store/AuthContext';
import api from '@/services/api';

export default function AdminProfilePage() {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');
      await api.put('/auth/profile', {
        name: formData.name,
        phone: formData.phone,
        currentPassword: formData.currentPassword || undefined,
        newPassword: formData.newPassword || undefined
      });
      updateUser({ name: formData.name, phone: formData.phone });
      setSuccess('Profile updated successfully.');
      setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-text-primary-light dark:text-text-primary-dark">
          Admin Profile &amp; Security
        </h2>
        <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-0.5">
          Manage your personal executive credentials and security settings.
        </p>
      </div>

      {success && (
        <div className="p-3 text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-3 text-xs bg-crimson-500/10 text-crimson-400 border border-crimson-500/20 rounded-xl">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-surface-light dark:bg-surface-elevated-dark border border-border-light dark:border-border-dark rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border-light dark:border-border-dark">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-text-tertiary-light dark:text-text-tertiary-dark uppercase tracking-wider">
            <User className="w-4 h-4 text-copper-400" />
            <span>Account Details</span>
          </div>
          <Badge type={user?.role} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Full Name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <Input
            label="Email Address"
            disabled
            value={user?.email || ''}
            hint="Email cannot be modified directly."
          />
        </div>

        <Input
          label="Phone Number"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        />

        <div className="pt-4 border-t border-border-light dark:border-border-dark space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-text-tertiary-light dark:text-text-tertiary-dark uppercase tracking-wider">
            <Lock className="w-4 h-4 text-copper-400" />
            <span>Change Password</span>
          </div>

          <Input
            label="Current Password"
            type="password"
            placeholder="••••••••"
            value={formData.currentPassword}
            onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="New Password"
              type="password"
              placeholder="••••••••"
              value={formData.newPassword}
              onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
            />
            <Input
              label="Confirm New Password"
              type="password"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            />
          </div>
        </div>

        <div className="pt-3 flex justify-end">
          <Button type="submit" size="sm" isLoading={loading}>
            Update Profile
          </Button>
        </div>
      </form>
    </div>
  );
}
