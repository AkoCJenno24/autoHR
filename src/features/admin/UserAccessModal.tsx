import React, { useState, useEffect } from 'react';
import { User, Role, AppModule, SystemRoleType } from '@/types';
import { db } from '@/lib/db';
import {
  APP_MODULE_DEFINITIONS,
  DEFAULT_ROLE_MODULES,
  getUserAllowedModules,
} from '@/lib/permissions/rbac';
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
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
  Sparkles,
  UserX,
  UserCheck,
  UserCircle,
  Save,
} from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

interface UserAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUser: User | null;
  currentUser?: User;
  onSaved?: (updatedUser: User) => void;
}

const MODULE_ICONS: Record<AppModule, React.ComponentType<{ className?: string }>> = {
  dashboard: LayoutDashboard,
  profile: UserCircle,
  tasks: CheckSquare,
  attendance: Clock,
  leave: CalendarCheck,
  payroll: CreditCard,
  documents: FileText,
  employees: Users,
  organization: Building2,
  workflows: GitMerge,
  reports: BarChart3,
  notifications: Bell,
  admin: Settings,
};

export function UserAccessModal({
  isOpen,
  onClose,
  targetUser,
  currentUser,
  onSaved,
}: UserAccessModalProps) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [selectedRoleType, setSelectedRoleType] = useState<SystemRoleType | 'CUSTOM'>('EMPLOYEE');
  const [selectedRoleName, setSelectedRoleName] = useState<string>('');
  const [allowedModules, setAllowedModules] = useState<AppModule[]>([]);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  useEffect(() => {
    setRoles(db.getRoles());
  }, [isOpen]);

  useEffect(() => {
    if (targetUser) {
      const allRoles = db.getRoles();
      setSelectedRoleId(targetUser.roleId || 'role_employee');
      setSelectedRoleType(targetUser.roleType || 'EMPLOYEE');
      setSelectedRoleName(targetUser.roleName || 'Regular Employee');
      setIsActive(targetUser.isActive !== false);

      // Load currently allowed modules
      const initialModules = getUserAllowedModules(targetUser, allRoles);
      setAllowedModules(initialModules);
      setSaveSuccess(false);
    }
  }, [targetUser, isOpen]);

  if (!targetUser) return null;

  const handleRoleChange = (newRoleId: string) => {
    setSelectedRoleId(newRoleId);
    const matchedRole = roles.find(r => r.id === newRoleId);
    if (matchedRole) {
      setSelectedRoleType(matchedRole.type);
      setSelectedRoleName(matchedRole.name);

      // Update modules to match new role default
      if (matchedRole.type in DEFAULT_ROLE_MODULES) {
        setAllowedModules([...DEFAULT_ROLE_MODULES[matchedRole.type as SystemRoleType]]);
      } else if (matchedRole.allowedModules) {
        setAllowedModules([...matchedRole.allowedModules]);
      }
    }
  };

  const handleToggleModule = (module: AppModule) => {
    setAllowedModules(prev =>
      prev.includes(module) ? prev.filter(m => m !== module) : [...prev, module]
    );
  };

  const handleApplyRoleDefaults = () => {
    if (selectedRoleType in DEFAULT_ROLE_MODULES) {
      setAllowedModules([...DEFAULT_ROLE_MODULES[selectedRoleType as SystemRoleType]]);
    } else {
      const role = roles.find(r => r.id === selectedRoleId);
      if (role?.allowedModules) {
        setAllowedModules([...role.allowedModules]);
      }
    }
  };

  const handleSelectAll = () => {
    setAllowedModules(APP_MODULE_DEFINITIONS.map(m => m.id));
  };

  const handleSelectNone = () => {
    setAllowedModules(['dashboard']);
  };

  const handleSave = () => {
    setIsSaving(true);
    const updated = db.updateUserAccess(targetUser.id, {
      roleId: selectedRoleId,
      roleType: selectedRoleType,
      roleName: selectedRoleName,
      allowedModules,
      isActive,
      isOwner: selectedRoleType === 'OWNER',
    });

    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      if (updated && onSaved) {
        onSaved(updated);
      }
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 700);
    }, 300);
  };

  const roleOptions = [
    { value: 'role_owner', label: 'Company Owner & Executive (OWNER)' },
    { value: 'role_super_admin', label: 'Super Administrator (SUPER_ADMIN)' },
    { value: 'role_hr_admin', label: 'HR Administrator (HR_ADMIN)' },
    { value: 'role_dept_mgr', label: 'Department Manager (DEPT_MANAGER)' },
    { value: 'role_payroll', label: 'Payroll Officer (PAYROLL_OFFICER)' },
    { value: 'role_employee', label: 'Regular Employee (EMPLOYEE)' },
    ...roles
      .filter(r => !['role_owner', 'role_super_admin', 'role_hr_admin', 'role_dept_mgr', 'role_payroll', 'role_employee'].includes(r.id))
      .map(r => ({ value: r.id, label: `${r.name} (${r.type})` })),
  ];

  const categories: { key: string; label: string; modules: typeof APP_MODULE_DEFINITIONS }[] = [
    {
      key: 'core',
      label: 'Core & Overview',
      modules: APP_MODULE_DEFINITIONS.filter(m => m.category === 'core'),
    },
    {
      key: 'workplace',
      label: 'Workplace & Employee Self-Service',
      modules: APP_MODULE_DEFINITIONS.filter(m => m.category === 'workplace'),
    },
    {
      key: 'management',
      label: 'People & Operations Management',
      modules: APP_MODULE_DEFINITIONS.filter(m => m.category === 'management'),
    },
    {
      key: 'system',
      label: 'System & Administration',
      modules: APP_MODULE_DEFINITIONS.filter(m => m.category === 'system'),
    },
  ];

  return (
    <Dialog isOpen={isOpen} onClose={onClose} maxWidth="2xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-neutral-border">
          <div className="flex items-center gap-3">
            <img
              src={targetUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
              alt={targetUser.displayName}
              className="w-12 h-12 rounded-full object-cover border-2 border-primary/30"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-neutral-text-primary">
                  Manage Access: {targetUser.displayName}
                </h3>
                <Badge variant={isActive ? 'success' : 'danger'} size="sm">
                  {isActive ? 'Active Account' : 'Suspended'}
                </Badge>
              </div>
              <p className="text-xs text-neutral-text-muted mt-0.5">
                {targetUser.email} · Employee ID: {targetUser.employeeId}
              </p>
            </div>
          </div>

          <Badge variant="primary" size="sm" className="hidden sm:inline-flex">
            <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Superuser Control
          </Badge>
        </div>

        {/* Role Assignment & Status Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-neutral-border">
          <div>
            <label className="block text-xs font-semibold text-neutral-text-primary mb-1.5">
              Assigned Role
            </label>
            <select
              value={selectedRoleId}
              onChange={e => handleRoleChange(e.target.value)}
              className="w-full text-xs bg-white border border-neutral-border rounded-lg px-3 py-2 text-neutral-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium"
            >
              {roleOptions.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <p className="text-[10px] text-neutral-text-muted mt-1">
              Role archetype controls default baseline permissions.
            </p>
          </div>

          <div className="flex flex-col justify-between">
            <label className="block text-xs font-semibold text-neutral-text-primary mb-1.5">
              Account Login Status
            </label>
            <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-neutral-border">
              <div className="flex items-center gap-2">
                {isActive ? (
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                ) : (
                  <UserX className="w-4 h-4 text-rose-600" />
                )}
                <span className="text-xs font-medium text-neutral-text-primary">
                  {isActive ? 'Account Active & Permitted' : 'Account Suspended'}
                </span>
              </div>
              <Switch
                checked={isActive}
                onChange={() => setIsActive(!isActive)}
              />
            </div>
            <p className="text-[10px] text-neutral-text-muted mt-1">
              Suspended users cannot log in or interact with the platform.
            </p>
          </div>
        </div>

        {/* Quick Module Presets Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
          <div>
            <h4 className="text-xs font-bold text-neutral-text-primary uppercase tracking-wider">
              Accessible Platform Modules ({allowedModules.length} of {APP_MODULE_DEFINITIONS.length})
            </h4>
            <p className="text-[11px] text-neutral-text-muted">
              Select which areas of the application this employee is allowed to view and use.
            </p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleApplyRoleDefaults}
              className="text-[11px] h-7 px-2.5"
            >
              <Sparkles className="w-3 h-3 text-primary" /> Role Defaults
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              className="text-[11px] h-7 px-2.5"
            >
              Select All
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSelectNone}
              className="text-[11px] h-7 px-2.5"
            >
              Minimal
            </Button>
          </div>
        </div>

        {/* Modules Grid */}
        <div className="max-h-72 sm:max-h-80 overflow-y-auto space-y-4 pr-1">
          {categories.map(category => (
            <div key={category.key} className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                {category.label}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {category.modules.map(module => {
                  const Icon = MODULE_ICONS[module.id] || LayoutDashboard;
                  const isAllowed = allowedModules.includes(module.id);
                  return (
                    <div
                      key={module.id}
                      onClick={() => handleToggleModule(module.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                        isAllowed
                          ? 'bg-primary/5 border-primary/30 shadow-xs'
                          : 'bg-white border-neutral-border/70 hover:border-neutral-border opacity-70 hover:opacity-100'
                      }`}
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                            isAllowed
                              ? 'bg-primary text-white'
                              : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold text-neutral-text-primary truncate">
                              {module.name}
                            </span>
                            <span className="text-[9px] font-mono text-slate-400">
                              {module.path}
                            </span>
                          </div>
                          <p className="text-[10px] text-neutral-text-muted line-clamp-1 mt-0.5">
                            {module.description}
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 pt-0.5" onClick={e => e.stopPropagation()}>
                        <Switch
                          checked={isAllowed}
                          onChange={() => handleToggleModule(module.id)}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-neutral-border flex items-center justify-between">
          <div>
            {saveSuccess && (
              <span className="text-xs font-medium text-emerald-600 flex items-center gap-1 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4" />
                Access settings updated successfully!
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              isLoading={isSaving}
              className="gap-1.5"
            >
              <Save className="w-3.5 h-3.5" /> Save Access Settings
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
