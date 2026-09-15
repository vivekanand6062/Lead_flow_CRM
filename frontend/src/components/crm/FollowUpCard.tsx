import React from 'react';
import { Phone, Mail, Calendar, CheckSquare, CheckCircle2, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

export interface FollowUpItem {
  _id: string;
  contactName: string;
  title: string;
  type: 'CALL' | 'EMAIL' | 'MEETING' | 'TASK';
  dueDate: string | Date;
  time?: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'TODAY' | 'UPCOMING' | 'OVERDUE' | 'COMPLETED';
  notes?: string;
  userId?: {
    name?: string;
  };
}

interface FollowUpCardProps {
  followUp: FollowUpItem;
  onToggleStatus: (id: string, newStatus: FollowUpItem['status']) => void;
}

export const FollowUpCard: React.FC<FollowUpCardProps> = ({ followUp, onToggleStatus }) => {
  const isCompleted = followUp.status === 'COMPLETED';
  const isOverdue = followUp.status === 'OVERDUE';

  const getTypeIcon = () => {
    switch (followUp.type) {
      case 'CALL':
        return <Phone className="w-3.5 h-3.5 text-[#A9683F] dark:text-[#C08457]" />;
      case 'EMAIL':
        return <Mail className="w-3.5 h-3.5 text-[#A9683F] dark:text-[#C08457]" />;
      case 'MEETING':
        return <Calendar className="w-3.5 h-3.5 text-[#704766] dark:text-[#8B5C86]" />;
      default:
        return <CheckSquare className="w-3.5 h-3.5 text-[#3FA77A]" />;
    }
  };

  const formattedDate = new Date(followUp.dueDate).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short'
  });

  return (
    <div
      className={`p-4 bg-[#FFFFFF] dark:bg-[#141117] border rounded-xl shadow-xs transition-all duration-150 ${
        isOverdue
          ? 'border-[rgba(215,101,101,0.35)] bg-[rgba(215,101,101,0.06)]'
          : isCompleted
          ? 'border-[#E5DCD5] dark:border-[#2A242D] opacity-60'
          : 'border-[#E5DCD5] dark:border-[#2A242D] hover:border-[#A9683F]/50 dark:hover:border-[#C08457]/50'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          {/* Complete Toggle Button */}
          <button
            onClick={() => onToggleStatus(followUp._id, isCompleted ? 'TODAY' : 'COMPLETED')}
            className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-all active:scale-[0.9] ${
              isCompleted
                ? 'bg-[#3FA77A] border-[#3FA77A] text-white'
                : 'border-[#E5DCD5] dark:border-[#2A242D] hover:border-[#A9683F] dark:hover:border-[#C08457] text-transparent'
            }`}
            title={isCompleted ? 'Mark incomplete' : 'Mark completed'}
          >
            <CheckCircle2 className="w-4 h-4" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h4
                className={`text-xs sm:text-sm font-semibold text-[#211A20] dark:text-[#F5F1F3] ${
                  isCompleted ? 'line-through text-[#8A7F87] dark:text-[#817783]' : ''
                }`}
              >
                {followUp.title}
              </h4>
            </div>

            <p className="text-xs text-[#665C65] dark:text-[#B8AEB9] font-medium mt-0.5">
              {followUp.contactName}
            </p>

            {followUp.notes && (
              <p className="text-[11px] text-[#8A7F87] dark:text-[#817783] mt-1.5 line-clamp-2">
                {followUp.notes}
              </p>
            )}

            <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px]">
              <span className="flex items-center gap-1 text-[#665C65] dark:text-[#B8AEB9]">
                {getTypeIcon()}
                <span className="capitalize">{followUp.type.toLowerCase()}</span>
              </span>

              <span className="text-[#E5DCD5] dark:text-[#2A242D]">•</span>

              <span className="flex items-center gap-1 text-[#8A7F87] dark:text-[#817783] font-mono tabular-nums">
                <Clock className="w-3 h-3" />
                {formattedDate} {followUp.time && `— ${followUp.time}`}
              </span>
            </div>
          </div>
        </div>

        {/* Status & Priority Badges */}
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <Badge type={followUp.status} />
          <Badge type={followUp.priority} />
        </div>
      </div>
    </div>
  );
};
