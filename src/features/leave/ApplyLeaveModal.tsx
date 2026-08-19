import React, { useState } from 'react';
import { db } from '@/lib/db';
import { User, LeaveType, LeaveBalance } from '@/types';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { differenceInBusinessDays, parseISO, isValid } from 'date-fns';
import { CalendarCheck, AlertCircle, Info } from 'lucide-react';

export function ApplyLeaveModal({
  isOpen,
  onClose,
  currentUser,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onSuccess: () => void;
}) {
  const leaveTypes = db.getLeaveTypes();
  const balances = db.getLeaveBalances(currentUser.employeeId);
  const employee = db.getEmployeeById(currentUser.employeeId);

  const [leaveTypeId, setLeaveTypeId] = useState(leaveTypes[0]?.id || '');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  const calculateDays = () => {
    try {
      const s = parseISO(startDate);
      const e = parseISO(endDate);
      if (isValid(s) && isValid(e) && e >= s) {
        return Math.max(1, differenceInBusinessDays(e, s) + 1);
      }
      return 1;
    } catch {
      return 1;
    }
  };

  const totalDays = calculateDays();
  const selectedBalance = balances.find(b => b.leaveTypeId === leaveTypeId);
  const selectedType = leaveTypes.find(t => t.id === leaveTypeId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (selectedBalance && totalDays > selectedBalance.remainingDays) {
      setError(`Insufficient leave balance. You have ${selectedBalance.remainingDays} days remaining, but requested ${totalDays} days.`);
      return;
    }

    db.submitLeaveRequest({
      employeeId: currentUser.employeeId,
      employeeName: currentUser.displayName,
      departmentName: employee?.departmentName || 'Engineering',
      leaveTypeId,
      leaveTypeName: selectedType ? selectedType.name : 'Annual Leave',
      startDate,
      endDate,
      totalDays,
      reason,
      approverId: 'usr_marcus',
      approverName: 'Marcus Chen',
    });

    onSuccess();
    onClose();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Apply for Time Off"
      description="Submit a leave application for policy validation and manager approval."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Leave Category"
          value={leaveTypeId}
          onChange={e => setLeaveTypeId(e.target.value)}
          options={leaveTypes.map(t => {
            const bal = balances.find(b => b.leaveTypeId === t.id);
            return {
              value: t.id,
              label: `${t.name} (${bal ? bal.remainingDays : t.daysPerYear} days available)`,
            };
          })}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Start Date"
            type="date"
            required
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
          />
          <Input
            label="End Date"
            type="date"
            required
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
          />
        </div>

        <div className="p-3 bg-slate-50 rounded-xl border border-neutral-border flex items-center justify-between text-xs">
          <span className="text-neutral-text-muted">Calculated Business Days:</span>
          <span className="font-bold text-sm text-primary">{totalDays} Work Day(s)</span>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-text-secondary">
            Reason for Leave
          </label>
          <textarea
            required
            rows={3}
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="Provide context for your manager..."
            className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-neutral-border rounded-lg text-neutral-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {error && (
          <div className="p-3 bg-danger-soft text-danger rounded-lg text-xs font-medium border border-rose-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-border">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Submit Application
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
