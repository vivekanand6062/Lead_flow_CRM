
import React, { useState, useEffect } from 'react';
import { Building2, Shield, Clock, CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import api from '@/services/api';

export const AdminSettingsPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    currency: 'INR'
  });
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/settings');
      const org = res.data?.data?.organization || {};
      setFormData({
        name: org.name || '',
        industry: org.industry || 'Enterprise Software & SaaS',
        email: org.email || '',
        phone: org.phone || '',
        website: org.website || '',
        address: org.address || '',
        currency: org.currency || 'INR'
      });
      setAuditLogs(res.data?.data?.auditLogs || []);
    } catch (err) {
      console.error('Failed to load settings', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setSuccessMsg('');
      setErrorMsg('');
      await api.put('/settings', formData);
      setSuccessMsg('Organization settings saved successfully.');
      fetchSettings();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to save organization settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-text-tertiary-dark">
        <div className="w-7 h-7 border-2 border-copper-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <span className="text-xs font-mono tracking-wide">Loading organization settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-text-primary-light dark:text-text-primary-dark">
          Organization Settings &amp; Configuration
        </h2>
        <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-0.5">
          Manage enterprise details, regional currencies, and audit event logs.
        </p>
      </div>

      {successMsg && (
        <div className="p-3 text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 text-xs bg-crimson-500/10 text-crimson-400 border border-crimson-500/20 rounded-xl">
          {errorMsg}
        </div>
      )}

      {/* Organization Profile Form */}
      <form onSubmit={handleSave} className="bg-surface-light dark:bg-surface-elevated-dark border border-border-light dark:border-border-dark rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-border-light dark:border-border-dark text-xs font-mono font-semibold text-text-tertiary-light dark:text-text-tertiary-dark uppercase tracking-wider">
          <Building2 className="w-4 h-4 text-copper-400" />
          <span>Organization Profile</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Organization Legal Name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
            <option value="Consulting & Professional Services">Consulting &amp; Professional Services</option>
          </Select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Official Business Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <Input
            label="Headquarters Phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Corporate Website"
            value={formData.website}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
          />
          <Select
            label="Default Currency"
            value={formData.currency}
            onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
          >
            <option value="INR">INR (₹) — Indian Rupee</option>
            <option value="USD">USD ($) — US Dollar</option>
            <option value="EUR">EUR (€) — Euro</option>
            <option value="GBP">GBP (£) — British Pound</option>
          </Select>
        </div>

        <Input
          label="Corporate Address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
        />

        <div className="pt-3 flex justify-end">
          <Button type="submit" size="sm" isLoading={saving}>
            Save Changes
          </Button>
        </div>
      </form>

      {/* Audit Log Table */}
      <div className="bg-surface-light dark:bg-surface-elevated-dark border border-border-light dark:border-border-dark rounded-xl p-6 shadow-xs">
        <div className="flex items-center gap-2 pb-3 border-b border-border-light dark:border-border-dark text-xs font-mono font-semibold text-text-tertiary-light dark:text-text-tertiary-dark uppercase tracking-wider mb-4">
          <Shield className="w-4 h-4 text-copper-400" />
          <span>Security &amp; Audit Event Log</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border-light dark:border-border-dark text-[10px] font-mono uppercase tracking-wider text-text-tertiary-light dark:text-text-tertiary-dark font-semibold">
                <th className="pb-2">Timestamp</th>
                <th className="pb-2">Initiator</th>
                <th className="pb-2">Action</th>
                <th className="pb-2">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light dark:divide-border-dark">
              {auditLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-text-tertiary-light dark:text-text-tertiary-dark">
                    No audit records registered yet.
                  </td>
                </tr>
              ) : (
                auditLogs.map((log: any) => (
                  <tr key={log._id} className="hover:bg-surface-muted-light dark:hover:bg-surface-dark transition-colors">
                    <td className="py-2.5 font-mono text-[11px] text-text-tertiary-light dark:text-text-tertiary-dark whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 font-medium text-text-primary-light dark:text-text-primary-dark">
                      {log.userName} <span className="text-[10px] text-copper-500 font-mono">({log.userRole})</span>
                    </td>
                    <td className="py-2.5 font-semibold text-text-primary-light dark:text-text-primary-dark">
                      {log.action}
                    </td>
                    <td className="py-2.5 text-text-secondary-light dark:text-text-secondary-dark">
                      {log.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


export default AdminSettingsPage;
