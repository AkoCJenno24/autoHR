import React, { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { User, ClockRecord, LeaveRequest, HumanTask, Payslip } from '@/types';
import { db } from '@/lib/db';
import { formatCurrency, formatDate, formatTime } from '@/lib/utils';
import { format } from 'date-fns';
import {
  Users,
  Clock,
  CalendarCheck,
  CreditCard,
  CheckSquare,
  AlertTriangle,
  ArrowUpRight,
  FileText,
  CheckCircle2,
  XCircle,
  Play,
  Square,
  Calendar,
  Wifi,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function DashboardView() {
  const { currentUser } = useOutletContext<{ currentUser: User }>();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [clockRecord, setClockRecord] = useState<ClockRecord | undefined>();
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [tasks, setTasks] = useState<HumanTask[]>([]);
  const [recentPayslip, setRecentPayslip] = useState<Payslip | undefined>();

  const isOwner = currentUser.roleType === 'OWNER' || currentUser.isOwner === true;
  const isHR = isOwner || currentUser.roleType === 'HR_ADMIN' || currentUser.roleType === 'SUPER_ADMIN';
  const isManager = currentUser.roleType === 'DEPT_MANAGER' || isHR;

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const update = () => {
      const today = new Date().toISOString().split('T')[0];
      const rec = db.getClockRecords().find(c => c.employeeId === currentUser.employeeId && c.date === today);
      setClockRecord(rec);
      setLeaveRequests(db.getLeaveRequests());
      setTasks(db.getTasks(currentUser.id));
      const payslips = db.getPayslips(currentUser.employeeId);
      if (payslips.length > 0) setRecentPayslip(payslips[0]);
    };
    update();
    const unsub = db.subscribe(update);
    return () => unsub();
  }, [currentUser]);

  const employees = db.getEmployees();
  const balances = db.getLeaveBalances(currentUser.employeeId);
  const pendingTasks = tasks.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS');
  const org = db.getOrganization();

  const handleClockIn = () => {
    db.clockIn(currentUser.employeeId);
  };

  const handleClockOut = () => {
    db.clockOut(currentUser.employeeId);
  };

  const handleQuickApproveTask = (task: HumanTask) => {
    if (task.entityType === 'LeaveRequest') {
      db.decideLeaveRequest(task.entityId, 'APPROVED', 'Approved.');
    }
  };

  // Greeting based on time of day
  const hour = currentTime.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = currentUser.displayName.split(' ')[0];

  return (
    <div className="space-y-6">
      {/* Header Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-bold text-neutral-text-primary tracking-tight font-display">
              {greeting}, {firstName}
            </h2>
            <Badge variant="primary" size="sm">{currentUser.roleName}</Badge>
          </div>
          <p className="text-sm text-neutral-text-muted mt-0.5">
            {formatDate(currentTime.toISOString(), 'EEEE, MMMM d')}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link to="/leave">
            <Button variant="outline" size="sm">
              <Calendar className="w-4 h-4" /> Request leave
            </Button>
          </Link>
          <Link to="/tasks">
            <Button variant="primary" size="sm">
              <CheckSquare className="w-4 h-4" /> Tasks {pendingTasks.length > 0 && `(${pendingTasks.length})`}
            </Button>
          </Link>
        </div>
      </div>

      {/* Top Metrics Row */}
      {isManager ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total headcount"
            value={employees.length}
            subtitle="Active employees"
            icon={<Users className="w-5 h-5" />}
            variant="primary"
          />
          <StatCard
            title="Present today"
            value={2}
            subtitle="On-time arrivals"
            icon={<Clock className="w-5 h-5" />}
            variant="success"
          />
          <StatCard
            title="Pending approvals"
            value={pendingTasks.length}
            subtitle="Needs your review"
            icon={<AlertTriangle className="w-5 h-5" />}
            variant="warning"
          />
          <StatCard
            title="Next payroll run"
            value="Aug 20"
            subtitle="First half period"
            icon={<CreditCard className="w-5 h-5" />}
            variant="info"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Annual leave"
            value={`${balances.find(b => b.leaveTypeId === 'lt_annual')?.remainingDays || 14} days`}
            subtitle="Available to take"
            icon={<CalendarCheck className="w-5 h-5" />}
            variant="primary"
          />
          <StatCard
            title="Sick leave"
            value={`${balances.find(b => b.leaveTypeId === 'lt_sick')?.remainingDays || 9} days`}
            subtitle="Remaining this year"
            icon={<Calendar className="w-5 h-5" />}
            variant="success"
          />
          <StatCard
            title="Open tasks"
            value={pendingTasks.length}
            subtitle="Assigned to you"
            icon={<CheckSquare className="w-5 h-5" />}
            variant="warning"
          />
          <StatCard
            title="Last net pay"
            value={recentPayslip ? formatCurrency(recentPayslip.netPay) : '₱4,825.58'}
            subtitle="Paid Aug 5, 2026"
            icon={<CreditCard className="w-5 h-5" />}
            variant="info"
          />
        </div>
      )}

      {/* Main Grid: Clocking Widget & Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Punch Clock */}
        <Card className="lg:col-span-1 flex flex-col justify-between">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" /> Punch clock
              </CardTitle>
              <Badge variant={clockRecord && !clockRecord.clockOutTime ? 'success' : 'neutral'} size="sm">
                {clockRecord && !clockRecord.clockOutTime ? 'Clocked in' : 'Not in'}
              </Badge>
            </div>
            <CardDescription>Shift: 09:00 AM – 06:00 PM</CardDescription>
          </CardHeader>

          <CardContent className="pb-5">
            <div className="text-4xl font-mono font-bold text-neutral-text-primary tracking-tight text-center">
              {format(currentTime, 'hh:mm:ss a')}
            </div>
            <p className="text-xs text-neutral-text-muted mt-1 text-center">Philippine Standard Time</p>

            <div className="mt-5 flex flex-col gap-2.5">
              {!clockRecord || clockRecord.clockOutTime ? (
                <Button variant="primary" size="lg" className="w-full font-bold" onClick={handleClockIn}>
                  <Play className="w-4 h-4 fill-white" /> Clock in
                </Button>
              ) : (
                <Button variant="danger" size="lg" className="w-full font-bold" onClick={handleClockOut}>
                  <Square className="w-4 h-4 fill-white" /> Clock out
                </Button>
              )}
            </div>

            {clockRecord && clockRecord.clockInTime && (
              <div className="mt-4 p-3 bg-neutral-bg rounded-xl border border-neutral-border text-xs space-y-1.5">
                <div className="flex justify-between text-neutral-text-muted">
                  <span>Clocked in</span>
                  <span className="font-semibold text-neutral-text-primary">{formatTime(clockRecord.clockInTime)}</span>
                </div>
                {clockRecord.clockOutTime && (
                  <div className="flex justify-between text-neutral-text-muted">
                    <span>Clocked out</span>
                    <span className="font-semibold text-neutral-text-primary">{formatTime(clockRecord.clockOutTime)}</span>
                  </div>
                )}
                <div className="flex justify-between text-neutral-text-muted">
                  <span>Hours today</span>
                  <span className="font-semibold text-primary">{clockRecord.totalHoursWorked || 0} hrs</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right: Tasks */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-warning" /> Needs your attention
                </CardTitle>
                <CardDescription>Items waiting on you</CardDescription>
              </div>
              <Link to="/tasks">
                <Button variant="ghost" size="sm" className="text-xs">
                  View all <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
                </Button>
              </Link>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="divide-y divide-neutral-border/60">
              {pendingTasks.length === 0 ? (
                <div className="p-10 text-center text-sm text-neutral-text-muted">
                  <CheckCircle2 className="w-8 h-8 text-success mx-auto mb-2.5 opacity-60" />
                  Nothing here — you're all caught up.
                </div>
              ) : (
                pendingTasks.slice(0, 4).map(task => (
                  <div key={task.id} className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-neutral-bg/50 transition-colors">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <Badge variant={task.priority === 'HIGH' || task.priority === 'URGENT' ? 'danger' : 'warning'} size="sm">
                          {task.priority}
                        </Badge>
                        <h4 className="text-sm font-semibold text-neutral-text-primary">{task.title}</h4>
                      </div>
                      <p className="text-xs text-neutral-text-muted leading-relaxed line-clamp-1">{task.description}</p>
                      <span className="text-[11px] text-neutral-text-muted">
                        Due {formatDate(task.dueDate)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => handleQuickApproveTask(task)}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                      </Button>
                      <Link to="/tasks">
                        <Button variant="outline" size="sm">
                          Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row: Leave Overview & System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-primary" /> Leave requests
              </CardTitle>
              <Link to="/leave">
                <Button variant="ghost" size="sm" className="text-xs">
                  Manage <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-neutral-border/60">
              {leaveRequests.slice(0, 3).map(req => (
                <div key={req.id} className="px-5 py-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-neutral-text-primary">
                      {req.employeeName} — {req.leaveTypeName}
                    </p>
                    <p className="text-xs text-neutral-text-muted mt-0.5">
                      {formatDate(req.startDate)} to {formatDate(req.endDate)} · {req.totalDays} {req.totalDays === 1 ? 'day' : 'days'}
                    </p>
                  </div>
                  <Badge
                    variant={req.status === 'APPROVED' ? 'success' : req.status === 'REJECTED' ? 'danger' : 'warning'}
                    size="sm"
                  >
                    {req.status.toLowerCase()}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wifi className="w-4 h-4 text-success" /> System status
            </CardTitle>
            <CardDescription>Your workspace</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-3 bg-neutral-bg rounded-xl border border-neutral-border text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-neutral-text-muted">Workspace</span>
                <span className="font-semibold text-neutral-text-primary">{org.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-text-muted">Your role</span>
                <span className="font-semibold text-primary">{currentUser.roleName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-text-muted">Audit log</span>
                <span className="text-success font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-success inline-block" /> On
                </span>
              </div>
            </div>
            <p className="text-xs text-neutral-text-muted mt-3 leading-relaxed">
              SSS, PhilHealth, Pag-IBIG, and BIR TRAIN deductions are calculated automatically on each payroll run.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
