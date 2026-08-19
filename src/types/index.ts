// ==========================================
// AutoHR Master TypeScript Types & Interfaces
// Compliant with Master Specification v1.0
// ==========================================

export type ID = string;

// ------------------------------------------
// 0. SaaS Multi-Tenant Registry Types
// ------------------------------------------

/** Slug lookup document stored at /slugs/{slug} in Firestore */
export interface OrgSlug {
  orgId: string;
  orgName: string;
  slug: string;
}

/** Auth state describing a user's org membership */
export interface OrgMembership {
  orgId: string;
  orgSlug: string;
  orgName: string;
}

/** Status of an employee's platform invite */
export type EmployeeInviteStatus = 'NOT_INVITED' | 'INVITED' | 'ACCEPTED';

// ------------------------------------------
// 1. Multi-Tenancy & Organization
// ------------------------------------------

export interface Organization {
  id: ID;
  name: string;
  slug?: string; // URL slug e.g. "ayala-tech" — used for /login/:slug
  code: string;
  domain: string;
  logoUrl?: string;
  address?: string;
  country: string; // "Philippines"
  countryCode: string; // "PH"
  timezone: string; // "Asia/Manila"
  currency: string; // "PHP"
  currencySymbol: string; // "₱"
  locale: string; // "en-PH"
  fiscalYearStartMonth: number; // 1-12
  settings: {
    workDaysPerWeek: number;
    standardHoursPerDay: number;
    allowSelfClockIn: boolean;
    requireGeofence: boolean;
    requireBiometrics: boolean;
    enforcePhilippineStatutory?: boolean;
    profileFieldPolicies?: Partial<Record<ProfileFieldKey, FieldEditPolicy>>;
  };
  createdAt: string;
  updatedAt: string;
}

export interface BusinessUnit {
  id: ID;
  organizationId: ID;
  name: string;
  code: string;
  headEmployeeId?: ID;
}

export interface Department {
  id: ID;
  organizationId: ID;
  businessUnitId?: ID;
  name: string;
  code: string;
  managerEmployeeId?: ID;
  parentDepartmentId?: ID;
  createdAt: string;
}

export interface Location {
  id: ID;
  organizationId: ID;
  name: string;
  code: string;
  address: string;
  city: string;
  country: string; // "Philippines"
  timezone: string; // "Asia/Manila"
  geofenceRadiusMeters?: number;
  latitude?: number;
  longitude?: number;
}

export interface Position {
  id: ID;
  organizationId: ID;
  departmentId: ID;
  title: string;
  code: string;
  jobLevel: string; // e.g. "L1", "L2", "L3", "Exec"
  description?: string;
  minSalary?: number;
  maxSalary?: number;
}

// ------------------------------------------
// 2. Roles, Permissions & RBAC
// ------------------------------------------

export type Permission =
  | 'company.manage'
  | 'employee.read'
  | 'employee.create'
  | 'employee.update'
  | 'employee.archive'
  | 'attendance.read'
  | 'attendance.clock'
  | 'attendance.correct'
  | 'attendance.approve'
  | 'leave.read'
  | 'leave.create'
  | 'leave.approve'
  | 'leave.reject'
  | 'leave.manage_policies'
  | 'payroll.read'
  | 'payroll.process'
  | 'payroll.approve'
  | 'payroll.finalize'
  | 'payroll.view_all_payslips'
  | 'documents.read'
  | 'documents.upload'
  | 'documents.delete'
  | 'workflow.view'
  | 'workflow.manage'
  | 'workflow.approve'
  | 'tasks.manage'
  | 'reports.view'
  | 'reports.export'
  | 'admin.manage_users'
  | 'admin.manage_roles'
  | 'admin.manage_settings'
  | 'admin.view_audit';

export type AppModule =
  | 'dashboard'
  | 'profile'
  | 'tasks'
  | 'attendance'
  | 'leave'
  | 'payroll'
  | 'documents'
  | 'employees'
  | 'organization'
  | 'workflows'
  | 'reports'
  | 'notifications'
  | 'admin';

export interface ModuleInfo {
  id: AppModule;
  name: string;
  description: string;
  path: string;
  category: 'core' | 'workplace' | 'management' | 'system';
}

// ------------------------------------------
// Profile Field Editing Policies & Approval Routing
// ------------------------------------------

export type FieldEditPolicy = 'READ_ONLY' | 'DIRECT_EDIT' | 'APPROVAL_REQUIRED';

export type ProfileFieldKey =
  | 'phone'
  | 'personalEmail'
  | 'address'
  | 'emergencyContactName'
  | 'emergencyContactPhone'
  | 'emergencyContactRelationship'
  | 'maritalStatus'
  | 'tinNumber'
  | 'sssNumber'
  | 'philHealthNumber'
  | 'pagIbigNumber'
  | 'bankName'
  | 'bankAccountNumber'
  | 'bankAccountName'
  | 'avatarUrl';

export type ProfileFieldPolicyConfig = Record<ProfileFieldKey, FieldEditPolicy>;

export interface ProfileChangeItem {
  field: ProfileFieldKey;
  label: string;
  previousValue: any;
  requestedValue: any;
}

export interface ProfileChangeRequest {
  id: ID;
  organizationId: ID;
  employeeId: ID;
  employeeName: string;
  requestedByUserId: ID;
  requestedByName: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  changes: ProfileChangeItem[];
  reason?: string;
  reviewedByUserId?: ID;
  reviewedByName?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export type SystemRoleType = 'OWNER' | 'SUPER_ADMIN' | 'HR_ADMIN' | 'DEPT_MANAGER' | 'EMPLOYEE' | 'PAYROLL_OFFICER';

export interface Role {
  id: ID;
  organizationId: ID;
  name: string;
  type: SystemRoleType | 'CUSTOM';
  description: string;
  isSystem: boolean;
  permissions: Permission[];
  allowedModules?: AppModule[];
  createdAt: string;
}

export interface User {
  id: ID;
  organizationId: ID;
  employeeId: ID;
  email: string;
  displayName: string;
  roleId: ID;
  roleType: SystemRoleType | 'CUSTOM';
  roleName: string;
  isActive: boolean;
  isOwner?: boolean;
  avatarUrl?: string;
  lastLoginAt?: string;
  allowedModules?: AppModule[];
}

// ------------------------------------------
// 3. Employee & Employment Records
// ------------------------------------------

export interface ConfigurableStatus {
  id: ID;
  organizationId: ID;
  name: string; // e.g. "Active", "Probationary", "On Leave", "Suspended", "Terminated", "Resigned"
  color: 'success' | 'warning' | 'danger' | 'info' | 'secondary';
  isDefault: boolean;
  allowsPayroll: boolean;
  allowsAttendance: boolean;
}

export interface ConfigurableEmploymentType {
  id: ID;
  organizationId: ID;
  name: string; // e.g. "Regular", "Probationary", "Contractual", "Intern", "Part-time"
  standardWeeklyHours: number;
}

export interface EmployeeHistoryItem {
  id: ID;
  employeeId: ID;
  organizationId: ID;
  effectiveDate: string;
  fieldChanged: string;
  oldValue: string;
  newValue: string;
  changedByUserId: ID;
  changedByName: string;
  reason?: string;
  createdAt: string;
}

export interface Employee {
  id: ID;
  organizationId: ID;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  personalEmail?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other' | 'undisclosed';
  maritalStatus?: 'single' | 'married' | 'widowed' | 'separated' | 'other';
  nationalId?: string; // Philippine National ID (PhilSys)
  address?: string;
  avatarUrl?: string;

  // Emergency Contact
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;

  // Philippine Statutory Numbers
  tinNumber?: string; // BIR Taxpayer Identification Number
  sssNumber?: string; // Social Security System Number
  philHealthNumber?: string; // PhilHealth Identification Number (PIN)
  pagIbigNumber?: string; // Pag-IBIG / HDMF MID

  // Employment Details
  departmentId: ID;
  departmentName: string;
  positionId: ID;
  positionTitle: string;
  locationId: ID;
  locationName: string;
  managerId?: ID;
  managerName?: string;

  hireDate: string;
  probationEndDate?: string;
  statusId: ID;
  statusName: string;
  employmentTypeId: ID;
  employmentTypeName: string;

  // Compensation / Payroll summary (in Philippine Peso ₱)
  baseSalary: number;
  salaryRateType: 'MONTHLY' | 'HOURLY' | 'BI_WEEKLY';
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountName?: string;
  taxIdentificationNumber?: string; // Alias for tinNumber

  // Field-level policy overrides specific to this employee
  fieldPolicyOverrides?: Partial<Record<ProfileFieldKey, FieldEditPolicy>>;

  createdAt: string;
  updatedAt: string;
}

// ------------------------------------------
// 4. Attendance & Time Tracking
// ------------------------------------------

export interface Shift {
  id: ID;
  organizationId: ID;
  name: string;
  code: string;
  startTime: string; // "09:00"
  endTime: string;   // "18:00"
  breakDurationMinutes: number;
  gracePeriodMinutes: number;
  isNightShift: boolean;
}

export type ClockEventType = 'CLOCK_IN' | 'CLOCK_OUT' | 'BREAK_START' | 'BREAK_END';

export interface ClockRecord {
  id: ID;
  organizationId: ID;
  employeeId: ID;
  employeeName: string;
  date: string; // "YYYY-MM-DD"
  shiftId?: ID;
  clockInTime?: string; // ISO String
  clockOutTime?: string; // ISO String
  totalHoursWorked: number;
  regularHours: number;
  overtimeHours: number;
  lateMinutes: number;
  earlyDepartureMinutes: number;
  status: 'PRESENT' | 'LATE' | 'HALF_DAY' | 'ABSENT' | 'ON_LEAVE' | 'REST_DAY';
  isCorrected: boolean;
  notes?: string;
}

export interface AttendanceCorrectionRequest {
  id: ID;
  organizationId: ID;
  employeeId: ID;
  employeeName: string;
  attendanceRecordId?: ID;
  date: string;
  proposedClockIn: string;
  proposedClockOut: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  workflowInstanceId?: ID;
  reviewerId?: ID;
  reviewerName?: string;
  reviewNotes?: string;
  createdAt: string;
  reviewedAt?: string;
}

// ------------------------------------------
// 5. Leave Management
// ------------------------------------------

export interface LeaveType {
  id: ID;
  organizationId: ID;
  name: string; // e.g. "Annual Leave", "Sick Leave", "Parental Leave"
  code: string;
  color: string;
  isPaid: boolean;
  daysPerYear: number;
  requiresAttachment: boolean;
  maxConsecutiveDays?: number;
}

export interface LeaveBalance {
  id: ID;
  organizationId: ID;
  employeeId: ID;
  leaveTypeId: ID;
  leaveTypeName: string;
  year: number;
  allocatedDays: number;
  usedDays: number;
  pendingDays: number;
  remainingDays: number;
}

export interface LeaveRequest {
  id: ID;
  organizationId: ID;
  employeeId: ID;
  employeeName: string;
  departmentName: string;
  leaveTypeId: ID;
  leaveTypeName: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  attachmentUrl?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  workflowInstanceId?: ID;
  approverId?: ID;
  approverName?: string;
  approverComments?: string;
  createdAt: string;
  decidedAt?: string;
}

// ------------------------------------------
// 6. Payroll Engine
// ------------------------------------------

export interface PayrollPeriod {
  id: ID;
  organizationId: ID;
  name: string; // e.g. "August 2026 - First Half"
  startDate: string;
  endDate: string;
  paymentDate: string;
  status: 'DRAFT' | 'CALCULATING' | 'CALCULATED' | 'UNDER_REVIEW' | 'APPROVED' | 'FINALIZED';
  totalGrossPay: number;
  totalDeductions: number;
  totalNetPay: number;
  employeeCount: number;
  finalizedAt?: string;
  finalizedByUserId?: ID;
  finalizedByName?: string;
  createdAt: string;
}

export interface PayrollItem {
  id: ID;
  title: string;
  type: 'EARNING' | 'DEDUCTION' | 'ADJUSTMENT';
  category: 'BASIC' | 'OVERTIME' | 'ALLOWANCE' | 'BONUS' | 'TAX' | 'PENSION' | 'HEALTH_INSURANCE' | 'UNPAID_LEAVE' | 'OTHER';
  amount: number;
  description?: string;
}

export interface Payslip {
  id: ID;
  organizationId: ID;
  payrollPeriodId: ID;
  periodName: string;
  periodStartDate: string;
  periodEndDate: string;
  paymentDate: string;
  employeeId: ID;
  employeeNumber: string;
  employeeName: string;
  departmentName: string;
  positionTitle: string;
  bankName?: string;
  bankAccountNumber?: string;
  taxIdentificationNumber?: string;

  // Breakdown
  baseSalary: number;
  daysWorked: number;
  regularHours: number;
  overtimeHours: number;
  unpaidLeaveDays: number;

  earnings: PayrollItem[];
  deductions: PayrollItem[];
  adjustments: PayrollItem[];

  grossPay: number;
  totalDeductions: number;
  netPay: number;

  status: 'DRAFT' | 'APPROVED' | 'PAID';
  generatedAt: string;
}

// ------------------------------------------
// 7. Documents
// ------------------------------------------

export interface DocumentItem {
  id: ID;
  organizationId: ID;
  employeeId?: ID;
  employeeName?: string;
  title: string;
  category: 'CONTRACT' | 'IDENTIFICATION' | 'CERTIFICATION' | 'POLICY' | 'TAX_FORM' | 'PAYSLIP' | 'OTHER';
  fileName: string;
  fileSizeBytes: number;
  fileUrl: string;
  mimeType: string;
  expiresAt?: string;
  isRestricted: boolean;
  uploadedByUserId: ID;
  uploadedByName: string;
  createdAt: string;
}

// ------------------------------------------
// 8. Workflow, Tasks & SLA Engine
// ------------------------------------------

export type StepApproverType = 'DIRECT_MANAGER' | 'DEPARTMENT_HEAD' | 'ROLE' | 'SPECIFIC_USER' | 'HR_ADMIN';

export interface WorkflowStepDefinition {
  stepNumber: number;
  title: string;
  approverType: StepApproverType;
  requiredRoleId?: ID;
  requiredUserId?: ID;
  slaHours: number;
  canReject: boolean;
}

export interface WorkflowDefinition {
  id: ID;
  organizationId: ID;
  name: string; // e.g. "Standard Leave Approval", "Overtime Approval", "Payroll Finalization"
  code: string;
  module: 'LEAVE' | 'ATTENDANCE' | 'PAYROLL' | 'EMPLOYEE_CHANGE';
  isActive: boolean;
  version: number;
  steps: WorkflowStepDefinition[];
  createdAt: string;
}

export type WorkflowInstanceStatus = 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED' | 'CANCELLED';

export interface WorkflowInstance {
  id: ID;
  organizationId: ID;
  workflowDefinitionId: ID;
  workflowName: string;
  module: 'LEAVE' | 'ATTENDANCE' | 'PAYROLL' | 'EMPLOYEE_CHANGE';
  entityId: ID; // e.g. leaveRequestId
  initiatorEmployeeId: ID;
  initiatorName: string;
  currentStepNumber: number;
  totalSteps: number;
  status: WorkflowInstanceStatus;
  stepHistories: {
    stepNumber: number;
    stepTitle: string;
    approverName?: string;
    action: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SKIPPED';
    comments?: string;
    timestamp?: string;
  }[];
  startedAt: string;
  completedAt?: string;
}

export type TaskStatus = 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'BLOCKED' | 'COMPLETED' | 'CANCELLED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface HumanTask {
  id: ID;
  organizationId: ID;
  workflowInstanceId?: ID;
  module: 'LEAVE' | 'ATTENDANCE' | 'PAYROLL' | 'PROFILE' | 'GENERAL' | 'INCIDENT';
  title: string;
  description: string;
  assignedToUserId?: ID;
  assignedToRoleId?: ID;
  assignedToName?: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  slaHours: number;
  isBreached: boolean;
  entityType: string;
  entityId: string;
  actions: Array<'APPROVE' | 'REJECT' | 'COMPLETE' | 'REASSIGN'>;
  createdAt: string;
  completedAt?: string;
}

// ------------------------------------------
// 9. Notification Engine & Incident Management
// ------------------------------------------

export type NotificationChannel = 'IN_APP' | 'EMAIL' | 'SMS' | 'PUSH';
export type NotificationPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';

export interface NotificationItem {
  id: ID;
  organizationId: ID;
  recipientUserId: ID;
  recipientEmail?: string;
  title: string;
  message: string;
  channel: NotificationChannel;
  priority: NotificationPriority;
  module: string;
  link?: string;
  isRead: boolean;
  status: 'QUEUED' | 'SENT' | 'FAILED' | 'RETRYING';
  errorDetails?: string;
  createdAt: string;
  sentAt?: string;
}

export type IncidentSeverity = 'SEV-1 Critical' | 'SEV-2 High' | 'SEV-3 Medium' | 'SEV-4 Low';

export interface NotificationIncident {
  id: ID;
  organizationId: ID;
  title: string;
  severity: IncidentSeverity;
  status: 'DETECTED' | 'INVESTIGATING' | 'MITIGATING' | 'MONITORING' | 'RESOLVED';
  affectedChannel: NotificationChannel;
  failedCount: number;
  rootCause?: string;
  correctiveActions?: string;
  detectedAt: string;
  resolvedAt?: string;
}

// ------------------------------------------
// 10. Audit Logging (Tamper-evident)
// ------------------------------------------

export interface AuditEvent {
  id: ID;
  organizationId: ID;
  actorId: ID;
  actorName: string;
  actorRole: string;
  action: string; // e.g. "EMPLOYEE_CREATED", "LEAVE_APPROVED", "PAYROLL_FINALIZED"
  module: 'EMPLOYEES' | 'ATTENDANCE' | 'LEAVE' | 'PAYROLL' | 'DOCUMENTS' | 'ADMIN' | 'WORKFLOW' | 'AUTH';
  resourceType: string;
  resourceId: string;
  previousState?: Record<string, any>;
  newState?: Record<string, any>;
  correlationId: string;
  ipAddress?: string;
  timestamp: string;
}

// ------------------------------------------
// 11. Reporting & Metrics
// ------------------------------------------

export interface DashboardMetrics {
  totalEmployees: number;
  activeEmployees: number;
  onLeaveToday: number;
  presentToday: number;
  lateToday: number;
  pendingLeaveRequests: number;
  pendingAttendanceCorrections: number;
  openTasksCount: number;
  unreadNotificationsCount: number;
  currentPeriodGrossPayroll: number;
}
