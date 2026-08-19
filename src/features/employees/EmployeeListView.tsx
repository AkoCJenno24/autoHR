import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '@/lib/db';
import { Employee } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  ArrowRight,
  Mail,
  Phone,
  Building2,
  MapPin,
  Briefcase,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { CreateEmployeeModal } from './CreateEmployeeModal';

export function EmployeeListView() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const departments = db.getDepartments();
  const statuses = db.getStatuses();

  const loadData = () => {
    setEmployees(db.getEmployees());
  };

  useEffect(() => {
    loadData();
    const unsub = db.subscribe(loadData);
    return () => unsub();
  }, []);

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch =
      `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      emp.email.toLowerCase().includes(search.toLowerCase()) ||
      emp.employeeNumber.toLowerCase().includes(search.toLowerCase()) ||
      emp.positionTitle.toLowerCase().includes(search.toLowerCase());

    const matchesDept = departmentFilter === 'ALL' || emp.departmentId === departmentFilter;
    const matchesStatus = statusFilter === 'ALL' || emp.statusId === statusFilter;

    return matchesSearch && matchesDept && matchesStatus;
  });

  const getStatusBadge = (statusName: string) => {
    switch (statusName.toLowerCase()) {
      case 'active':
        return <Badge variant="success">{statusName}</Badge>;
      case 'probationary':
        return <Badge variant="warning">{statusName}</Badge>;
      case 'on leave':
        return <Badge variant="info">{statusName}</Badge>;
      case 'terminated':
        return <Badge variant="danger">{statusName}</Badge>;
      default:
        return <Badge variant="secondary">{statusName}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-neutral-text-primary tracking-tight">
            Employee Directory
          </h2>
          <p className="text-xs sm:text-sm text-neutral-text-muted mt-1">
            Manage organization workforce, profiles, departments, and employment statuses.
          </p>
        </div>

        <Button variant="primary" size="md" onClick={() => setIsAddModalOpen(true)}>
          <UserPlus className="w-4 h-4" /> Add New Employee
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-neutral-border shadow-card flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-neutral-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email, employee ID, or title..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-neutral-border rounded-lg text-neutral-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={departmentFilter}
            onChange={e => setDepartmentFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-white border border-neutral-border rounded-lg text-neutral-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="ALL">All Departments</option>
            {departments.map(d => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-white border border-neutral-border rounded-lg text-neutral-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="ALL">All Statuses</option>
            {statuses.map(s => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Employees Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Employee</TableHead>
            <TableHead>Department & Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Hire Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredEmployees.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-xs text-neutral-text-muted">
                No employees found matching the filters.
              </TableCell>
            </TableRow>
          ) : (
            filteredEmployees.map(emp => (
              <TableRow key={emp.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <img
                      src={emp.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                      alt={emp.firstName}
                      className="w-9 h-9 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <Link
                        to={`/employees/${emp.id}`}
                        className="font-semibold text-xs sm:text-sm text-neutral-text-primary hover:text-primary transition-colors block"
                      >
                        {emp.firstName} {emp.lastName}
                      </Link>
                      <span className="text-[11px] text-neutral-text-muted font-mono">{emp.employeeNumber}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="text-xs font-semibold text-neutral-text-primary">{emp.positionTitle}</p>
                    <p className="text-[11px] text-neutral-text-muted">{emp.departmentName}</p>
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(emp.statusName)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5 text-xs text-neutral-text-secondary">
                    <MapPin className="w-3.5 h-3.5 text-neutral-text-muted" />
                    <span>{emp.locationName}</span>
                  </div>
                </TableCell>
                <TableCell className="text-xs text-neutral-text-muted">
                  {formatDate(emp.hireDate)}
                </TableCell>
                <TableCell className="text-right">
                  <Link to={`/employees/${emp.id}`}>
                    <Button variant="ghost" size="sm" className="text-xs">
                      View Profile <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Add Employee Modal */}
      <CreateEmployeeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          loadData();
        }}
      />
    </div>
  );
}
