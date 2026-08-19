import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db';
import { Department, Location, Position, ConfigurableStatus, ConfigurableEmploymentType } from '@/types';
import {
  Building2,
  MapPin,
  Briefcase,
  Sliders,
  Users,
  Plus,
  CheckCircle2,
  Shield,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

export function OrganizationView() {
  const [activeTab, setActiveTab] = useState('departments');
  const org = db.getOrganization();
  const departments = db.getDepartments();
  const locations = db.getLocations();
  const positions = db.getPositions();
  const statuses = db.getStatuses();
  const employmentTypes = db.getEmploymentTypes();
  const employees = db.getEmployees();

  const tabs = [
    { id: 'departments', label: 'Departments', count: departments.length, icon: <Building2 className="w-4 h-4" /> },
    { id: 'locations', label: 'Branches & Locations', count: locations.length, icon: <MapPin className="w-4 h-4" /> },
    { id: 'positions', label: 'Positions & Bands', count: positions.length, icon: <Briefcase className="w-4 h-4" /> },
    { id: 'statuses', label: 'Configurable Statuses & Types', count: statuses.length + employmentTypes.length, icon: <Sliders className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-neutral-text-primary tracking-tight">
            Organization Management
          </h2>
          <p className="text-xs sm:text-sm text-neutral-text-muted mt-1">
            Define organizational structure, branches, position grades, and dynamic employment policies.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="primary" size="md">
            Tenant: {org.name} ({org.code})
          </Badge>
        </div>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab: Departments */}
      {activeTab === 'departments' && (
        <div className="space-y-4 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {departments.map(dept => {
              const deptEmployees = employees.filter(e => e.departmentId === dept.id);
              const manager = employees.find(e => e.id === dept.managerEmployeeId);

              return (
                <Card key={dept.id} className="p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-primary px-2 py-0.5 rounded bg-primary-soft">
                        {dept.code}
                      </span>
                      <span className="text-xs text-neutral-text-muted flex items-center gap-1 font-medium">
                        <Users className="w-3.5 h-3.5" /> {deptEmployees.length} members
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-neutral-text-primary mt-3">{dept.name}</h4>
                    <p className="text-xs text-neutral-text-muted mt-1">
                      Lead: {manager ? `${manager.firstName} ${manager.lastName}` : 'Unassigned'}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-neutral-border/50 text-[11px] text-neutral-text-muted">
                    Active in AutoHR workflow routing
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab: Locations */}
      {activeTab === 'locations' && (
        <div className="space-y-4 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {locations.map(loc => (
              <Card key={loc.id} className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-50 text-primary rounded-xl">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-neutral-text-primary">{loc.name}</h4>
                      <p className="text-xs text-neutral-text-muted">{loc.address}, {loc.city}, {loc.country}</p>
                    </div>
                  </div>
                  <Badge variant="neutral" size="sm">{loc.code}</Badge>
                </div>
                <div className="mt-4 pt-3 border-t border-neutral-border/50 flex items-center justify-between text-xs text-neutral-text-muted">
                  <span>Authoritative Timezone:</span>
                  <span className="font-semibold text-neutral-text-primary font-mono">{loc.timezone}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Positions */}
      {activeTab === 'positions' && (
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Standard Position Titles & Compensation Bands</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Position Title</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Job Level</TableHead>
                  <TableHead>Salary Range (Annual)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {positions.map(pos => (
                  <TableRow key={pos.id}>
                    <TableCell className="font-semibold text-xs">{pos.title}</TableCell>
                    <TableCell className="font-mono text-xs text-neutral-text-muted">{pos.code}</TableCell>
                    <TableCell>
                      <Badge variant="primary" size="sm">{pos.jobLevel}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-neutral-text-secondary font-mono">
                      {formatCurrency(pos.minSalary || 0)} – {formatCurrency(pos.maxSalary || 0)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Tab: Configurable Statuses & Types */}
      {activeTab === 'statuses' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
          {/* Statuses */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Configurable Employee Statuses</CardTitle>
              <CardDescription>Dynamic organization-defined lifecycle states (no hardcoded enums)</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-neutral-border/60">
                {statuses.map(s => (
                  <div key={s.id} className="p-3.5 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-neutral-text-primary">{s.name}</span>
                      <p className="text-[10px] text-neutral-text-muted">
                        Payroll: {s.allowsPayroll ? 'Enabled' : 'Blocked'} · Attendance: {s.allowsAttendance ? 'Allowed' : 'Disabled'}
                      </p>
                    </div>
                    <Badge variant={s.color} size="sm">{s.name}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Employment Types */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Configurable Employment Types</CardTitle>
              <CardDescription>Weekly standard hours and contractual terms</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-neutral-border/60">
                {employmentTypes.map(t => (
                  <div key={t.id} className="p-3.5 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-neutral-text-primary">{t.name}</span>
                      <p className="text-[10px] text-neutral-text-muted">Standard: {t.standardWeeklyHours} hrs/week</p>
                    </div>
                    <Badge variant="secondary" size="sm">{t.standardWeeklyHours}h</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
