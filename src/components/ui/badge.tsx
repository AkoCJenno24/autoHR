import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  size?: 'sm' | 'md';
}

export function Badge({ className, variant = 'neutral', size = 'md', children, ...props }: BadgeProps) {
  const baseStyles = 'inline-flex items-center font-medium rounded-md border transition-colors';

  const variants = {
    primary: 'bg-primary-soft text-primary border-violet-200',
    secondary: 'bg-secondary-soft text-secondary border-violet-100',
    success: 'bg-success-soft text-success border-emerald-200',
    warning: 'bg-warning-soft text-warning border-amber-200',
    danger: 'bg-danger-soft text-danger border-rose-200',
    info: 'bg-info-soft text-info border-blue-200',
    neutral: 'bg-neutral-bg text-neutral-text-secondary border-neutral-border',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[11px] leading-tight',
    md: 'px-2.5 py-1 text-xs leading-none',
  };

  return (
    <span className={cn(baseStyles, variants[variant], sizes[size], className)} {...props}>
      {children}
    </span>
  );
}
