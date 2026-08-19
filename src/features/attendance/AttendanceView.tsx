import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { db } from '@/lib/db';
import { User, ClockRecord } from '@/types';
import { formatDate, formatTime, exportToCsv } from '@/lib/utils';
import {
  Clock,
  Calendar,
  Play,
  Square,
  FileEdit,
  Download,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { AttendanceCorrectionModal } from './AttendanceCorrectionModal';

export function AttendanceView() {
  const { currentUser } = useOutletContext<{ currentUser: User }>();
  const [clockRecords, setClockRecords] = useState<ClockRecord[]>([]);
  const [todayRecord, setTodayRecord] = useState<ClockRecord | undefined>();
  const [isCorrectionModalOpen, setIsCorrectionModalOpen] = useState(false);

  const isManager = currentUser.roleType === 'DEPT_MANAGER' || currentUser.roleType === 'HR_ADMIN' || currentUser.roleType === 'SUPER_ADMIN';

  const loadData = () => {
    const today = new Date().toISOString().split('T')[0];
    const records = db.getClockRecords();
    setClockRecords(records);
    const rec = records.find(r => r.employeeId === currentUser.employeeId && r.date === today);
    setTodayRecord(rec);
  };

  useEffect(() => {
    loadData();
    const unsub = db.subscribe(loadData);
    return () => unsub();
  }, [currentUser]);

  const handleClockIn = () => {
    db.clockIn(currentUser.employeeId);
  };

  const handleClockOut = () => {
    db.clockOut(currentUser.employeeId);
  };

  const handleExportCsv = () => {
    const rows = clockRecords.map(r => ({
      Date: r.date,
      Employee: r.employeeName,
      ClockIn: r.clockInTime ? formatTime(r.clockInTime) : 'N/A',
      ClockOut: r.clockOutTime ? formatTime(r.clockOutTime) : 'N/A',
      TotalHours: r.totalHoursWorked,
      RegularHours: r.regularHours,
      OvertimeHours: r.overtimeHours,
      Status: r.status,
    }));
    exportToCsv(`attendance_records_${new Date().toISOString().split('T')[0]}`, rows);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-neutral-text-primary tracking-tight">
            Attendance & Time Tracking
          </h2>
          <p className="text-xs sm:text-sm text-neutral-text-muted mt-1">
            Official work hour logging, shift schedules, overtime calculation, and adjustment workflows.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => setIsCorrectionModalOpen(true)}>
            <FileEdit className="w-4 h-4" /> Request Correction
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportCsv}>
            <Download className="w-4 h-4" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Clock Station Card */}
      <div className="bg-white p-6 rounded-2xl border border-neutral-border shadow-card flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-blue-50 text-primary rounded-2xl">
            <Clock className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-neutral-text-primary">
                {todayRecord && !todayRecord.clockOutTime ? 'Currently Clocked In' : 'Ready to Clock In'}
              </h3>
              <Badge variant={todayRecord && !todayRecord.clockOutTime ? 'success' : 'neutral'} size="sm">
                {todayRecord && !todayRecord.clockOutTime ? 'ON SHIFT' : 'OFF DUTY'}
              </Badge>
            </div>
            <p className="text-xs text-neutral-text-muted mt-1">
              Assigned Shift: General Office (09:00 AM – 06:00 PM PST) · Grace period: 15 mins
            </p>
            {todayRecord && todayRecord.clockInTime && (
              <div className="flex items-center gap-4 text-xs font-medium text-neutral-text-secondary mt-2">
                <span>In: <strong>{formatTime(todayRecord.clockInTime)}</strong></span>
                {todayRecord.clockOutTime && <span>Out: <strong>{formatTime(todayRecord.clockOutTime)}</strong></span>}
                <span>Hours: <strong className="text-primary">{todayRecord.totalHoursWorked || 0} hrs</strong></span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {!todayRecord || todayRecord.clockOutTime ? (
            <Button variant="primary" size="lg" className="w-full md:w-auto font-bold px-8 shadow-sm" onClick={handleClockIn}>
              <Play className="w-4 h-4 fill-white" /> Clock In
            </Button>
          ) : (
            <Button variant="danger" size="lg" className="w-full md:w-auto font-bold px-8 shadow-sm" onClick={handleClockOut}>
              <Square className="w-4 h-4 fill-white" /> Clock Out
            </Button>
          )}
        </div>
      </div>

      {/* Attendance Records Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            <span>Attendance Log (Current Month)</span>
            <Badge variant="primary" size="sm">Auto-calculated Overtime</Badge>
          </CardTitle>
          <CardDescription>
            {isManager ? 'Showing real-time records for all team members' : 'Showing your verified attendance history'}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>Clock In</TableHead>
                <TableHead>Clock Out</TableHead>
                <TableHead>Regular (hrs)</TableHead>
                <TableHead>Overtime (hrs)</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clockRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-xs text-neutral-text-muted">
                    No attendance records logged yet.
                  </TableCell>
                </TableRow>
              ) : (
                clockRecords.map(rec => (
                  <TableRow key={rec.id}>
                    <TableCell className="font-semibold text-xs text-neutral-text-primary">
                      {formatDate(rec.date)}
                    </TableCell>
                    <TableCell className="text-xs font-medium">
                      {rec.employeeName}
                    </TableCell>
                    <TableCell className="text-xs font-mono">
                      {rec.clockInTime ? formatTime(rec.clockInTime) : '—'}
                    </TableCell>
                    <TableCell className="text-xs font-mono">
                      {rec.clockOutTime ? formatTime(rec.clockOutTime) : '—'}
                    </TableCell>
                    <TableCell className="text-xs font-mono text-neutral-text-secondary">
                      {rec.regularHours}
                    </TableCell>
                    <TableCell className="text-xs font-mono font-semibold text-primary">
                      {rec.overtimeHours > 0 ? `+${rec.overtimeHours}` : '0'}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={rec.status === 'PRESENT' ? 'success' : rec.status === 'LATE' ? 'warning' : 'neutral'}
                        size="sm"
                      >
                        {rec.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Attendance Correction Modal */}
      <AttendanceCorrectionModal
        isOpen={isCorrectionModalOpen}
        onClose={() => setIsCorrectionModalOpen(false)}
        currentUser={currentUser}
        onSuccess={loadData}
      />
    </div>
  );
}
