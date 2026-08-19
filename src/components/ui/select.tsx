import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
  helperText?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, options, error, helperText, id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={selectId} className="block text-xs font-semibold uppercase tracking-wider text-neutral-text-secondary">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              'w-full h-10 pl-3 pr-10 py-2 text-sm bg-white border border-neutral-border rounded-lg text-neutral-text-primary appearance-none transition-all duration-150',
              'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
              'disabled:bg-slate-50 disabled:text-neutral-disabled disabled:cursor-not-allowed',
              error && 'border-danger focus:ring-danger text-danger',
              className
            )}
            {...props}
          >
            {options.map(opt => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-neutral-text-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
        {error && <p className="text-xs text-danger font-medium animate-fade-in">{error}</p>}
        {helperText && !error && <p className="text-xs text-neutral-text-muted">{helperText}</p>}
      </div>
    );
  }
);
Select.displayName = 'Select';
