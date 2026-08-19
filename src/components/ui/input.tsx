import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, leftIcon, rightIcon, helperText, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold uppercase tracking-wider text-neutral-text-secondary">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && <div className="absolute left-3 text-neutral-text-muted pointer-events-none">{leftIcon}</div>}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full h-10 px-3 py-2 text-sm bg-white border border-neutral-border rounded-lg text-neutral-text-primary placeholder:text-neutral-text-muted/70 transition-all duration-150',
              'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
              'disabled:bg-slate-50 disabled:text-neutral-disabled disabled:cursor-not-allowed',
              leftIcon && 'pl-9',
              rightIcon && 'pr-9',
              error && 'border-danger focus:ring-danger text-danger',
              className
            )}
            {...props}
          />
          {rightIcon && <div className="absolute right-3 text-neutral-text-muted">{rightIcon}</div>}
        </div>
        {error && <p className="text-xs text-danger font-medium animate-fade-in">{error}</p>}
        {helperText && !error && <p className="text-xs text-neutral-text-muted">{helperText}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';
