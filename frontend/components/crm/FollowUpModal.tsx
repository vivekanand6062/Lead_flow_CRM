'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import api from '@/services/api';

interface FollowUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultContact?: string;
  leadId?: string;
  dealId?: string;
}

export const FollowUpModal: React.FC<FollowUpModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultContact = '',
  leadId,
  dealId
}) => {
  const [formData, setFormData] = useState({
    contactName: defaultContact,
    title: '',
    type: 'CALL',
    dueDate: new Date().toISOString().split('T')[0],
    time: '04:00 PM',
    priority: 'HIGH',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.contactName.trim() || !formData.dueDate) {
      setError('Title, contact name, and date are required.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await api.post('/follow-ups', {
        ...formData,
        leadId: leadId || null,
        dealId: dealId || null
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to schedule follow-up');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Schedule Follow-up Task"
      description="Create a prioritized task with deadline and reminder"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-xs bg-[rgba(215,101,101,0.12)] text-[#D76565] border border-[rgba(215,101,101,0.3)] rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Follow-up Title"
            required
            placeholder="e.g. Contract Negotiation Call"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
          <Input
            label="Target Contact / Account"
            required
            placeholder="e.g. Rahul Verma (XYZ Technologies)"
            value={formData.contactName}
            onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Action Type"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          >
            <option value="CALL">Call</option>
            <option value="EMAIL">Email</option>
            <option value="MEETING">Meeting</option>
            <option value="TASK">Task</option>
          </Select>

          <Select
            label="Priority Level"
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
          >
            <option value="HIGH">HIGH (Urgent Milestone)</option>
            <option value="MEDIUM">MEDIUM (Standard Cadence)</option>
            <option value="LOW">LOW (Low Pressure)</option>
          </Select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Due Date"
            type="date"
            required
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
          />
          <Input
            label="Time"
            placeholder="04:00 PM"
            value={formData.time}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[#665C65] dark:text-[#B8AEB9] mb-1.5">
            Objective &amp; Talking Points
          </label>
          <textarea
            rows={3}
            placeholder="Objective of this follow-up, commitments to verify..."
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
            Schedule Follow-up
          </Button>
        </div>
      </form>
    </Modal>
  );
};
