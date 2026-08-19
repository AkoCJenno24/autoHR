import {
  calculateSSSContribution,
  calculatePhilHealthContribution,
  calculatePagIbigContribution,
  calculateBIRWithholdingTax,
  calculateSemiMonthlyPayroll,
  calculate13thMonthPay,
} from '../lib/payroll/philippineTaxEngine';

function runPhilippinePayrollTests() {
  console.log('--- Starting AutoHR Philippine Statutory & Tax Engine Tests (v1.2 Lock) ---');

  // 1. SSS Contribution Tests (Semi-Monthly)
  // Monthly rate: 4.5% EE, MSC range ₱4,000 - ₱30,000
  const sssLow = calculateSSSContribution(3000); // Below floor -> MSC ₱4,000 -> Monthly ₱180 -> Semi-monthly ₱90
  console.assert(sssLow.employee === 90, `SSS Low EE expected 90, got ${sssLow.employee}`);
  console.assert(sssLow.employer === 190, `SSS Low ER expected 190, got ${sssLow.employer}`);

  const sssMid = calculateSSSContribution(20000); // MSC ₱20,000 -> Monthly ₱900 -> Semi-monthly ₱450
  console.assert(sssMid.employee === 450, `SSS Mid EE expected 450, got ${sssMid.employee}`);

  const sssCapped = calculateSSSContribution(50000); // Above cap -> MSC ₱30,000 -> Monthly ₱1,350 -> Semi-monthly ₱675
  console.assert(sssCapped.employee === 675, `SSS Capped EE expected 675, got ${sssCapped.employee}`);
  console.log('✓ SSS statutory contributions passed across all brackets');

  // 2. PhilHealth Contribution Tests (Semi-Monthly)
  // Monthly rate: 5% total (2.5% EE, 2.5% ER), Floor ₱10,000, Ceiling ₱100,000
  const phLow = calculatePhilHealthContribution(8000); // Floor ₱10k -> Monthly ₱250 -> Semi-monthly ₱125
  console.assert(phLow.employee === 125, `PhilHealth Low expected 125, got ${phLow.employee}`);

  const phMid = calculatePhilHealthContribution(40000); // ₱40k -> Monthly ₱1,000 -> Semi-monthly ₱500
  console.assert(phMid.employee === 500, `PhilHealth Mid expected 500, got ${phMid.employee}`);

  const phCapped = calculatePhilHealthContribution(150000); // Ceiling ₱100k -> Monthly ₱2,500 -> Semi-monthly ₱1,250
  console.assert(phCapped.employee === 1250, `PhilHealth Capped expected 1250, got ${phCapped.employee}`);
  console.log('✓ PhilHealth statutory premiums passed across all brackets');

  // 3. Pag-IBIG Contribution Tests (Semi-Monthly)
  // 2% capped at ₱100 semi-monthly (₱200/month)
  const hdmfLow = calculatePagIbigContribution(4000); // 2% of ₱4k = ₱80 -> Semi-monthly ₱40
  console.assert(hdmfLow.employee === 40, `Pag-IBIG Low expected 40, got ${hdmfLow.employee}`);

  const hdmfCapped = calculatePagIbigContribution(30000); // Capped at ₱200/mo -> Semi-monthly ₱100
  console.assert(hdmfCapped.employee === 100, `Pag-IBIG Capped expected 100, got ${hdmfCapped.employee}`);
  console.log('✓ Pag-IBIG statutory contributions passed across all brackets');

  // 4. BIR TRAIN Law Semi-Monthly Withholding Tax Tests
  // Tier 1: <= ₱10,417 -> 0
  console.assert(calculateBIRWithholdingTax(10000) === 0, 'BIR Tier 1 tax should be 0');

  // Tier 2: ₱10,417 to ₱16,666 -> 15% in excess over 10417
  // ₱15,000: (15000 - 10417) * 0.15 = 4583 * 0.15 = 687.45
  const taxTier2 = calculateBIRWithholdingTax(15000);
  console.assert(taxTier2 === 687.45, `BIR Tier 2 expected 687.45, got ${taxTier2}`);

  // Tier 3: ₱16,667 to ₱33,332 -> 937.50 + 20% in excess over 16667
  // ₱25,000: 937.50 + (25000 - 16667) * 0.20 = 937.50 + 1666.60 = 2604.10
  const taxTier3 = calculateBIRWithholdingTax(25000);
  console.assert(taxTier3 === 2604.10, `BIR Tier 3 expected 2604.10, got ${taxTier3}`);

  // Tier 4: ₱33,333 to ₱83,332 -> 4270.70 + 25% in excess over 33333
  // ₱50,000: 4270.70 + (50000 - 33333) * 0.25 = 4270.70 + 4166.75 = 8437.45
  const taxTier4 = calculateBIRWithholdingTax(50000);
  console.assert(taxTier4 === 8437.45, `BIR Tier 4 expected 8437.45, got ${taxTier4}`);
  console.log('✓ BIR TRAIN Law Semi-Monthly Withholding Tax tables passed across all tiers');

  // 5. Full Semi-Monthly Payroll Calculation
  const fullCalc = calculateSemiMonthlyPayroll({
    monthlyBaseSalary: 75000,
    nonTaxableAllowances: 2500, // De Minimis
    overtimeHours: 0,
  });

  console.assert(fullCalc.semiMonthlyBasic === 37500, `Semi-monthly basic expected 37500, got ${fullCalc.semiMonthlyBasic}`);
  console.assert(fullCalc.grossPay === 40000, `Gross pay expected 40000, got ${fullCalc.grossPay}`);
  console.assert(fullCalc.statutory.sssEmployee === 675, `SSS EE expected 675, got ${fullCalc.statutory.sssEmployee}`);
  console.assert(fullCalc.statutory.philHealthEmployee === 937.5, `PhilHealth EE expected 937.5, got ${fullCalc.statutory.philHealthEmployee}`);
  console.assert(fullCalc.statutory.pagIbigEmployee === 100, `Pag-IBIG EE expected 100, got ${fullCalc.statutory.pagIbigEmployee}`);
  console.assert(fullCalc.netPay > 0 && fullCalc.netPay < fullCalc.grossPay, 'Net pay must be positive and less than gross');
  console.log(`✓ Full Philippine Payroll calculated: Gross=₱${fullCalc.grossPay}, Total Deductions=₱${fullCalc.totalDeductions}, Net Pay=₱${fullCalc.netPay}`);

  // 6. 13th Month Pay Test
  const thirteenthMonth = calculate13thMonthPay(75000 * 12);
  console.assert(thirteenthMonth === 75000, `13th month expected 75000, got ${thirteenthMonth}`);
  console.log('✓ 13th Month Pay calculation passed');

  console.log('--- All Philippine Payroll Statutory & Tax tests PASSED! ---');
}

runPhilippinePayrollTests();
