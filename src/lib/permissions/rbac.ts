import { Permission, SystemRoleType, Role, User, AppModule, ModuleInfo } from '@/types';

// Built-in Default System Role Permission Mapping
export const SYSTEM_ROLE_PERMISSIONS: Record<SystemRoleType, Permission[]> = {
  OWNER: [
    'company.manage',
    'employee.read', 'employee.create', 'employee.update', 'employee.archive',
    'attendance.read', 'attendance.clock', 'attendance.correct', 'attendance.approve',
    'leave.read', 'leave.create', 'leave.approve', 'leave.reject', 'leave.manage_policies',
    'payroll.read', 'payroll.process', 'payroll.approve', 'payroll.finalize', 'payroll.view_all_payslips',
    'documents.read', 'documents.upload', 'documents.delete',
    'workflow.view', 'workflow.manage', 'workflow.approve',
    'tasks.manage', 'reports.view', 'reports.export',
    'admin.manage_users', 'admin.manage_roles', 'admin.manage_settings', 'admin.view_audit',
  ],
  SUPER_ADMIN: [
    'company.manage',
    'employee.read', 'employee.create', 'employee.update', 'employee.archive',
    'attendance.read', 'attendance.clock', 'attendance.correct', 'attendance.approve',
    'leave.read', 'leave.create', 'leave.approve', 'leave.reject', 'leave.manage_policies',
    'payroll.read', 'payroll.process', 'payroll.approve', 'payroll.finalize', 'payroll.view_all_payslips',
    'documents.read', 'documents.upload', 'documents.delete',
    'workflow.view', 'workflow.manage', 'workflow.approve',
    'tasks.manage', 'reports.view', 'reports.export',
    'admin.manage_users', 'admin.manage_roles', 'admin.manage_settings', 'admin.view_audit',
  ],
  HR_ADMIN: [
    'employee.read', 'employee.create', 'employee.update', 'employee.archive',
    'attendance.read', 'attendance.clock', 'attendance.correct', 'attendance.approve',
    'leave.read', 'leave.create', 'leave.approve', 'leave.reject', 'leave.manage_policies',
    'payroll.read', 'payroll.process', 'payroll.approve', 'payroll.finalize', 'payroll.view_all_payslips',
    'documents.read', 'documents.upload', 'documents.delete',
    'workflow.view', 'workflow.manage', 'workflow.approve',
    'tasks.manage', 'reports.view', 'reports.export',
    'admin.manage_users', 'admin.manage_roles', 'admin.view_audit',
  ],
  DEPT_MANAGER: [
    'employee.read',
    'attendance.read', 'attendance.clock', 'attendance.approve',
    'leave.read', 'leave.create', 'leave.approve', 'leave.reject',
    'documents.read', 'documents.upload',
    'workflow.view', 'workflow.approve',
    'tasks.manage', 'reports.view',
  ],
  PAYROLL_OFFICER: [
    'employee.read',
    'attendance.read',
    'leave.read',
    'payroll.read', 'payroll.process', 'payroll.approve', 'payroll.finalize', 'payroll.view_all_payslips',
    'documents.read',
    'reports.view', 'reports.export',
  ],
  EMPLOYEE: [
    'employee.read',
    'attendance.clock',
    'leave.create',
    'documents.read', 'documents.upload',
    'workflow.view',
  ],
};

// Available platform modules metadata
export const APP_MODULE_DEFINITIONS: ModuleInfo[] = [
  { id: 'dashboard', name: 'Dashboard', description: 'Overview, team metrics, quick action cards, and attendance shortcuts', path: '/dashboard', category: 'core' },
  { id: 'profile', name: 'My Profile', description: 'Personal information, contact details, statutory IDs, and disbursement bank accounts', path: '/profile', category: 'core' },
  { id: 'tasks', name: 'My Tasks', description: 'Assigned workflow steps, approvals, and personal action items', path: '/tasks', category: 'workplace' },
  { id: 'attendance', name: 'Attendance', description: 'Timeclock punch records, biometric sync, logs, and timesheets', path: '/attendance', category: 'workplace' },
  { id: 'leave', name: 'Leave & Time Off', description: 'Leave filing, balance tracking, and vacation request approvals', path: '/leave', category: 'workplace' },
  { id: 'payroll', name: 'Payroll & Payslips', description: 'Salary computations, payslips, PH 13th month, and tax reporting', path: '/payroll', category: 'workplace' },
  { id: 'documents', name: 'Documents', description: 'Employee 201 filing cabinets, certificates, and compliance contracts', path: '/documents', category: 'workplace' },
  { id: 'employees', name: 'Employees Directory', description: 'Employee master roster, profiles, department structure, and status', path: '/employees', category: 'management' },
  { id: 'organization', name: 'Organization', description: 'Department hierarchy, branches, designations, and company charts', path: '/organization', category: 'management' },
  { id: 'workflows', name: 'Workflows', description: 'Configurable multi-step approval routing and state machines', path: '/workflows', category: 'management' },
  { id: 'reports', name: 'Reports & Analytics', description: 'HR analytics, attendance summaries, payroll cost, and export tools', path: '/reports', category: 'management' },
  { id: 'notifications', name: 'Notifications', description: 'Company bulletins, broadcasts, and direct system announcements', path: '/notifications', category: 'system' },
  { id: 'admin', name: 'Settings & Security', description: 'RBAC permissions, audit trail, user accounts, and tenant policies', path: '/admin', category: 'system' },
];

// Default Accessible Modules per Role
export const DEFAULT_ROLE_MODULES: Record<SystemRoleType, AppModule[]> = {
  OWNER: [
    'dashboard', 'profile', 'tasks', 'attendance', 'leave', 'payroll', 'documents',
    'employees', 'organization', 'workflows', 'reports', 'notifications', 'admin'
  ],
  SUPER_ADMIN: [
    'dashboard', 'profile', 'tasks', 'attendance', 'leave', 'payroll', 'documents',
    'employees', 'organization', 'workflows', 'reports', 'notifications', 'admin'
  ],
  HR_ADMIN: [
    'dashboard', 'profile', 'tasks', 'attendance', 'leave', 'payroll', 'documents',
    'employees', 'organization', 'workflows', 'reports', 'notifications', 'admin'
  ],
  DEPT_MANAGER: [
    'dashboard', 'profile', 'tasks', 'attendance', 'leave', 'payroll', 'documents',
    'employees', 'organization', 'workflows', 'reports'
  ],
  PAYROLL_OFFICER: [
    'dashboard', 'profile', 'tasks', 'attendance', 'leave', 'payroll', 'documents',
    'reports'
  ],
  EMPLOYEE: [
    'dashboard', 'profile', 'tasks', 'attendance', 'leave', 'payroll', 'documents'
  ],
};

/**
 * Returns whether a user is considered a superuser (Owner, Super Admin, or has both user & role management privileges)
 */
export function isSuperUser(user: User | null): boolean {
  if (!user) return false;
  if (user.roleType === 'OWNER' || user.isOwner === true || user.roleType === 'SUPER_ADMIN') {
    return true;
  }
  return hasPermission(user, 'admin.manage_users') && hasPermission(user, 'admin.manage_roles');
}

/**
 * Resolves the full list of allowed modules for a given user.
 * 1. If explicit user `allowedModules` are set, uses them.
 * 2. Otherwise if assigned a custom role with `allowedModules`, uses those.
 * 3. Otherwise falls back to system role defaults.
 */
export function getUserAllowedModules(user: User | null, customRoles: Role[] = []): AppModule[] {
  if (!user) return [];

  // Superuser has all modules by default unless explicitly customized
  if (isSuperUser(user) && !user.allowedModules) {
    return [
      'dashboard', 'profile', 'tasks', 'attendance', 'leave', 'payroll', 'documents',
      'employees', 'organization', 'workflows', 'reports', 'notifications', 'admin'
    ];
  }

  // 1. Direct per-user allowedModules override
  if (user.allowedModules && Array.isArray(user.allowedModules)) {
    return user.allowedModules;
  }

  // 2. Custom role
  const role = customRoles.find(r => r.id === user.roleId);
  if (role && role.allowedModules && Array.isArray(role.allowedModules)) {
    return role.allowedModules;
  }

  // 3. System role default
  if (user.roleType && user.roleType in DEFAULT_ROLE_MODULES) {
    return DEFAULT_ROLE_MODULES[user.roleType as SystemRoleType];
  }

  return DEFAULT_ROLE_MODULES.EMPLOYEE;
}

/**
 * Checks whether a user can access a specific app module
 */
export function canAccessModule(user: User | null, module: AppModule, customRoles: Role[] = []): boolean {
  if (!user) return false;
  if (!user.isActive) return false;

  const allowedModules = getUserAllowedModules(user, customRoles);
  return allowedModules.includes(module);
}

/**
 * Maps a URL pathname to an AppModule
 */
export function getModuleFromPath(pathname: string): AppModule | null {
  const cleanPath = pathname.split('?')[0].split('#')[0];
  if (cleanPath.startsWith('/dashboard')) return 'dashboard';
  if (cleanPath.startsWith('/profile')) return 'profile';
  if (cleanPath.startsWith('/tasks')) return 'tasks';
  if (cleanPath.startsWith('/attendance')) return 'attendance';
  if (cleanPath.startsWith('/leave')) return 'leave';
  if (cleanPath.startsWith('/payroll')) return 'payroll';
  if (cleanPath.startsWith('/documents')) return 'documents';
  if (cleanPath.startsWith('/employees')) return 'employees';
  if (cleanPath.startsWith('/organization')) return 'organization';
  if (cleanPath.startsWith('/workflows')) return 'workflows';
  if (cleanPath.startsWith('/reports')) return 'reports';
  if (cleanPath.startsWith('/notifications')) return 'notifications';
  if (cleanPath.startsWith('/admin')) return 'admin';
  return null;
}

export function hasPermission(user: User | null, permission: Permission, customRoles: Role[] = []): boolean {
  if (!user) return false;

  // Check system role permissions
  if (user.roleType && user.roleType in SYSTEM_ROLE_PERMISSIONS) {
    const permissions = SYSTEM_ROLE_PERMISSIONS[user.roleType as SystemRoleType];
    return permissions.includes(permission);
  }

  // Check custom role permissions if assigned
  const role = customRoles.find(r => r.id === user.roleId);
  if (role) {
    return role.permissions.includes(permission);
  }

  return false;
}

export function hasAnyPermission(user: User | null, permissions: Permission[], customRoles: Role[] = []): boolean {
  return permissions.some(p => hasPermission(user, p, customRoles));
}

export function hasAllPermissions(user: User | null, permissions: Permission[], customRoles: Role[] = []): boolean {
  return permissions.every(p => hasPermission(user, p, customRoles));
}

export function isCompanyOwner(user: User | null): boolean {
  if (!user) return false;
  return user.roleType === 'OWNER' || user.isOwner === true;
}

export function isHRAdmin(user: User | null): boolean {
  if (!user) return false;
  return user.roleType === 'OWNER' || user.roleType === 'SUPER_ADMIN' || user.roleType === 'HR_ADMIN';
}


