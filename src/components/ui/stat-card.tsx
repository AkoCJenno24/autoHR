import React from 'react';
import { cn } from '@/lib/utils';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  variant?: 'primary' | 'success' | 'warning' | 'info' | 'neutral';
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  variant = 'neutral',
  className,
}: StatCardProps) {
  const iconVariants = {
    primary: 'bg-primary-soft text-primary',
    success: 'bg-success-soft text-success',
    warning: 'bg-warning-soft text-warning',
    info: 'bg-info-soft text-info',
    neutral: 'bg-neutral-bg text-neutral-text-secondary',
  };

  return (
    <div
      className={cn(
        'bg-neutral-surface p-5 sm:p-6 rounded-2xl border border-neutral-border shadow-card transition-all duration-200 hover:shadow-card-hover flex flex-col justify-between group',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-neutral-text-muted">{title}</p>
          <h4 className="text-2xl sm:text-3xl font-bold text-neutral-text-primary mt-2 tracking-tight font-display">{value}</h4>
        </div>
        <div className={cn('p-2.5 rounded-xl transition-transform duration-200 group-hover:scale-110', iconVariants[variant])}>{icon}</div>
      </div>
      {(subtitle || trend) && (
        <div className="mt-4 flex items-center justify-between text-xs text-neutral-text-muted">
          {subtitle && <span>{subtitle}</span>}
          {trend && (
            <span className={cn('font-semibold flex items-center gap-1', trend.isPositive ? 'text-success' : 'text-danger')}>
              {trend.isPositive ? '↑' : '↓'} {trend.value}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
