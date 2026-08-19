import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { db } from '@/lib/db';
import { User, HumanTask } from '@/types';
import { formatDate } from '@/lib/utils';
import {
  CheckSquare,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Filter,
  UserCheck,
  ArrowRight,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

export function TasksView() {
  const { currentUser } = useOutletContext<{ currentUser: User }>();
  const [tasks, setTasks] = useState<HumanTask[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'OPEN' | 'COMPLETED'>('OPEN');

  const loadData = () => {
    setTasks(db.getTasks());
  };

  useEffect(() => {
    loadData();
    const unsub = db.subscribe(loadData);
    return () => unsub();
  }, [currentUser]);

  const handleAction = (task: HumanTask, action: 'APPROVE' | 'REJECT') => {
    if (task.entityType === 'LeaveRequest') {
      db.decideLeaveRequest(task.entityId, action === 'APPROVE' ? 'APPROVED' : 'REJECTED', `Action taken via Task Inbox.`);
    } else {
      task.status = 'COMPLETED';
      task.completedAt = new Date().toISOString();
      loadData();
    }
  };

  const displayedTasks = tasks.filter(t => {
    if (filter === 'OPEN') return t.status === 'OPEN' || t.status === 'IN_PROGRESS';
    if (filter === 'COMPLETED') return t.status === 'COMPLETED';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-neutral-text-primary tracking-tight">
            Human Tasks & Worklist
          </h2>
          <p className="text-xs sm:text-sm text-neutral-text-muted mt-1">
            Universal task queue for workflow approvals, document verifications, and compliance actions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {(['OPEN', 'COMPLETED', 'ALL'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                filter === f ? 'bg-primary text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f} Tasks
            </button>
          ))}
        </div>
      </div>

      {/* Tasks Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Task Queue ({displayedTasks.length})</CardTitle>
          <CardDescription>Actions assigned to your role with strict SLA timers</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Priority</TableHead>
                <TableHead>Task Title & Description</TableHead>
                <TableHead>Module</TableHead>
                <TableHead>Assignee</TableHead>
                <TableHead>Due Date (SLA)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedTasks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-xs text-neutral-text-muted">
                    <CheckCircle2 className="w-6 h-6 text-success mx-auto mb-2 opacity-80" />
                    No tasks found in this view.
                  </TableCell>
                </TableRow>
              ) : (
                displayedTasks.map(task => (
                  <TableRow key={task.id}>
                    <TableCell>
                      <Badge
                        variant={task.priority === 'HIGH' || task.priority === 'URGENT' ? 'danger' : 'warning'}
                        size="sm"
                      >
                        {task.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-xs font-semibold text-neutral-text-primary">{task.title}</p>
                        <p className="text-[11px] text-neutral-text-muted max-w-sm truncate">{task.description}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="neutral" size="sm">{task.module}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-neutral-text-secondary font-medium">
                      {task.assignedToName || 'Unassigned'}
                    </TableCell>
                    <TableCell className="text-xs text-neutral-text-muted whitespace-nowrap">
                      {formatDate(task.dueDate)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={task.status === 'COMPLETED' ? 'success' : task.status === 'IN_PROGRESS' ? 'info' : 'warning'}
                        size="sm"
                      >
                        {task.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {task.status !== 'COMPLETED' ? (
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => handleAction(task, 'APPROVE')}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleAction(task, 'REJECT')}
                          >
                            <XCircle className="w-3.5 h-3.5" /> Reject
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-success font-semibold flex items-center justify-end gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Resolved
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
    </div>
  );
}
