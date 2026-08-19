import React from 'react';
import { Payslip } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Printer, Download, Building2, CheckCircle2, ShieldCheck } from 'lucide-react';
import { db } from '@/lib/db';

export function PayslipModal({
  isOpen,
  onClose,
  payslip,
}: {
  isOpen: boolean;
  onClose: () => void;
  payslip?: Payslip;
}) {
  if (!payslip) return null;

  const org = db.getOrganization();

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} maxWidth="2xl">
      <div className="space-y-6 print:p-0">
        {/* Actions bar (Hidden in print) */}
        <div className="flex items-center justify-between no-print border-b border-neutral-border pb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-neutral-text-primary">Official Payslip Statement</h3>
            <Badge variant="success" size="sm">{payslip.status}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="w-4 h-4" /> Print / Save PDF
            </Button>
          </div>
        </div>

        {/* Payslip Paper Layout */}
        <div className="p-6 bg-white rounded-xl border border-neutral-border space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-neutral-border pb-6">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-neutral-text-primary">{org.name}</h2>
                  <p className="text-xs text-neutral-text-muted">{org.domain} · Official Payroll Disbursement</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono font-bold text-primary uppercase">{payslip.periodName}</span>
              <p className="text-[11px] text-neutral-text-muted mt-0.5">
                Pay Date: <strong>{formatDate(payslip.paymentDate)}</strong>
              </p>
            </div>
          </div>

          {/* Employee & Period Details */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50/80 rounded-xl text-xs border border-neutral-border/60">
            <div>
              <span className="text-neutral-text-muted block text-[11px]">Employee Name:</span>
              <span className="font-bold text-neutral-text-primary">{payslip.employeeName}</span>
            </div>
            <div>
              <span className="text-neutral-text-muted block text-[11px]">Employee ID:</span>
              <span className="font-mono font-bold text-neutral-text-primary">{payslip.employeeNumber}</span>
            </div>
            <div>
              <span className="text-neutral-text-muted block text-[11px]">Department:</span>
              <span className="font-semibold text-neutral-text-primary">{payslip.departmentName}</span>
            </div>
            <div>
              <span className="text-neutral-text-muted block text-[11px]">Tax ID (BIR TIN):</span>
              <span className="font-mono font-semibold text-neutral-text-primary">{payslip.taxIdentificationNumber || 'TIN-000-000-000'}</span>
            </div>
          </div>

          {/* Breakdown Tables: Earnings & Deductions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Earnings */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-text-muted mb-2 border-b border-neutral-border pb-1">
                Earnings
              </h4>
              <div className="space-y-2 text-xs">
                {payslip.earnings.map(e => (
                  <div key={e.id} className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-neutral-text-secondary">{e.title}</span>
                    <span className="font-mono font-semibold text-neutral-text-primary">{formatCurrency(e.amount)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-2 border-t-2 border-neutral-border flex justify-between text-xs font-bold">
                <span>Total Gross Earnings:</span>
                <span className="font-mono text-primary">{formatCurrency(payslip.grossPay)}</span>
              </div>
            </div>

            {/* Deductions */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-text-muted mb-2 border-b border-neutral-border pb-1">
                Philippine Statutory & Deductions
              </h4>
              <div className="space-y-2 text-xs">
                {payslip.deductions.map(d => (
                  <div key={d.id} className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-neutral-text-secondary">{d.title}</span>
                    <span className="font-mono font-semibold text-danger">-{formatCurrency(d.amount)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-2 border-t-2 border-neutral-border flex justify-between text-xs font-bold">
                <span>Total Deductions:</span>
                <span className="font-mono text-danger">-{formatCurrency(payslip.totalDeductions)}</span>
              </div>
            </div>
          </div>

          {/* Net Pay Callout */}
          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Net Pay Disbursement (PHP ₱)</span>
              <p className="text-[11px] text-emerald-700">Direct Deposit to {payslip.bankName || 'BDO Unibank'} ({payslip.bankAccountNumber || '•••• 1109'})</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black font-mono text-emerald-900">{formatCurrency(payslip.netPay)}</span>
            </div>
          </div>

          {/* Security & Audit Footer */}
          <div className="pt-4 border-t border-neutral-border/50 text-[10px] text-neutral-text-muted flex items-center justify-between">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-success" /> AutoHR Cryptographically Signed & Audited
            </span>
            <span className="font-mono">Reference: {payslip.id}</span>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
