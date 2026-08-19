import {
  Organization,
  Department,
  Location,
  Position,
  ConfigurableStatus,
  ConfigurableEmploymentType,
  Role,
  User,
  Employee,
  ClockRecord,
  AttendanceCorrectionRequest,
  LeaveType,
  LeaveBalance,
  LeaveRequest,
  PayrollPeriod,
  Payslip,
  DocumentItem,
  WorkflowDefinition,
  WorkflowInstance,
  HumanTask,
  NotificationItem,
  NotificationIncident,
  AuditEvent,
  ID,
} from '@/types';
import { calculateSemiMonthlyPayroll } from '@/lib/payroll/philippineTaxEngine';

// =========================================================================
// PHILIPPINES DEFAULT SEED DATA FOR MULTI-TENANT ARCHITECTURE (v1.2 Lock)
// =========================================================================

const SEED_ORGANIZATION: Organization = {
  id: 'org_autohr_ph',
  name: 'AutoHR Philippines Technologies Inc.',
  code: 'AUTOHR-PH',
  domain: 'autohr.ph',
  country: 'Philippines',
  countryCode: 'PH',
  timezone: 'Asia/Manila',
  currency: 'PHP',
  currencySymbol: '₱',
  locale: 'en-PH',
  fiscalYearStartMonth: 1,
  settings: {
    workDaysPerWeek: 5,
    standardHoursPerDay: 8,
    allowSelfClockIn: true,
    requireGeofence: false,
    requireBiometrics: false,
    enforcePhilippineStatutory: true,
  },
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

const SEED_DEPARTMENTS: Department[] = [
  { id: 'dept_hr', organizationId: 'org_autohr_ph', name: 'Human Resources & People', code: 'HR', managerEmployeeId: 'emp_eleanor', createdAt: '2026-01-01T00:00:00Z' },
  { id: 'dept_eng', organizationId: 'org_autohr_ph', name: 'Software Engineering', code: 'ENG', managerEmployeeId: 'emp_marcus', createdAt: '2026-01-01T00:00:00Z' },
  { id: 'dept_fin', organizationId: 'org_autohr_ph', name: 'Finance & Philippine Payroll', code: 'FIN', managerEmployeeId: 'emp_eleanor', createdAt: '2026-01-01T00:00:00Z' },
  { id: 'dept_ops', organizationId: 'org_autohr_ph', name: 'Operations & Compliance', code: 'OPS', managerEmployeeId: 'emp_marcus', createdAt: '2026-01-01T00:00:00Z' },
];

const SEED_LOCATIONS: Location[] = [
  { id: 'loc_bgc', organizationId: 'org_autohr_ph', name: 'Manila HQ (BGC)', code: 'BGC', address: '26th Street & 5th Avenue, Bonifacio Global City', city: 'Taguig City', country: 'Philippines', timezone: 'Asia/Manila' },
  { id: 'loc_cebu', organizationId: 'org_autohr_ph', name: 'Cebu Innovation Hub', code: 'CEB', address: 'Salinas Drive, Cebu IT Park', city: 'Cebu City', country: 'Philippines', timezone: 'Asia/Manila' },
];

const SEED_POSITIONS: Position[] = [
  { id: 'pos_hr_dir', organizationId: 'org_autohr_ph', departmentId: 'dept_hr', title: 'VP of People & HR', code: 'HR-EXEC', jobLevel: 'Exec', minSalary: 140000, maxSalary: 200000 },
  { id: 'pos_eng_lead', organizationId: 'org_autohr_ph', departmentId: 'dept_eng', title: 'Engineering Director', code: 'ENG-M4', jobLevel: 'M4', minSalary: 160000, maxSalary: 230000 },
  { id: 'pos_sr_dev', organizationId: 'org_autohr_ph', departmentId: 'dept_eng', title: 'Senior Full-Stack Engineer', code: 'ENG-L3', jobLevel: 'L3', minSalary: 120000, maxSalary: 165000 },
  { id: 'pos_pay_lead', organizationId: 'org_autohr_ph', departmentId: 'dept_fin', title: 'Philippine Payroll Operations Lead', code: 'FIN-L3', jobLevel: 'L3', minSalary: 90000, maxSalary: 130000 },
];

const SEED_STATUSES: ConfigurableStatus[] = [
  { id: 'stat_active', organizationId: 'org_autohr_ph', name: 'Active', color: 'success', isDefault: true, allowsPayroll: true, allowsAttendance: true },
  { id: 'stat_probation', organizationId: 'org_autohr_ph', name: 'Probationary', color: 'warning', isDefault: false, allowsPayroll: true, allowsAttendance: true },
  { id: 'stat_onleave', organizationId: 'org_autohr_ph', name: 'On Leave', color: 'info', isDefault: false, allowsPayroll: true, allowsAttendance: false },
  { id: 'stat_suspended', organizationId: 'org_autohr_ph', name: 'Suspended', color: 'danger', isDefault: false, allowsPayroll: false, allowsAttendance: false },
  { id: 'stat_terminated', organizationId: 'org_autohr_ph', name: 'Terminated', color: 'danger', isDefault: false, allowsPayroll: false, allowsAttendance: false },
  { id: 'stat_resigned', organizationId: 'org_autohr_ph', name: 'Resigned', color: 'secondary', isDefault: false, allowsPayroll: false, allowsAttendance: false },
];

const SEED_EMPLOYMENT_TYPES: ConfigurableEmploymentType[] = [
  { id: 'type_reg', organizationId: 'org_autohr_ph', name: 'Regular', standardWeeklyHours: 40 },
  { id: 'type_prob', organizationId: 'org_autohr_ph', name: 'Probationary', standardWeeklyHours: 40 },
  { id: 'type_contract', organizationId: 'org_autohr_ph', name: 'Contractual', standardWeeklyHours: 40 },
  { id: 'type_parttime', organizationId: 'org_autohr_ph', name: 'Part-time', standardWeeklyHours: 20 },
  { id: 'type_intern', organizationId: 'org_autohr_ph', name: 'Intern', standardWeeklyHours: 35 },
];

const SEED_ROLES: Role[] = [
  {
    id: 'role_owner',
    organizationId: 'org_autohr_ph',
    name: 'Company Owner & Executive',
    type: 'OWNER',
    description: 'Supreme company authority, company settings governance, full RBAC and statutory payroll approval.',
    isSystem: true,
    permissions: [
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
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'role_hr_admin',
    organizationId: 'org_autohr_ph',
    name: 'HR Administrator',
    type: 'HR_ADMIN',
    description: 'Full administrative access across Core HR, Payroll, Leave, and Workflow settings.',
    isSystem: true,
    permissions: [
      'employee.read', 'employee.create', 'employee.update', 'employee.archive',
      'attendance.read', 'attendance.clock', 'attendance.correct', 'attendance.approve',
      'leave.read', 'leave.create', 'leave.approve', 'leave.reject', 'leave.manage_policies',
      'payroll.read', 'payroll.process', 'payroll.approve', 'payroll.finalize', 'payroll.view_all_payslips',
      'documents.read', 'documents.upload', 'documents.delete',
      'workflow.view', 'workflow.manage', 'workflow.approve',
      'tasks.manage', 'reports.view', 'reports.export',
      'admin.manage_users', 'admin.manage_roles', 'admin.view_audit',
    ],
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'role_dept_mgr',
    organizationId: 'org_autohr_ph',
    name: 'Department Manager',
    type: 'DEPT_MANAGER',
    description: 'Manages team attendance, leave approvals, workflows, and task assignments.',
    isSystem: true,
    permissions: [
      'employee.read',
      'attendance.read', 'attendance.clock', 'attendance.approve',
      'leave.read', 'leave.create', 'leave.approve', 'leave.reject',
      'documents.read', 'documents.upload',
      'workflow.view', 'workflow.approve',
      'tasks.manage', 'reports.view',
    ],
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'role_employee',
    organizationId: 'org_autohr_ph',
    name: 'Regular Employee',
    type: 'EMPLOYEE',
    description: 'Employee Self-Service access for personal clocking, leave requests, and confidential payslips.',
    isSystem: true,
    permissions: [
      'employee.read',
      'attendance.clock',
      'leave.create',
      'documents.read', 'documents.upload',
      'workflow.view',
    ],
    createdAt: '2026-01-01T00:00:00Z',
  },
];

const SEED_USERS: User[] = [
  {
    id: 'usr_eleanor',
    organizationId: 'org_autohr_ph',
    employeeId: 'emp_eleanor',
    email: 'eleanor.santos@autohr.ph',
    displayName: 'Eleanor Santos',
    roleId: 'role_owner',
    roleType: 'OWNER',
    roleName: 'Company Owner & HR VP',
    isActive: true,
    isOwner: true,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'usr_marcus',
    organizationId: 'org_autohr_ph',
    employeeId: 'emp_marcus',
    email: 'marcus.reyes@autohr.ph',
    displayName: 'Marcus Reyes',
    roleId: 'role_dept_mgr',
    roleType: 'DEPT_MANAGER',
    roleName: 'Engineering Director',
    isActive: true,
    isOwner: false,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'usr_sarah',
    organizationId: 'org_autohr_ph',
    employeeId: 'emp_sarah',
    email: 'sarah.bautista@autohr.ph',
    displayName: 'Sarah Bautista',
    roleId: 'role_employee',
    roleType: 'EMPLOYEE',
    roleName: 'Senior Software Engineer',
    isActive: true,
    isOwner: false,
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  },
];

const SEED_EMPLOYEES: Employee[] = [
  {
    id: 'emp_eleanor',
    organizationId: 'org_autohr_ph',
    employeeNumber: 'PH-EMP-0001',
    firstName: 'Eleanor',
    lastName: 'Santos',
    middleName: 'Mendoza',
    email: 'eleanor.santos@autohr.ph',
    phone: '+63 917 890 1122',
    dateOfBirth: '1985-04-12',
    gender: 'female',
    nationalId: 'PH-PSN-8921-9921',
    tinNumber: 'TIN-234-981-221',
    sssNumber: 'SSS-34-8921822-1',
    philHealthNumber: 'PHIC-12-09281928-3',
    pagIbigNumber: 'HDMF-1210-9982-1290',
    taxIdentificationNumber: 'TIN-234-981-221',
    address: 'Unit 28B, Two Serendra, BGC, Taguig City, Metro Manila',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    departmentId: 'dept_hr',
    departmentName: 'Human Resources & People',
    positionId: 'pos_hr_dir',
    positionTitle: 'VP of People & HR',
    locationId: 'loc_bgc',
    locationName: 'Manila HQ (BGC)',
    hireDate: '2021-03-15',
    statusId: 'stat_active',
    statusName: 'Active',
    employmentTypeId: 'type_reg',
    employmentTypeName: 'Regular',
    baseSalary: 165000,
    salaryRateType: 'MONTHLY',
    bankName: 'BDO Unibank',
    bankAccountNumber: '•••• •••• 9812',
    createdAt: '2021-03-15T09:00:00Z',
    updatedAt: '2026-08-01T00:00:00Z',
  },
  {
    id: 'emp_marcus',
    organizationId: 'org_autohr_ph',
    employeeNumber: 'PH-EMP-0002',
    firstName: 'Marcus',
    lastName: 'Reyes',
    middleName: 'Tan',
    email: 'marcus.reyes@autohr.ph',
    phone: '+63 918 773 4411',
    dateOfBirth: '1988-11-20',
    gender: 'male',
    nationalId: 'PH-PSN-7744-1102',
    tinNumber: 'TIN-441-209-883',
    sssNumber: 'SSS-03-9912019-8',
    philHealthNumber: 'PHIC-09-11029384-5',
    pagIbigNumber: 'HDMF-1402-9912-0044',
    taxIdentificationNumber: 'TIN-441-209-883',
    address: '15 Eastwood Ave, Bagumbayan, Quezon City, Metro Manila',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    departmentId: 'dept_eng',
    departmentName: 'Software Engineering',
    positionId: 'pos_eng_lead',
    positionTitle: 'Engineering Director',
    locationId: 'loc_bgc',
    locationName: 'Manila HQ (BGC)',
    managerId: 'emp_eleanor',
    managerName: 'Eleanor Santos',
    hireDate: '2022-01-10',
    statusId: 'stat_active',
    statusName: 'Active',
    employmentTypeId: 'type_reg',
    employmentTypeName: 'Regular',
    baseSalary: 195000,
    salaryRateType: 'MONTHLY',
    bankName: 'Bank of the Philippine Islands (BPI)',
    bankAccountNumber: '•••• •••• 4421',
    createdAt: '2022-01-10T09:00:00Z',
    updatedAt: '2026-08-01T00:00:00Z',
  },
  {
    id: 'emp_sarah',
    organizationId: 'org_autohr_ph',
    employeeNumber: 'PH-EMP-0003',
    firstName: 'Sarah',
    lastName: 'Bautista',
    middleName: 'Villanueva',
    email: 'sarah.bautista@autohr.ph',
    phone: '+63 920 554 9988',
    dateOfBirth: '1992-06-18',
    gender: 'female',
    nationalId: 'PH-PSN-5599-3381',
    tinNumber: 'TIN-882-192-004',
    sssNumber: 'SSS-34-1192039-4',
    philHealthNumber: 'PHIC-18-29384719-0',
    pagIbigNumber: 'HDMF-1882-9901-2299',
    taxIdentificationNumber: 'TIN-882-192-004',
    address: 'Ayala Alabang Village, Muntinlupa City, Metro Manila',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    departmentId: 'dept_eng',
    departmentName: 'Software Engineering',
    positionId: 'pos_sr_dev',
    positionTitle: 'Senior Full-Stack Engineer',
    locationId: 'loc_bgc',
    locationName: 'Manila HQ (BGC)',
    managerId: 'emp_marcus',
    managerName: 'Marcus Reyes',
    hireDate: '2023-05-01',
    statusId: 'stat_active',
    statusName: 'Active',
    employmentTypeId: 'type_reg',
    employmentTypeName: 'Regular',
    baseSalary: 145000,
    salaryRateType: 'MONTHLY',
    bankName: 'UnionBank of the Philippines',
    bankAccountNumber: '•••• •••• 1109',
    createdAt: '2023-05-01T09:00:00Z',
    updatedAt: '2026-08-01T00:00:00Z',
  },
];

const SEED_LEAVE_TYPES: LeaveType[] = [
  { id: 'lt_vl', organizationId: 'org_autohr_ph', name: 'Vacation Leave (VL)', code: 'VL', color: '#2563EB', isPaid: true, daysPerYear: 15, requiresAttachment: false, maxConsecutiveDays: 10 },
  { id: 'lt_sl', organizationId: 'org_autohr_ph', name: 'Sick Leave (SL)', code: 'SL', color: '#16A34A', isPaid: true, daysPerYear: 15, requiresAttachment: true, maxConsecutiveDays: 5 },
  { id: 'lt_mat', organizationId: 'org_autohr_ph', name: 'Maternity Leave (RA 11210)', code: 'MAT', color: '#0891B2', isPaid: true, daysPerYear: 105, requiresAttachment: true },
  { id: 'lt_pat', organizationId: 'org_autohr_ph', name: 'Paternity Leave (RA 8187)', code: 'PAT', color: '#0284C7', isPaid: true, daysPerYear: 7, requiresAttachment: true },
  { id: 'lt_solo', organizationId: 'org_autohr_ph', name: 'Solo Parent Leave (RA 8972)', code: 'SOLO', color: '#D97706', isPaid: true, daysPerYear: 7, requiresAttachment: true },
  { id: 'lt_emer', organizationId: 'org_autohr_ph', name: 'Emergency / Bereavement Leave', code: 'EMER', color: '#64748B', isPaid: true, daysPerYear: 5, requiresAttachment: false },
];

const SEED_LEAVE_BALANCES: LeaveBalance[] = [
  { id: 'lb_sarah_vl', organizationId: 'org_autohr_ph', employeeId: 'emp_sarah', leaveTypeId: 'lt_vl', leaveTypeName: 'Vacation Leave (VL)', year: 2026, allocatedDays: 15, usedDays: 3, pendingDays: 2, remainingDays: 10 },
  { id: 'lb_sarah_sl', organizationId: 'org_autohr_ph', employeeId: 'emp_sarah', leaveTypeId: 'lt_sl', leaveTypeName: 'Sick Leave (SL)', year: 2026, allocatedDays: 15, usedDays: 1, pendingDays: 0, remainingDays: 14 },
  { id: 'lb_marcus_vl', organizationId: 'org_autohr_ph', employeeId: 'emp_marcus', leaveTypeId: 'lt_vl', leaveTypeName: 'Vacation Leave (VL)', year: 2026, allocatedDays: 15, usedDays: 2, pendingDays: 0, remainingDays: 13 },
];

const SEED_LEAVE_REQUESTS: LeaveRequest[] = [
  {
    id: 'lvr_101',
    organizationId: 'org_autohr_ph',
    employeeId: 'emp_sarah',
    employeeName: 'Sarah Bautista',
    departmentName: 'Software Engineering',
    leaveTypeId: 'lt_vl',
    leaveTypeName: 'Vacation Leave (VL)',
    startDate: '2026-08-25',
    endDate: '2026-08-26',
    totalDays: 2,
    reason: 'Personal time-off and family trip to Palawan.',
    status: 'PENDING',
    workflowInstanceId: 'wf_lvr_101',
    approverId: 'usr_marcus',
    approverName: 'Marcus Reyes',
    createdAt: '2026-08-18T08:30:00Z',
  },
  {
    id: 'lvr_100',
    organizationId: 'org_autohr_ph',
    employeeId: 'emp_sarah',
    employeeName: 'Sarah Bautista',
    departmentName: 'Software Engineering',
    leaveTypeId: 'lt_sl',
    leaveTypeName: 'Sick Leave (SL)',
    startDate: '2026-07-14',
    endDate: '2026-07-14',
    totalDays: 1,
    reason: 'Dental appointment and recovery.',
    status: 'APPROVED',
    approverId: 'usr_marcus',
    approverName: 'Marcus Reyes',
    approverComments: 'Approved. Get well soon!',
    createdAt: '2026-07-13T10:00:00Z',
    decidedAt: '2026-07-13T14:20:00Z',
  },
];

const SEED_CLOCK_RECORDS: ClockRecord[] = [
  {
    id: 'clk_sarah_today',
    organizationId: 'org_autohr_ph',
    employeeId: 'emp_sarah',
    employeeName: 'Sarah Bautista',
    date: new Date().toISOString().split('T')[0],
    clockInTime: `${new Date().toISOString().split('T')[0]}T09:02:14Z`,
    totalHoursWorked: 7.5,
    regularHours: 7.5,
    overtimeHours: 0,
    lateMinutes: 2,
    earlyDepartureMinutes: 0,
    status: 'PRESENT',
    isCorrected: false,
  },
  {
    id: 'clk_marcus_today',
    organizationId: 'org_autohr_ph',
    employeeId: 'emp_marcus',
    employeeName: 'Marcus Reyes',
    date: new Date().toISOString().split('T')[0],
    clockInTime: `${new Date().toISOString().split('T')[0]}T08:45:00Z`,
    totalHoursWorked: 8.2,
    regularHours: 8.0,
    overtimeHours: 0.2,
    lateMinutes: 0,
    earlyDepartureMinutes: 0,
    status: 'PRESENT',
    isCorrected: false,
  },
];

const SEED_WORKFLOWS: WorkflowDefinition[] = [
  {
    id: 'wf_def_leave',
    organizationId: 'org_autohr_ph',
    name: 'Philippine Leave Approval Flow',
    code: 'WF-LEAVE-STD',
    module: 'LEAVE',
    isActive: true,
    version: 1,
    steps: [
      { stepNumber: 1, title: 'Direct Manager Review', approverType: 'DIRECT_MANAGER', slaHours: 24, canReject: true },
      { stepNumber: 2, title: 'HR Department Final Verification', approverType: 'HR_ADMIN', slaHours: 48, canReject: true },
    ],
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'wf_def_att_corr',
    organizationId: 'org_autohr_ph',
    name: 'Attendance Correction Review',
    code: 'WF-ATT-CORR',
    module: 'ATTENDANCE',
    isActive: true,
    version: 1,
    steps: [
      { stepNumber: 1, title: 'Manager Verification', approverType: 'DIRECT_MANAGER', slaHours: 24, canReject: true },
    ],
    createdAt: '2026-01-01T00:00:00Z',
  },
];

const SEED_TASKS: HumanTask[] = [
  {
    id: 'tsk_101',
    organizationId: 'org_autohr_ph',
    workflowInstanceId: 'wf_lvr_101',
    module: 'LEAVE',
    title: 'Review Leave Application: Sarah Bautista (2 Days VL)',
    description: 'Sarah Bautista requested 2 days of Vacation Leave from Aug 25 to Aug 26, 2026.',
    assignedToUserId: 'usr_marcus',
    assignedToName: 'Marcus Reyes',
    priority: 'HIGH',
    status: 'OPEN',
    dueDate: '2026-08-20T18:00:00Z',
    slaHours: 24,
    isBreached: false,
    entityType: 'LeaveRequest',
    entityId: 'lvr_101',
    actions: ['APPROVE', 'REJECT'],
    createdAt: '2026-08-18T08:30:00Z',
  },
];

const SEED_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_1',
    organizationId: 'org_autohr_ph',
    recipientUserId: 'usr_marcus',
    title: 'New Leave Request Awaiting Review',
    message: 'Sarah Bautista submitted a request for 2 days of Vacation Leave.',
    channel: 'IN_APP',
    priority: 'HIGH',
    module: 'LEAVE',
    link: '/leave',
    isRead: false,
    status: 'SENT',
    createdAt: '2026-08-18T08:30:00Z',
  },
  {
    id: 'notif_2',
    organizationId: 'org_autohr_ph',
    recipientUserId: 'usr_sarah',
    title: 'Time Clock Auto-Recorded',
    message: 'Clock-in confirmed at 09:02 AM today (Asia/Manila).',
    channel: 'IN_APP',
    priority: 'NORMAL',
    module: 'ATTENDANCE',
    link: '/attendance',
    isRead: true,
    status: 'SENT',
    createdAt: '2026-08-18T09:02:14Z',
  },
];

// Pre-calculate Philippine Statutory Payslip for Seed Period
function generateSeedPayrollData() {
  const periodId = 'pay_aug_2026_1';
  const periodName = 'August 2026 (First Half)';
  const startDate = '2026-08-01';
  const endDate = '2026-08-15';
  const paymentDate = '2026-08-20';

  let totalGross = 0;
  let totalDeductions = 0;
  let totalNet = 0;

  const payslips: Payslip[] = SEED_EMPLOYEES.map(emp => {
    const calc = calculateSemiMonthlyPayroll({
      monthlyBaseSalary: emp.baseSalary,
      nonTaxableAllowances: 2500, // De Minimis / Rice Subsidy Allowance
      overtimeHours: emp.id === 'emp_sarah' ? 4 : 0,
    });

    totalGross += calc.grossPay;
    totalDeductions += calc.totalDeductions;
    totalNet += calc.netPay;

    return {
      id: `ps_${periodId}_${emp.id}`,
      organizationId: 'org_autohr_ph',
      payrollPeriodId: periodId,
      periodName,
      periodStartDate: startDate,
      periodEndDate: endDate,
      paymentDate,
      employeeId: emp.id,
      employeeNumber: emp.employeeNumber,
      employeeName: `${emp.firstName} ${emp.lastName}`,
      departmentName: emp.departmentName,
      positionTitle: emp.positionTitle,
      bankName: emp.bankName,
      bankAccountNumber: emp.bankAccountNumber,
      taxIdentificationNumber: emp.tinNumber,
      baseSalary: calc.semiMonthlyBasic,
      daysWorked: 11,
      regularHours: 88,
      overtimeHours: emp.id === 'emp_sarah' ? 4 : 0,
      unpaidLeaveDays: 0,
      earnings: [
        { id: `e1_${emp.id}`, title: 'Semi-Monthly Basic Salary', type: 'EARNING', category: 'BASIC', amount: calc.semiMonthlyBasic },
        { id: `e2_${emp.id}`, title: 'De Minimis / Non-Taxable Allowance', type: 'EARNING', category: 'ALLOWANCE', amount: 2500 },
        ...(emp.id === 'emp_sarah' ? [{ id: `e3_${emp.id}`, title: 'Overtime Pay (4 hrs @ 125%)', type: 'EARNING' as const, category: 'OVERTIME' as const, amount: calc.overtimePay }] : []),
      ],
      deductions: [
        { id: `d1_${emp.id}`, title: 'SSS Employee Contribution', type: 'DEDUCTION', category: 'TAX', amount: calc.statutory.sssEmployee },
        { id: `d2_${emp.id}`, title: 'PhilHealth Employee Premium', type: 'DEDUCTION', category: 'HEALTH_INSURANCE', amount: calc.statutory.philHealthEmployee },
        { id: `d3_${emp.id}`, title: 'Pag-IBIG / HDMF Contribution', type: 'DEDUCTION', category: 'TAX', amount: calc.statutory.pagIbigEmployee },
        { id: `d4_${emp.id}`, title: 'BIR Withholding Tax (TRAIN)', type: 'DEDUCTION', category: 'TAX', amount: calc.statutory.withholdingTax },
      ],
      adjustments: [],
      grossPay: calc.grossPay,
      totalDeductions: calc.totalDeductions,
      netPay: calc.netPay,
      status: 'APPROVED',
      generatedAt: '2026-08-16T08:00:00Z',
    };
  });

  const period: PayrollPeriod = {
    id: periodId,
    organizationId: 'org_autohr_ph',
    name: periodName,
    startDate,
    endDate,
    paymentDate,
    status: 'UNDER_REVIEW',
    totalGrossPay: Math.round(totalGross * 100) / 100,
    totalDeductions: Math.round(totalDeductions * 100) / 100,
    totalNetPay: Math.round(totalNet * 100) / 100,
    employeeCount: SEED_EMPLOYEES.length,
    createdAt: '2026-08-16T08:00:00Z',
  };

  return { period, payslips };
}

const { period: SEED_PAYROLL_PERIOD, payslips: SEED_PAYSLIPS_CALCULATED } = generateSeedPayrollData();

const SEED_PAYROLL_PERIODS: PayrollPeriod[] = [
  SEED_PAYROLL_PERIOD,
  {
    id: 'pay_jul_2026_2',
    organizationId: 'org_autohr_ph',
    name: 'July 2026 (Second Half)',
    startDate: '2026-07-16',
    endDate: '2026-07-31',
    paymentDate: '2026-08-05',
    status: 'FINALIZED',
    totalGrossPay: 260500,
    totalDeductions: 54200,
    totalNetPay: 206300,
    employeeCount: 3,
    finalizedAt: '2026-08-04T16:00:00Z',
    finalizedByName: 'Eleanor Santos',
    createdAt: '2026-08-01T08:00:00Z',
  },
];

const SEED_DOCUMENTS: DocumentItem[] = [
  {
    id: 'doc_1',
    organizationId: 'org_autohr_ph',
    employeeId: 'emp_sarah',
    employeeName: 'Sarah Bautista',
    title: 'Philippine Employment Contract & DOLE Compliance (Executed)',
    category: 'CONTRACT',
    fileName: 'Sarah_Bautista_Employment_Contract_2023.pdf',
    fileSizeBytes: 2450000,
    fileUrl: '#',
    mimeType: 'application/pdf',
    isRestricted: true,
    uploadedByUserId: 'usr_eleanor',
    uploadedByName: 'Eleanor Santos',
    createdAt: '2023-05-01T10:00:00Z',
  },
  {
    id: 'doc_2',
    organizationId: 'org_autohr_ph',
    title: 'Philippine Employee Handbook & DOLE Statutory Benefits Guide 2026',
    category: 'POLICY',
    fileName: 'AutoHR_PH_Handbook_2026.pdf',
    fileSizeBytes: 4120000,
    fileUrl: '#',
    mimeType: 'application/pdf',
    isRestricted: false,
    uploadedByUserId: 'usr_eleanor',
    uploadedByName: 'Eleanor Santos',
    createdAt: '2026-01-05T09:00:00Z',
  },
];

const SEED_AUDIT_LOGS: AuditEvent[] = [
  {
    id: 'aud_init_1',
    organizationId: 'org_autohr_ph',
    actorId: 'usr_eleanor',
    actorName: 'Eleanor Santos',
    actorRole: 'Company Owner & HR VP',
    action: 'ORGANIZATION_INITIALIZED_PH_LOCK',
    module: 'ADMIN',
    resourceType: 'Organization',
    resourceId: 'org_autohr_ph',
    correlationId: 'corr_ph_init-001',
    timestamp: '2026-01-01T00:00:00Z',
  },
  {
    id: 'aud_init_2',
    organizationId: 'org_autohr_ph',
    actorId: 'usr_eleanor',
    actorName: 'Eleanor Santos',
    actorRole: 'Company Owner & HR VP',
    action: 'EMPLOYEE_CREATED',
    module: 'EMPLOYEES',
    resourceType: 'Employee',
    resourceId: 'emp_sarah',
    newState: { name: 'Sarah Bautista', position: 'Senior Full-Stack Engineer', tin: 'TIN-882-192-004' },
    correlationId: 'corr_emp-create-03',
    timestamp: '2023-05-01T09:00:00Z',
  },
];

// =========================================================================
// REACTIVE LOCAL DATABASE & PERSISTENCE STORE
// =========================================================================

class AutoHRDataStore {
  private organization: Organization = SEED_ORGANIZATION;
  private departments: Department[] = [...SEED_DEPARTMENTS];
  private locations: Location[] = [...SEED_LOCATIONS];
  private positions: Position[] = [...SEED_POSITIONS];
  private statuses: ConfigurableStatus[] = [...SEED_STATUSES];
  private employmentTypes: ConfigurableEmploymentType[] = [...SEED_EMPLOYMENT_TYPES];
  private roles: Role[] = [...SEED_ROLES];
  private users: User[] = [...SEED_USERS];
  private employees: Employee[] = [...SEED_EMPLOYEES];
  private clockRecords: ClockRecord[] = [...SEED_CLOCK_RECORDS];
  private correctionRequests: AttendanceCorrectionRequest[] = [];
  private leaveTypes: LeaveType[] = [...SEED_LEAVE_TYPES];
  private leaveBalances: LeaveBalance[] = [...SEED_LEAVE_BALANCES];
  private leaveRequests: LeaveRequest[] = [...SEED_LEAVE_REQUESTS];
  private payrollPeriods: PayrollPeriod[] = [...SEED_PAYROLL_PERIODS];
  private payslips: Payslip[] = [...SEED_PAYSLIPS_CALCULATED];
  private documents: DocumentItem[] = [...SEED_DOCUMENTS];
  private workflows: WorkflowDefinition[] = [...SEED_WORKFLOWS];
  private tasks: HumanTask[] = [...SEED_TASKS];
  private notifications: NotificationItem[] = [...SEED_NOTIFICATIONS];
  private incidents: NotificationIncident[] = [];
  private auditEvents: AuditEvent[] = [...SEED_AUDIT_LOGS];

  // Active current user state
  private currentUser: User = SEED_USERS[0]; // Default: Eleanor Santos (Owner)
  private subscribers: Array<() => void> = [];

  constructor() {
    // Load persisted state from localStorage if available
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('autohr_ph_data_v1_2');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.organization) this.organization = parsed.organization;
          if (parsed.departments) this.departments = parsed.departments;
          if (parsed.locations) this.locations = parsed.locations;
          if (parsed.positions) this.positions = parsed.positions;
          if (parsed.roles) this.roles = parsed.roles;
          if (parsed.users) this.users = parsed.users;
          if (parsed.employees) this.employees = parsed.employees;
          if (parsed.leaveRequests) this.leaveRequests = parsed.leaveRequests;
          if (parsed.leaveBalances) this.leaveBalances = parsed.leaveBalances;
          if (parsed.clockRecords) this.clockRecords = parsed.clockRecords;
          if (parsed.tasks) this.tasks = parsed.tasks;
          if (parsed.notifications) this.notifications = parsed.notifications;
          if (parsed.auditEvents) this.auditEvents = parsed.auditEvents;
          if (parsed.payrollPeriods) this.payrollPeriods = parsed.payrollPeriods;
          if (parsed.payslips) this.payslips = parsed.payslips;
          if (parsed.currentUserId) {
            const u = this.users.find(usr => usr.id === parsed.currentUserId);
            if (u) this.currentUser = u;
          }
        } catch (e) {
          console.error('Failed to parse cached AutoHR PH data', e);
        }
      }
    }
  }

  private persist() {
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(
          'autohr_ph_data_v1_2',
          JSON.stringify({
            organization: this.organization,
            departments: this.departments,
            locations: this.locations,
            positions: this.positions,
            roles: this.roles,
            users: this.users,
            employees: this.employees,
            leaveRequests: this.leaveRequests,
            leaveBalances: this.leaveBalances,
            clockRecords: this.clockRecords,
            tasks: this.tasks,
            notifications: this.notifications,
            auditEvents: this.auditEvents,
            payrollPeriods: this.payrollPeriods,
            payslips: this.payslips,
            currentUserId: this.currentUser.id,
          })
        );
      } catch {}
    }
    this.notify();
  }

  public subscribe(cb: () => void) {
    this.subscribers.push(cb);
    return () => {
      this.subscribers = this.subscribers.filter(s => s !== cb);
    };
  }

  private notify() {
    this.subscribers.forEach(cb => cb());
  }

  // =========================================================================
  // DYNAMIC COMPANY CREATION & AUTOMATIC SECURE OWNER PROVISIONING (Section 4)
  // =========================================================================
  public createCompanyTenant(params: {
    companyName: string;
    companyCode: string;
    domain?: string;
    ownerName: string;
    ownerEmail: string;
    ownerUid: string;
  }): { organization: Organization; ownerUser: User; ownerEmployee: Employee } {
    const orgId = `org_${params.companyCode.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now().toString(36)}`;
    
    // 1. Initialized with Philippine Defaults
    const newOrg: Organization = {
      id: orgId,
      name: params.companyName,
      code: params.companyCode.toUpperCase(),
      domain: params.domain || `${params.companyCode.toLowerCase()}.ph`,
      country: 'Philippines',
      countryCode: 'PH',
      timezone: 'Asia/Manila',
      currency: 'PHP',
      currencySymbol: '₱',
      locale: 'en-PH',
      fiscalYearStartMonth: 1,
      settings: {
        workDaysPerWeek: 5,
        standardHoursPerDay: 8,
        allowSelfClockIn: true,
        requireGeofence: false,
        requireBiometrics: false,
        enforcePhilippineStatutory: true,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 2. Default Departments for Tenant
    const defaultDepts: Department[] = [
      { id: `dept_exec_${orgId}`, organizationId: orgId, name: 'Executive Office', code: 'EXEC', createdAt: new Date().toISOString() },
      { id: `dept_hr_${orgId}`, organizationId: orgId, name: 'Human Resources & People', code: 'HR', createdAt: new Date().toISOString() },
      { id: `dept_fin_${orgId}`, organizationId: orgId, name: 'Finance & Philippine Payroll', code: 'FIN', createdAt: new Date().toISOString() },
      { id: `dept_ops_${orgId}`, organizationId: orgId, name: 'Operations & Engineering', code: 'OPS', createdAt: new Date().toISOString() },
    ];

    // 3. Default Philippine Locations
    const defaultLocs: Location[] = [
      { id: `loc_hq_${orgId}`, organizationId: orgId, name: 'Manila HQ', code: 'MNL', address: 'Bonifacio Global City', city: 'Taguig City', country: 'Philippines', timezone: 'Asia/Manila' },
    ];

    // 4. Default Positions
    const defaultPositions: Position[] = [
      { id: `pos_owner_${orgId}`, organizationId: orgId, departmentId: defaultDepts[0].id, title: 'Company Owner & Executive', code: 'OWNER-EXEC', jobLevel: 'Exec', minSalary: 150000, maxSalary: 300000 },
    ];

    // 5. Default Roles with OWNER
    const tenantRoles: Role[] = [
      {
        id: `role_owner_${orgId}`,
        organizationId: orgId,
        name: 'Company Owner & Executive',
        type: 'OWNER',
        description: 'Supreme company authority, company settings governance, full RBAC and statutory payroll approval.',
        isSystem: true,
        permissions: [
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
        createdAt: new Date().toISOString(),
      },
      {
        id: `role_hr_${orgId}`,
        organizationId: orgId,
        name: 'HR Administrator',
        type: 'HR_ADMIN',
        description: 'Full administrative access across Core HR, Payroll, Leave, and Workflow settings.',
        isSystem: true,
        permissions: [
          'employee.read', 'employee.create', 'employee.update', 'employee.archive',
          'attendance.read', 'attendance.clock', 'attendance.correct', 'attendance.approve',
          'leave.read', 'leave.create', 'leave.approve', 'leave.reject', 'leave.manage_policies',
          'payroll.read', 'payroll.process', 'payroll.approve', 'payroll.finalize', 'payroll.view_all_payslips',
          'documents.read', 'documents.upload', 'documents.delete',
          'workflow.view', 'workflow.manage', 'workflow.approve',
          'tasks.manage', 'reports.view', 'reports.export',
          'admin.manage_users', 'admin.manage_roles', 'admin.view_audit',
        ],
        createdAt: new Date().toISOString(),
      },
      {
        id: `role_emp_${orgId}`,
        organizationId: orgId,
        name: 'Regular Employee',
        type: 'EMPLOYEE',
        description: 'Employee Self-Service access for personal clocking, leave requests, and confidential payslips.',
        isSystem: true,
        permissions: [
          'employee.read',
          'attendance.clock',
          'leave.create',
          'documents.read', 'documents.upload',
          'workflow.view',
        ],
        createdAt: new Date().toISOString(),
      },
    ];

    // 6. Default Philippine Leave Types
    const tenantLeaveTypes: LeaveType[] = [
      { id: `lt_vl_${orgId}`, organizationId: orgId, name: 'Vacation Leave (VL)', code: 'VL', color: '#2563EB', isPaid: true, daysPerYear: 15, requiresAttachment: false, maxConsecutiveDays: 10 },
      { id: `lt_sl_${orgId}`, organizationId: orgId, name: 'Sick Leave (SL)', code: 'SL', color: '#16A34A', isPaid: true, daysPerYear: 15, requiresAttachment: true, maxConsecutiveDays: 5 },
      { id: `lt_solo_${orgId}`, organizationId: orgId, name: 'Solo Parent Leave (RA 8972)', code: 'SOLO', color: '#D97706', isPaid: true, daysPerYear: 7, requiresAttachment: true },
      { id: `lt_mat_${orgId}`, organizationId: orgId, name: 'Maternity Leave (RA 11210)', code: 'MAT', color: '#0891B2', isPaid: true, daysPerYear: 105, requiresAttachment: true },
      { id: `lt_pat_${orgId}`, organizationId: orgId, name: 'Paternity Leave (RA 8187)', code: 'PAT', color: '#0284C7', isPaid: true, daysPerYear: 7, requiresAttachment: true },
    ];

    // 7. Initial Owner Employee Profile
    const empId = `emp_${params.ownerUid.substring(0, 8)}`;
    const ownerEmployee: Employee = {
      id: empId,
      organizationId: orgId,
      employeeNumber: 'PH-EMP-0001',
      firstName: params.ownerName.split(' ')[0] || params.ownerName,
      lastName: params.ownerName.split(' ').slice(1).join(' ') || 'Owner',
      email: params.ownerEmail,
      departmentId: defaultDepts[0].id,
      departmentName: defaultDepts[0].name,
      positionId: defaultPositions[0].id,
      positionTitle: defaultPositions[0].title,
      locationId: defaultLocs[0].id,
      locationName: defaultLocs[0].name,
      hireDate: new Date().toISOString().split('T')[0],
      statusId: 'stat_active',
      statusName: 'Active',
      employmentTypeId: 'type_reg',
      employmentTypeName: 'Regular',
      baseSalary: 150000,
      salaryRateType: 'MONTHLY',
      bankName: 'BDO Unibank',
      bankAccountNumber: '•••• •••• 1001',
      tinNumber: 'TIN-000-111-222',
      taxIdentificationNumber: 'TIN-000-111-222',
      sssNumber: 'SSS-00-1112223-4',
      philHealthNumber: 'PHIC-00-11223344-5',
      pagIbigNumber: 'HDMF-0000-1111-2222',
      address: 'Metro Manila, Philippines',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 8. Initial Owner User with OWNER authority
    const ownerUser: User = {
      id: `usr_${params.ownerUid}`,
      organizationId: orgId,
      employeeId: empId,
      email: params.ownerEmail,
      displayName: params.ownerName,
      roleId: tenantRoles[0].id,
      roleType: 'OWNER',
      roleName: 'Company Owner & Executive',
      isActive: true,
      isOwner: true,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    };

    // Set Tenant in memory
    this.organization = newOrg;
    this.departments = defaultDepts;
    this.locations = defaultLocs;
    this.positions = defaultPositions;
    this.roles = tenantRoles;
    this.leaveTypes = tenantLeaveTypes;
    this.employees = [ownerEmployee];
    this.users = [ownerUser];
    this.clockRecords = [];
    this.leaveRequests = [];
    this.leaveBalances = tenantLeaveTypes.map(lt => ({
      id: `lb_${empId}_${lt.id}`,
      organizationId: orgId,
      employeeId: empId,
      leaveTypeId: lt.id,
      leaveTypeName: lt.name,
      year: 2026,
      allocatedDays: lt.daysPerYear,
      usedDays: 0,
      pendingDays: 0,
      remainingDays: lt.daysPerYear,
    }));
    this.payrollPeriods = [];
    this.payslips = [];
    this.tasks = [];
    this.notifications = [
      {
        id: `notif_welcome_${orgId}`,
        organizationId: orgId,
        recipientUserId: ownerUser.id,
        title: `Welcome to AutoHR, ${params.ownerName}!`,
        message: `Your company ${params.companyName} has been initialized with Philippines-only configuration (₱ PHP / Asia/Manila / SSS / PhilHealth / Pag-IBIG / BIR Withholding Tax). You have full OWNER authority.`,
        channel: 'IN_APP',
        priority: 'HIGH',
        module: 'ADMIN',
        link: '/dashboard',
        isRead: false,
        status: 'SENT',
        createdAt: new Date().toISOString(),
      },
    ];

    this.currentUser = ownerUser;

    // Tamper-evident Audit entry
    this.auditEvents.unshift({
      id: `aud_${Date.now().toString(36)}`,
      organizationId: orgId,
      actorId: ownerUser.id,
      actorName: ownerUser.displayName,
      actorRole: 'Company Owner & Executive',
      action: 'COMPANY_CREATED_AND_OWNER_PROVISIONED',
      module: 'ADMIN',
      resourceType: 'Organization',
      resourceId: orgId,
      newState: { name: newOrg.name, country: 'Philippines', currency: 'PHP', owner: ownerUser.email },
      correlationId: `corr_onboarding_${orgId}`,
      timestamp: new Date().toISOString(),
    });

    this.persist();
    return { organization: newOrg, ownerUser, ownerEmployee };
  }

  // Getters
  public getCurrentUser(): User { return this.currentUser; }
  public setCurrentUser(userId: ID) {
    const u = this.users.find(user => user.id === userId);
    if (u) {
      this.currentUser = u;
      this.persist();
    }
  }

  public getOrganization(): Organization { return this.organization; }

  public updateOrganizationSettings(settings: Partial<Organization['settings']>) {
    this.organization.settings = { ...this.organization.settings, ...settings };
    this.organization.updatedAt = new Date().toISOString();
    this.logAudit('ORGANIZATION_SETTINGS_UPDATED', 'Organization', this.organization.id, {}, settings);
    this.persist();
  }

  public getUsers(): User[] { return this.users; }
  public getEmployees(): Employee[] { return this.employees; }
  public getEmployeeById(id: ID): Employee | undefined { return this.employees.find(e => e.id === id); }
  public getDepartments(): Department[] { return this.departments; }
  public getLocations(): Location[] { return this.locations; }
  public getPositions(): Position[] { return this.positions; }
  public getStatuses(): ConfigurableStatus[] { return this.statuses; }
  public getEmploymentTypes(): ConfigurableEmploymentType[] { return this.employmentTypes; }
  public getRoles(): Role[] { return this.roles; }
  public getClockRecords(): ClockRecord[] { return this.clockRecords; }
  public getCorrectionRequests(): AttendanceCorrectionRequest[] { return this.correctionRequests; }
  public getLeaveTypes(): LeaveType[] { return this.leaveTypes; }
  public getLeaveBalances(employeeId?: ID): LeaveBalance[] {
    return employeeId ? this.leaveBalances.filter(b => b.employeeId === employeeId) : this.leaveBalances;
  }
  public getLeaveRequests(): LeaveRequest[] { return this.leaveRequests; }
  public getPayrollPeriods(): PayrollPeriod[] { return this.payrollPeriods; }
  public getPayslips(employeeId?: ID): Payslip[] {
    return employeeId ? this.payslips.filter(p => p.employeeId === employeeId) : this.payslips;
  }
  public getDocuments(employeeId?: ID): DocumentItem[] {
    return employeeId ? this.documents.filter(d => !d.employeeId || d.employeeId === employeeId) : this.documents;
  }
  public getWorkflows(): WorkflowDefinition[] { return this.workflows; }
  public getTasks(userId?: ID): HumanTask[] {
    return userId ? this.tasks.filter(t => t.assignedToUserId === userId || !t.assignedToUserId) : this.tasks;
  }
  public getNotifications(userId?: ID): NotificationItem[] {
    return userId ? this.notifications.filter(n => n.recipientUserId === userId) : this.notifications;
  }
  public getIncidents(): NotificationIncident[] { return this.incidents; }
  public getAuditEvents(): AuditEvent[] { return this.auditEvents; }

  // Mutations
  public addEmployee(emp: Omit<Employee, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>): Employee {
    const id = `emp_${Date.now().toString(36)}`;
    const newEmp: Employee = {
      ...emp,
      id,
      organizationId: this.organization.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.employees.unshift(newEmp);

    // Create user account if needed
    const newUser: User = {
      id: `usr_${id}`,
      organizationId: this.organization.id,
      employeeId: id,
      email: emp.email,
      displayName: `${emp.firstName} ${emp.lastName}`,
      roleId: 'role_employee',
      roleType: 'EMPLOYEE',
      roleName: 'Regular Employee',
      isActive: true,
      avatarUrl: emp.avatarUrl,
    };
    this.users.push(newUser);

    // Initialize default leave balances
    this.leaveTypes.forEach(lt => {
      this.leaveBalances.push({
        id: `lb_${id}_${lt.id}`,
        organizationId: this.organization.id,
        employeeId: id,
        leaveTypeId: lt.id,
        leaveTypeName: lt.name,
        year: 2026,
        allocatedDays: lt.daysPerYear,
        usedDays: 0,
        pendingDays: 0,
        remainingDays: lt.daysPerYear,
      });
    });

    this.logAudit('EMPLOYEE_CREATED', 'Employee', id, {}, newEmp);
    this.persist();
    return newEmp;
  }

  public updateEmployee(id: ID, updates: Partial<Employee>): Employee | undefined {
    const index = this.employees.findIndex(e => e.id === id);
    if (index === -1) return undefined;
    const oldState = { ...this.employees[index] };
    this.employees[index] = {
      ...this.employees[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.logAudit('EMPLOYEE_UPDATED', 'Employee', id, oldState, updates);
    this.persist();
    return this.employees[index];
  }

  public clockIn(employeeId: ID): ClockRecord {
    const emp = this.getEmployeeById(employeeId);
    const today = new Date().toISOString().split('T')[0];
    const existing = this.clockRecords.find(c => c.employeeId === employeeId && c.date === today);

    if (existing) {
      existing.clockInTime = new Date().toISOString();
      existing.status = 'PRESENT';
      this.persist();
      return existing;
    }

    const newRecord: ClockRecord = {
      id: `clk_${Date.now().toString(36)}`,
      organizationId: this.organization.id,
      employeeId,
      employeeName: emp ? `${emp.firstName} ${emp.lastName}` : 'Employee',
      date: today,
      clockInTime: new Date().toISOString(),
      totalHoursWorked: 0,
      regularHours: 0,
      overtimeHours: 0,
      lateMinutes: 0,
      earlyDepartureMinutes: 0,
      status: 'PRESENT',
      isCorrected: false,
    };
    this.clockRecords.unshift(newRecord);
    this.persist();
    return newRecord;
  }

  public clockOut(employeeId: ID): ClockRecord | undefined {
    const today = new Date().toISOString().split('T')[0];
    const record = this.clockRecords.find(c => c.employeeId === employeeId && c.date === today);
    if (!record) return undefined;

    record.clockOutTime = new Date().toISOString();
    if (record.clockInTime) {
      const diffHrs = (new Date(record.clockOutTime).getTime() - new Date(record.clockInTime).getTime()) / (1000 * 60 * 60);
      record.totalHoursWorked = Math.round(diffHrs * 100) / 100;
      record.regularHours = Math.min(8, record.totalHoursWorked);
      record.overtimeHours = Math.max(0, Math.round((record.totalHoursWorked - 8) * 100) / 100);
    }
    this.persist();
    return record;
  }

  public submitLeaveRequest(req: Omit<LeaveRequest, 'id' | 'organizationId' | 'status' | 'createdAt'>): LeaveRequest {
    const id = `lvr_${Date.now().toString(36)}`;
    const newReq: LeaveRequest = {
      ...req,
      id,
      organizationId: this.organization.id,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };
    this.leaveRequests.unshift(newReq);

    // Update pending balance
    const balance = this.leaveBalances.find(b => b.employeeId === req.employeeId && b.leaveTypeId === req.leaveTypeId);
    if (balance) {
      balance.pendingDays += req.totalDays;
      balance.remainingDays = Math.max(0, balance.allocatedDays - balance.usedDays - balance.pendingDays);
    }

    // Auto-create Task for manager or HR
    const managerUser = this.users.find(u => u.roleType === 'DEPT_MANAGER' || u.roleType === 'HR_ADMIN' || u.roleType === 'OWNER') || this.users[0];
    this.tasks.unshift({
      id: `tsk_${id}`,
      organizationId: this.organization.id,
      module: 'LEAVE',
      title: `Approve Leave: ${req.employeeName} (${req.totalDays} Days ${req.leaveTypeName})`,
      description: req.reason,
      assignedToUserId: managerUser.id,
      assignedToName: managerUser.displayName,
      priority: 'HIGH',
      status: 'OPEN',
      dueDate: new Date(Date.now() + 86400000).toISOString(),
      slaHours: 24,
      isBreached: false,
      entityType: 'LeaveRequest',
      entityId: id,
      actions: ['APPROVE', 'REJECT'],
      createdAt: new Date().toISOString(),
    });

    // Notify approver
    this.notifications.unshift({
      id: `notif_${id}`,
      organizationId: this.organization.id,
      recipientUserId: managerUser.id,
      title: 'New Leave Request Received',
      message: `${req.employeeName} applied for ${req.totalDays} days of ${req.leaveTypeName}.`,
      channel: 'IN_APP',
      priority: 'HIGH',
      module: 'LEAVE',
      link: '/leave',
      isRead: false,
      status: 'SENT',
      createdAt: new Date().toISOString(),
    });

    this.logAudit('LEAVE_SUBMITTED', 'LeaveRequest', id, {}, newReq);
    this.persist();
    return newReq;
  }

  public decideLeaveRequest(id: ID, status: 'APPROVED' | 'REJECTED', approverComments?: string) {
    const req = this.leaveRequests.find(r => r.id === id);
    if (!req) return;

    req.status = status;
    req.approverId = this.currentUser.id;
    req.approverName = this.currentUser.displayName;
    req.approverComments = approverComments;
    req.decidedAt = new Date().toISOString();

    // Adjust leave balances
    const balance = this.leaveBalances.find(b => b.employeeId === req.employeeId && b.leaveTypeId === req.leaveTypeId);
    if (balance) {
      balance.pendingDays = Math.max(0, balance.pendingDays - req.totalDays);
      if (status === 'APPROVED') {
        balance.usedDays += req.totalDays;
      }
      balance.remainingDays = Math.max(0, balance.allocatedDays - balance.usedDays - balance.pendingDays);
    }

    // Complete related tasks
    const relatedTask = this.tasks.find(t => t.entityId === id);
    if (relatedTask) {
      relatedTask.status = 'COMPLETED';
      relatedTask.completedAt = new Date().toISOString();
    }

    // Notify employee
    const empUser = this.users.find(u => u.employeeId === req.employeeId);
    if (empUser) {
      this.notifications.unshift({
        id: `notif_decide_${id}`,
        organizationId: this.organization.id,
        recipientUserId: empUser.id,
        title: `Leave Request ${status === 'APPROVED' ? 'Approved' : 'Rejected'}`,
        message: `Your leave for ${req.startDate} to ${req.endDate} has been ${status.toLowerCase()} by ${this.currentUser.displayName}.`,
        channel: 'IN_APP',
        priority: status === 'APPROVED' ? 'NORMAL' : 'HIGH',
        module: 'LEAVE',
        link: '/leave',
        isRead: false,
        status: 'SENT',
        createdAt: new Date().toISOString(),
      });
    }

    this.logAudit(status === 'APPROVED' ? 'LEAVE_APPROVED' : 'LEAVE_REJECTED', 'LeaveRequest', id, {}, { status, approverComments });
    this.persist();
  }

  // =========================================================================
  // AUTOMATIC PHILIPPINE STATUTORY PAYROLL PROCESSING (v1.2 SSS/PhilHealth/HDMF/BIR)
  // =========================================================================
  public runPayroll(periodName: string, startDate: string, endDate: string, paymentDate: string): PayrollPeriod {
    const periodId = `pay_${Date.now().toString(36)}`;
    let totalGross = 0;
    let totalDeductions = 0;
    let totalNet = 0;

    const generatedPayslips: Payslip[] = this.employees.map(emp => {
      // Automatic statutory computation using Philippine Tax Engine
      const calc = calculateSemiMonthlyPayroll({
        monthlyBaseSalary: emp.baseSalary,
        nonTaxableAllowances: 2500, // Standard Rice/De Minimis allowance
        overtimeHours: 0,
      });

      totalGross += calc.grossPay;
      totalDeductions += calc.totalDeductions;
      totalNet += calc.netPay;

      return {
        id: `ps_${periodId}_${emp.id}`,
        organizationId: this.organization.id,
        payrollPeriodId: periodId,
        periodName,
        periodStartDate: startDate,
        periodEndDate: endDate,
        paymentDate,
        employeeId: emp.id,
        employeeNumber: emp.employeeNumber,
        employeeName: `${emp.firstName} ${emp.lastName}`,
        departmentName: emp.departmentName,
        positionTitle: emp.positionTitle,
        bankName: emp.bankName || 'BDO Unibank',
        bankAccountNumber: emp.bankAccountNumber || '•••• •••• 1001',
        taxIdentificationNumber: emp.tinNumber || emp.taxIdentificationNumber,
        baseSalary: calc.semiMonthlyBasic,
        daysWorked: 11,
        regularHours: 88,
        overtimeHours: 0,
        unpaidLeaveDays: 0,
        earnings: [
          { id: `e1_${emp.id}`, title: 'Semi-Monthly Basic Salary', type: 'EARNING', category: 'BASIC', amount: calc.semiMonthlyBasic },
          { id: `e2_${emp.id}`, title: 'Non-Taxable De Minimis / Rice Allowance', type: 'EARNING', category: 'ALLOWANCE', amount: 2500 },
        ],
        deductions: [
          { id: `d1_${emp.id}`, title: 'SSS Employee Share (4.5%)', type: 'DEDUCTION', category: 'TAX', amount: calc.statutory.sssEmployee },
          { id: `d2_${emp.id}`, title: 'PhilHealth Employee Share (2.5%)', type: 'DEDUCTION', category: 'HEALTH_INSURANCE', amount: calc.statutory.philHealthEmployee },
          { id: `d3_${emp.id}`, title: 'Pag-IBIG / HDMF Contribution', type: 'DEDUCTION', category: 'TAX', amount: calc.statutory.pagIbigEmployee },
          { id: `d4_${emp.id}`, title: 'BIR Withholding Tax (TRAIN Table)', type: 'DEDUCTION', category: 'TAX', amount: calc.statutory.withholdingTax },
        ],
        adjustments: [],
        grossPay: calc.grossPay,
        totalDeductions: calc.totalDeductions,
        netPay: calc.netPay,
        status: 'DRAFT',
        generatedAt: new Date().toISOString(),
      };
    });

    const newPeriod: PayrollPeriod = {
      id: periodId,
      organizationId: this.organization.id,
      name: periodName,
      startDate,
      endDate,
      paymentDate,
      status: 'CALCULATED',
      totalGrossPay: Math.round(totalGross * 100) / 100,
      totalDeductions: Math.round(totalDeductions * 100) / 100,
      totalNetPay: Math.round(totalNet * 100) / 100,
      employeeCount: this.employees.length,
      createdAt: new Date().toISOString(),
    };

    this.payrollPeriods.unshift(newPeriod);
    this.payslips.unshift(...generatedPayslips);
    this.logAudit('PAYROLL_PROCESSED_PHILIPPINES', 'PayrollPeriod', periodId, {}, newPeriod);
    this.persist();
    return newPeriod;
  }

  public finalizePayroll(periodId: ID) {
    const period = this.payrollPeriods.find(p => p.id === periodId);
    if (!period) return;

    period.status = 'FINALIZED';
    period.finalizedAt = new Date().toISOString();
    period.finalizedByUserId = this.currentUser.id;
    period.finalizedByName = this.currentUser.displayName;

    // Lock all payslips
    this.payslips.filter(ps => ps.payrollPeriodId === periodId).forEach(ps => {
      ps.status = 'PAID';
    });

    // Notify all employees
    this.employees.forEach(emp => {
      const u = this.users.find(usr => usr.employeeId === emp.id);
      if (u) {
        this.notifications.unshift({
          id: `notif_ps_${periodId}_${emp.id}`,
          organizationId: this.organization.id,
          recipientUserId: u.id,
          title: 'Official Payslip Available',
          message: `Your payslip for period "${period.name}" is now ready in Philippine Pesos (₱).`,
          channel: 'IN_APP',
          priority: 'NORMAL',
          module: 'PAYROLL',
          link: '/payroll',
          isRead: false,
          status: 'SENT',
          createdAt: new Date().toISOString(),
        });
      }
    });

    this.logAudit('PAYROLL_FINALIZED', 'PayrollPeriod', periodId, {}, { status: 'FINALIZED', finalizedBy: this.currentUser.displayName });
    this.persist();
  }

  public markNotificationAsRead(id: ID) {
    const notif = this.notifications.find(n => n.id === id);
    if (notif) {
      notif.isRead = true;
      this.persist();
    }
  }

  public markAllNotificationsAsRead(userId: ID) {
    this.notifications.filter(n => n.recipientUserId === userId).forEach(n => {
      n.isRead = true;
    });
    this.persist();
  }

  public addDocument(doc: Omit<DocumentItem, 'id' | 'organizationId' | 'uploadedByUserId' | 'uploadedByName' | 'createdAt'>): DocumentItem {
    const id = `doc_${Date.now().toString(36)}`;
    const newDoc: DocumentItem = {
      ...doc,
      id,
      organizationId: this.organization.id,
      uploadedByUserId: this.currentUser.id,
      uploadedByName: this.currentUser.displayName,
      createdAt: new Date().toISOString(),
    };
    this.documents.unshift(newDoc);
    this.logAudit('DOCUMENT_UPLOADED', 'DocumentItem', id, {}, newDoc);
    this.persist();
    return newDoc;
  }

  private logAudit(action: string, resourceType: string, resourceId: string, previousState?: any, newState?: any) {
    this.auditEvents.unshift({
      id: `aud_${Date.now().toString(36)}`,
      organizationId: this.organization.id,
      actorId: this.currentUser.id,
      actorName: this.currentUser.displayName,
      actorRole: this.currentUser.roleName,
      action,
      module: 'ADMIN',
      resourceType,
      resourceId,
      previousState,
      newState,
      correlationId: `corr_${Date.now().toString(36)}`,
      timestamp: new Date().toISOString(),
    });
  }
}

export const db = new AutoHRDataStore();
