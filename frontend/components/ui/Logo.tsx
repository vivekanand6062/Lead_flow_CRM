import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showWordmark?: boolean;
  subtitle?: string;
  className?: string;
  asLink?: boolean;
  href?: string;
  imgOnly?: boolean;
}

const SIZE_MAP = {
  sm: {
    pixels: 26,
    container: 'w-7 h-7',
    title: 'text-sm',
    sub: 'text-[9px]',
    gap: 'gap-2'
  },
  md: {
    pixels: 34,
    container: 'w-8.5 h-8.5',
    title: 'text-base',
    sub: 'text-[10px]',
    gap: 'gap-2.5'
  },
  lg: {
    pixels: 46,
    container: 'w-12 h-12',
    title: 'text-xl',
    sub: 'text-xs',
    gap: 'gap-3'
  },
  xl: {
    pixels: 58,
    container: 'w-15 h-15',
    title: 'text-2xl',
    sub: 'text-xs',
    gap: 'gap-3.5'
  }
};

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showWordmark = true,
  subtitle = 'CRM',
  className = '',
  asLink = false,
  href = '/',
  imgOnly = false
}) => {
  const config = SIZE_MAP[size] || SIZE_MAP.md;

  const imageElement = (
    <div
      className={`relative ${config.container} shrink-0 flex items-center justify-center transition-transform duration-300 group-hover:scale-105 select-none`}
    >
      <Image
        src="/logo.png"
        alt="LeadFlow CRM Logo"
        width={config.pixels}
        height={config.pixels}
        priority
        className="w-full h-full object-contain drop-shadow-[0_2px_10px_rgba(192,132,87,0.35)]"
      />
    </div>
  );

  if (imgOnly) {
    return imageElement;
  }

  const content = (
    <div className={`inline-flex items-center ${config.gap} group ${className}`}>
      {imageElement}
      {showWordmark && (
        <div className="flex flex-col select-none">
          <span
            className={`font-bold tracking-tight text-text-primary-light dark:text-text-primary-dark ${config.title} leading-tight`}
          >
            LeadFlow
          </span>
          {subtitle && (
            <span
              className={`font-mono font-bold uppercase tracking-wider text-copper-600 dark:text-copper-400 ${config.sub} -mt-0.5`}
            >
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (asLink) {
    return (
      <Link href={href} className="inline-flex items-center">
        {content}
      </Link>
    );
  }

  return content;
};
