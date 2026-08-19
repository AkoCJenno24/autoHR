import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { db } from '@/lib/db';
import { Employee, AuditEvent } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  Users,
  Building2,
  Mail,
  Phone,
  Calendar,
  MapPin,
  CreditCard,
  FileText,
  History,
  ArrowLeft,
  Briefcase,
  ShieldCheck,
  Edit,
  CheckCircle2,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs } from '@/components/ui/tabs';

export function EmployeeDetailView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<Employee | undefined>();
  const [activeTab, setActiveTab] = useState('overview');
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);

  useEffect(() => {
    if (id) {
      const emp = db.getEmployeeById(id);
      setEmployee(emp);
      const events = db.getAuditEvents().filter(a => a.resourceId === id);
      setAuditEvents(events);
    }
  }, [id]);

  if (!employee) {
    return (
      <div className="text-center py-16 space-y-4">
        <h3 className="text-lg font-bold text-neutral-text-primary">Employee Record Not Found</h3>
        <p className="text-xs text-neutral-text-muted">The requested employee ID does not exist or is restricted.</p>
        <Link to="/employees">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4" /> Return to Employee Directory
          </Button>
        </Link>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview & Profile', icon: <Users className="w-4 h-4" /> },
    { id: 'employment', label: 'Employment & Hierarchy', icon: <Briefcase className="w-4 h-4" /> },
    { id: 'compensation', label: 'Compensation & Bank', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'documents', label: 'Documents', icon: <FileText className="w-4 h-4" /> },
    { id: 'history', label: 'Audit Trail & History', icon: <History className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumb Back Bar */}
      <div className="flex items-center gap-2 text-xs text-neutral-text-muted">
        <Link to="/employees" className="hover:text-primary transition-colors flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Employees
        </Link>
        <span>/</span>
        <span className="text-neutral-text-primary font-semibold">
          {employee.firstName} {employee.lastName}
        </span>
      </div>

      {/* Employee Profile Header Card */}
      <div className="bg-white p-6 rounded-2xl border border-neutral-border shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={employee.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
            alt={employee.firstName}
            className="w-16 h-16 rounded-full object-cover border-2 border-primary/20 shadow-sm"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-neutral-text-primary">
                {employee.firstName} {employee.lastName}
              </h2>
              <Badge variant="success" size="sm">{employee.statusName}</Badge>
            </div>
            <p className="text-xs text-neutral-text-muted mt-0.5">
              {employee.positionTitle} · {employee.departmentName}
            </p>
            <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-text-secondary mt-2">
              <span className="flex items-center gap-1 font-mono text-neutral-text-muted">
                {employee.employeeNumber}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-neutral-text-muted" /> {employee.email}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-neutral-text-muted" /> {employee.locationName}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/leave">
            <Button variant="outline" size="sm">
              <Calendar className="w-4 h-4" /> View Leaves
            </Button>
          </Link>
          <Link to="/payroll">
            <Button variant="primary" size="sm">
              <CreditCard className="w-4 h-4" /> View Payslips
            </Button>
          </Link>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-neutral-border/50">
                <span className="text-neutral-text-muted">Full Legal Name:</span>
                <span className="font-semibold text-neutral-text-primary">{employee.firstName} {employee.lastName}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-neutral-border/50">
                <span className="text-neutral-text-muted">Date of Birth:</span>
                <span className="font-semibold text-neutral-text-primary">{formatDate(employee.dateOfBirth)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-neutral-border/50">
                <span className="text-neutral-text-muted">Philippine ID / PhilSys:</span>
                <span className="font-mono font-semibold text-neutral-text-primary">{employee.nationalId || 'PH-PSN-0000-0000'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-neutral-border/50">
                <span className="text-neutral-text-muted">BIR Taxpayer ID (TIN):</span>
                <span className="font-mono font-semibold text-neutral-text-primary">{employee.tinNumber || employee.taxIdentificationNumber || 'TIN-000-000-000'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-neutral-border/50">
                <span className="text-neutral-text-muted">Residential Address:</span>
                <span className="font-semibold text-neutral-text-primary">{employee.address || 'Metro Manila, Philippines'}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Contact Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-neutral-border/50">
                <span className="text-neutral-text-muted">Work Email:</span>
                <span className="font-semibold text-primary">{employee.email}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-neutral-border/50">
                <span className="text-neutral-text-muted">Mobile Phone:</span>
                <span className="font-semibold text-neutral-text-primary">{employee.phone || '+63 917 000 0000'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-neutral-border/50">
                <span className="text-neutral-text-muted">Work Location:</span>
                <span className="font-semibold text-neutral-text-primary">{employee.locationName}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-neutral-border/50">
                <span className="text-neutral-text-muted">Timezone:</span>
                <span className="font-semibold text-neutral-text-primary">Asia/Manila (PHT)</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab 2: Employment & Hierarchy */}
      {activeTab === 'employment' && (
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Organizational Structure & Hierarchy</CardTitle>
            <CardDescription>Position assignment, direct reporting lines, and tenure</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-neutral-border space-y-2">
                <p className="text-neutral-text-muted font-medium">Department</p>
                <h4 className="text-sm font-bold text-neutral-text-primary">{employee.departmentName}</h4>
                <p className="text-[11px] text-neutral-text-muted">Company Department Unit</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-neutral-border space-y-2">
                <p className="text-neutral-text-muted font-medium">Direct Manager</p>
                <h4 className="text-sm font-bold text-neutral-text-primary">{employee.managerName || 'Direct to Executive'}</h4>
                <p className="text-[11px] text-neutral-text-muted">Primary Approver for Leaves & Tasks</p>
              </div>
            </div>

            <div className="divide-y divide-neutral-border/50">
              <div className="flex justify-between py-2">
                <span className="text-neutral-text-muted">Employment Type:</span>
                <span className="font-semibold text-neutral-text-primary">{employee.employmentTypeName}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-neutral-text-muted">Official Hire Date:</span>
                <span className="font-semibold text-neutral-text-primary">{formatDate(employee.hireDate)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-neutral-text-muted">Probation Status:</span>
                <span className="font-semibold text-success">Completed & Confirmed</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab 3: Compensation & Philippine Statutory */}
      {activeTab === 'compensation' && (
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Compensation & Philippine Statutory Profiles</CardTitle>
            <CardDescription>Confidential payroll profile, mandatory contributions, and disbursement</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                <p className="text-neutral-text-muted font-medium">Monthly Basic Salary</p>
                <h4 className="text-lg font-bold text-primary mt-1">{formatCurrency(employee.baseSalary)}</h4>
                <p className="text-[11px] text-neutral-text-muted">Semi-monthly payout: {formatCurrency(employee.baseSalary / 2)}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-neutral-border">
                <p className="text-neutral-text-muted font-medium">BIR Tax ID (TIN)</p>
                <h4 className="text-base font-mono font-bold text-neutral-text-primary mt-1">
                  {employee.tinNumber || employee.taxIdentificationNumber || 'TIN-000-000-000'}
                </h4>
                <p className="text-[11px] text-neutral-text-muted">TRAIN Law Tax Compliant</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-neutral-border">
                <p className="text-neutral-text-muted font-medium">Disbursement Bank</p>
                <h4 className="text-sm font-bold text-neutral-text-primary mt-1">
                  {employee.bankName || 'BDO Unibank'}
                </h4>
                <p className="text-[11px] font-mono text-neutral-text-muted">{employee.bankAccountNumber || '•••• 1001'}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-3 bg-slate-50/80 rounded-xl border border-neutral-border/60">
                <p className="text-neutral-text-muted text-[11px]">SSS Member ID</p>
                <p className="font-mono font-semibold text-neutral-text-primary mt-0.5">{employee.sssNumber || 'SSS-00-0000000-0'}</p>
              </div>
              <div className="p-3 bg-slate-50/80 rounded-xl border border-neutral-border/60">
                <p className="text-neutral-text-muted text-[11px]">PhilHealth PIN</p>
                <p className="font-mono font-semibold text-neutral-text-primary mt-0.5">{employee.philHealthNumber || 'PHIC-00-00000000-0'}</p>
              </div>
              <div className="p-3 bg-slate-50/80 rounded-xl border border-neutral-border/60">
                <p className="text-neutral-text-muted text-[11px]">Pag-IBIG / HDMF MID</p>
                <p className="font-mono font-semibold text-neutral-text-primary mt-0.5">{employee.pagIbigNumber || 'HDMF-0000-0000-0000'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab 4: Documents */}
      {activeTab === 'documents' && (
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Employee Documents & Attachments</CardTitle>
            <CardDescription>Encrypted and tenant-isolated storage documents</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-neutral-border/60">
              <div className="p-4 flex items-center justify-between hover:bg-slate-50">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-xs font-semibold text-neutral-text-primary">
                      Signed Employment Agreement & NDA
                    </p>
                    <p className="text-[11px] text-neutral-text-muted">Executed PDF · 2.4 MB · Uploaded on Hire Date</p>
                  </div>
                </div>
                <Badge variant="primary" size="sm">Confidential</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab 5: History & Audit */}
      {activeTab === 'history' && (
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <History className="w-4 h-4 text-primary" /> Historical Changes & Tamper-Evident Trail
            </CardTitle>
            <CardDescription>Auditable record of all position, department, and salary adjustments</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-neutral-border/60">
              {auditEvents.length === 0 ? (
                <div className="p-6 text-center text-xs text-neutral-text-muted">
                  No subsequent modifications recorded since profile creation.
                </div>
              ) : (
                auditEvents.map(evt => (
                  <div key={evt.id} className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-neutral-text-primary">{evt.action}</p>
                      <p className="text-[11px] text-neutral-text-muted">
                        Performed by {evt.actorName} ({evt.actorRole})
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-neutral-text-muted block font-mono">
                        {formatDate(evt.timestamp, 'MMM dd, yyyy · hh:mm a')}
                      </span>
                      <span className="text-[10px] text-neutral-text-muted font-mono">{evt.correlationId}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
