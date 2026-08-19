import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db';
import { User, Role, AuditEvent, Organization, ProfileFieldKey, FieldEditPolicy, ProfileFieldPolicyConfig } from '@/types';
import { formatDateTime } from '@/lib/utils';
import { isSuperUser, getUserAllowedModules, APP_MODULE_DEFINITIONS } from '@/lib/permissions/rbac';
import {
  Settings,
  ShieldCheck,
  Users,
  History,
  Sliders,
  Lock,
  CheckCircle2,
  AlertCircle,
  Building2,
  KeyRound,
  Plus,
  Edit2,
  Layers,
  UserCheck,
  Clock,
  Sparkles,
  Save,
  Check,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { UserAccessModal } from './UserAccessModal';
import { RoleManagementModal } from './RoleManagementModal';

export function AdminView() {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [org, setOrg] = useState<Organization>(db.getOrganization());
  const [selectedUserForAccess, setSelectedUserForAccess] = useState<User | null>(null);
  const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);
  const [selectedRoleForEdit, setSelectedRoleForEdit] = useState<Role | null>(null);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

  // Field Policies State
  const [fieldPolicies, setFieldPolicies] = useState<ProfileFieldPolicyConfig>(() => {
    const o = db.getOrganization();
    return {
      phone: 'DIRECT_EDIT',
      personalEmail: 'DIRECT_EDIT',
      address: 'DIRECT_EDIT',
      emergencyContactName: 'DIRECT_EDIT',
      emergencyContactPhone: 'DIRECT_EDIT',
      emergencyContactRelationship: 'DIRECT_EDIT',
      avatarUrl: 'DIRECT_EDIT',
      maritalStatus: 'APPROVAL_REQUIRED',
      tinNumber: 'APPROVAL_REQUIRED',
      sssNumber: 'APPROVAL_REQUIRED',
      philHealthNumber: 'APPROVAL_REQUIRED',
      pagIbigNumber: 'APPROVAL_REQUIRED',
      bankName: 'APPROVAL_REQUIRED',
      bankAccountNumber: 'APPROVAL_REQUIRED',
      bankAccountName: 'APPROVAL_REQUIRED',
      ...(o.settings.profileFieldPolicies || {}),
    };
  });
  const [isSavingPolicies, setIsSavingPolicies] = useState(false);
  const [policySavedToast, setPolicySavedToast] = useState(false);

  const [profileData, setProfileData] = useState({
    name: db.getOrganization().name,
    logoUrl: db.getOrganization().logoUrl || '',
    address: db.getOrganization().address || '',
  });

  const loadData = () => {
    setUsers(db.getUsers());
    setRoles(db.getRoles());
    setAuditEvents(db.getAuditEvents());
    const currentOrg = db.getOrganization();
    setOrg(currentOrg);
    setProfileData({
      name: currentOrg.name,
      logoUrl: currentOrg.logoUrl || '',
      address: currentOrg.address || '',
    });
  };

  useEffect(() => {
    loadData();
    const unsub = db.subscribe(loadData);
    return () => unsub();
  }, []);

  const handleSettingToggle = (key: keyof Organization['settings']) => {
    db.updateOrganizationSettings({
      [key]: !org.settings[key],
    });
    setOrg(db.getOrganization());
  };

  const handleFieldPolicyChange = (field: ProfileFieldKey, policy: FieldEditPolicy) => {
    setFieldPolicies(prev => ({
      ...prev,
      [field]: policy,
    }));
  };

  const handleSavePolicies = () => {
    setIsSavingPolicies(true);
    db.updateGlobalFieldPolicies(fieldPolicies);
    setTimeout(() => {
      setIsSavingPolicies(false);
      setPolicySavedToast(true);
      setTimeout(() => setPolicySavedToast(false), 3000);
    }, 400);
  };

  const applyPolicyPreset = (preset: 'strict' | 'balanced' | 'open') => {
    if (preset === 'strict') {
      const allApproval: any = {};
      Object.keys(fieldPolicies).forEach(k => {
        allApproval[k] = 'APPROVAL_REQUIRED';
      });
      setFieldPolicies(allApproval);
    } else if (preset === 'balanced') {
      setFieldPolicies({
        phone: 'DIRECT_EDIT',
        personalEmail: 'DIRECT_EDIT',
        address: 'DIRECT_EDIT',
        emergencyContactName: 'DIRECT_EDIT',
        emergencyContactPhone: 'DIRECT_EDIT',
        emergencyContactRelationship: 'DIRECT_EDIT',
        avatarUrl: 'DIRECT_EDIT',
        maritalStatus: 'APPROVAL_REQUIRED',
        tinNumber: 'APPROVAL_REQUIRED',
        sssNumber: 'APPROVAL_REQUIRED',
        philHealthNumber: 'APPROVAL_REQUIRED',
        pagIbigNumber: 'APPROVAL_REQUIRED',
        bankName: 'APPROVAL_REQUIRED',
        bankAccountNumber: 'APPROVAL_REQUIRED',
        bankAccountName: 'APPROVAL_REQUIRED',
      });
    } else if (preset === 'open') {
      const allDirect: any = {};
      Object.keys(fieldPolicies).forEach(k => {
        allDirect[k] = 'DIRECT_EDIT';
      });
      setFieldPolicies(allDirect);
    }
  };

  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  const handleProfileSave = () => {
    setIsSavingProfile(true);
    db.updateOrganizationProfile({
      name: profileData.name,
      logoUrl: profileData.logoUrl,
      address: profileData.address,
    });
    setOrg(db.getOrganization());
    
    setTimeout(() => {
      setIsSavingProfile(false);
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    }, 400);
  };

  const handleOpenAccessModal = (user: User) => {
    setSelectedUserForAccess(user);
    setIsAccessModalOpen(true);
  };

  const handleCreateRole = () => {
    setSelectedRoleForEdit(null);
    setIsRoleModalOpen(true);
  };

  const handleEditRole = (role: Role) => {
    setSelectedRoleForEdit(role);
    setIsRoleModalOpen(true);
  };

  const tabs = [
    { id: 'users', label: 'User Accounts & Access', count: users.length, icon: <Users className="w-4 h-4" /> },
    { id: 'rbac', label: 'Roles & Granular Permissions', count: roles.length, icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'policies', label: 'Profile Field Edit Policies', icon: <Sliders className="w-4 h-4" /> },
    { id: 'audit', label: 'Tamper-Evident Audit Trail', count: auditEvents.length, icon: <History className="w-4 h-4" /> },
    { id: 'profile', label: 'Company Profile', icon: <Building2 className="w-4 h-4" /> },
    { id: 'settings', label: 'Tenant Security Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-neutral-text-primary tracking-tight">
            Administration & Access Control
          </h2>
          <p className="text-xs sm:text-sm text-neutral-text-muted mt-1">
            Manage employee access, configure module visibility per user/role, and inspect audit logs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="primary" size="md">
            Superuser Control Active
          </Badge>
        </div>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab 1: User Accounts & Module Access */}
      {activeTab === 'users' && (
        <Card className="animate-fade-in">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <CardTitle className="text-base">Employee Accounts & Module Permissions</CardTitle>
                <CardDescription>
                  Configure assigned roles, toggle active status, and customize which parts of the app each employee can access.
                </CardDescription>
              </div>
              <Badge variant="neutral" size="sm">
                {users.length} Active Profiles
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User / Employee</TableHead>
                  <TableHead>Work Email</TableHead>
                  <TableHead>Assigned Role</TableHead>
                  <TableHead>Accessible Modules</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map(u => {
                  const allowed = getUserAllowedModules(u, roles);
                  const isAll = allowed.length === APP_MODULE_DEFINITIONS.length;
                  return (
                    <TableRow key={u.id} className="hover:bg-slate-50/70 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <img
                            src={u.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                            alt={u.displayName}
                            className="w-8 h-8 rounded-full object-cover border border-neutral-border"
                          />
                          <div>
                            <span className="font-semibold text-xs text-neutral-text-primary block">
                              {u.displayName}
                            </span>
                            <span className="text-[10px] text-neutral-text-muted font-mono">
                              ID: {u.employeeId}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs font-mono text-neutral-text-secondary">
                        {u.email}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            u.roleType === 'OWNER' || u.roleType === 'SUPER_ADMIN'
                              ? 'primary'
                              : u.roleType === 'HR_ADMIN'
                              ? 'danger'
                              : u.roleType === 'DEPT_MANAGER'
                              ? 'warning'
                              : 'neutral'
                          }
                          size="sm"
                        >
                          {u.roleName}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <Badge variant={isAll ? 'success' : 'info'} size="sm">
                            <Layers className="w-3 h-3 mr-1" />
                            {isAll ? 'All Modules (12)' : `${allowed.length} / 12 Modules`}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={u.isActive ? 'success' : 'danger'} size="sm">
                          {u.isActive ? 'ACTIVE' : 'SUSPENDED'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenAccessModal(u)}
                          className="text-xs gap-1.5 h-8 font-medium hover:bg-primary/5 hover:text-primary hover:border-primary/40"
                        >
                          <KeyRound className="w-3.5 h-3.5 text-primary" />
                          Manage Access
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Tab 2: RBAC & Granular Permissions */}
      {activeTab === 'rbac' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-neutral-text-primary">System & Custom Roles</h3>
              <p className="text-xs text-neutral-text-muted">
                Predefined role templates and custom access profiles.
              </p>
            </div>
            <Button variant="primary" size="sm" onClick={handleCreateRole} className="gap-1.5">
              <Plus className="w-4 h-4" /> Create Custom Role
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {roles.map(r => (
              <Card
                key={r.id}
                className="p-5 flex flex-col justify-between hover:shadow-card-hover transition-all duration-200"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-neutral-text-primary">{r.name}</h4>
                    <Badge variant={r.type === 'HR_ADMIN' ? 'danger' : r.type === 'CUSTOM' ? 'info' : 'primary'} size="sm">
                      {r.type}
                    </Badge>
                  </div>
                  <p className="text-xs text-neutral-text-muted mt-2 leading-relaxed">{r.description}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-border/60 space-y-3">
                  <div>
                    <span className="text-[11px] font-semibold text-neutral-text-secondary block mb-1">
                      Granted Permissions ({r.permissions.length}):
                    </span>
                    <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-1">
                      {r.permissions.map(p => (
                        <span key={p} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-end pt-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditRole(r)}
                      className="text-xs h-7 text-primary hover:bg-primary/10 gap-1"
                    >
                      <Edit2 className="w-3 h-3" /> Edit Role & Modules
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Profile Field Policies */}
      {activeTab === 'policies' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-neutral-border shadow-card">
            <div>
              <h3 className="text-base font-bold text-neutral-text-primary flex items-center gap-2">
                <Sliders className="w-5 h-5 text-primary" /> Employee Profile Field-Level Editing Policies
              </h3>
              <p className="text-xs text-neutral-text-muted mt-1">
                Configure whether employee edits take effect immediately, stage an approval task for HR review, or remain strictly locked.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => applyPolicyPreset('strict')}
                  className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-white hover:shadow-xs rounded-lg transition-all"
                  title="All fields require HR approval"
                >
                  Strict Preset
                </button>
                <button
                  onClick={() => applyPolicyPreset('balanced')}
                  className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-white hover:shadow-xs rounded-lg transition-all"
                  title="Contact info direct, statutory & bank require approval"
                >
                  Balanced HR
                </button>
                <button
                  onClick={() => applyPolicyPreset('open')}
                  className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-white hover:shadow-xs rounded-lg transition-all"
                  title="All fields allow direct editing"
                >
                  Open Self-Service
                </button>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={handleSavePolicies}
                isLoading={isSavingPolicies}
                className="gap-1.5 shadow-sm"
              >
                <Save className="w-3.5 h-3.5" /> Save Policies
              </Button>
            </div>
          </div>

          {policySavedToast && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Employee profile field policies saved and applied across all employee profiles!</span>
            </div>
          )}

          <div className="grid grid-cols-1 gap-5">
            {[
              {
                category: 'contact',
                title: 'Contact Details',
                description: 'Personal communication and residential address details',
                fields: [
                  { key: 'phone' as ProfileFieldKey, label: 'Mobile Phone Number', help: 'Primary contact phone used for SMS & login notifications' },
                  { key: 'personalEmail' as ProfileFieldKey, label: 'Personal Email Address', help: 'Secondary personal contact email' },
                  { key: 'address' as ProfileFieldKey, label: 'Residential Address', help: 'Physical home address and province' },
                ],
              },
              {
                category: 'emergency',
                title: 'Emergency Contacts',
                description: 'Next of kin designated for emergency incident outreach',
                fields: [
                  { key: 'emergencyContactName' as ProfileFieldKey, label: 'Emergency Contact Person', help: 'Full legal name of emergency contact' },
                  { key: 'emergencyContactRelationship' as ProfileFieldKey, label: 'Relationship', help: 'e.g. Spouse / Parent / Sibling' },
                  { key: 'emergencyContactPhone' as ProfileFieldKey, label: 'Emergency Contact Phone', help: 'Direct contact phone number' },
                ],
              },
              {
                category: 'personal',
                title: 'Personal Information & Avatar',
                description: 'Demographic status and visual avatar',
                fields: [
                  { key: 'maritalStatus' as ProfileFieldKey, label: 'Civil / Marital Status', help: 'Civil registration: Single / Married / Widowed' },
                  { key: 'avatarUrl' as ProfileFieldKey, label: 'Profile Picture / Avatar', help: 'User display avatar photo' },
                ],
              },
              {
                category: 'statutory',
                title: 'Philippine Statutory & Government IDs',
                description: 'Critical tax withholding and Philippine mandatory benefit numbers',
                fields: [
                  { key: 'tinNumber' as ProfileFieldKey, label: 'BIR Tax Identification (TIN)', help: 'Bureau of Internal Revenue Taxpayer Identification' },
                  { key: 'sssNumber' as ProfileFieldKey, label: 'Social Security System (SSS)', help: 'Philippine SSS member account ID' },
                  { key: 'philHealthNumber' as ProfileFieldKey, label: 'PhilHealth Identification (PIN)', help: 'PhilHealth national health insurance number' },
                  { key: 'pagIbigNumber' as ProfileFieldKey, label: 'Pag-IBIG / HDMF MID', help: 'Home Development Mutual Fund member number' },
                ],
              },
              {
                category: 'bank',
                title: 'Payroll Bank Disbursement Accounts',
                description: 'Depository bank account details for ACH/PESONet payroll credit',
                fields: [
                  { key: 'bankName' as ProfileFieldKey, label: 'Disbursement Bank Name', help: 'Depository financial institution (e.g. BDO, BPI, Metrobank)' },
                  { key: 'bankAccountNumber' as ProfileFieldKey, label: 'Bank Account Number', help: 'Account number for direct salary deposit' },
                  { key: 'bankAccountName' as ProfileFieldKey, label: 'Bank Account Holder Name', help: 'Registered legal account name' },
                ],
              },
            ].map(sec => (
              <Card key={sec.category} className="overflow-hidden">
                <CardHeader className="bg-slate-50/60 pb-3 border-b border-neutral-border/60">
                  <CardTitle className="text-sm font-bold text-neutral-text-primary">
                    {sec.title}
                  </CardTitle>
                  <CardDescription className="text-xs">{sec.description}</CardDescription>
                </CardHeader>
                <CardContent className="p-0 divide-y divide-neutral-border/60">
                  {sec.fields.map(field => {
                    const currentPolicy = fieldPolicies[field.key] || 'READ_ONLY';
                    return (
                      <div
                        key={field.key}
                        className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-50/40 transition-colors"
                      >
                        <div className="space-y-0.5 max-w-lg">
                          <span className="text-xs font-bold text-neutral-text-primary block">
                            {field.label}
                          </span>
                          <span className="text-[11px] text-neutral-text-muted block">
                            {field.help}
                          </span>
                        </div>

                        {/* 3-way toggle button group */}
                        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0 self-start md:self-auto">
                          <button
                            onClick={() => handleFieldPolicyChange(field.key, 'READ_ONLY')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                              currentPolicy === 'READ_ONLY'
                                ? 'bg-white text-slate-800 shadow-xs'
                                : 'text-slate-500 hover:text-slate-800'
                            }`}
                          >
                            <Lock className="w-3 h-3" /> Read Only
                          </button>
                          <button
                            onClick={() => handleFieldPolicyChange(field.key, 'DIRECT_EDIT')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                              currentPolicy === 'DIRECT_EDIT'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'text-slate-500 hover:text-emerald-700'
                            }`}
                          >
                            <CheckCircle2 className="w-3 h-3" /> Direct Edit
                          </button>
                          <button
                            onClick={() => handleFieldPolicyChange(field.key, 'APPROVAL_REQUIRED')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                              currentPolicy === 'APPROVAL_REQUIRED'
                                ? 'bg-amber-500 text-white shadow-xs'
                                : 'text-slate-500 hover:text-amber-700'
                            }`}
                          >
                            <Clock className="w-3 h-3" /> Requires Approval
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Audit Log Explorer */}
      {activeTab === 'audit' && (
        <Card className="animate-fade-in">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Immutable Audit Event Stream</CardTitle>
                <CardDescription>Server-side recorded audit ledger capturing all critical business mutations</CardDescription>
              </div>
              <Badge variant="success" size="sm">Tamper-Evident</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Resource</TableHead>
                  <TableHead>Correlation ID</TableHead>
                  <TableHead className="text-right">Origin</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditEvents.map(evt => (
                  <TableRow key={evt.id}>
                    <TableCell className="font-mono text-xs text-neutral-text-muted whitespace-nowrap">
                      {formatDateTime(evt.timestamp)}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-xs font-semibold text-neutral-text-primary">{evt.actorName}</p>
                        <p className="text-[10px] text-neutral-text-muted">{evt.actorRole}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-bold text-primary font-mono">{evt.action}</span>
                    </TableCell>
                    <TableCell className="text-xs text-neutral-text-secondary">
                      {evt.resourceType} ({evt.resourceId})
                    </TableCell>
                    <TableCell className="font-mono text-[11px] text-neutral-text-muted">
                      {evt.correlationId}
                    </TableCell>
                    <TableCell className="text-right text-[11px] text-neutral-text-muted font-mono">
                      {evt.ipAddress || '127.0.0.1'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Tab 4: Tenant Settings */}
      {activeTab === 'settings' && (
        <Card className="animate-fade-in max-w-2xl">
          <CardHeader>
            <CardTitle className="text-base">Tenant Policy & Security Controls</CardTitle>
            <CardDescription>Configurable attendance rules and security parameters for {org.name}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Switch
              label="Allow Employee Self Clock-In"
              description="Permit employees to record punches from their personal web / mobile dashboard."
              checked={org.settings.allowSelfClockIn}
              onChange={() => handleSettingToggle('allowSelfClockIn')}
            />
            <Switch
              label="Enforce Geofence Validation"
              description="Require mobile punch timestamps to verify device GPS coordinates within designated branch radius."
              checked={org.settings.requireGeofence}
              onChange={() => handleSettingToggle('requireGeofence')}
            />
            <Switch
              label="Biometric Verification Policy"
              description="Require WebAuthn / TouchID for privileged payroll finalization and permission edits."
              checked={org.settings.requireBiometrics}
              onChange={() => handleSettingToggle('requireBiometrics')}
            />
          </CardContent>
        </Card>
      )}

      {/* Tab 5: Company Profile */}
      {activeTab === 'profile' && (
        <Card className="animate-fade-in max-w-2xl">
          <CardHeader>
            <CardTitle className="text-base">Company Profile</CardTitle>
            <CardDescription>Update your company's branding and physical address.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Company Name"
              value={profileData.name}
              onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
            />
            <Input
              label="Logo URL"
              value={profileData.logoUrl}
              onChange={(e) => setProfileData({ ...profileData, logoUrl: e.target.value })}
              placeholder="https://example.com/logo.png"
            />
            <Input
              label="Company Address"
              value={profileData.address}
              onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
              placeholder="123 Corporate Ave, Metro Manila"
            />
            <div className="pt-4 flex justify-end items-center gap-3">
              {profileSaved && (
                <span className="text-sm font-medium text-emerald-600 flex items-center gap-1.5 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4" />
                  Saved successfully!
                </span>
              )}
              <Button onClick={handleProfileSave} variant="primary" isLoading={isSavingProfile}>
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* User Access & Module Permissions Management Modal */}
      <UserAccessModal
        isOpen={isAccessModalOpen}
        onClose={() => {
          setIsAccessModalOpen(false);
          setSelectedUserForAccess(null);
        }}
        targetUser={selectedUserForAccess}
        onSaved={loadData}
      />

      {/* Custom Role Creation & Configuration Modal */}
      <RoleManagementModal
        isOpen={isRoleModalOpen}
        onClose={() => {
          setIsRoleModalOpen(false);
          setSelectedRoleForEdit(null);
        }}
        roleToEdit={selectedRoleForEdit}
        onSaved={loadData}
      />
    </div>
  );
}
