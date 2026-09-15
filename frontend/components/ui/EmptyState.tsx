import React, { ReactNode } from 'react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center bg-[#F7F3F0]/60 dark:bg-[#141117] border border-dashed border-[#E5DCD5] dark:border-[#2A242D] rounded-xl my-3 ${className || ''}`}
    >
      {icon && (
        <div className="p-3 mb-3 rounded-full bg-[#F3E3D7] dark:bg-[rgba(192,132,87,0.12)] text-[#A9683F] dark:text-[#E0A978] border border-[#E5DCD5] dark:border-[rgba(192,132,87,0.25)]">
          {icon}
        </div>
      )}
      <h4 className="text-sm font-semibold text-[#211A20] dark:text-[#F5F1F3]">
        {title}
      </h4>
      <p className="text-xs text-[#665C65] dark:text-[#B8AEB9] max-w-sm mt-1 mb-4 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
