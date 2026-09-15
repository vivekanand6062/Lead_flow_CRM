import React, { ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 select-none';

  const variants = {
    primary:
      'bg-[#A9683F] hover:bg-[#8F5734] active:bg-[#79472B] dark:bg-[#C08457] dark:hover:bg-[#D39A6B] dark:active:bg-[#A96F46] text-white shadow-xs focus-visible:ring-[#C08457] border border-transparent',
    secondary:
      'bg-[#FFFFFF] dark:bg-[#141117] hover:bg-[#F8F2EE] dark:hover:bg-[#211B24] active:bg-[#F4EAE3] dark:active:bg-[#261D28] text-[#211A20] dark:text-[#F5F1F3] border border-[#E5DCD5] dark:border-[#2A242D] shadow-xs focus-visible:ring-[#C08457]',
    outline:
      'border border-[#E5DCD5] dark:border-[#2A242D] hover:border-[#A9683F] dark:hover:border-[#C08457] hover:bg-[#F8F2EE] dark:hover:bg-[#1A151D] active:bg-[#F4EAE3] dark:active:bg-[#211B24] text-[#211A20] dark:text-[#F5F1F3] focus-visible:ring-[#C08457]',
    ghost:
      'hover:bg-[#F8F2EE] dark:hover:bg-[#211B24] active:bg-[#F4EAE3] dark:active:bg-[#261D28] text-[#665C65] dark:text-[#B8AEB9] hover:text-[#211A20] dark:hover:text-[#F5F1F3] focus-visible:ring-[#C08457]',
    danger:
      'bg-[#D76565] hover:bg-[#C25454] active:bg-[#A94343] text-white shadow-xs focus-visible:ring-[#D76565] border border-transparent'
  };

  const sizes = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5 h-8',
    md: 'text-xs sm:text-sm px-3.5 py-2 gap-2 h-9',
    lg: 'text-sm px-5 py-2.5 gap-2.5 h-10'
  };

  return (
    <button
      className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />}
      {children}
    </button>
  );
};
