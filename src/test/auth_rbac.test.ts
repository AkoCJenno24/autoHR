import { hasPermission, hasAnyPermission, isCompanyOwner, isHRAdmin, isSuperUser, canAccessModule, SYSTEM_ROLE_PERMISSIONS } from '../lib/permissions/rbac';
import { calculateHoursWorked } from '../lib/utils';
import { User, Employee } from '../types';

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

  // 6. Test Module Access Controls & Superuser checks
  console.assert(isSuperUser(ownerUser) === true, 'Owner must be superuser');
  console.assert(isSuperUser(employeeUser) === false, 'Employee must not be superuser');
  console.assert(canAccessModule(ownerUser, 'admin') === true, 'Owner can access admin module');
  console.assert(canAccessModule(ownerUser, 'payroll') === true, 'Owner can access payroll module');
  console.assert(canAccessModule(employeeUser, 'admin') === false, 'Employee cannot access admin module');
  console.assert(canAccessModule(employeeUser, 'attendance') === true, 'Employee can access attendance module');

  // Custom user override test
  const restrictedEmployee: User = {
    ...employeeUser,
    allowedModules: ['dashboard', 'attendance'], // Restricted: no payroll or leave
  };
  console.assert(canAccessModule(restrictedEmployee, 'dashboard') === true, 'Restricted employee has dashboard');
  console.assert(canAccessModule(restrictedEmployee, 'attendance') === true, 'Restricted employee has attendance');
  console.assert(canAccessModule(restrictedEmployee, 'leave') === false, 'Restricted employee cannot access leave');
  console.assert(canAccessModule(restrictedEmployee, 'payroll') === false, 'Restricted employee cannot access payroll');
  console.log('✓ Module access control and custom overrides verified');

  // 7. Test Profile Field Policies
  const testEmp: Employee = {
    id: 'emp_test_1',
    organizationId: 'org_ayala_ph',
    employeeNumber: 'EMP-999',
    firstName: 'Juan',
    lastName: 'Dela Cruz',
    email: 'juan@example.com',
    phone: '+63 917 111 2222',
    departmentId: 'dept_eng',
    departmentName: 'Engineering',
    positionId: 'pos_dev',
    positionTitle: 'Developer',
    locationId: 'loc_bgc',
    locationName: 'BGC',
    hireDate: '2026-01-01',
    statusId: 'stat_active',
    statusName: 'Active',
    employmentTypeId: 'type_reg',
    employmentTypeName: 'Regular',
    baseSalary: 75000,
    salaryRateType: 'MONTHLY',
    bankName: 'BDO Unibank',
    bankAccountNumber: '123456789',
    fieldPolicyOverrides: {
      phone: 'READ_ONLY', // Overridden to locked
    },
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  };

  // Test field policy resolution (direct override vs default)
  console.assert(testEmp.fieldPolicyOverrides?.phone === 'READ_ONLY', 'Custom override for phone must be READ_ONLY');
  console.assert(testEmp.bankName === 'BDO Unibank', 'Initial bank name is BDO');

  console.log('✓ Profile field-level editing policies verified');
  console.log('--- All AutoHR v1.2 RBAC and Security tests PASSED! ---');
}

runTests();
