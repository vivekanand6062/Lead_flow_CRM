'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import api from '@/services/api';

interface DealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  deal?: any;
  agentsList?: { id: string; name: string }[];
  isManager?: boolean;
}

export const DealModal: React.FC<DealModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  deal,
  agentsList = [],
  isManager = false
}) => {
  const [formData, setFormData] = useState({
    title: '',
    companyName: '',
    value: 500000,
    probability: 50,
    stage: 'QUALIFIED',
    expectedCloseDate: '',
    assignedAgentId: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (deal) {
      const dateStr = deal.expectedCloseDate ? new Date(deal.expectedCloseDate).toISOString().split('T')[0] : '';
      setFormData({
        title: deal.title || '',
        companyName: deal.companyName || '',
        value: deal.value || 0,
        probability: deal.probability || 50,
        stage: deal.stage || 'QUALIFIED',
        expectedCloseDate: dateStr,
        assignedAgentId: deal.assignedAgentId?._id || deal.assignedAgentId || '',
        notes: deal.notes || ''
      });
    } else {
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 30);
      setFormData({
        title: '',
        companyName: '',
        value: 500000,
        probability: 50,
        stage: 'QUALIFIED',
        expectedCloseDate: defaultDate.toISOString().split('T')[0],
        assignedAgentId: '',
        notes: ''
      });
    }
    setError('');
  }, [deal, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.companyName.trim() || !formData.expectedCloseDate) {
      setError('Title, company name, and close date are required.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      if (deal?._id) {
        await api.put(`/deals/${deal._id}`, formData);
      } else {
        await api.post('/deals', formData);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save deal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={deal ? 'Edit Deal Opportunity' : 'Create Pipeline Deal'}
      description="Record deal value, estimated close date, and pipeline milestone"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-xs bg-[rgba(215,101,101,0.12)] text-[#D76565] border border-[rgba(215,101,101,0.3)] rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Deal Title"
            required
            placeholder="e.g. Enterprise Cloud Migration"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
          <Input
            label="Target Account / Company"
            required
            placeholder="e.g. XYZ Technologies"
            value={formData.companyName}
            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Deal Value (₹)"
            type="number"
            required
            placeholder="500000"
            value={formData.value}
            onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
          />
          <Input
            label="Win Probability (%)"
            type="number"
            min={0}
            max={100}
            placeholder="50"
            value={formData.probability}
            onChange={(e) => setFormData({ ...formData, probability: Number(e.target.value) })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Pipeline Stage"
            value={formData.stage}
            onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
          >
            <option value="QUALIFIED">QUALIFIED</option>
            <option value="PROPOSAL">PROPOSAL</option>
            <option value="NEGOTIATION">NEGOTIATION</option>
            <option value="WON">WON</option>
            <option value="LOST">LOST</option>
          </Select>

          <Input
            label="Expected Close Date"
            type="date"
            required
            value={formData.expectedCloseDate}
            onChange={(e) => setFormData({ ...formData, expectedCloseDate: e.target.value })}
          />
        </div>

        {isManager && (
          <div>
            <Select
              label="Assigned Sales Agent"
              value={formData.assignedAgentId}
              onChange={(e) => setFormData({ ...formData, assignedAgentId: e.target.value })}
            >
              <option value="">Select Agent</option>
              {agentsList.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name}
                </option>
              ))}
            </Select>
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-[#665C65] dark:text-[#B8AEB9] mb-1.5">
            Opportunity Notes
          </label>
          <textarea
            rows={3}
            placeholder="Key decision makers, contractual timeline, budget authority..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full text-xs rounded-lg border border-[#E5DCD5] dark:border-[#2A242D] bg-[#FFFFFF] dark:bg-[#141117] p-2.5 text-[#211A20] dark:text-[#F5F1F3] placeholder-[#8A7F87] dark:placeholder-[#817783] focus:outline-none focus:border-[#A9683F] dark:focus:border-[#C08457] focus:ring-1 focus:ring-[#A9683F] dark:focus:ring-[#C08457] transition-all"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E5DCD5] dark:border-[#2A242D]">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" size="sm" isLoading={loading}>
            {deal ? 'Save Changes' : 'Create Deal'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
