import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className, ...props }) => {
  return (
    <div
      className={twMerge(
        clsx(
          'animate-pulse rounded-md bg-[#E5DCD5]/70 dark:bg-[#211B24]/80',
          className
        )
      )}
      {...props}
    />
  );
};
