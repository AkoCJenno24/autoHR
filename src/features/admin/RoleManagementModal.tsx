import React, { useState, useEffect } from 'react';
import { Role, AppModule, Permission, SystemRoleType } from '@/types';
import { db } from '@/lib/db';
import { APP_MODULE_DEFINITIONS, SYSTEM_ROLE_PERMISSIONS } from '@/lib/permissions/rbac';
import { ShieldCheck, Plus, CheckCircle2, Save, Trash2 } from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';

interface RoleManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  roleToEdit?: Role | null;
  onSaved?: (role: Role) => void;
}

const ALL_PERMISSIONS: { key: Permission; label: string; group: string }[] = [
  // Company & Admin
  { key: 'company.manage', label: 'Manage Company Profile & Settings', group: 'Company' },
  { key: 'admin.manage_users', label: 'Manage User Accounts & Access', group: 'Admin' },
  { key: 'admin.manage_roles', label: 'Manage RBAC Roles & Permissions', group: 'Admin' },
  { key: 'admin.manage_settings', label: 'Configure Tenant Security Policies', group: 'Admin' },
  { key: 'admin.view_audit', label: 'View Immutable Security Audit Logs', group: 'Admin' },

  // Employee
  { key: 'employee.read', label: 'View Employee Directory & Profiles', group: 'Employee' },
  { key: 'employee.create', label: 'Create New Employee Records', group: 'Employee' },
  { key: 'employee.update', label: 'Update Employee Records & Compensation', group: 'Employee' },
  { key: 'employee.archive', label: 'Archive / Terminate Employee Records', group: 'Employee' },

  // Attendance
  { key: 'attendance.read', label: 'View Attendance Logs & Timesheets', group: 'Attendance' },
  { key: 'attendance.clock', label: 'Record Self Timeclock Punches', group: 'Attendance' },
  { key: 'attendance.correct', label: 'Request / File Attendance Corrections', group: 'Attendance' },
  { key: 'attendance.approve', label: 'Approve Team Timesheets & Time Edits', group: 'Attendance' },

  // Leave
  { key: 'leave.read', label: 'View Leave Balances & History', group: 'Leave' },
  { key: 'leave.create', label: 'File Leave & Time Off Requests', group: 'Leave' },
  { key: 'leave.approve', label: 'Approve Leave Applications', group: 'Leave' },
  { key: 'leave.reject', label: 'Reject Leave Applications', group: 'Leave' },
  { key: 'leave.manage_policies', label: 'Configure Leave Types & Allocations', group: 'Leave' },

  // Payroll
  { key: 'payroll.read', label: 'View Personal Payslips', group: 'Payroll' },
  { key: 'payroll.view_all_payslips', label: 'View All Organization Payslips', group: 'Payroll' },
  { key: 'payroll.process', label: 'Compute & Run Payroll Calculation', group: 'Payroll' },
  { key: 'payroll.approve', label: 'Approve Staged Payroll Runs', group: 'Payroll' },
  { key: 'payroll.finalize', label: 'Finalize & Lock Payroll Cycles', group: 'Payroll' },

  // Documents
  { key: 'documents.read', label: 'Access Documents & 201 Files', group: 'Documents' },
  { key: 'documents.upload', label: 'Upload Documents & Contracts', group: 'Documents' },
  { key: 'documents.delete', label: 'Delete Document Records', group: 'Documents' },

  // Workflows & Tasks
  { key: 'workflow.view', label: 'View Workflows & Approvals', group: 'Workflows' },
  { key: 'workflow.manage', label: 'Configure Approval Routing Definitions', group: 'Workflows' },
  { key: 'workflow.approve', label: 'Approve / Reject Routing Steps', group: 'Workflows' },
  { key: 'tasks.manage', label: 'Assign & Reassign Human Tasks', group: 'Workflows' },

  // Reports
  { key: 'reports.view', label: 'View Reports & Business Intelligence', group: 'Reports' },
  { key: 'reports.export', label: 'Export CSV / PDF Compliance Reports', group: 'Reports' },
];

export function RoleManagementModal({
  isOpen,
  onClose,
  roleToEdit,
  onSaved,
}: RoleManagementModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedModules, setSelectedModules] = useState<AppModule[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<Permission[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (roleToEdit) {
      setName(roleToEdit.name);
      setDescription(roleToEdit.description || '');
      setSelectedModules(roleToEdit.allowedModules || ['dashboard', 'attendance', 'leave']);
      setSelectedPermissions(roleToEdit.permissions || []);
    } else {
      setName('');
      setDescription('');
      setSelectedModules(['dashboard', 'tasks', 'attendance', 'leave', 'documents']);
      setSelectedPermissions(['employee.read', 'attendance.clock', 'leave.create', 'documents.read', 'workflow.view']);
    }
    setErrorMsg(null);
  }, [roleToEdit, isOpen]);

  const handleToggleModule = (modId: AppModule) => {
    setSelectedModules(prev =>
      prev.includes(modId) ? prev.filter(m => m !== modId) : [...prev, modId]
    );
  };

  const handleTogglePermission = (perm: Permission) => {
    setSelectedPermissions(prev =>
      prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]
    );
  };

  const handleSave = () => {
    if (!name.trim()) {
      setErrorMsg('Please enter a role name.');
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);

    let savedRole: Role;
    if (roleToEdit) {
      const updated = db.updateRole(roleToEdit.id, {
        name: name.trim(),
        description: description.trim(),
        allowedModules: selectedModules,
        permissions: selectedPermissions,
      });
      savedRole = updated || roleToEdit;
    } else {
      savedRole = db.createRole({
        name: name.trim(),
        type: 'CUSTOM',
        description: description.trim() || 'Custom Organization Role',
        isSystem: false,
        allowedModules: selectedModules,
        permissions: selectedPermissions,
      });
    }

    setTimeout(() => {
      setIsSaving(false);
      if (onSaved) onSaved(savedRole);
      onClose();
    }, 300);
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} maxWidth="2xl">
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-border">
          <div>
            <h3 className="text-base font-bold text-neutral-text-primary flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              {roleToEdit ? `Edit Role: ${roleToEdit.name}` : 'Create Custom Role'}
            </h3>
            <p className="text-xs text-neutral-text-muted mt-0.5">
              Define role title, accessible application modules, and granular system permissions.
            </p>
          </div>
          {roleToEdit?.isSystem && (
            <Badge variant="primary" size="sm">System Built-in</Badge>
          )}
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600">
            {errorMsg}
          </div>
        )}

        {/* Inputs */}
        <div className="grid grid-cols-1 gap-3">
          <Input
            label="Role Name"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Branch Supervisor / Payroll Auditor"
            disabled={roleToEdit?.isSystem}
          />
          <Input
            label="Description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Summary of responsibilities and access scope"
          />
        </div>

        {/* Module Access Checkboxes */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-neutral-text-primary uppercase tracking-wider">
              Default Accessible Modules ({selectedModules.length} of {APP_MODULE_DEFINITIONS.length})
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSelectedModules(APP_MODULE_DEFINITIONS.map(m => m.id))}
                className="text-[11px] text-primary hover:underline font-semibold"
              >
                Select All
              </button>
              <span className="text-slate-300">·</span>
              <button
                type="button"
                onClick={() => setSelectedModules(['dashboard'])}
                className="text-[11px] text-neutral-text-muted hover:underline"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto p-1 bg-slate-50 rounded-xl border border-neutral-border">
            {APP_MODULE_DEFINITIONS.map(mod => (
              <label
                key={mod.id}
                className="flex items-center gap-2 p-2 rounded-lg bg-white border border-neutral-border/60 hover:border-primary/40 cursor-pointer text-xs transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedModules.includes(mod.id)}
                  onChange={() => handleToggleModule(mod.id)}
                  className="rounded text-primary focus:ring-primary h-3.5 w-3.5"
                />
                <span className="truncate font-medium text-neutral-text-primary">{mod.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Granular Permissions Checkboxes */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-neutral-text-primary uppercase tracking-wider">
              Granular System Permissions ({selectedPermissions.length} of {ALL_PERMISSIONS.length})
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSelectedPermissions(ALL_PERMISSIONS.map(p => p.key))}
                className="text-[11px] text-primary hover:underline font-semibold"
              >
                Select All
              </button>
              <span className="text-slate-300">·</span>
              <button
                type="button"
                onClick={() => setSelectedPermissions([])}
                className="text-[11px] text-neutral-text-muted hover:underline"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-neutral-border">
            {ALL_PERMISSIONS.map(perm => (
              <label
                key={perm.key}
                className="flex items-start gap-2 p-2 rounded-lg bg-white border border-neutral-border/60 hover:border-primary/40 cursor-pointer text-xs transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedPermissions.includes(perm.key)}
                  onChange={() => handleTogglePermission(perm.key)}
                  className="rounded text-primary focus:ring-primary h-3.5 w-3.5 mt-0.5"
                />
                <div className="min-w-0">
                  <span className="font-semibold text-neutral-text-primary block leading-tight">
                    {perm.label}
                  </span>
                  <span className="text-[10px] font-mono text-neutral-text-muted">{perm.key}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="pt-3 border-t border-neutral-border flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleSave} isLoading={isSaving} className="gap-1.5">
            <Save className="w-3.5 h-3.5" /> Save Role
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
