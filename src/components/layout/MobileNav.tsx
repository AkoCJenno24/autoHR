import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, Clock, CalendarCheck, CreditCard, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { User, AppModule } from '@/types';
import { canAccessModule } from '@/lib/permissions/rbac';
import { db } from '@/lib/db';

export function MobileNav({ currentUser }: { currentUser: User }) {
  const roles = db.getRoles();
  const rawItems: { name: string; path: string; icon: React.ComponentType<{ className?: string }>; module: AppModule }[] = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, module: 'dashboard' },
    { name: 'Attendance', path: '/attendance', icon: Clock, module: 'attendance' },
    { name: 'Tasks', path: '/tasks', icon: CheckSquare, module: 'tasks' },
    { name: 'Leave', path: '/leave', icon: CalendarCheck, module: 'leave' },
    { name: 'Payroll', path: '/payroll', icon: CreditCard, module: 'payroll' },
  ];

  const navItems = rawItems.filter(item => canAccessModule(currentUser, item.module, roles));

  if (navItems.length === 0) return null;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-neutral-border py-1 px-3 shadow-lg flex items-center justify-around">
      {navItems.map(item => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center p-1.5 rounded-lg text-[10px] font-medium transition-colors',
                isActive ? 'text-primary font-bold' : 'text-neutral-text-muted hover:text-neutral-text-primary'
              )
            }
          >
            <Icon className="w-5 h-5 mb-0.5" />
            <span>{item.name}</span>
          </NavLink>
        );
      })}
    </div>
  );
}
