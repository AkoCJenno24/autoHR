import React, { useState } from 'react';
import { db } from '@/lib/db';
import { Department, Position, Location, ConfigurableStatus, ConfigurableEmploymentType } from '@/types';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { User, Briefcase, CheckCircle2, ShieldCheck, MapPin, KeyRound, Lock, Eye, EyeOff } from 'lucide-react';
import { createEmployeeInOrg } from '@/lib/firebase/firestore';
import { useAuth } from '@/lib/auth/AuthContext';

export function CreateEmployeeModal({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    middleName: '',
    email: '',
    phone: '',
    employeeNumber: `PH-EMP-${Math.floor(1000 + Math.random() * 9000)}`,
    departmentId: '',
    positionId: '',
    locationId: '',
    managerId: '',
    hireDate: new Date().toISOString().split('T')[0],
    statusId: '',
    employmentTypeId: '',
    baseSalary: 75000,
    salaryRateType: 'MONTHLY' as const,
    bankName: 'BDO Unibank',
    bankAccountNumber: '•••• •••• 1001',
    tinNumber: 'TIN-100-291-884',
    sssNumber: 'SSS-34-8921822-1',
    philHealthNumber: 'PHIC-12-09281928-3',
    pagIbigNumber: 'HDMF-1210-9982-1290',
    giveAppAccess: true,
    roleType: 'EMPLOYEE',
    tempPassword: 'AutoHR2026!PH',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { orgMembership, user: currentUser } = useAuth();

  const departments = db.getDepartments();
  const positions = db.getPositions();
  const locations = db.getLocations();
  const statuses = db.getStatuses();
  const employmentTypes = db.getEmploymentTypes();
  const employees = db.getEmployees();
  const roles = db.getRoles();

  // Set default selects if empty
  React.useEffect(() => {
    if (!formData.departmentId && departments.length) setFormData(d => ({ ...d, departmentId: departments[0].id }));
    if (!formData.positionId && positions.length) setFormData(d => ({ ...d, positionId: positions[0].id }));
    if (!formData.locationId && locations.length) setFormData(d => ({ ...d, locationId: locations[0].id }));
    if (!formData.statusId && statuses.length) setFormData(d => ({ ...d, statusId: statuses[0].id }));
    if (!formData.employmentTypeId && employmentTypes.length) setFormData(d => ({ ...d, employmentTypeId: employmentTypes[0].id }));
  }, [departments, positions, locations, statuses, employmentTypes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const selectedDept = departments.find(d => d.id === formData.departmentId);
      const selectedPos = positions.find(p => p.id === formData.positionId);
      const selectedLoc = locations.find(l => l.id === formData.locationId);
      const selectedStatus = statuses.find(s => s.id === formData.statusId);
      const selectedType = employmentTypes.find(t => t.id === formData.employmentTypeId);
      const selectedMgr = employees.find(m => m.id === formData.managerId);

      const orgId = orgMembership?.orgId || db.getOrganization().id;
      const orgSlug = orgMembership?.orgSlug || db.getOrganization().code.toLowerCase();

      const employeePayload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        middleName: formData.middleName || undefined,
        email: formData.email,
        phone: formData.phone,
        employeeNumber: formData.employeeNumber,
        departmentId: formData.departmentId,
        departmentName: selectedDept ? selectedDept.name : 'Engineering',
        positionId: formData.positionId,
        positionTitle: selectedPos ? selectedPos.title : 'Software Engineer',
        locationId: formData.locationId,
        locationName: selectedLoc ? selectedLoc.name : 'Manila HQ',
        managerId: formData.managerId || undefined,
        managerName: selectedMgr ? `${selectedMgr.firstName} ${selectedMgr.lastName}` : undefined,
        hireDate: formData.hireDate,
        statusId: formData.statusId,
        statusName: selectedStatus ? selectedStatus.name : 'Active',
        employmentTypeId: formData.employmentTypeId,
        employmentTypeName: selectedType ? selectedType.name : 'Regular',
        baseSalary: Number(formData.baseSalary),
        salaryRateType: formData.salaryRateType,
        bankName: formData.bankName,
        bankAccountNumber: formData.bankAccountNumber,
        tinNumber: formData.tinNumber,
        sssNumber: formData.sssNumber,
        philHealthNumber: formData.philHealthNumber,
        pagIbigNumber: formData.pagIbigNumber,
        taxIdentificationNumber: formData.tinNumber,
        avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
      };

      if (formData.giveAppAccess) {
        const selectedRole = roles.find(r => r.type === formData.roleType) || roles.find(r => r.type === 'EMPLOYEE');
        await createEmployeeInOrg({
          orgId,
          orgSlug,
          employee: employeePayload,
          roleId: selectedRole ? selectedRole.id : 'role_employee',
          roleType: formData.roleType,
          roleName: selectedRole ? selectedRole.name : 'Regular Employee',
          tempPassword: formData.tempPassword,
          invitedByUserId: currentUser?.id || 'usr_owner',
        });
      } else {
        db.addEmployee(employeePayload);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Failed to create employee:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Add employee"
      description="Fill in their details and we'll handle the rest."
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step Indicator */}
        <div className="flex items-center justify-between border-b border-neutral-border pb-4">
          <div className="flex items-center gap-2">
            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step === 1 ? 'bg-primary text-white' : 'bg-slate-100 text-neutral-text-muted'}`}>
              1
            </span>
            <span className="text-xs font-semibold text-neutral-text-primary">Personal</span>
          </div>
          <div className="w-8 sm:w-12 h-0.5 bg-neutral-border" />
          <div className="flex items-center gap-2">
            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step === 2 ? 'bg-primary text-white' : 'bg-slate-100 text-neutral-text-muted'}`}>
              2
            </span>
            <span className="text-xs font-semibold text-neutral-text-primary">Role</span>
          </div>
          <div className="w-8 sm:w-12 h-0.5 bg-neutral-border" />
          <div className="flex items-center gap-2">
            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step === 3 ? 'bg-primary text-white' : 'bg-slate-100 text-neutral-text-muted'}`}>
              3
            </span>
            <span className="text-xs font-semibold text-neutral-text-primary">Pay & access</span>
          </div>
        </div>

        {/* Step 1: Personal Details */}
        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="First name"
                required
                value={formData.firstName}
                onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="Juan"
              />
              <Input
                label="Middle name"
                value={formData.middleName}
                onChange={e => setFormData({ ...formData, middleName: e.target.value })}
                placeholder="Protacio"
              />
              <Input
                label="Last name"
                required
                value={formData.lastName}
                onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="dela Cruz"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Email"
                type="email"
                required
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                placeholder="juan.delacruz@company.ph"
              />
              <Input
                label="Phone number"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+63 917 123 4567"
              />
            </div>
            <Input
              label="Employee ID"
              required
              value={formData.employeeNumber}
              onChange={e => setFormData({ ...formData, employeeNumber: e.target.value })}
            />
          </div>
        )}

        {/* Step 2: Employment & Hierarchy */}
        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Department"
                value={formData.departmentId}
                onChange={e => setFormData({ ...formData, departmentId: e.target.value })}
                options={departments.map(d => ({ value: d.id, label: d.name }))}
              />
              <Select
                label="Job title"
                value={formData.positionId}
                onChange={e => setFormData({ ...formData, positionId: e.target.value })}
                options={positions.map(p => ({ value: p.id, label: `${p.title} (${p.code})` }))}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Work location"
                value={formData.locationId}
                onChange={e => setFormData({ ...formData, locationId: e.target.value })}
                options={locations.map(l => ({ value: l.id, label: `${l.name} (${l.city})` }))}
              />
              <Select
                label="Manager"
                value={formData.managerId}
                onChange={e => setFormData({ ...formData, managerId: e.target.value })}
                options={[
                  { value: '', label: 'None' },
                  ...employees.map(m => ({ value: m.id, label: `${m.firstName} ${m.lastName} (${m.positionTitle})` })),
                ]}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Start date"
                type="date"
                required
                value={formData.hireDate}
                onChange={e => setFormData({ ...formData, hireDate: e.target.value })}
              />
              <Select
                label="Status"
                value={formData.statusId}
                onChange={e => setFormData({ ...formData, statusId: e.target.value })}
                options={statuses.map(s => ({ value: s.id, label: s.name }))}
              />
              <Select
                label="Employment type"
                value={formData.employmentTypeId}
                onChange={e => setFormData({ ...formData, employmentTypeId: e.target.value })}
                options={employmentTypes.map(t => ({ value: t.id, label: t.name }))}
              />
            </div>
          </div>
        )}

        {/* Step 3: Compensation & App Login Credentials */}
        {step === 3 && (
          <div className="space-y-4 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Monthly base salary (₱)"
                type="number"
                required
                value={formData.baseSalary}
                onChange={e => setFormData({ ...formData, baseSalary: Number(e.target.value) })}
              />
              <Input
                label="TIN"
                value={formData.tinNumber}
                onChange={e => setFormData({ ...formData, tinNumber: e.target.value })}
                placeholder="TIN-XXX-XXX-XXX"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="SSS number"
                value={formData.sssNumber}
                onChange={e => setFormData({ ...formData, sssNumber: e.target.value })}
                placeholder="SSS-XX-XXXXXXX-X"
              />
              <Input
                label="PhilHealth number"
                value={formData.philHealthNumber}
                onChange={e => setFormData({ ...formData, philHealthNumber: e.target.value })}
                placeholder="PHIC-XX-XXXXXXXX-X"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Pag-IBIG number"
                value={formData.pagIbigNumber}
                onChange={e => setFormData({ ...formData, pagIbigNumber: e.target.value })}
                placeholder="HDMF-XXXX-XXXX-XXXX"
              />
              <Select
                label="Bank"
                value={formData.bankName}
                onChange={e => setFormData({ ...formData, bankName: e.target.value })}
                options={[
                  { value: 'BDO Unibank', label: 'BDO Unibank' },
                  { value: 'Bank of the Philippine Islands (BPI)', label: 'BPI' },
                  { value: 'Metrobank', label: 'Metrobank' },
                  { value: 'UnionBank of the Philippines', label: 'UnionBank' },
                  { value: 'Security Bank', label: 'Security Bank' },
                  { value: 'Land Bank of the Philippines', label: 'Landbank' },
                  { value: 'GCash', label: 'GCash' },
                  { value: 'Maya', label: 'Maya' },
                ]}
              />
              <Input
                label="Account number"
                value={formData.bankAccountNumber}
                onChange={e => setFormData({ ...formData, bankAccountNumber: e.target.value })}
                placeholder="•••• •••• 1001"
              />
            </div>

            {/* Portal Login Credentials Section */}
            <div className="p-4 rounded-xl border border-neutral-border bg-neutral-bg/60 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-primary" />
                  <div>
                    <p className="text-xs font-semibold text-neutral-text-primary">Portal Login Credentials</p>
                    <p className="text-[11px] text-neutral-text-muted">Allow this employee to log in to your company portal</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.giveAppAccess}
                  onChange={e => setFormData({ ...formData, giveAppAccess: e.target.checked })}
                  className="w-4 h-4 text-primary rounded border-neutral-border focus:ring-primary"
                />
              </div>

              {formData.giveAppAccess && (
                <div className="pt-2 border-t border-neutral-border/60 grid grid-cols-1 sm:grid-cols-2 gap-3 animate-fade-in">
                  <Select
                    label="Portal Role"
                    value={formData.roleType}
                    onChange={e => setFormData({ ...formData, roleType: e.target.value })}
                    options={[
                      { value: 'EMPLOYEE', label: 'Regular Employee (Self-Service)' },
                      { value: 'DEPT_MANAGER', label: 'Department Manager' },
                      { value: 'HR_ADMIN', label: 'HR Administrator' },
                    ]}
                  />

                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-neutral-text-secondary">Temporary Password</label>
                    <div className="relative flex items-center">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.tempPassword}
                        onChange={e => setFormData({ ...formData, tempPassword: e.target.value })}
                        placeholder="••••••••••••"
                        className="w-full h-9 px-3 pr-8 text-sm bg-white border border-neutral-border rounded-lg text-neutral-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 text-neutral-text-muted hover:text-neutral-text-primary"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg text-xs border border-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
              <span>We'll automatically set them up with the standard leave policy.</span>
            </div>
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-neutral-border">
          {step > 1 ? (
            <Button type="button" variant="outline" onClick={() => setStep(step - 1)}>
              Back
            </Button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-3">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            {step < 3 ? (
              <Button type="button" variant="primary" onClick={() => setStep(step + 1)}>
                Continue
              </Button>
            ) : (
              <Button type="submit" variant="primary" isLoading={isSubmitting}>
                Add employee
              </Button>
            )}
          </div>
        </div>
      </form>
    </Dialog>
  );
}
