/**
 * AutoHR Philippine Statutory Deductions & Tax Calculation Engine
 * Compliant with AutoHR Consolidated Source of Truth v1.2
 *
 * Statutory References:
 * - SSS: Social Security System (14% contribution, 4.5% EE share, MSC cap ₱30,000)
 * - PhilHealth: Philippine Health Insurance Corp (5% premium, 2.5% EE share, ₱10k-₱100k salary range)
 * - Pag-IBIG: Home Development Mutual Fund (2% EE share, statutory monthly cap ₱200 / semi-monthly ₱100)
 * - BIR: Bureau of Internal Revenue TRAIN Law Revised Withholding Tax Table (Semi-Monthly)
 */

export interface PhilippineStatutoryDeductions {
  sssEmployee: number;
  sssEmployer: number;
  philHealthEmployee: number;
  philHealthEmployer: number;
  pagIbigEmployee: number;
  pagIbigEmployer: number;
  taxableIncome: number;
  withholdingTax: number;
  totalEmployeeDeductions: number;
  totalEmployerContributions: number;
}

export interface SemiMonthlyPayrollCalculation {
  baseSalary: number;
  semiMonthlyBasic: number;
  taxableAllowances: number;
  nonTaxableAllowances: number;
  overtimePay: number;
  grossPay: number;
  statutory: PhilippineStatutoryDeductions;
  otherDeductions: number;
  totalDeductions: number;
  netPay: number;
}

/**
 * Calculates SSS contribution for semi-monthly payroll.
 * Monthly SSS EE rate = 4.5% of MSC (Min ₱4,000; Max ₱30,000).
 */
export function calculateSSSContribution(monthlyBasicSalary: number): { employee: number; employer: number } {
  const msc = Math.min(Math.max(monthlyBasicSalary, 4000), 30000);
  const monthlyEE = Math.round(msc * 0.045 * 100) / 100;
  const monthlyER = Math.round(msc * 0.095 * 100) / 100;
  
  // Semi-monthly allocation
  return {
    employee: Math.round((monthlyEE / 2) * 100) / 100,
    employer: Math.round((monthlyER / 2) * 100) / 100,
  };
}

/**
 * Calculates PhilHealth premium contribution for semi-monthly payroll.
 * Monthly PhilHealth rate = 5% total (2.5% EE, 2.5% ER).
 * Salary Floor: ₱10,000, Salary Ceiling: ₱100,000.
 */
export function calculatePhilHealthContribution(monthlyBasicSalary: number): { employee: number; employer: number } {
  const cappedSalary = Math.min(Math.max(monthlyBasicSalary, 10000), 100000);
  const monthlyEE = Math.round(cappedSalary * 0.025 * 100) / 100;
  const monthlyER = Math.round(cappedSalary * 0.025 * 100) / 100;

  // Semi-monthly allocation
  return {
    employee: Math.round((monthlyEE / 2) * 100) / 100,
    employer: Math.round((monthlyER / 2) * 100) / 100,
  };
}

/**
 * Calculates Pag-IBIG / HDMF contribution for semi-monthly payroll.
 * Statutory standard: 2% of basic salary capped at ₱100 semi-monthly (₱200/month).
 */
export function calculatePagIbigContribution(monthlyBasicSalary: number): { employee: number; employer: number } {
  const monthlyEE = Math.min(Math.round(monthlyBasicSalary * 0.02 * 100) / 100, 200);
  const monthlyER = monthlyEE;

  return {
    employee: Math.round((monthlyEE / 2) * 100) / 100,
    employer: Math.round((monthlyER / 2) * 100) / 100,
  };
}

/**
 * Calculates BIR TRAIN Law Revised Semi-Monthly Withholding Tax.
 * Taxable income = Semi-Monthly Gross Compensation - Mandatory Statutory Deductions (SSS + PhilHealth + Pag-IBIG).
 */
export function calculateBIRWithholdingTax(semiMonthlyTaxableIncome: number): number {
  if (semiMonthlyTaxableIncome <= 10417) {
    return 0;
  }
  if (semiMonthlyTaxableIncome <= 16666) {
    // 15% in excess over ₱10,417
    return Math.round((semiMonthlyTaxableIncome - 10417) * 0.15 * 100) / 100;
  }
  if (semiMonthlyTaxableIncome <= 33332) {
    // ₱937.50 + 20% in excess over ₱16,667
    return Math.round((937.5 + (semiMonthlyTaxableIncome - 16667) * 0.20) * 100) / 100;
  }
  if (semiMonthlyTaxableIncome <= 83332) {
    // ₱4,270.70 + 25% in excess over ₱33,333
    return Math.round((4270.70 + (semiMonthlyTaxableIncome - 33333) * 0.25) * 100) / 100;
  }
  if (semiMonthlyTaxableIncome <= 333332) {
    // ₱16,770.70 + 30% in excess over ₱83,333
    return Math.round((16770.70 + (semiMonthlyTaxableIncome - 83333) * 0.30) * 100) / 100;
  }
  // ₱91,770.70 + 35% in excess over ₱333,332
  return Math.round((91770.70 + (semiMonthlyTaxableIncome - 333332) * 0.35) * 100) / 100;
}

/**
 * Calculates full semi-monthly compensation breakdown for an employee.
 */
export function calculateSemiMonthlyPayroll(params: {
  monthlyBaseSalary: number;
  taxableAllowances?: number;
  nonTaxableAllowances?: number;
  overtimeHours?: number;
  hourlyRate?: number;
  otherDeductions?: number;
}): SemiMonthlyPayrollCalculation {
  const {
    monthlyBaseSalary,
    taxableAllowances = 0,
    nonTaxableAllowances = 0,
    overtimeHours = 0,
    hourlyRate = monthlyBaseSalary / 21.75 / 8,
    otherDeductions = 0,
  } = params;

  const semiMonthlyBasic = Math.round((monthlyBaseSalary / 2) * 100) / 100;
  // Overtime rate in PH is 125% of regular hourly rate on ordinary working days
  const overtimePay = Math.round(overtimeHours * hourlyRate * 1.25 * 100) / 100;
  const grossPay = Math.round((semiMonthlyBasic + taxableAllowances + nonTaxableAllowances + overtimePay) * 100) / 100;

  // Statutory contributions
  const sss = calculateSSSContribution(monthlyBaseSalary);
  const philHealth = calculatePhilHealthContribution(monthlyBaseSalary);
  const pagIbig = calculatePagIbigContribution(monthlyBaseSalary);

  // Statutory deductions from employee gross
  const mandatoryDeductions = sss.employee + philHealth.employee + pagIbig.employee;
  const taxableIncome = Math.max(0, semiMonthlyBasic + taxableAllowances + overtimePay - mandatoryDeductions);
  const withholdingTax = calculateBIRWithholdingTax(taxableIncome);

  const totalEmployeeDeductions = Math.round((mandatoryDeductions + withholdingTax) * 100) / 100;
  const totalEmployerContributions = Math.round((sss.employer + philHealth.employer + pagIbig.employer) * 100) / 100;

  const totalDeductions = Math.round((totalEmployeeDeductions + otherDeductions) * 100) / 100;
  const netPay = Math.round((grossPay - totalDeductions) * 100) / 100;

  return {
    baseSalary: monthlyBaseSalary,
    semiMonthlyBasic,
    taxableAllowances,
    nonTaxableAllowances,
    overtimePay,
    grossPay,
    statutory: {
      sssEmployee: sss.employee,
      sssEmployer: sss.employer,
      philHealthEmployee: philHealth.employee,
      philHealthEmployer: philHealth.employer,
      pagIbigEmployee: pagIbig.employee,
      pagIbigEmployer: pagIbig.employer,
      taxableIncome,
      withholdingTax,
      totalEmployeeDeductions,
      totalEmployerContributions,
    },
    otherDeductions,
    totalDeductions,
    netPay,
  };
}

/**
 * Calculates Philippine 13th Month Pay.
 * Presidential Decree No. 851: 1/12 of the total basic salary earned by an employee within a calendar year.
 */
export function calculate13thMonthPay(totalBasicSalaryEarnedInYear: number): number {
  return Math.round((totalBasicSalaryEarnedInYear / 12) * 100) / 100;
}
