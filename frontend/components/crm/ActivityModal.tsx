'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import api from '@/services/api';

interface ActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  leadId?: string;
  dealId?: string;
  contactId?: string;
  defaultCustomer?: string;
}

export const ActivityModal: React.FC<ActivityModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  leadId,
  dealId,
  contactId,
  defaultCustomer = ''
}) => {
  const [formData, setFormData] = useState({
    type: 'CALL',
    title: '',
    relatedCustomer: defaultCustomer,
    notes: '',
    status: 'COMPLETED'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Activity title is required.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await api.post('/activities', {
        ...formData,
        leadId: leadId || null,
        dealId: dealId || null,
        contactId: contactId || null,
        date: new Date()
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to record activity');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Log Sales Activity"
      description="Record a call, meeting, email, or key customer interaction"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-xs bg-[rgba(215,101,101,0.12)] text-[#D76565] border border-[rgba(215,101,101,0.3)] rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Activity Type"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          >
            <option value="CALL">Call</option>
            <option value="EMAIL">Email</option>
            <option value="MEETING">Meeting</option>
            <option value="TASK">Task</option>
            <option value="NOTE">Note</option>
            <option value="FOLLOW_UP">Follow-up</option>
          </Select>

          <Input
            label="Activity Summary / Title"
            required
            placeholder="e.g. Discussed SLA & Security Terms"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
        </div>

        <Input
          label="Related Customer / Company"
          placeholder="e.g. Rahul Sharma (XYZ Technologies)"
          value={formData.relatedCustomer}
          onChange={(e) => setFormData({ ...formData, relatedCustomer: e.target.value })}
        />

        <div>
          <label className="block text-xs font-medium text-[#665C65] dark:text-[#B8AEB9] mb-1.5">
            Interaction Details &amp; Notes
          </label>
          <textarea
            rows={4}
            required
            placeholder="Document key questions answered, commitments made, next actions agreed..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full text-xs rounded-lg border border-[#E5DCD5] dark:border-[#2A242D] bg-[#FFFFFF] dark:bg-[#141117] p-2.5 text-[#211A20] dark:text-[#F5F1F3] placeholder-[#8A7F87] dark:placeholder-[#817783] focus:outline-none focus:ring-1 focus:ring-[#A9683F] dark:focus:ring-[#C08457] focus:border-[#A9683F] dark:focus:border-[#C08457] transition-colors"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E5DCD5] dark:border-[#2A242D]">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" size="sm" isLoading={loading}>
            Save Activity
          </Button>
        </div>
      </form>
    </Modal>
  );
};
