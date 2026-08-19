import React from 'react';
import { cn } from '@/lib/utils';

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
}

export function Switch({ checked, onChange, label, description, disabled = false }: SwitchProps) {
  return (
    <label className={cn('flex items-start gap-3 cursor-pointer select-none', disabled && 'opacity-50 cursor-not-allowed')}>
      <div className="relative inline-flex items-center shrink-0 mt-0.5">
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={e => onChange(e.target.checked)}
          className="sr-only"
        />
        <div
          className={cn(
            'w-11 h-6 bg-slate-200 rounded-full transition-colors duration-200 ease-in-out',
            checked ? 'bg-primary' : 'bg-slate-300'
          )}
        >
          <div
            className={cn(
              'w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ease-in-out transform top-0.5 absolute left-0.5',
              checked ? 'translate-x-5' : 'translate-x-0'
            )}
          />
        </div>
      </div>
      {(label || description) && (
        <div className="flex flex-col">
          {label && <span className="text-sm font-medium text-neutral-text-primary">{label}</span>}
          {description && <span className="text-xs text-neutral-text-muted">{description}</span>}
        </div>
      )}
    </label>
  );
}
