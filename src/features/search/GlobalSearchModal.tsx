import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '@/lib/db';
import { User } from '@/types';
import {
  Search,
  Users,
  CalendarCheck,
  CreditCard,
  FileText,
  CheckSquare,
  ArrowRight,
  X,
} from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

import { canAccessModule } from '@/lib/permissions/rbac';

export function GlobalSearchModal({
  isOpen,
  onClose,
  currentUser,
}: {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
}) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const roles = db.getRoles();

  useEffect(() => {
    if (isOpen) {
      setQuery('');
    }
  }, [isOpen]);

  const canAccessEmployees = canAccessModule(currentUser, 'employees', roles);
  const canAccessLeave = canAccessModule(currentUser, 'leave', roles);
  const canAccessDocs = canAccessModule(currentUser, 'documents', roles);
  const canAccessTasks = canAccessModule(currentUser, 'tasks', roles);

  const employees = canAccessEmployees ? db.getEmployees() : [];
  const leaveRequests = canAccessLeave ? db.getLeaveRequests() : [];
  const documents = canAccessDocs ? db.getDocuments() : [];
  const tasks = canAccessTasks ? db.getTasks(currentUser.id) : [];

  const filteredEmployees = query
    ? employees.filter(
        e =>
          `${e.firstName} ${e.lastName}`.toLowerCase().includes(query.toLowerCase()) ||
          e.departmentName.toLowerCase().includes(query.toLowerCase()) ||
          e.positionTitle.toLowerCase().includes(query.toLowerCase()) ||
          e.employeeNumber.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const filteredLeaves = query
    ? leaveRequests.filter(
        l =>
          l.employeeName.toLowerCase().includes(query.toLowerCase()) ||
          l.leaveTypeName.toLowerCase().includes(query.toLowerCase()) ||
          l.reason.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const filteredDocs = query
    ? documents.filter(
        d =>
          d.title.toLowerCase().includes(query.toLowerCase()) ||
          d.category.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const filteredTasks = query
    ? tasks.filter(
        t =>
          t.title.toLowerCase().includes(query.toLowerCase()) ||
          t.description.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const hasResults =
    filteredEmployees.length > 0 ||
    filteredLeaves.length > 0 ||
    filteredDocs.length > 0 ||
    filteredTasks.length > 0;

  const handleSelect = (path: string) => {
    onClose();
    navigate(path);
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} maxWidth="xl">
      <div className="space-y-4">
        {/* Search Input */}
        <div className="relative flex items-center border-b border-neutral-border pb-3">
          <Search className="w-5 h-5 text-neutral-text-muted absolute left-2" />
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search employees, leaves, tasks, documents..."
            className="w-full pl-10 pr-8 py-2 text-base bg-transparent text-neutral-text-primary focus:outline-none placeholder:text-neutral-text-muted"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-neutral-text-muted hover:text-neutral-text-primary"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Results Container */}
        <div className="max-h-96 overflow-y-auto space-y-4 pr-1">
          {!query ? (
            <div className="py-8 text-center text-xs text-neutral-text-muted">
              Type anything to search across the entire organization...
            </div>
          ) : !hasResults ? (
            <div className="py-8 text-center text-xs text-neutral-text-muted">
              No matching records found for "{query}".
            </div>
          ) : (
            <>
              {/* Employees */}
              {filteredEmployees.length > 0 && (
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-text-muted mb-2 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-primary" /> Employees ({filteredEmployees.length})
                  </p>
                  <div className="space-y-1">
                    {filteredEmployees.map(emp => (
                      <div
                        key={emp.id}
                        onClick={() => handleSelect(`/employees/${emp.id}`)}
                        className="p-2.5 rounded-lg hover:bg-slate-50 border border-transparent hover:border-neutral-border flex items-center justify-between cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={emp.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                            alt={emp.firstName}
                            className="w-7 h-7 rounded-full object-cover"
                          />
                          <div>
                            <p className="text-xs font-semibold text-neutral-text-primary">
                              {emp.firstName} {emp.lastName}
                            </p>
                            <p className="text-[11px] text-neutral-text-muted">
                              {emp.positionTitle} · {emp.departmentName}
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-neutral-text-muted" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Leave Requests */}
              {filteredLeaves.length > 0 && (
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-text-muted mb-2 flex items-center gap-1.5">
                    <CalendarCheck className="w-3.5 h-3.5 text-warning" /> Leave Requests ({filteredLeaves.length})
                  </p>
                  <div className="space-y-1">
                    {filteredLeaves.map(leave => (
                      <div
                        key={leave.id}
                        onClick={() => handleSelect('/leave')}
                        className="p-2.5 rounded-lg hover:bg-slate-50 border border-transparent hover:border-neutral-border flex items-center justify-between cursor-pointer transition-colors"
                      >
                        <div>
                          <p className="text-xs font-semibold text-neutral-text-primary">
                            {leave.employeeName} — {leave.leaveTypeName} ({leave.totalDays} Days)
                          </p>
                          <p className="text-[11px] text-neutral-text-muted">{leave.reason}</p>
                        </div>
                        <Badge
                          variant={leave.status === 'APPROVED' ? 'success' : leave.status === 'REJECTED' ? 'danger' : 'warning'}
                          size="sm"
                        >
                          {leave.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Documents */}
              {filteredDocs.length > 0 && (
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-text-muted mb-2 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-info" /> Documents ({filteredDocs.length})
                  </p>
                  <div className="space-y-1">
                    {filteredDocs.map(doc => (
                      <div
                        key={doc.id}
                        onClick={() => handleSelect('/documents')}
                        className="p-2.5 rounded-lg hover:bg-slate-50 border border-transparent hover:border-neutral-border flex items-center justify-between cursor-pointer transition-colors"
                      >
                        <div>
                          <p className="text-xs font-semibold text-neutral-text-primary">{doc.title}</p>
                          <p className="text-[11px] text-neutral-text-muted">{doc.fileName}</p>
                        </div>
                        <Badge variant="info" size="sm">
                          {doc.category}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Dialog>
  );
}
