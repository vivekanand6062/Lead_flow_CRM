'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import api from '@/services/api';

interface ManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  manager?: any;
}

export const ManagerModal: React.FC<ManagerModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  manager
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    department: 'Enterprise Sales',
    targetQuota: 5000000,
    status: 'ACTIVE'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (manager) {
      setFormData({
        name: manager.name || '',
        email: manager.email || '',
        password: '',
        phone: manager.phone || '',
        department: manager.department || 'Enterprise Sales',
        targetQuota: manager.targetQuota || 5000000,
        status: manager.status || 'ACTIVE'
      });
    } else {
      setFormData({
        name: '',
        email: '',
        password: '',
        phone: '',
        department: 'Enterprise Sales',
        targetQuota: 5000000,
        status: 'ACTIVE'
      });
    }
    setError('');
  }, [manager, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      setError('Name and email are required.');
      return;
    }
    if (!manager && !formData.password) {
      setError('Password is required for creating a new manager.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      if (manager?._id) {
        await api.put(`/users/managers/${manager._id}`, formData);
      } else {
        await api.post('/users/managers', formData);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save manager account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={manager ? 'Edit Manager' : 'Add Sales Manager'}
      description="Create a manager account responsible for sales teams and quota execution"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-xs bg-[rgba(215,101,101,0.12)] text-[#D76565] border border-[rgba(215,101,101,0.3)] rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Manager Full Name"
            required
            placeholder="e.g. Rahul Sharma"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <Input
            label="Work Email"
            type="email"
            required
            disabled={Boolean(manager)}
            placeholder="rahul@company.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label={manager ? 'New Password (Optional)' : 'Initial Password'}
            type="password"
            required={!manager}
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
          <Input
            label="Phone Number"
            placeholder="+91 98222 33445"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Department / Territory"
            placeholder="Enterprise Sales (West & North)"
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
          />
          <Input
            label="Target Quota (₹)"
            type="number"
            placeholder="5000000"
            value={formData.targetQuota}
            onChange={(e) => setFormData({ ...formData, targetQuota: Number(e.target.value) })}
          />
        </div>

        {manager && (
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
            {manager ? 'Save Changes' : 'Create Manager'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
