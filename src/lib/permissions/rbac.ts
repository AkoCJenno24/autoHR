import { Permission, SystemRoleType, Role, User } from '@/types';

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

