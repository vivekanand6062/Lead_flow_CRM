import React, { ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { clsx } from 'clsx';

export interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  className
}) => {
  return (
    <div
      className={clsx(
        'bg-[#FFFDFC] dark:bg-[#141117] border border-[#E5DCD5] dark:border-[#2A242D] rounded-xl p-5 shadow-xs transition-all duration-150 hover:border-[#A9683F]/50 dark:hover:border-[#C08457]/50',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold text-[#665C65] dark:text-[#B8AEB9] uppercase tracking-wider">
          {title}
        </span>
        {icon && (
          <div className="p-1.5 rounded-lg bg-[#F3E3D7] dark:bg-[rgba(192,132,87,0.12)] text-[#A9683F] dark:text-[#E0A978] border border-[#E5DCD5] dark:border-[rgba(192,132,87,0.25)]">
            {icon}
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl sm:text-3xl font-bold tracking-tight text-[#211A20] dark:text-[#F5F1F3] tabular-nums">
          {value}
        </span>
      </div>

      {(subtitle || trend) && (
        <div className="mt-2.5 flex items-center gap-1.5 text-xs">
          {trend && (
            <span
              className={clsx(
                'inline-flex items-center gap-0.5 font-semibold text-[11px] tabular-nums',
                trend.isPositive ? 'text-[#3FA77A] dark:text-[#68C99E]' : 'text-[#D76565] dark:text-[#F08E8E]'
              )}
            >
              {trend.isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {trend.value}
            </span>
          )}
          {subtitle && (
            <span className="text-[11px] text-[#8A7F87] dark:text-[#817783] truncate">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
