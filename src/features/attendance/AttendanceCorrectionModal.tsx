import React, { useState } from 'react';
import { db } from '@/lib/db';
import { User, AttendanceCorrectionRequest } from '@/types';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle2 } from 'lucide-react';

export function AttendanceCorrectionModal({
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
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);
  const [proposedClockIn, setProposedClockIn] = useState('09:00');
  const [proposedClockOut, setProposedClockOut] = useState('18:00');
  const [reason, setReason] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const emp = db.getEmployeeById(currentUser.employeeId);
    const org = db.getOrganization();

    const correctionId = `corr_${Date.now().toString(36)}`;
    const newCorr: AttendanceCorrectionRequest = {
      id: correctionId,
      organizationId: org.id,
      employeeId: currentUser.employeeId,
      employeeName: currentUser.displayName,
      date,
      proposedClockIn: `${date}T${proposedClockIn}:00Z`,
      proposedClockOut: `${date}T${proposedClockOut}:00Z`,
      reason,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    db.getCorrectionRequests().unshift(newCorr);

    // Auto-create task for Manager
    const managerUser = db.getUsers().find(u => u.employeeId === 'emp_marcus') || db.getUsers()[0];
    db.getTasks().unshift({
      id: `tsk_${correctionId}`,
      organizationId: org.id,
      module: 'ATTENDANCE',
      title: `Attendance Correction Review: ${currentUser.displayName} (${date})`,
      description: `Correction requested for ${date}: Proposed ${proposedClockIn} to ${proposedClockOut}. Reason: "${reason}"`,
      assignedToUserId: managerUser.id,
      assignedToName: managerUser.displayName,
      priority: 'MEDIUM',
      status: 'OPEN',
      dueDate: new Date(Date.now() + 86400000).toISOString(),
      slaHours: 24,
      isBreached: false,
      entityType: 'AttendanceCorrection',
      entityId: correctionId,
      actions: ['APPROVE', 'REJECT'],
      createdAt: new Date().toISOString(),
    });

    onSuccess();
    onClose();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Request Attendance Correction"
      description="Submit a timestamp adjustment for manager approval and audit review."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Attendance Date"
          type="date"
          required
          value={date}
          onChange={e => setDate(e.target.value)}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Actual Clock In"
            type="time"
            required
            value={proposedClockIn}
            onChange={e => setProposedClockIn(e.target.value)}
          />
          <Input
            label="Actual Clock Out"
            type="time"
            required
            value={proposedClockOut}
            onChange={e => setProposedClockOut(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-text-secondary">
            Reason for Adjustment
          </label>
          <textarea
            required
            rows={3}
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="e.g. Forgot badge at morning reception; worked standard hours."
            className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-neutral-border rounded-lg text-neutral-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-border">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Submit Correction Request
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
