import React, { useState } from 'react';
import { db } from '@/lib/db';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CreditCard, Calculator, CheckCircle2 } from 'lucide-react';

export function RunPayrollModal({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [periodName, setPeriodName] = useState('August 2026 (Second Half)');
  const [startDate, setStartDate] = useState('2026-08-16');
  const [endDate, setEndDate] = useState('2026-08-31');
  const [paymentDate, setPaymentDate] = useState('2026-09-05');
  const [isCalculating, setIsCalculating] = useState(false);

  const employees = db.getEmployees();

  const handleRun = (e: React.FormEvent) => {
    e.preventDefault();
    setIsCalculating(true);

    setTimeout(() => {
      db.runPayroll(periodName, startDate, endDate, paymentDate);
      setIsCalculating(false);
      onSuccess();
      onClose();
    }, 600);
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Run Payroll Calculation"
      description="Calculate salary, attendance hours, tax deductions, and benefits for all active employees."
      maxWidth="md"
    >
      <form onSubmit={handleRun} className="space-y-4">
        <Input
          label="Payroll Period Name"
          required
          value={periodName}
          onChange={e => setPeriodName(e.target.value)}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Cycle Start Date"
            type="date"
            required
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
          />
          <Input
            label="Cycle End Date"
            type="date"
            required
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
          />
        </div>

        <Input
          label="Disbursement / Payment Date"
          type="date"
          required
          value={paymentDate}
          onChange={e => setPaymentDate(e.target.value)}
        />

        <div className="p-3 bg-blue-50 text-blue-900 rounded-xl border border-blue-100 text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-semibold">
            <Calculator className="w-4 h-4 text-primary" />
            <span>Calculation Scope: {employees.length} Active Employees (Philippine Peso ₱)</span>
          </div>
          <p className="text-[11px] text-blue-700">
            Automatically computes SSS, PhilHealth, Pag-IBIG / HDMF contributions, BIR TRAIN Withholding Tax, and attendance overtime hours.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-border">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isCalculating}>
            Calculate & Generate Draft Run
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
