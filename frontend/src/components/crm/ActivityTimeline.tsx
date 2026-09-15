import React from 'react';
import { Phone, Mail, Calendar, CheckSquare, FileText, Clock } from 'lucide-react';

export interface ActivityItem {
  _id: string;
  type: 'CALL' | 'EMAIL' | 'MEETING' | 'TASK' | 'NOTE' | 'FOLLOW_UP';
  title: string;
  date: string | Date;
  relatedCustomer?: string;
  notes?: string;
  userId?: {
    name?: string;
    role?: string;
  };
}

interface ActivityTimelineProps {
  activities: ActivityItem[];
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ activities }) => {
  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'CALL':
        return <Phone className="w-3.5 h-3.5 text-[#A9683F] dark:text-[#C08457]" />;
      case 'EMAIL':
        return <Mail className="w-3.5 h-3.5 text-[#A9683F] dark:text-[#C08457]" />;
      case 'MEETING':
        return <Calendar className="w-3.5 h-3.5 text-[#704766] dark:text-[#8B5C86]" />;
      case 'TASK':
        return <CheckSquare className="w-3.5 h-3.5 text-[#3FA77A]" />;
      case 'NOTE':
        return <FileText className="w-3.5 h-3.5 text-[#D29A4A]" />;
      default:
        return <Clock className="w-3.5 h-3.5 text-[#8A7F87] dark:text-[#817783]" />;
    }
  };

  if (activities.length === 0) {
    return (
      <div className="p-8 text-center border border-dashed border-[#E5DCD5] dark:border-[#2A242D] rounded-xl text-xs text-[#8A7F87] dark:text-[#817783]">
        No recorded activities on this timeline yet.
      </div>
    );
  }

  return (
    <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E5DCD5] dark:before:bg-[#2A242D]">
      {activities.map((act) => {
        const dateObj = new Date(act.date);
        const formattedDate = dateObj.toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        });
        const formattedTime = dateObj.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit'
        });

        return (
          <div key={act._id} className="relative group">
            {/* Timeline Dot with Icon */}
            <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-white dark:bg-[#1A151D] border border-[#E5DCD5] dark:border-[#2A242D] flex items-center justify-center shadow-xs">
              {getActivityIcon(act.type)}
            </div>

            {/* Content Card */}
            <div className="bg-[#FFFFFF] dark:bg-[#141117] border border-[#E5DCD5] dark:border-[#2A242D] rounded-xl p-3.5 shadow-xs hover:border-[#A9683F]/50 dark:hover:border-[#C08457]/50 transition-colors">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-[#211A20] dark:text-[#F5F1F3]">
                  {act.title}
                </span>
                <span className="text-[11px] text-[#8A7F87] dark:text-[#817783] font-mono shrink-0 tabular-nums">
                  {formattedDate} • {formattedTime}
                </span>
              </div>

              {act.relatedCustomer && (
                <p className="text-[11px] text-[#665C65] dark:text-[#B8AEB9] mt-0.5 font-medium">
                  {act.relatedCustomer}
                </p>
              )}

              {act.notes && (
                <p className="text-xs text-[#211A20] dark:text-[#F5F1F3] mt-2 bg-[#F7F3F0] dark:bg-[#1A151D]/60 p-2.5 rounded-lg border border-[#E5DCD5]/70 dark:border-[#2A242D]/70 leading-relaxed">
                  {act.notes}
                </p>
              )}

              {act.userId && (
                <div className="mt-2 flex items-center gap-1.5 text-[10px] text-[#8A7F87] dark:text-[#817783]">
                  <span>Logged by {act.userId.name || 'Sales Agent'}</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
