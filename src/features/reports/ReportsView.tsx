import React from 'react';
import { db } from '@/lib/db';
import { formatCurrency, exportToCsv } from '@/lib/utils';
import {
  BarChart3,
  TrendingUp,
  Download,
  Users,
  CalendarCheck,
  CreditCard,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

export function ReportsView() {
  const employees = db.getEmployees();
  const departments = db.getDepartments();
  const leaveRequests = db.getLeaveRequests();
  const payrollPeriods = db.getPayrollPeriods();

  const totalPayrollGross = payrollPeriods.reduce((sum, p) => sum + p.totalGrossPay, 0);

  const handleExportHeadcount = () => {
    const rows = employees.map(e => ({
      EmployeeID: e.employeeNumber,
      Name: `${e.firstName} ${e.lastName}`,
      Department: e.departmentName,
      Position: e.positionTitle,
      Status: e.statusName,
      Type: e.employmentTypeName,
      HireDate: e.hireDate,
      Salary: e.baseSalary,
    }));
    exportToCsv(`headcount_report_${new Date().toISOString().split('T')[0]}`, rows);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-neutral-text-primary tracking-tight">
            Workforce Reports & Analytics
          </h2>
          <p className="text-xs sm:text-sm text-neutral-text-muted mt-1">
            Operational dashboards, headcount analytics, leave utilization, and compensation distributions.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={handleExportHeadcount}>
          <Download className="w-4 h-4" /> Export Headcount CSV
        </Button>
      </div>

      {/* High-level Enterprise Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Workforce"
          value={employees.length}
          subtitle="Across 4 Departments"
          icon={<Users className="w-5 h-5" />}
          variant="primary"
        />
        <StatCard
          title="Attendance Rate"
          value="98.5%"
          subtitle="Current calendar month"
          icon={<Clock className="w-5 h-5" />}
          variant="success"
        />
        <StatCard
          title="Leave Approvals"
          value={`${leaveRequests.filter(l => l.status === 'APPROVED').length} Approved`}
          subtitle="Avg turnaround: 4.2 hrs"
          icon={<CalendarCheck className="w-5 h-5" />}
          variant="info"
        />
        <StatCard
          title="YTD Gross Payroll"
          value={formatCurrency(totalPayrollGross)}
          subtitle="Audited distributions"
          icon={<CreditCard className="w-5 h-5" />}
          variant="primary"
        />
      </div>

      {/* Department Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Headcount by Department</CardTitle>
            <CardDescription>Workforce density across active business units</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Department</TableHead>
                  <TableHead>Headcount</TableHead>
                  <TableHead>Share (%)</TableHead>
                  <TableHead>Avg Base Salary</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {departments.map(dept => {
                  const deptEmps = employees.filter(e => e.departmentId === dept.id);
                  const count = deptEmps.length;
                  const share = Math.round((count / Math.max(1, employees.length)) * 100);
                  const avgSalary =
                    count > 0
                      ? Math.round(deptEmps.reduce((s, e) => s + e.baseSalary, 0) / count)
                      : 0;

                  return (
                    <TableRow key={dept.id}>
                      <TableCell className="font-semibold text-xs text-neutral-text-primary">
                        {dept.name}
                      </TableCell>
                      <TableCell className="text-xs font-mono">{count}</TableCell>
                      <TableCell className="text-xs font-mono text-primary font-semibold">{share}%</TableCell>
                      <TableCell className="text-xs font-mono text-neutral-text-secondary">
                        {avgSalary > 0 ? formatCurrency(avgSalary) : '—'}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* SLA & Approval Compliance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">SLA & Operational Performance</CardTitle>
            <CardDescription>Turnaround efficiency on leave requests and task approvals</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-neutral-border space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-neutral-text-muted">Target SLA Compliance:</span>
                <span className="font-bold text-success">99.2%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-text-muted">Average Manager Resolution Time:</span>
                <span className="font-bold text-neutral-text-primary">3.8 Hours</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-text-muted">Breached Approvals (Past 30 Days):</span>
                <span className="font-mono font-bold text-success">0</span>
              </div>
            </div>

            <div className="p-4 bg-emerald-50 text-emerald-900 rounded-xl border border-emerald-200 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
              <span>All platform engines are operating within designated organizational SLAs.</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
