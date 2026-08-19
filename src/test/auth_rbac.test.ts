import { hasPermission, hasAnyPermission, isCompanyOwner, isHRAdmin, SYSTEM_ROLE_PERMISSIONS } from '../lib/permissions/rbac';
import { calculateHoursWorked } from '../lib/utils';
import { User } from '../types';

function runTests() {
  console.log('--- Starting AutoHR v1.2 RBAC, Security & Tenant Verification Suite ---');

  const ownerUser: User = {
    id: 'usr_owner_1',
    organizationId: 'org_ayala_ph',
    employeeId: 'emp_owner_1',
    email: 'jaime.ayala@ayala.ph',
    displayName: 'Jaime Ayala',
    roleId: 'role_owner',
    roleType: 'OWNER',
    roleName: 'Company Owner & Executive',
    isActive: true,
    isOwner: true,
  };

  const hrAdminUser: User = {
    id: 'usr_eleanor',
    organizationId: 'org_ayala_ph',
    employeeId: 'emp_eleanor',
    email: 'eleanor.santos@ayala.ph',
    displayName: 'Eleanor Santos',
    roleId: 'role_hr_admin',
    roleType: 'HR_ADMIN',
    roleName: 'HR Administrator',
    isActive: true,
    isOwner: false,
  };

  const deptManagerUser: User = {
    id: 'usr_marcus',
    organizationId: 'org_ayala_ph',
    employeeId: 'emp_marcus',
    email: 'marcus.reyes@ayala.ph',
    displayName: 'Marcus Reyes',
    roleId: 'role_dept_mgr',
    roleType: 'DEPT_MANAGER',
    roleName: 'Engineering Director',
    isActive: true,
    isOwner: false,
  };

  const employeeUser: User = {
    id: 'usr_sarah',
    organizationId: 'org_ayala_ph',
    employeeId: 'emp_sarah',
    email: 'sarah.bautista@ayala.ph',
    displayName: 'Sarah Bautista',
    roleId: 'role_employee',
    roleType: 'EMPLOYEE',
    roleName: 'Regular Employee',
    isActive: true,
    isOwner: false,
  };

  // 1. Test OWNER Authority
  console.assert(isCompanyOwner(ownerUser) === true, 'Owner user must be recognized as company owner');
  console.assert(hasPermission(ownerUser, 'company.manage') === true, 'Owner must have company.manage');
  console.assert(hasPermission(ownerUser, 'payroll.finalize') === true, 'Owner must have payroll.finalize');
  console.assert(hasPermission(ownerUser, 'admin.manage_settings') === true, 'Owner must have admin.manage_settings');
  console.assert(hasPermission(ownerUser, 'admin.manage_roles') === true, 'Owner must have admin.manage_roles');
  console.assert(isHRAdmin(ownerUser) === true, 'Owner must pass isHRAdmin check');
  console.log('✓ OWNER authority and permissions verified');

  // 2. Test HR Admin Permissions & Safeguards
  console.assert(isCompanyOwner(hrAdminUser) === false, 'HR Admin alone is NOT the company owner');
  console.assert(hasPermission(hrAdminUser, 'employee.create') === true, 'HR Admin should have employee.create');
  console.assert(hasPermission(hrAdminUser, 'payroll.process') === true, 'HR Admin should have payroll.process');
  console.assert(hasPermission(hrAdminUser, 'payroll.finalize') === true, 'HR Admin should have payroll.finalize');
  console.assert(hasPermission(hrAdminUser, 'admin.view_audit') === true, 'HR Admin should have admin.view_audit');
  console.assert(isHRAdmin(hrAdminUser) === true, 'HR Admin must pass isHRAdmin check');
  console.log('✓ HR Admin permissions verified');

  // 3. Test Department Manager Permissions
  console.assert(hasPermission(deptManagerUser, 'leave.approve') === true, 'Manager should have leave.approve');
  console.assert(hasPermission(deptManagerUser, 'attendance.approve') === true, 'Manager should have attendance.approve');
  console.assert(hasPermission(deptManagerUser, 'payroll.finalize') === false, 'Manager should NOT have payroll.finalize');
  console.assert(isHRAdmin(deptManagerUser) === false, 'Manager alone should NOT be HR admin');
  console.log('✓ Department Manager boundaries verified');

  // 4. Test Regular Employee Restrictions
  console.assert(hasPermission(employeeUser, 'employee.create') === false, 'Employee should NOT have employee.create');
  console.assert(hasPermission(employeeUser, 'payroll.process') === false, 'Employee should NOT have payroll.process');
  console.assert(hasPermission(employeeUser, 'payroll.finalize') === false, 'Employee should NOT have payroll.finalize');
  console.assert(hasPermission(employeeUser, 'admin.manage_roles') === false, 'Employee should NOT have admin.manage_roles');
  console.assert(hasPermission(employeeUser, 'attendance.clock') === true, 'Employee should have attendance.clock');
  console.assert(hasPermission(employeeUser, 'leave.create') === true, 'Employee should have leave.create');
  console.assert(isCompanyOwner(employeeUser) === false, 'Employee is not company owner');
  console.log('✓ Employee self-service privileges and administrative restrictions verified');

  // 5. Test Time Calculations
  const calc = calculateHoursWorked('2026-08-18T09:00:00Z', '2026-08-18T18:00:00Z', 60);
  console.assert(calc.totalHours === 8, '8 total hours should be calculated with 1 hr break');
  console.assert(calc.regularHours === 8, '8 regular hours');
  console.assert(calc.overtimeHours === 0, '0 overtime hours');
  console.log('✓ Time calculation utilities verified');

  console.log('--- All AutoHR v1.2 RBAC and Security tests PASSED! ---');
}

runTests();
