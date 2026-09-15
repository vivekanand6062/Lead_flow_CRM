import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export type BadgeType =
  | 'NEW'
  | 'CONTACTED'
  | 'QUALIFIED'
  | 'PROPOSAL'
  | 'NEGOTIATION'
  | 'WON'
  | 'LOST'
  | 'ADMIN'
  | 'MANAGER'
  | 'SALES_AGENT'
  | 'HIGH'
  | 'MEDIUM'
  | 'LOW'
  | 'GOOD'
  | 'MODERATE'
  | 'AT_RISK'
  | 'ACTIVE'
  | 'INACTIVE'
  | 'COMPLETED'
  | 'TODAY'
  | 'UPCOMING'
  | 'OVERDUE'
  | 'AI'
  | string;

interface BadgeProps {
  type?: BadgeType;
  label?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'ai';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ type, label, variant, className }) => {
  const displayLabel = label || (type ? type.replace(/_/g, ' ') : '');

  // Exact Midnight Plum × Copper semantic color mappings
  const typeStyles: Record<string, string> = {
    // Pipeline stages
    NEW: 'bg-[#F3E3D7] text-[#8F5734] border-[#E9BF9F] dark:bg-[rgba(192,132,87,0.12)] dark:text-[#E0A978] dark:border-[rgba(192,132,87,0.25)]',
    CONTACTED: 'bg-[#F0E5EE] text-[#704766] border-[#DBB8D5] dark:bg-[rgba(110,69,107,0.14)] dark:text-[#C391BC] dark:border-[rgba(110,69,107,0.25)]',
    QUALIFIED: 'bg-[#F3DAC9] text-[#79472B] border-[#DDA175] dark:bg-[rgba(192,132,87,0.18)] dark:text-[#E0A978] dark:border-[rgba(192,132,87,0.35)] font-semibold',
    PROPOSAL: 'bg-[rgba(210,154,74,0.12)] text-[#A87228] border-[rgba(210,154,74,0.3)] dark:bg-[rgba(210,154,74,0.15)] dark:text-[#E5B56E] dark:border-[rgba(210,154,74,0.3)]',
    NEGOTIATION: 'bg-[#F0E5EE] text-[#5B3758] border-[#DBB8D5] dark:bg-[rgba(110,69,107,0.18)] dark:text-[#DBB8D5] dark:border-[rgba(110,69,107,0.35)]',
    WON: 'bg-[rgba(63,167,122,0.12)] text-[#2C7A58] border-[rgba(63,167,122,0.3)] dark:bg-[rgba(63,167,122,0.15)] dark:text-[#68C99E] dark:border-[rgba(63,167,122,0.3)] font-semibold',
    LOST: 'bg-[rgba(215,101,101,0.12)] text-[#B04343] border-[rgba(215,101,101,0.3)] dark:bg-[rgba(215,101,101,0.15)] dark:text-[#F08E8E] dark:border-[rgba(215,101,101,0.3)]',

    // Role tags
    ADMIN: 'bg-[#F3E3D7] text-[#79472B] border-[#E9BF9F] dark:bg-[rgba(192,132,87,0.18)] dark:text-[#E0A978] dark:border-[rgba(192,132,87,0.35)] font-semibold',
    MANAGER: 'bg-[#F0E5EE] text-[#5B3758] border-[#DBB8D5] dark:bg-[rgba(110,69,107,0.2)] dark:text-[#DBB8D5] dark:border-[rgba(110,69,107,0.35)] font-semibold',
    SALES_AGENT: 'bg-[rgba(63,167,122,0.12)] text-[#2C7A58] border-[rgba(63,167,122,0.3)] dark:bg-[rgba(63,167,122,0.15)] dark:text-[#68C99E] dark:border-[rgba(63,167,122,0.3)] font-semibold',

    // Risk and priority
    HIGH: 'bg-[rgba(215,101,101,0.12)] text-[#B04343] border-[rgba(215,101,101,0.3)] dark:bg-[rgba(215,101,101,0.15)] dark:text-[#F08E8E] dark:border-[rgba(215,101,101,0.3)] font-semibold',
    MEDIUM: 'bg-[rgba(210,154,74,0.12)] text-[#A87228] border-[rgba(210,154,74,0.3)] dark:bg-[rgba(210,154,74,0.15)] dark:text-[#E5B56E] dark:border-[rgba(210,154,74,0.3)]',
    LOW: 'bg-[#F1EBE7] text-[#665C65] border-[#E5DCD5] dark:bg-[#1A151D] dark:text-[#B8AEB9] dark:border-[#2A242D]',

    GOOD: 'bg-[rgba(63,167,122,0.12)] text-[#2C7A58] border-[rgba(63,167,122,0.3)] dark:bg-[rgba(63,167,122,0.15)] dark:text-[#68C99E] dark:border-[rgba(63,167,122,0.3)]',
    MODERATE: 'bg-[rgba(210,154,74,0.12)] text-[#A87228] border-[rgba(210,154,74,0.3)] dark:bg-[rgba(210,154,74,0.15)] dark:text-[#E5B56E] dark:border-[rgba(210,154,74,0.3)]',
    AT_RISK: 'bg-[rgba(215,101,101,0.12)] text-[#B04343] border-[rgba(215,101,101,0.3)] dark:bg-[rgba(215,101,101,0.15)] dark:text-[#F08E8E] dark:border-[rgba(215,101,101,0.3)] font-semibold',

    ACTIVE: 'bg-[rgba(63,167,122,0.12)] text-[#2C7A58] border-[rgba(63,167,122,0.3)] dark:bg-[rgba(63,167,122,0.15)] dark:text-[#68C99E] dark:border-[rgba(63,167,122,0.3)]',
    INACTIVE: 'bg-[#F1EBE7] text-[#8A7F87] border-[#E5DCD5] dark:bg-[#1A151D] dark:text-[#817783] dark:border-[#2A242D]',

    COMPLETED: 'bg-[rgba(63,167,122,0.12)] text-[#2C7A58] border-[rgba(63,167,122,0.3)] dark:bg-[rgba(63,167,122,0.15)] dark:text-[#68C99E] dark:border-[rgba(63,167,122,0.3)]',
    TODAY: 'bg-[#F3DAC9] text-[#79472B] border-[#DDA175] dark:bg-[rgba(192,132,87,0.18)] dark:text-[#E0A978] dark:border-[rgba(192,132,87,0.35)] font-semibold',
    UPCOMING: 'bg-[#F1EBE7] text-[#665C65] border-[#E5DCD5] dark:bg-[#1A151D] dark:text-[#B8AEB9] dark:border-[#2A242D]',
    OVERDUE: 'bg-[rgba(215,101,101,0.12)] text-[#B04343] border-[rgba(215,101,101,0.3)] dark:bg-[rgba(215,101,101,0.15)] dark:text-[#F08E8E] dark:border-[rgba(215,101,101,0.3)] font-semibold',

    // AI Lavender
    AI: 'bg-[#EEEAFB] text-[#5B45B3] border-[#DDD6FE] dark:bg-[rgba(155,138,251,0.15)] dark:text-[#B7AAFF] dark:border-[rgba(155,138,251,0.3)] font-semibold'
  };

  const variantStyles = {
    default: 'bg-[#F1EBE7] text-[#665C65] border-[#E5DCD5] dark:bg-[#1A151D] dark:text-[#B8AEB9] dark:border-[#2A242D]',
    success: 'bg-[rgba(63,167,122,0.12)] text-[#2C7A58] border-[rgba(63,167,122,0.3)] dark:bg-[rgba(63,167,122,0.15)] dark:text-[#68C99E] dark:border-[rgba(63,167,122,0.3)]',
    warning: 'bg-[rgba(210,154,74,0.12)] text-[#A87228] border-[rgba(210,154,74,0.3)] dark:bg-[rgba(210,154,74,0.15)] dark:text-[#E5B56E] dark:border-[rgba(210,154,74,0.3)]',
    danger: 'bg-[rgba(215,101,101,0.12)] text-[#B04343] border-[rgba(215,101,101,0.3)] dark:bg-[rgba(215,101,101,0.15)] dark:text-[#F08E8E] dark:border-[rgba(215,101,101,0.3)]',
    info: 'bg-[rgba(126,159,214,0.12)] text-[#486DA8] border-[rgba(126,159,214,0.3)] dark:bg-[rgba(126,159,214,0.15)] dark:text-[#9DB8E5] dark:border-[rgba(126,159,214,0.3)]',
    ai: 'bg-[#EEEAFB] text-[#5B45B3] border-[#DDD6FE] dark:bg-[rgba(155,138,251,0.15)] dark:text-[#B7AAFF] dark:border-[rgba(155,138,251,0.3)]'
  };

  const style = (type && typeStyles[type]) || (variant && variantStyles[variant]) || variantStyles.default;

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center gap-1.5 text-[11px] font-medium tracking-wide uppercase px-2 py-0.5 rounded-full border select-none',
          style,
          className
        )
      )}
    >
      {(type === 'GOOD' || type === 'ACTIVE' || type === 'WON') && (
        <span className="w-1.5 h-1.5 rounded-full bg-[#3FA77A]" />
      )}
      {(type === 'MODERATE' || type === 'WARNING') && (
        <span className="w-1.5 h-1.5 rounded-full bg-[#D29A4A]" />
      )}
      {(type === 'AT_RISK' || type === 'OVERDUE' || type === 'LOST') && (
        <span className="w-1.5 h-1.5 rounded-full bg-[#D76565]" />
      )}
      {type === 'AI' && (
        <span className="text-[10px] text-[#9B8AFB] leading-none">✦</span>
      )}
      {displayLabel}
    </span>
  );
};
