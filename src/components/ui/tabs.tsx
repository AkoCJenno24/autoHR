import React from 'react';
import { cn } from '@/lib/utils';

export interface TabItem {
  id: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  return (
    <div className={cn('border-b border-neutral-border flex space-x-1 sm:space-x-4 overflow-x-auto scrollbar-none', className)}>
      {tabs.map(tab => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              'flex items-center gap-2 py-3 px-3.5 text-sm font-medium border-b-2 whitespace-nowrap transition-all duration-150',
              isActive
                ? 'border-primary text-primary font-semibold'
                : 'border-transparent text-neutral-text-secondary hover:text-neutral-text-primary hover:border-slate-300'
            )}
          >
            {tab.icon && <span className={cn(isActive ? 'text-primary' : 'text-neutral-text-muted')}>{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={cn(
                  'px-2 py-0.5 text-xs rounded-full',
                  isActive ? 'bg-primary-soft text-primary font-bold' : 'bg-slate-100 text-neutral-text-muted'
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
