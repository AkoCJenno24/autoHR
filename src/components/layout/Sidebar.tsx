import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { User, AppModule } from '@/types';
import {
  LayoutDashboard,
  Users,
  Building2,
  Clock,
  CalendarCheck,
  CreditCard,
  FileText,
  GitMerge,
  CheckSquare,
  Bell,
  BarChart3,
  Settings,
  UserCircle,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { db } from '@/lib/db';
import { canAccessModule } from '@/lib/permissions/rbac';

interface SidebarProps {
  currentUser: User;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({ currentUser, isOpenMobile = false, onCloseMobile }: SidebarProps) {
  const location = useLocation();
  const [tasks, setTasks] = useState(db.getTasks(currentUser.id));
  const [org, setOrg] = useState(db.getOrganization());
  const [roles, setRoles] = useState(db.getRoles());

  useEffect(() => {
    const unsub = db.subscribe(() => {
      setTasks(db.getTasks(currentUser.id));
      setOrg(db.getOrganization());
      setRoles(db.getRoles());
    });
    return () => unsub();
  }, [currentUser.id]);

  const openTasksCount = tasks.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length;

  interface NavItem {
    name: string;
    path: string;
    icon: React.ComponentType<{ className?: string }>;
    module: AppModule;
    badge?: number;
  }

  const rawSections: { title: string | null; items: NavItem[] }[] = [
    {
      title: null,
      items: [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, module: 'dashboard' },
        { name: 'My profile', path: '/profile', icon: UserCircle, module: 'profile' },
        { name: 'My tasks', path: '/tasks', icon: CheckSquare, module: 'tasks', badge: openTasksCount > 0 ? openTasksCount : undefined },
        { name: 'Attendance', path: '/attendance', icon: Clock, module: 'attendance' },
        { name: 'Leave & time off', path: '/leave', icon: CalendarCheck, module: 'leave' },
        { name: 'Payslips', path: '/payroll', icon: CreditCard, module: 'payroll' },
        { name: 'Documents', path: '/documents', icon: FileText, module: 'documents' },
      ],
    },
    {
      title: 'Team',
      items: [
        { name: 'Employees', path: '/employees', icon: Users, module: 'employees' },
        { name: 'Organization', path: '/organization', icon: Building2, module: 'organization' },
        { name: 'Workflows', path: '/workflows', icon: GitMerge, module: 'workflows' },
      ],
    },
    {
      title: 'Admin',
      items: [
        { name: 'Reports', path: '/reports', icon: BarChart3, module: 'reports' },
        { name: 'Notifications', path: '/notifications', icon: Bell, module: 'notifications' },
        { name: 'Settings & access', path: '/admin', icon: Settings, module: 'admin' },
      ],
    },
  ];

  // Filter sections and items based on module access
  const navSections = rawSections
    .map(section => ({
      ...section,
      items: section.items.filter(item => canAccessModule(currentUser, item.module, roles)),
    }))
    .filter(section => section.items.length > 0);

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#1A1625] text-slate-300 select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-5 sm:px-6 shrink-0">
        <div className="flex items-center gap-3">
          {org.logoUrl ? (
            <img src={org.logoUrl} alt={org.name} className="w-8 h-8 rounded-xl object-cover shrink-0 bg-white" />
          ) : (
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, #5B4CF5 0%, #8B5CF6 100%)' }}>
              <svg width="16" height="14" viewBox="0 0 16 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="16" height="3" rx="1.5" fill="white" fillOpacity="0.95"/>
                <rect x="3" y="5.5" width="10" height="3" rx="1.5" fill="white" fillOpacity="0.7"/>
                <rect x="6" y="11" width="4" height="3" rx="1.5" fill="white" fillOpacity="0.45"/>
              </svg>
            </div>
          )}
          <div className="flex flex-col overflow-hidden">
            <span className="font-bold text-white text-sm tracking-tight font-display truncate pr-2">
              {org.name && org.name !== 'AutoHR Philippines Technologies Inc.' ? org.name : 'AutoHR'}
            </span>
            {org.name && org.name !== 'AutoHR Philippines Technologies Inc.' && (
              <span className="text-[9px] text-slate-400 font-medium">powered by AutoHR</span>
            )}
          </div>
        </div>

        {/* Mobile Close Button */}
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
            title="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-3 px-3 overflow-y-auto space-y-5">
        {navSections.map((section, idx) => (
          <div key={idx}>
            {section.title && (
              <p className="px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-1.5">
                {section.title}
              </p>
            )}
            <nav className="space-y-0.5">
              {section.items.map(item => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => {
                      if (onCloseMobile) onCloseMobile();
                    }}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center justify-between px-3 py-2.5 sm:py-2 text-sm rounded-xl transition-all duration-150 min-h-[40px] relative',
                        isActive
                          ? 'bg-white/10 text-white font-semibold'
                          : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 font-medium'
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-full" />
                        )}
                        <div className="flex items-center gap-3">
                          <Icon className="w-4 h-4 shrink-0" />
                          <span>{item.name}</span>
                        </div>
                        {'badge' in item && item.badge !== undefined && (
                          <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-danger text-white tabular-nums">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-white/5 text-xs text-slate-500 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span className="font-medium text-slate-400 truncate">{org.name}</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex w-60 shrink-0 flex-col min-h-screen">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay & Sidebar */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity animate-fade-in"
            onClick={onCloseMobile}
          />
          {/* Drawer Panel */}
          <div className="relative w-64 max-w-[80vw] h-full shadow-2xl z-10 animate-fade-in">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
