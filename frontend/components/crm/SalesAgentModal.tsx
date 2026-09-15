'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import api from '@/services/api';

interface SalesAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  agent?: any;
}

export const SalesAgentModal: React.FC<SalesAgentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  agent
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    department: 'Enterprise AE',
    targetQuota: 2500000,
    status: 'ACTIVE'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (agent) {
      setFormData({
        name: agent.name || '',
        email: agent.email || '',
        password: '',
        phone: agent.phone || '',
        department: agent.department || 'Enterprise AE',
        targetQuota: agent.targetQuota || 2500000,
        status: agent.status || 'ACTIVE'
      });
    } else {
      setFormData({
        name: '',
        email: '',
        password: '',
        phone: '',
        department: 'Enterprise AE',
        targetQuota: 2500000,
        status: 'ACTIVE'
      });
    }
    setError('');
  }, [agent, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      setError('Name and email are required.');
      return;
    }
    if (!agent && !formData.password) {
      setError('Password is required for creating a new sales agent.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      if (agent?._id) {
        await api.put(`/users/agents/${agent._id}`, formData);
      } else {
        await api.post('/users/agents', formData);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save sales agent');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={agent ? 'Edit Sales Agent' : 'Add Sales Agent'}
      description="Register an account executive to manage deals, activities and quotas"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-xs bg-[rgba(215,101,101,0.12)] text-[#D76565] border border-[rgba(215,101,101,0.3)] rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Agent Full Name"
            required
            placeholder="e.g. Amit Verma"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <Input
            label="Work Email"
            type="email"
            required
            disabled={Boolean(agent)}
            placeholder="amit@company.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label={agent ? 'New Password (Optional)' : 'Initial Password'}
            type="password"
            required={!agent}
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
          <Input
            label="Phone Number"
            placeholder="+91 98111 22334"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Role / Title"
            placeholder="Senior Account Executive"
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
          />
          <Input
            label="Target Quota (₹)"
            type="number"
            placeholder="2500000"
            value={formData.targetQuota}
            onChange={(e) => setFormData({ ...formData, targetQuota: Number(e.target.value) })}
          />
        </div>

        {agent && (
          <div>
            <Select
              label="Account Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </Select>
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E5DCD5] dark:border-[#2A242D]">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" size="sm" isLoading={loading}>
            {agent ? 'Save Changes' : 'Create Agent'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
