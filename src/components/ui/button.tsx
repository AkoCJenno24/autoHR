import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'info';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading = false, children, disabled, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-semibold transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.97]';

    const variants = {
      primary: 'bg-primary text-white hover:bg-primary-hover focus:ring-primary shadow-sm',
      secondary: 'bg-secondary text-white hover:bg-[#2A2438] focus:ring-secondary shadow-sm',
      outline: 'border border-neutral-border bg-white text-neutral-text-primary hover:bg-neutral-bg focus:ring-primary shadow-sm',
      ghost: 'text-neutral-text-secondary hover:bg-neutral-bg hover:text-neutral-text-primary focus:ring-neutral-border',
      danger: 'bg-danger text-white hover:bg-danger-hover focus:ring-danger shadow-sm',
      success: 'bg-success text-white hover:bg-success-hover focus:ring-success shadow-sm',
      info: 'bg-info text-white hover:bg-info-hover focus:ring-info shadow-sm',
    };

    const sizes = {
      sm: 'h-8 px-3 text-xs gap-1.5 rounded-lg',
      md: 'h-9 px-4 text-sm gap-2 rounded-xl',
      lg: 'h-11 px-5 text-sm gap-2.5 rounded-xl',
      icon: 'h-9 w-9 p-0 rounded-xl',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
