'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import api from '@/services/api';

interface LeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  lead?: any; // If passed, edit mode
  agentsList?: { id: string; name: string }[];
  isManager?: boolean;
}

export const LeadModal: React.FC<LeadModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  lead,
  agentsList = [],
  isManager = false
}) => {
  const [formData, setFormData] = useState({
    name: '',
    companyName: '',
    email: '',
    phone: '',
    status: 'NEW',
    leadSource: 'Website',
    estimatedValue: 0,
    assignedAgentId: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (lead) {
      setFormData({
        name: lead.name || '',
        companyName: lead.companyName || '',
        email: lead.email || '',
        phone: lead.phone || '',
        status: lead.status || 'NEW',
        leadSource: lead.leadSource || 'Website',
        estimatedValue: lead.estimatedValue || 0,
        assignedAgentId: lead.assignedAgentId?._id || lead.assignedAgentId || '',
        notes: lead.notes || ''
      });
    } else {
      setFormData({
        name: '',
        companyName: '',
        email: '',
        phone: '',
        status: 'NEW',
        leadSource: 'Website',
        estimatedValue: 0,
        assignedAgentId: '',
        notes: ''
      });
    }
    setError('');
  }, [lead, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.companyName.trim()) {
      setError('Lead name and company name are required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (lead) {
        await api.put(`/leads/${lead._id}`, formData);
      } else {
        await api.post('/leads', formData);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Failed to save lead', err);
      setError(err.response?.data?.message || 'Failed to save lead record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={lead ? 'Edit Commercial Lead' : 'Create New Commercial Lead'}
      description="Record stakeholder details, commercial value, and lifecycle status."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-xs bg-[rgba(215,101,101,0.12)] border border-[rgba(215,101,101,0.3)] text-[#D76565] rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Lead / Stakeholder Name"
            placeholder="e.g. Vikram Malhotra"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <Input
            label="Company Name"
            placeholder="e.g. Tata Digital"
            required
            value={formData.companyName}
            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Business Email"
            type="email"
            placeholder="name@company.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <Input
            label="Phone Number"
            placeholder="+91 98765 43210"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Lead Status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          >
            <option value="NEW">NEW</option>
            <option value="CONTACTED">CONTACTED</option>
            <option value="QUALIFIED">QUALIFIED</option>
            <option value="PROPOSAL">PROPOSAL</option>
            <option value="NEGOTIATION">NEGOTIATION</option>
            <option value="WON">WON</option>
            <option value="LOST">LOST</option>
          </Select>

          <Select
            label="Lead Source"
            value={formData.leadSource}
            onChange={(e) => setFormData({ ...formData, leadSource: e.target.value })}
          >
            <option value="Website">Website</option>
            <option value="Inbound Web">Inbound Web</option>
            <option value="Partner Referral">Partner Referral</option>
            <option value="Direct Sales">Direct Sales</option>
            <option value="LinkedIn Campaign">LinkedIn Campaign</option>
            <option value="Webinar">Webinar</option>
            <option value="Cold Outreach">Cold Outreach</option>
          </Select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Estimated Deal Value (₹)"
            type="number"
            placeholder="500000"
            value={formData.estimatedValue}
            onChange={(e) => setFormData({ ...formData, estimatedValue: Number(e.target.value) })}
          />

          {isManager && (
            <Select
              label="Assign Sales Agent"
              value={formData.assignedAgentId}
              onChange={(e) => setFormData({ ...formData, assignedAgentId: e.target.value })}
            >
              <option value="">Unassigned</option>
              {agentsList.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name}
                </option>
              ))}
            </Select>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-[#665C65] dark:text-[#B8AEB9] mb-1.5">
            Initial Discovery Notes
          </label>
          <textarea
            rows={3}
            placeholder="Key discussion points, pain points, timeline requirements..."
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
            {lead ? 'Save Changes' : 'Create Lead'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
