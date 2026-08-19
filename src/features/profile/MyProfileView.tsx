import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { db } from '@/lib/db';
import {
  Employee,
  ProfileChangeRequest,
  ProfileFieldKey,
  FieldEditPolicy,
  ProfileChangeItem,
} from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  User as UserIcon,
  Phone,
  Mail,
  MapPin,
  Heart,
  Shield,
  CreditCard,
  Briefcase,
  Edit,
  Clock,
  CheckCircle2,
  AlertCircle,
  Lock,
  Sparkles,
  ArrowRight,
  Save,
  X,
  History,
  FileCheck,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog } from '@/components/ui/dialog';

interface FieldConfigMeta {
  key: ProfileFieldKey;
  label: string;
  category: 'personal' | 'contact' | 'emergency' | 'statutory' | 'bank';
  placeholder?: string;
  type?: string;
}

const PROFILE_FIELDS: FieldConfigMeta[] = [
  // Contact
  { key: 'phone', label: 'Mobile Phone', category: 'contact', placeholder: '+63 917 123 4567' },
  { key: 'personalEmail', label: 'Personal Email', category: 'contact', placeholder: 'personal@example.com', type: 'email' },
  { key: 'address', label: 'Residential Address', category: 'contact', placeholder: 'Unit No, Street, City, Metro Manila' },

  // Emergency
  { key: 'emergencyContactName', label: 'Emergency Contact Person', category: 'emergency', placeholder: 'Full Name' },
  { key: 'emergencyContactRelationship', label: 'Relationship', category: 'emergency', placeholder: 'e.g. Spouse / Parent / Sibling' },
  { key: 'emergencyContactPhone', label: 'Emergency Contact Phone', category: 'emergency', placeholder: '+63 917 000 0000' },

  // Personal
  { key: 'maritalStatus', label: 'Civil / Marital Status', category: 'personal' },

  // Statutory
  { key: 'tinNumber', label: 'BIR Taxpayer Identification Number (TIN)', category: 'statutory', placeholder: '000-000-000-000' },
  { key: 'sssNumber', label: 'Social Security System (SSS) Number', category: 'statutory', placeholder: '00-0000000-0' },
  { key: 'philHealthNumber', label: 'PhilHealth Identification Number (PIN)', category: 'statutory', placeholder: '00-000000000-0' },
  { key: 'pagIbigNumber', label: 'Pag-IBIG / HDMF MID', category: 'statutory', placeholder: '0000-0000-0000' },

  // Bank
  { key: 'bankName', label: 'Disbursement Bank Name', category: 'bank', placeholder: 'e.g. BDO / BPI / Metrobank / UnionBank' },
  { key: 'bankAccountNumber', label: 'Bank Account Number', category: 'bank', placeholder: '0000-0000-0000' },
  { key: 'bankAccountName', label: 'Bank Account Holder Name', category: 'bank', placeholder: 'Full Legal Account Name' },
];

export function MyProfileView() {
  const { user } = useAuth();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [changeRequests, setChangeRequests] = useState<ProfileChangeRequest[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  // Edit form state
  const [formData, setFormData] = useState<Partial<Record<ProfileFieldKey, string>>>({});
  const [changeReason, setChangeReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccessMsg, setSubmitSuccessMsg] = useState<string | null>(null);

  const loadData = () => {
    if (user?.employeeId) {
      const emp = db.getEmployeeById(user.employeeId);
      if (emp) {
        setEmployee(emp);
        setChangeRequests(db.getProfileChangeRequests(emp.id));
        setFormData({
          phone: emp.phone || '',
          personalEmail: emp.personalEmail || '',
          address: emp.address || '',
          emergencyContactName: emp.emergencyContactName || '',
          emergencyContactRelationship: emp.emergencyContactRelationship || '',
          emergencyContactPhone: emp.emergencyContactPhone || '',
          maritalStatus: emp.maritalStatus || 'single',
          tinNumber: emp.tinNumber || emp.taxIdentificationNumber || '',
          sssNumber: emp.sssNumber || '',
          philHealthNumber: emp.philHealthNumber || '',
          pagIbigNumber: emp.pagIbigNumber || '',
          bankName: emp.bankName || '',
          bankAccountNumber: emp.bankAccountNumber || '',
          bankAccountName: emp.bankAccountName || '',
        });
      }
    }
  };

  useEffect(() => {
    loadData();
    const unsub = db.subscribe(loadData);
    return () => unsub();
  }, [user?.employeeId]);

  if (!employee) {
    return (
      <div className="text-center py-16 space-y-3">
        <UserIcon className="w-10 h-10 text-slate-300 mx-auto" />
        <h3 className="text-base font-bold text-neutral-text-primary">Employee Record Not Linked</h3>
        <p className="text-xs text-neutral-text-muted">
          Your account is not linked to an active employee record. Contact HR to link your profile.
        </p>
      </div>
    );
  }

  const pendingRequests = changeRequests.filter(r => r.status === 'PENDING');

  const getFieldPolicy = (fieldKey: ProfileFieldKey): FieldEditPolicy => {
    return db.getProfileFieldPolicy(fieldKey, employee);
  };

  const renderPolicyBadge = (policy: FieldEditPolicy) => {
    if (policy === 'DIRECT_EDIT') {
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
          <CheckCircle2 className="w-2.5 h-2.5" /> Direct Edit
        </span>
      );
    }
    if (policy === 'APPROVAL_REQUIRED') {
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/60">
          <Clock className="w-2.5 h-2.5" /> Requires HR Approval
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
        <Lock className="w-2.5 h-2.5" /> Read Only
      </span>
    );
  };

  const handleOpenEdit = () => {
    setFormData({
      phone: employee.phone || '',
      personalEmail: employee.personalEmail || '',
      address: employee.address || '',
      emergencyContactName: employee.emergencyContactName || '',
      emergencyContactRelationship: employee.emergencyContactRelationship || '',
      emergencyContactPhone: employee.emergencyContactPhone || '',
      maritalStatus: employee.maritalStatus || 'single',
      tinNumber: employee.tinNumber || employee.taxIdentificationNumber || '',
      sssNumber: employee.sssNumber || '',
      philHealthNumber: employee.philHealthNumber || '',
      pagIbigNumber: employee.pagIbigNumber || '',
      bankName: employee.bankName || '',
      bankAccountNumber: employee.bankAccountNumber || '',
      bankAccountName: employee.bankAccountName || '',
    });
    setChangeReason('');
    setSubmitSuccessMsg(null);
    setIsEditModalOpen(true);
  };

  const handleSubmitEdit = () => {
    setIsSubmitting(true);

    const directUpdates: Partial<Employee> = {};
    const approvalChanges: ProfileChangeItem[] = [];

    PROFILE_FIELDS.forEach(field => {
      const policy = getFieldPolicy(field.key);
      if (policy === 'READ_ONLY') return;

      const previousVal = (employee as any)[field.key] || '';
      const newVal = (formData[field.key] || '').trim();

      if (newVal !== previousVal) {
        if (policy === 'DIRECT_EDIT') {
          (directUpdates as any)[field.key] = newVal;
        } else if (policy === 'APPROVAL_REQUIRED') {
          approvalChanges.push({
            field: field.key,
            label: field.label,
            previousValue: previousVal || '(Empty)',
            requestedValue: newVal || '(Empty)',
          });
        }
      }
    });

    if (Object.keys(directUpdates).length === 0 && approvalChanges.length === 0) {
      setIsSubmitting(false);
      setIsEditModalOpen(false);
      return;
    }

    try {
      db.submitProfileChangeRequest({
        employeeId: employee.id,
        directUpdates,
        approvalChanges,
        reason: changeReason.trim() || undefined,
      });

      loadData();
      setTimeout(() => {
        setIsSubmitting(false);
        setSubmitSuccessMsg(
          approvalChanges.length > 0
            ? 'Your updates have been submitted to HR for approval!'
            : 'Your profile has been updated successfully!'
        );
        setTimeout(() => {
          setIsEditModalOpen(false);
        }, 1200);
      }, 400);
    } catch (e: any) {
      console.error(e);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Profile Summary */}
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
              <Badge variant="success" size="sm">
                {employee.statusName}
              </Badge>
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
          {changeRequests.length > 0 && (
            <Button variant="outline" size="sm" onClick={() => setIsHistoryModalOpen(true)} className="gap-1.5">
              <History className="w-3.5 h-3.5 text-neutral-text-muted" /> Requests ({changeRequests.length})
            </Button>
          )}
          <Button variant="primary" size="sm" onClick={handleOpenEdit} className="gap-1.5">
            <Edit className="w-3.5 h-3.5" /> Edit Profile Details
          </Button>
        </div>
      </div>

      {/* Pending Change Requests Alert Banner */}
      {pendingRequests.length > 0 && (
        <div className="p-4 bg-amber-50/80 border border-amber-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in shadow-xs">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-900">
                You have {pendingRequests.length} Profile Change Request awaiting HR Approval
              </h4>
              <p className="text-[11px] text-amber-800/80 mt-0.5">
                Submitted updates: {pendingRequests[0].changes.map(c => c.label).join(', ')}. Changes will reflect upon HR review.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsHistoryModalOpen(true)}
            className="text-xs shrink-0 text-amber-900 border-amber-300 hover:bg-amber-100"
          >
            View Request Details
          </Button>
        </div>
      )}

      {/* Profile Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
        {/* Card 1: Contact Information */}
        <Card className="hover:shadow-card-hover transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary" /> Contact Details
              </CardTitle>
            </div>
            <CardDescription>Personal communication channels and primary physical residence</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="flex items-center justify-between py-2 border-b border-neutral-border/50">
              <div className="space-y-0.5">
                <span className="text-neutral-text-muted block">Mobile Phone Number</span>
                <span className="font-semibold text-neutral-text-primary text-xs">
                  {employee.phone || '(Not provided)'}
                </span>
              </div>
              <div>{renderPolicyBadge(getFieldPolicy('phone'))}</div>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-neutral-border/50">
              <div className="space-y-0.5">
                <span className="text-neutral-text-muted block">Personal Email</span>
                <span className="font-semibold text-neutral-text-primary text-xs">
                  {employee.personalEmail || '(Not provided)'}
                </span>
              </div>
              <div>{renderPolicyBadge(getFieldPolicy('personalEmail'))}</div>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-neutral-border/50">
              <div className="space-y-0.5">
                <span className="text-neutral-text-muted block">Official Work Email</span>
                <span className="font-semibold text-primary font-mono text-xs">
                  {employee.email}
                </span>
              </div>
              <div>{renderPolicyBadge('READ_ONLY')}</div>
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="space-y-0.5 max-w-[70%]">
                <span className="text-neutral-text-muted block">Residential Address</span>
                <span className="font-semibold text-neutral-text-primary text-xs leading-relaxed block">
                  {employee.address || '(Not provided)'}
                </span>
              </div>
              <div>{renderPolicyBadge(getFieldPolicy('address'))}</div>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Emergency Contact */}
        <Card className="hover:shadow-card-hover transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-500" /> Emergency Contact
              </CardTitle>
            </div>
            <CardDescription>Designated family member or next of kin in event of incident</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="flex items-center justify-between py-2 border-b border-neutral-border/50">
              <div className="space-y-0.5">
                <span className="text-neutral-text-muted block">Contact Person Name</span>
                <span className="font-semibold text-neutral-text-primary text-xs">
                  {employee.emergencyContactName || '(Not provided)'}
                </span>
              </div>
              <div>{renderPolicyBadge(getFieldPolicy('emergencyContactName'))}</div>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-neutral-border/50">
              <div className="space-y-0.5">
                <span className="text-neutral-text-muted block">Relationship</span>
                <span className="font-semibold text-neutral-text-primary text-xs">
                  {employee.emergencyContactRelationship || '(Not provided)'}
                </span>
              </div>
              <div>{renderPolicyBadge(getFieldPolicy('emergencyContactRelationship'))}</div>
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="space-y-0.5">
                <span className="text-neutral-text-muted block">Emergency Phone Number</span>
                <span className="font-semibold text-neutral-text-primary text-xs">
                  {employee.emergencyContactPhone || '(Not provided)'}
                </span>
              </div>
              <div>{renderPolicyBadge(getFieldPolicy('emergencyContactPhone'))}</div>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Philippine Statutory & Government IDs */}
        <Card className="hover:shadow-card-hover transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Shield className="w-4 h-4 text-indigo-500" /> Philippine Statutory Numbers
              </CardTitle>
            </div>
            <CardDescription>Mandatory Philippine government identification numbers for tax & social benefits</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="flex items-center justify-between py-2 border-b border-neutral-border/50">
              <div className="space-y-0.5">
                <span className="text-neutral-text-muted block">BIR Tax Identification Number (TIN)</span>
                <span className="font-mono font-semibold text-neutral-text-primary text-xs">
                  {employee.tinNumber || employee.taxIdentificationNumber || '(Not provided)'}
                </span>
              </div>
              <div>{renderPolicyBadge(getFieldPolicy('tinNumber'))}</div>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-neutral-border/50">
              <div className="space-y-0.5">
                <span className="text-neutral-text-muted block">Social Security System (SSS) Number</span>
                <span className="font-mono font-semibold text-neutral-text-primary text-xs">
                  {employee.sssNumber || '(Not provided)'}
                </span>
              </div>
              <div>{renderPolicyBadge(getFieldPolicy('sssNumber'))}</div>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-neutral-border/50">
              <div className="space-y-0.5">
                <span className="text-neutral-text-muted block">PhilHealth Identification (PIN)</span>
                <span className="font-mono font-semibold text-neutral-text-primary text-xs">
                  {employee.philHealthNumber || '(Not provided)'}
                </span>
              </div>
              <div>{renderPolicyBadge(getFieldPolicy('philHealthNumber'))}</div>
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="space-y-0.5">
                <span className="text-neutral-text-muted block">Pag-IBIG / HDMF MID</span>
                <span className="font-mono font-semibold text-neutral-text-primary text-xs">
                  {employee.pagIbigNumber || '(Not provided)'}
                </span>
              </div>
              <div>{renderPolicyBadge(getFieldPolicy('pagIbigNumber'))}</div>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Bank Account & Payroll Disbursement */}
        <Card className="hover:shadow-card-hover transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600" /> Payroll Bank Disbursement
              </CardTitle>
            </div>
            <CardDescription>Bank account details used for semi-monthly direct salary deposit</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="flex items-center justify-between py-2 border-b border-neutral-border/50">
              <div className="space-y-0.5">
                <span className="text-neutral-text-muted block">Bank Name</span>
                <span className="font-semibold text-neutral-text-primary text-xs">
                  {employee.bankName || '(Not provided)'}
                </span>
              </div>
              <div>{renderPolicyBadge(getFieldPolicy('bankName'))}</div>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-neutral-border/50">
              <div className="space-y-0.5">
                <span className="text-neutral-text-muted block">Account Number</span>
                <span className="font-mono font-semibold text-neutral-text-primary text-xs">
                  {employee.bankAccountNumber || '(Not provided)'}
                </span>
              </div>
              <div>{renderPolicyBadge(getFieldPolicy('bankAccountNumber'))}</div>
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="space-y-0.5">
                <span className="text-neutral-text-muted block">Account Holder Name</span>
                <span className="font-semibold text-neutral-text-primary text-xs">
                  {employee.bankAccountName || `${employee.firstName} ${employee.lastName}`}
                </span>
              </div>
              <div>{renderPolicyBadge(getFieldPolicy('bankAccountName'))}</div>
            </div>
          </CardContent>
        </Card>

        {/* Card 5: Employment & Organizational Details (Read Only) */}
        <Card className="md:col-span-2 bg-slate-50/50 border-neutral-border/80">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-slate-600" /> Official Employment Information
              </CardTitle>
              <Badge variant="neutral" size="sm">
                <Lock className="w-3 h-3 mr-1 text-slate-400" /> Company Managed Record
              </Badge>
            </div>
            <CardDescription>Read-only structural parameters managed strictly by HR Administration</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3 bg-white rounded-xl border border-neutral-border">
              <span className="text-neutral-text-muted block mb-1">Department</span>
              <span className="font-bold text-neutral-text-primary">{employee.departmentName}</span>
            </div>
            <div className="p-3 bg-white rounded-xl border border-neutral-border">
              <span className="text-neutral-text-muted block mb-1">Direct Manager</span>
              <span className="font-bold text-neutral-text-primary">{employee.managerName || 'Direct to Executive'}</span>
            </div>
            <div className="p-3 bg-white rounded-xl border border-neutral-border">
              <span className="text-neutral-text-muted block mb-1">Official Hire Date</span>
              <span className="font-bold text-neutral-text-primary">{formatDate(employee.hireDate)}</span>
            </div>
            <div className="p-3 bg-white rounded-xl border border-neutral-border">
              <span className="text-neutral-text-muted block mb-1">Employment Type</span>
              <span className="font-bold text-neutral-text-primary">{employee.employmentTypeName}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Profile Details Modal */}
      <Dialog isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} maxWidth="2xl">
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-border">
            <div>
              <h3 className="text-base font-bold text-neutral-text-primary flex items-center gap-2">
                <Edit className="w-4 h-4 text-primary" /> Edit My Profile Details
              </h3>
              <p className="text-xs text-neutral-text-muted mt-0.5">
                Update your contact info, statutory numbers, or payroll bank account.
              </p>
            </div>
          </div>

          {submitSuccessMsg && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{submitSuccessMsg}</span>
            </div>
          )}

          <div className="max-h-[60vh] overflow-y-auto space-y-6 pr-1">
            {/* Contact Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-neutral-text-primary uppercase tracking-wider">
                  Contact Information
                </h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PROFILE_FIELDS.filter(f => f.category === 'contact').map(field => {
                  const policy = getFieldPolicy(field.key);
                  const isLocked = policy === 'READ_ONLY';
                  return (
                    <div key={field.key} className={field.key === 'address' ? 'sm:col-span-2' : ''}>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-semibold text-neutral-text-primary">
                          {field.label}
                        </label>
                        {renderPolicyBadge(policy)}
                      </div>
                      <input
                        type={field.type || 'text'}
                        value={formData[field.key] || ''}
                        onChange={e => setFormData({ ...formData, [field.key]: e.target.value })}
                        disabled={isLocked}
                        placeholder={field.placeholder}
                        className={`w-full text-xs rounded-lg px-3 py-2 border transition-all ${
                          isLocked
                            ? 'bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed'
                            : 'bg-white border-neutral-border focus:ring-2 focus:ring-primary/20 focus:border-primary text-neutral-text-primary'
                        }`}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-neutral-text-primary uppercase tracking-wider">
                  Emergency Contact
                </h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {PROFILE_FIELDS.filter(f => f.category === 'emergency').map(field => {
                  const policy = getFieldPolicy(field.key);
                  const isLocked = policy === 'READ_ONLY';
                  return (
                    <div key={field.key}>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-semibold text-neutral-text-primary truncate">
                          {field.label}
                        </label>
                      </div>
                      <input
                        type="text"
                        value={formData[field.key] || ''}
                        onChange={e => setFormData({ ...formData, [field.key]: e.target.value })}
                        disabled={isLocked}
                        placeholder={field.placeholder}
                        className={`w-full text-xs rounded-lg px-3 py-2 border transition-all ${
                          isLocked
                            ? 'bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed'
                            : 'bg-white border-neutral-border focus:ring-2 focus:ring-primary/20 focus:border-primary text-neutral-text-primary'
                        }`}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Statutory Numbers */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-neutral-text-primary uppercase tracking-wider">
                  Philippine Statutory Numbers
                </h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PROFILE_FIELDS.filter(f => f.category === 'statutory').map(field => {
                  const policy = getFieldPolicy(field.key);
                  const isLocked = policy === 'READ_ONLY';
                  return (
                    <div key={field.key}>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-semibold text-neutral-text-primary truncate">
                          {field.label}
                        </label>
                        {renderPolicyBadge(policy)}
                      </div>
                      <input
                        type="text"
                        value={formData[field.key] || ''}
                        onChange={e => setFormData({ ...formData, [field.key]: e.target.value })}
                        disabled={isLocked}
                        placeholder={field.placeholder}
                        className={`w-full text-xs font-mono rounded-lg px-3 py-2 border transition-all ${
                          isLocked
                            ? 'bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed'
                            : 'bg-white border-neutral-border focus:ring-2 focus:ring-primary/20 focus:border-primary text-neutral-text-primary'
                        }`}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bank Disbursement */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-neutral-text-primary uppercase tracking-wider">
                  Payroll Bank Account
                </h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {PROFILE_FIELDS.filter(f => f.category === 'bank').map(field => {
                  const policy = getFieldPolicy(field.key);
                  const isLocked = policy === 'READ_ONLY';
                  return (
                    <div key={field.key}>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-semibold text-neutral-text-primary truncate">
                          {field.label}
                        </label>
                      </div>
                      <input
                        type="text"
                        value={formData[field.key] || ''}
                        onChange={e => setFormData({ ...formData, [field.key]: e.target.value })}
                        disabled={isLocked}
                        placeholder={field.placeholder}
                        className={`w-full text-xs rounded-lg px-3 py-2 border transition-all ${
                          isLocked
                            ? 'bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed'
                            : 'bg-white border-neutral-border focus:ring-2 focus:ring-primary/20 focus:border-primary text-neutral-text-primary'
                        }`}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Reason / Notes */}
            <div className="space-y-1.5 pt-2 border-t border-neutral-border">
              <label className="block text-xs font-semibold text-neutral-text-primary">
                Reason for Requested Changes (Optional for Direct Edits, Required for Approval Fields)
              </label>
              <textarea
                rows={2}
                value={changeReason}
                onChange={e => setChangeReason(e.target.value)}
                placeholder="e.g. Updated primary payroll savings bank account / new phone number..."
                className="w-full text-xs rounded-lg p-2.5 bg-white border border-neutral-border focus:ring-2 focus:ring-primary/20 focus:border-primary text-neutral-text-primary"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-neutral-border flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsEditModalOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSubmitEdit}
              isLoading={isSubmitting}
              className="gap-1.5"
            >
              <Save className="w-3.5 h-3.5" /> Submit Updates
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Change Requests History Modal */}
      <Dialog isOpen={isHistoryModalOpen} onClose={() => setIsHistoryModalOpen(false)} maxWidth="xl">
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-border">
            <h3 className="text-base font-bold text-neutral-text-primary flex items-center gap-2">
              <History className="w-4 h-4 text-primary" /> Profile Change Requests History
            </h3>
          </div>

          <div className="max-h-96 overflow-y-auto space-y-3 pr-1">
            {changeRequests.length === 0 ? (
              <p className="text-center py-8 text-xs text-neutral-text-muted">No profile change requests filed.</p>
            ) : (
              changeRequests.map(req => (
                <div
                  key={req.id}
                  className="p-4 rounded-xl border border-neutral-border bg-white space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-neutral-text-muted">
                      {formatDate(req.createdAt, 'MMM dd, yyyy · hh:mm a')}
                    </span>
                    <Badge
                      variant={
                        req.status === 'APPROVED'
                          ? 'success'
                          : req.status === 'REJECTED'
                          ? 'danger'
                          : 'warning'
                      }
                      size="sm"
                    >
                      {req.status}
                    </Badge>
                  </div>

                  <div className="space-y-1 bg-slate-50 p-2.5 rounded-lg border border-neutral-border/60">
                    {req.changes.map((change, idx) => (
                      <div key={idx} className="text-xs flex items-center justify-between gap-2 py-0.5">
                        <span className="font-semibold text-neutral-text-secondary">{change.label}:</span>
                        <div className="flex items-center gap-1.5 text-right font-mono text-[11px]">
                          <span className="text-neutral-text-muted line-through">{String(change.previousValue)}</span>
                          <ArrowRight className="w-3 h-3 text-slate-400" />
                          <span className="text-primary font-bold">{String(change.requestedValue)}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {req.reason && (
                    <p className="text-[11px] text-neutral-text-muted italic">
                      "Reason: {req.reason}"
                    </p>
                  )}

                  {req.status === 'REJECTED' && req.rejectionReason && (
                    <div className="p-2 bg-rose-50 border border-rose-200 rounded text-[11px] text-rose-700">
                      <strong>Decline Reason:</strong> {req.rejectionReason}
                    </div>
                  )}

                  {req.reviewedByName && (
                    <p className="text-[10px] text-neutral-text-muted text-right">
                      Reviewed by {req.reviewedByName} on {formatDate(req.reviewedAt || '')}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="pt-2 border-t border-neutral-border flex justify-end">
            <Button variant="outline" size="sm" onClick={() => setIsHistoryModalOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
