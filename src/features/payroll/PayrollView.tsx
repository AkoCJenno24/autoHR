import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { db } from '@/lib/db';
import { User, PayrollPeriod, Payslip } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  CreditCard,
  Plus,
  Lock,
  FileCheck,
  Eye,
  ShieldCheck,
  Building2,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { RunPayrollModal } from './RunPayrollModal';
import { PayslipModal } from './PayslipModal';

export function PayrollView() {
  const { currentUser } = useOutletContext<{ currentUser: User }>();
  const [periods, setPeriods] = useState<PayrollPeriod[]>([]);
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [isRunModalOpen, setIsRunModalOpen] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState<Payslip | undefined>();

  const isOwner = currentUser.roleType === 'OWNER' || currentUser.isOwner === true;
  const isHR = isOwner || currentUser.roleType === 'HR_ADMIN' || currentUser.roleType === 'SUPER_ADMIN' || currentUser.roleType === 'PAYROLL_OFFICER';

  const loadData = () => {
    setPeriods(db.getPayrollPeriods());
    const slips = isHR ? db.getPayslips() : db.getPayslips(currentUser.employeeId);
    setPayslips(slips);
  };

  useEffect(() => {
    loadData();
    const unsub = db.subscribe(loadData);
    return () => unsub();
  }, [currentUser]);

  const handleFinalize = (periodId: string) => {
    if (confirm('Are you sure you want to finalize this payroll run? This will lock all payslips, dispatch employee notifications, and produce an immutable audit entry.')) {
      db.finalizePayroll(periodId);
      loadData();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-neutral-text-primary tracking-tight">
            Philippine Payroll & Statutory Compensation
          </h2>
          <p className="text-xs sm:text-sm text-neutral-text-muted mt-1">
            Automated SSS, PhilHealth, Pag-IBIG / HDMF contributions, BIR TRAIN Withholding Tax, and itemized Philippine Peso (₱) payslips.
          </p>
        </div>

        {isHR && (
          <Button variant="primary" size="md" onClick={() => setIsRunModalOpen(true)}>
            <Plus className="w-4 h-4" /> Run Payroll for Period
          </Button>
        )}
      </div>

      {/* Payroll Periods Lifecycle Card (HR View) */}
      {isHR && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Payroll Processing Runs</CardTitle>
                <CardDescription>Multi-stage verification and immutable finalization</CardDescription>
              </div>
              <Badge variant="primary" size="sm">Strict Security & RBAC Enforced</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cycle Name</TableHead>
                  <TableHead>Coverage Dates</TableHead>
                  <TableHead>Pay Date</TableHead>
                  <TableHead>Total Gross</TableHead>
                  <TableHead>Total Net</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {periods.map(period => (
                  <TableRow key={period.id}>
                    <TableCell className="font-semibold text-xs text-neutral-text-primary">
                      {period.name}
                    </TableCell>
                    <TableCell className="text-xs text-neutral-text-secondary whitespace-nowrap">
                      {formatDate(period.startDate)} – {formatDate(period.endDate)}
                    </TableCell>
                    <TableCell className="text-xs text-neutral-text-muted">
                      {formatDate(period.paymentDate)}
                    </TableCell>
                    <TableCell className="text-xs font-mono font-semibold text-neutral-text-primary">
                      {formatCurrency(period.totalGrossPay)}
                    </TableCell>
                    <TableCell className="text-xs font-mono font-bold text-primary">
                      {formatCurrency(period.totalNetPay)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={period.status === 'FINALIZED' ? 'success' : period.status === 'APPROVED' ? 'info' : 'warning'}
                        size="sm"
                      >
                        {period.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {period.status !== 'FINALIZED' ? (
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => handleFinalize(period.id)}
                        >
                          <Lock className="w-3.5 h-3.5" /> Finalize & Lock
                        </Button>
                      ) : (
                        <span className="text-xs text-success font-semibold flex items-center justify-end gap-1">
                          <FileCheck className="w-3.5 h-3.5" /> Locked & Audited
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Payslips Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {isHR ? 'All Employee Payslips' : 'Your Payslip Statements'}
          </CardTitle>
          <CardDescription>
            {isHR ? 'Official disbursement statements across all departments' : 'Confidential salary statements available for preview and download'}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Pay Date</TableHead>
                <TableHead>Gross Pay</TableHead>
                <TableHead>Deductions</TableHead>
                <TableHead>Net Pay</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payslips.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-xs text-neutral-text-muted">
                    No payslip records available yet.
                  </TableCell>
                </TableRow>
              ) : (
                payslips.map(ps => (
                  <TableRow key={ps.id}>
                    <TableCell>
                      <div>
                        <p className="text-xs font-semibold text-neutral-text-primary">{ps.employeeName}</p>
                        <p className="text-[11px] text-neutral-text-muted">{ps.departmentName}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs font-medium text-neutral-text-secondary">{ps.periodName}</TableCell>
                    <TableCell className="text-xs text-neutral-text-muted">{formatDate(ps.paymentDate)}</TableCell>
                    <TableCell className="text-xs font-mono font-medium">{formatCurrency(ps.grossPay)}</TableCell>
                    <TableCell className="text-xs font-mono text-danger">-{formatCurrency(ps.totalDeductions)}</TableCell>
                    <TableCell className="text-xs font-mono font-bold text-success">{formatCurrency(ps.netPay)}</TableCell>
                    <TableCell>
                      <Badge variant={ps.status === 'PAID' ? 'success' : 'warning'} size="sm">
                        {ps.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-primary font-medium"
                        onClick={() => setSelectedPayslip(ps)}
                      >
                        <Eye className="w-3.5 h-3.5" /> View Statement
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Run Payroll Modal */}
      <RunPayrollModal
        isOpen={isRunModalOpen}
        onClose={() => setIsRunModalOpen(false)}
        onSuccess={loadData}
      />

      {/* Payslip View Modal */}
      <PayslipModal
        isOpen={!!selectedPayslip}
        onClose={() => setSelectedPayslip(undefined)}
        payslip={selectedPayslip}
      />
    </div>
  );
}
