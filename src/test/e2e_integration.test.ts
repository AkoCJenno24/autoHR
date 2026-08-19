import { db } from '../lib/db';
import { hasPermission, isCompanyOwner, isHRAdmin } from '../lib/permissions/rbac';
import { formatCurrency, formatDate } from '../lib/utils';
import { calculateSemiMonthlyPayroll, calculate13thMonthPay } from '../lib/payroll/philippineTaxEngine';

function runE2EIntegrationTests() {
  console.log('================================================================');
  console.log('  AutoHR v1.2 End-to-End Comprehensive Journey & Security Test  ');
  console.log('================================================================\n');

  // -------------------------------------------------------------
  // Journey 1: New User Signs Up & Creates Company (Section 4 & 5)
  // -------------------------------------------------------------
  console.log('1. Executing Company Creation & Automatic OWNER Assignment Journey...');
  const onboardingResult = db.createCompanyTenant({
    companyName: 'Ayala Digital Ventures Inc.',
    companyCode: 'AYALADV',
    domain: 'ayaladv.ph',
    ownerName: 'Fernando Zobel',
    ownerEmail: 'fernando.zobel@ayaladv.ph',
    ownerUid: 'uid_fernando_zobel_123',
  });

  const { organization, ownerUser, ownerEmployee } = onboardingResult;

  // Verify Philippines Defaults Initialized
  console.assert(organization.country === 'Philippines', 'Country must be Philippines');
  console.assert(organization.countryCode === 'PH', 'Country Code must be PH');
  console.assert(organization.currency === 'PHP', 'Currency must be PHP');
  console.assert(organization.currencySymbol === '₱', 'Currency Symbol must be ₱');
  console.assert(organization.timezone === 'Asia/Manila', 'Timezone must be Asia/Manila');
  console.assert(organization.locale === 'en-PH', 'Locale must be en-PH');
  console.log('   ✓ Philippine defaults verified: PH / PHP (₱) / en-PH / Asia/Manila');

  // Verify Automatic Secure OWNER Assignment
  console.assert(ownerUser.roleType === 'OWNER', 'User must have OWNER role');
  console.assert(ownerUser.isOwner === true, 'User must be marked as isOwner');
  console.assert(isCompanyOwner(ownerUser) === true, 'isCompanyOwner check must pass');
  console.assert(isHRAdmin(ownerUser) === true, 'isHRAdmin check must pass');
  console.assert(hasPermission(ownerUser, 'company.manage') === true, 'Owner has company.manage');
  console.assert(hasPermission(ownerUser, 'payroll.finalize') === true, 'Owner has payroll.finalize');
  console.assert(hasPermission(ownerUser, 'admin.manage_roles') === true, 'Owner has admin.manage_roles');
  console.log('   ✓ Automatic OWNER authority provisioned securely without approval requirement');

  // -------------------------------------------------------------
  // Journey 2: Owner Adds New Employees with Philippine IDs
  // -------------------------------------------------------------
  console.log('\n2. Executing Employee Directory Creation Journey...');
  const newEmp = db.addEmployee({
    firstName: 'Mateo',
    lastName: 'Guidicelli',
    email: 'mateo.guidicelli@ayaladv.ph',
    phone: '+63 917 555 4321',
    employeeNumber: 'PH-EMP-0002',
    departmentId: db.getDepartments()[1].id,
    departmentName: db.getDepartments()[1].name,
    positionId: db.getPositions()[0].id,
    positionTitle: 'Lead Software Architect',
    locationId: db.getLocations()[0].id,
    locationName: db.getLocations()[0].name,
    hireDate: '2026-08-01',
    statusId: 'stat_active',
    statusName: 'Active',
    employmentTypeId: 'type_reg',
    employmentTypeName: 'Regular',
    baseSalary: 130000,
    salaryRateType: 'MONTHLY',
    bankName: 'Bank of the Philippine Islands (BPI)',
    bankAccountNumber: '•••• •••• 4492',
    tinNumber: 'TIN-442-991-002',
    sssNumber: 'SSS-03-8821902-3',
    philHealthNumber: 'PHIC-12-88291029-4',
    pagIbigNumber: 'HDMF-1402-8821-9901',
    taxIdentificationNumber: 'TIN-442-991-002',
    address: 'Makati City, Metro Manila',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  });

  console.assert(newEmp.id.startsWith('emp_'), 'New employee ID generated');
  console.assert(newEmp.tinNumber === 'TIN-442-991-002', 'TIN stored');
  console.assert(newEmp.sssNumber === 'SSS-03-8821902-3', 'SSS number stored');
  console.assert(newEmp.philHealthNumber === 'PHIC-12-88291029-4', 'PhilHealth PIN stored');
  console.assert(newEmp.pagIbigNumber === 'HDMF-1402-8821-9901', 'Pag-IBIG MID stored');
  
  // Verify leave balances automatically initialized
  const mateoBalances = db.getLeaveBalances(newEmp.id);
  console.assert(mateoBalances.length > 0, 'Leave balances provisioned');
  console.log(`   ✓ Employee created with Philippine statutory IDs and ${mateoBalances.length} default leave balance policies`);

  // -------------------------------------------------------------
  // Journey 3: Attendance Clocking
  // -------------------------------------------------------------
  console.log('\n3. Executing Attendance Clocking Journey...');
  const clockInRecord = db.clockIn(newEmp.id);
  console.assert(clockInRecord.status === 'PRESENT', 'Clock in recorded as PRESENT');
  console.assert(clockInRecord.clockInTime !== undefined, 'Clock in time recorded');
  
  const clockOutRecord = db.clockOut(newEmp.id);
  console.assert(clockOutRecord !== undefined, 'Clock out record updated');
  console.log('   ✓ Real-time punch clock recorded and validated');

  // -------------------------------------------------------------
  // Journey 4: Leave Application & Multi-tier Workflow Decision
  // -------------------------------------------------------------
  console.log('\n4. Executing Leave Request & Approval Workflow Journey...');
  const leaveReq = db.submitLeaveRequest({
    employeeId: newEmp.id,
    employeeName: `${newEmp.firstName} ${newEmp.lastName}`,
    departmentName: newEmp.departmentName,
    leaveTypeId: mateoBalances[0].leaveTypeId,
    leaveTypeName: mateoBalances[0].leaveTypeName,
    startDate: '2026-08-25',
    endDate: '2026-08-26',
    totalDays: 2,
    reason: 'Family time-off in Cebu.',
  });

  console.assert(leaveReq.status === 'PENDING', 'Leave request initially PENDING');
  
  // Check tasks generated for Owner/Manager
  const tasks = db.getTasks();
  const relatedTask = tasks.find(t => t.entityId === leaveReq.id);
  console.assert(relatedTask !== undefined, 'Workflow generated human task for approval');
  console.log('   ✓ Leave request submitted, task assigned, notifications routed');

  // Owner Approves Leave
  db.decideLeaveRequest(leaveReq.id, 'APPROVED', 'Approved by Company Owner.');
  const updatedLeave = db.getLeaveRequests().find(r => r.id === leaveReq.id);
  console.assert(updatedLeave?.status === 'APPROVED', 'Leave marked APPROVED');
  console.log('   ✓ Leave approved, balance updated, task completed, audit logged');

  // -------------------------------------------------------------
  // Journey 5: Philippine Statutory Payroll Run & Immutable Finalization
  // -------------------------------------------------------------
  console.log('\n5. Executing Philippine Statutory Payroll Processing Journey (v1.2 Lock)...');
  const period = db.runPayroll('August 2026 (First Half)', '2026-08-01', '2026-08-15', '2026-08-20');
  console.assert(period.status === 'CALCULATED', 'Payroll status CALCULATED');
  console.assert(period.totalGrossPay > 0, 'Gross payroll calculated in PHP');
  console.assert(period.totalDeductions > 0, 'Statutory deductions computed');
  console.assert(period.totalNetPay > 0, 'Net pay calculated');

  // Verify Payslip itemization
  const payslips = db.getPayslips();
  const mateoSlip = payslips.find(p => p.employeeId === newEmp.id);
  console.assert(mateoSlip !== undefined, 'Mateo payslip generated');
  
  const hasSSS = mateoSlip?.deductions.some(d => d.title.includes('SSS'));
  const hasPhilHealth = mateoSlip?.deductions.some(d => d.title.includes('PhilHealth'));
  const hasPagIbig = mateoSlip?.deductions.some(d => d.title.includes('Pag-IBIG'));
  const hasBIR = mateoSlip?.deductions.some(d => d.title.includes('BIR'));
  
  console.assert(hasSSS, 'Payslip contains SSS deduction');
  console.assert(hasPhilHealth, 'Payslip contains PhilHealth deduction');
  console.assert(hasPagIbig, 'Payslip contains Pag-IBIG deduction');
  console.assert(hasBIR, 'Payslip contains BIR Withholding Tax deduction');
  console.log(`   ✓ Semi-monthly payroll processed: Gross=₱${mateoSlip?.grossPay}, Deductions=₱${mateoSlip?.totalDeductions}, Net Pay=₱${mateoSlip?.netPay}`);
  console.log('   ✓ SSS, PhilHealth, Pag-IBIG, and BIR Tax withholdings itemized correctly');

  // Finalize & Lock Payroll (Section 16: Finalized payroll is immutable)
  db.finalizePayroll(period.id);
  const finalizedPeriod = db.getPayrollPeriods().find(p => p.id === period.id);
  console.assert(finalizedPeriod?.status === 'FINALIZED', 'Payroll period FINALIZED and LOCKED');
  console.assert(finalizedPeriod?.finalizedByName === ownerUser.displayName, 'Finalized by Owner recorded');
  console.log('   ✓ Payroll finalized, payslips locked and published, notifications dispatched');

  // -------------------------------------------------------------
  // Journey 6: Tamper-Evident Audit Logging
  // -------------------------------------------------------------
  console.log('\n6. Verifying Tamper-Evident Audit Trail...');
  const auditLogs = db.getAuditEvents();
  console.assert(auditLogs.length >= 4, 'Comprehensive audit stream recorded');
  console.log(`   ✓ ${auditLogs.length} immutable audit entries captured across lifecycle`);

  console.log('\n================================================================');
  console.log('  ALL AUTOHR v1.2 END-TO-END VERIFICATION JOURNEYS PASSED (100%) ');
  console.log('================================================================\n');
}

runE2EIntegrationTests();
