import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { db } from '@/lib/db';
import { User, LeaveRequest, LeaveBalance, LeaveType } from '@/types';
import { formatDate } from '@/lib/utils';
import {
  CalendarCheck,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  AlertCircle,
  FileText,
  UserCheck,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { ApplyLeaveModal } from './ApplyLeaveModal';

export function LeaveView() {
  const { currentUser } = useOutletContext<{ currentUser: User }>();
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');

  const isManager = currentUser.roleType === 'DEPT_MANAGER' || currentUser.roleType === 'HR_ADMIN' || currentUser.roleType === 'SUPER_ADMIN';

  const loadData = () => {
    setLeaveBalances(db.getLeaveBalances(currentUser.employeeId));
    setLeaveRequests(db.getLeaveRequests());
  };

  useEffect(() => {
    loadData();
    const unsub = db.subscribe(loadData);
    return () => unsub();
  }, [currentUser]);

  const handleApprove = (reqId: string) => {
    db.decideLeaveRequest(reqId, 'APPROVED', 'Approved by manager.');
  };

  const handleReject = (reqId: string) => {
    db.decideLeaveRequest(reqId, 'REJECTED', 'Schedule conflict during sprint milestone.');
  };

  const displayedRequests = leaveRequests.filter(r => {
    if (filter !== 'ALL' && r.status !== filter) return false;
    if (!isManager && r.employeeId !== currentUser.employeeId) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-neutral-text-primary tracking-tight">
            Leave & Time Off
          </h2>
          <p className="text-xs sm:text-sm text-neutral-text-muted mt-1">
            Apply for paid leave, view policy entitlements, and manage approval workflows.
          </p>
        </div>

        <Button variant="primary" size="md" onClick={() => setIsApplyModalOpen(true)}>
          <Plus className="w-4 h-4" /> Apply for Time Off
        </Button>
      </div>

      {/* Leave Balances Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {leaveBalances.map(bal => (
          <Card key={bal.id} className="p-5 flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold text-neutral-text-muted uppercase tracking-wider">
                {bal.leaveTypeName}
              </span>
              <div className="flex items-baseline gap-2 mt-2">
                <h4 className="text-3xl font-bold text-primary">{bal.remainingDays}</h4>
                <span className="text-xs text-neutral-text-muted">/ {bal.allocatedDays} days</span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-neutral-border/60 flex items-center justify-between text-[11px] text-neutral-text-muted">
              <span>Used: <strong>{bal.usedDays}</strong></span>
              {bal.pendingDays > 0 && <span className="text-warning font-semibold">Pending: {bal.pendingDays}</span>}
              <span>Year: 2026</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Leave Requests Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-base">Leave Applications & History</CardTitle>
              <CardDescription>
                {isManager ? 'Applications requiring review or historical team records' : 'Your submitted leave requests'}
              </CardDescription>
            </div>

            <div className="flex items-center gap-2">
              {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${
                    filter === f ? 'bg-primary text-white font-bold shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-xs text-neutral-text-muted">
                    No leave requests found for this filter.
                  </TableCell>
                </TableRow>
              ) : (
                displayedRequests.map(req => (
                  <TableRow key={req.id}>
                    <TableCell className="font-semibold text-xs text-neutral-text-primary">
                      {req.employeeName}
                    </TableCell>
                    <TableCell className="text-xs font-medium">
                      {req.leaveTypeName}
                    </TableCell>
                    <TableCell className="text-xs text-neutral-text-secondary whitespace-nowrap">
                      {formatDate(req.startDate)} – {formatDate(req.endDate)}
                    </TableCell>
                    <TableCell className="text-xs font-mono font-semibold">
                      {req.totalDays} day{req.totalDays > 1 ? 's' : ''}
                    </TableCell>
                    <TableCell className="text-xs text-neutral-text-muted max-w-xs truncate">
                      {req.reason}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={req.status === 'APPROVED' ? 'success' : req.status === 'REJECTED' ? 'danger' : 'warning'}
                        size="sm"
                      >
                        {req.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {req.status === 'PENDING' && isManager ? (
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => handleApprove(req.id)}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleReject(req.id)}
                          >
                            <XCircle className="w-3.5 h-3.5" /> Reject
                          </Button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-neutral-text-muted">
                          {req.approverName ? `Decided by ${req.approverName}` : 'Completed'}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Apply Leave Modal */}
      <ApplyLeaveModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        currentUser={currentUser}
        onSuccess={loadData}
      />
    </div>
  );
}
