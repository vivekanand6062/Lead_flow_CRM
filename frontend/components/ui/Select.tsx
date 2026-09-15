import React, { SelectHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ChevronDown } from 'lucide-react';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options?: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  error,
  options,
  children,
  className,
  id,
  required,
  ...props
}, ref) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={selectId} className="block text-xs font-medium text-[#665C65] dark:text-[#B8AEB9]">
          {label} {required && <span className="text-[#D76565]">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          ref={ref}
          required={required}
          className={twMerge(
            clsx(
              'block w-full rounded-lg border text-xs sm:text-sm pl-3 pr-8 transition-all duration-150 appearance-none cursor-pointer',
              'bg-[#FFFFFF] dark:bg-[#141117]',
              'border-[#E5DCD5] dark:border-[#2A242D]',
              'text-[#211A20] dark:text-[#F5F1F3]',
              'focus:border-[#A9683F] dark:focus:border-[#C08457] focus:outline-none focus:ring-1 focus:ring-[#A9683F] dark:focus:ring-[#C08457]',
              'h-9',
              error && 'border-[#D76565] focus:border-[#D76565] focus:ring-[#D76565]',
              className
            )
          )}
          {...props}
        >
          {options ? (
            options.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-[#FFFFFF] dark:bg-[#141117] text-[#211A20] dark:text-[#F5F1F3]">
                {opt.label}
              </option>
            ))
          ) : (
            children
          )}
        </select>
        <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-[#8A7F87] dark:text-[#817783]">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>
      {error && (
        <p className="text-[11px] text-[#D76565] font-medium">{error}</p>
      )}
    </div>
  );
});

Select.displayName = 'Select';
