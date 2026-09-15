import React, { InputHTMLAttributes, forwardRef, ReactNode } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  icon,
  hint,
  className,
  id,
  required,
  ...props
}, ref) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-medium text-[#665C65] dark:text-[#B8AEB9]">
          {label} {required && <span className="text-[#D76565]">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8A7F87] dark:text-[#817783]">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          ref={ref}
          required={required}
          className={twMerge(
            clsx(
              'block w-full rounded-lg border text-xs sm:text-sm transition-all duration-150',
              'bg-[#FFFFFF] dark:bg-[#141117]',
              'border-[#E5DCD5] dark:border-[#2A242D]',
              'text-[#211A20] dark:text-[#F5F1F3]',
              'placeholder-[#8A7F87] dark:placeholder-[#817783]',
              'focus:border-[#A9683F] dark:focus:border-[#C08457] focus:outline-none focus:ring-1 focus:ring-[#A9683F] dark:focus:ring-[#C08457]',
              'disabled:bg-[#F1EBE7] dark:disabled:bg-[#1A151D] disabled:opacity-60 disabled:cursor-not-allowed',
              'h-9',
              icon ? 'pl-9 pr-3' : 'px-3',
              error && 'border-[#D76565] focus:border-[#D76565] focus:ring-[#D76565] dark:border-[#D76565]',
              className
            )
          )}
          {...props}
        />
      </div>
      {hint && !error && (
        <p className="text-[11px] text-[#8A7F87] dark:text-[#817783]">{hint}</p>
      )}
      {error && (
        <p className="text-[11px] text-[#D76565] font-medium">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
