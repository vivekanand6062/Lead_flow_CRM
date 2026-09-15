'use client';

import React, { useState, useEffect } from 'react';
import { Plus, CheckSquare, AlertTriangle, Calendar, Clock, CheckCircle2 } from 'lucide-react';
import { FollowUpCard, FollowUpItem } from '@/components/crm/FollowUpCard';
import { Button } from '@/components/ui/Button';
import { FollowUpModal } from '@/components/crm/FollowUpModal';
import api from '@/services/api';

export default function ManagerFollowUpsPage() {
  const [categorized, setCategorized] = useState<{
    today: FollowUpItem[];
    upcoming: FollowUpItem[];
    overdue: FollowUpItem[];
    completed: FollowUpItem[];
  }>({ today: [], upcoming: [], overdue: [], completed: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ALL' | 'OVERDUE' | 'TODAY' | 'UPCOMING' | 'COMPLETED'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchFollowUps = async () => {
    try {
      setLoading(true);
      const res = await api.get('/follow-ups');
      setCategorized(res.data.categorized || { today: [], upcoming: [], overdue: [], completed: [] });
    } catch (err) {
      console.error('Failed to load follow-ups', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFollowUps();
  }, []);

  const handleToggleStatus = async (id: string, newStatus: FollowUpItem['status']) => {
    try {
      await api.put(`/follow-ups/${id}`, { status: newStatus });
      fetchFollowUps();
    } catch (err) {
      console.error('Failed to update follow-up status', err);
    }
  };

  const totalCount = categorized.today.length + categorized.upcoming.length + categorized.overdue.length + categorized.completed.length;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-text-primary-light dark:text-text-primary-dark">
            Team Follow-ups Hub
          </h2>
          <p className="text-xs text-text-muted-light dark:text-text-muted-dark mt-0.5">
            Monitor client follow-up commitments, call milestones, and resolve overdue activities.
          </p>
        </div>

        <Button size="sm" onClick={() => setIsModalOpen(true)}>
          <Plus className="w-3.5 h-3.5" />
          <span>New Follow-up</span>
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 border-b border-border-light dark:border-border-dark pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('ALL')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            activeTab === 'ALL'
              ? 'bg-copper-500 text-white'
              : 'text-text-secondary-light dark:text-text-secondary-dark hover:bg-surface-elevated-light dark:hover:bg-surface-elevated-dark'
          }`}
        >
          All Tasks ({totalCount})
        </button>

        <button
          onClick={() => setActiveTab('OVERDUE')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'OVERDUE'
              ? 'bg-crimson-600 text-white'
              : 'text-crimson-600 dark:text-crimson-400 hover:bg-crimson-500/10'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Overdue ({categorized.overdue.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('TODAY')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            activeTab === 'TODAY'
              ? 'bg-copper-500 text-white'
              : 'text-text-secondary-light dark:text-text-secondary-dark hover:bg-surface-elevated-light dark:hover:bg-surface-elevated-dark'
          }`}
        >
          Today ({categorized.today.length})
        </button>

        <button
          onClick={() => setActiveTab('UPCOMING')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            activeTab === 'UPCOMING'
              ? 'bg-copper-500 text-white'
              : 'text-text-secondary-light dark:text-text-secondary-dark hover:bg-surface-elevated-light dark:hover:bg-surface-elevated-dark'
          }`}
        >
          Upcoming ({categorized.upcoming.length})
        </button>

        <button
          onClick={() => setActiveTab('COMPLETED')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            activeTab === 'COMPLETED'
              ? 'bg-copper-500 text-white'
              : 'text-text-secondary-light dark:text-text-secondary-dark hover:bg-surface-elevated-light dark:hover:bg-surface-elevated-dark'
          }`}
        >
          Completed ({categorized.completed.length})
        </button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-text-muted-light dark:text-text-muted-dark">
          <div className="w-6 h-6 border-2 border-copper-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <span className="text-xs">Loading follow-ups...</span>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Overdue Section */}
          {(activeTab === 'ALL' || activeTab === 'OVERDUE') && categorized.overdue.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-crimson-600 dark:text-crimson-400 uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4" />
                <span>Overdue Activities ({categorized.overdue.length})</span>
              </div>
              <div className="space-y-2.5">
                {categorized.overdue.map(f => (
                  <FollowUpCard key={f._id} followUp={f} onToggleStatus={handleToggleStatus} />
                ))}
              </div>
            </div>
          )}

          {/* Today Section */}
          {(activeTab === 'ALL' || activeTab === 'TODAY') && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">
                <Clock className="w-4 h-4 text-copper-500" />
                <span>Due Today ({categorized.today.length})</span>
              </div>
              {categorized.today.length === 0 ? (
                <p className="text-xs text-text-muted-light dark:text-text-muted-dark p-4 border border-dashed border-border-light dark:border-border-dark rounded-xl text-center">
                  No tasks scheduled for today.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {categorized.today.map(f => (
                    <FollowUpCard key={f._id} followUp={f} onToggleStatus={handleToggleStatus} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Upcoming Section */}
          {(activeTab === 'ALL' || activeTab === 'UPCOMING') && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">
                <Calendar className="w-4 h-4 text-lavender-500" />
                <span>Upcoming Milestones ({categorized.upcoming.length})</span>
              </div>
              {categorized.upcoming.length === 0 ? (
                <p className="text-xs text-text-muted-light dark:text-text-muted-dark p-4 border border-dashed border-border-light dark:border-border-dark rounded-xl text-center">
                  No upcoming follow-ups scheduled.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {categorized.upcoming.map(f => (
                    <FollowUpCard key={f._id} followUp={f} onToggleStatus={handleToggleStatus} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Completed Section */}
          {(activeTab === 'ALL' || activeTab === 'COMPLETED') && categorized.completed.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-text-muted-light dark:text-text-muted-dark uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Completed Tasks ({categorized.completed.length})</span>
              </div>
              <div className="space-y-2.5">
                {categorized.completed.map(f => (
                  <FollowUpCard key={f._id} followUp={f} onToggleStatus={handleToggleStatus} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <FollowUpModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchFollowUps}
      />
    </div>
  );
}
