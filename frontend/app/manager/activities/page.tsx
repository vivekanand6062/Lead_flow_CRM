'use client';

import React, { useState, useEffect } from 'react';
import { Clock, Plus, Phone, Mail, Calendar, CheckSquare } from 'lucide-react';
import { ActivityTimeline, ActivityItem } from '@/components/crm/ActivityTimeline';
import { Button } from '@/components/ui/Button';
import { ActivityModal } from '@/components/crm/ActivityModal';
import api from '@/services/api';

export default function ManagerActivitiesPage() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const res = await api.get('/activities');
      setActivities(res.data.data || []);
    } catch (err) {
      console.error('Failed to load team activities', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-text-primary-light dark:text-text-primary-dark">
            Team Activity Feed
          </h2>
          <p className="text-xs text-text-muted-light dark:text-text-muted-dark mt-0.5">
            Chronological audit of calls, meetings, customer demos, and notes logged across your team.
          </p>
        </div>

        <Button size="sm" onClick={() => setIsModalOpen(true)}>
          <Plus className="w-3.5 h-3.5" />
          <span>Log Activity</span>
        </Button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-text-muted-light dark:text-text-muted-dark">
          <div className="w-6 h-6 border-2 border-copper-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <span className="text-xs">Loading activity timeline...</span>
        </div>
      ) : (
        <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl p-6 shadow-xs">
          <ActivityTimeline activities={activities} />
        </div>
      )}

      <ActivityModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchActivities}
      />
    </div>
  );
}
