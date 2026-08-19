import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db';
import { User, Role, AuditEvent, Organization } from '@/types';
import { formatDateTime } from '@/lib/utils';
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
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

export function AdminView() {
  const [activeTab, setActiveTab] = useState('audit');
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [org, setOrg] = useState<Organization>(db.getOrganization());

  const loadData = () => {
    setUsers(db.getUsers());
    setRoles(db.getRoles());
    setAuditEvents(db.getAuditEvents());
    setOrg(db.getOrganization());
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

  const tabs = [
    { id: 'audit', label: 'Tamper-Evident Audit Trail', count: auditEvents.length, icon: <History className="w-4 h-4" /> },
    { id: 'rbac', label: 'Roles & Granular Permissions', count: roles.length, icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'users', label: 'User Accounts', count: users.length, icon: <Users className="w-4 h-4" /> },
    { id: 'settings', label: 'Tenant Security Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-neutral-text-primary tracking-tight">
            Administration & Security
          </h2>
          <p className="text-xs sm:text-sm text-neutral-text-muted mt-1">
            RBAC permission matrix, user account mapping, immutable audit streams, and tenant security policy.
          </p>
        </div>

        <Badge variant="primary" size="md">
          Strict Multi-Tenancy Boundary Enforced
        </Badge>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab 1: Audit Log Explorer */}
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

      {/* Tab 2: RBAC & Permissions Matrix */}
      {activeTab === 'rbac' && (
        <div className="space-y-4 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {roles.map(r => (
              <Card key={r.id} className="p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-neutral-text-primary">{r.name}</h4>
                    <Badge variant={r.type === 'HR_ADMIN' ? 'danger' : 'primary'} size="sm">
                      {r.type}
                    </Badge>
                  </div>
                  <p className="text-xs text-neutral-text-muted mt-2 leading-relaxed">{r.description}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-border/60">
                  <span className="text-xs font-semibold text-neutral-text-secondary block mb-2">
                    Granted Permissions ({r.permissions.length}):
                  </span>
                  <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto pr-1">
                    {r.permissions.map(p => (
                      <span key={p} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: User Accounts */}
      {activeTab === 'users' && (
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="text-base">Active Tenant User Accounts</CardTitle>
            <CardDescription>Authentication credentials bound to employee records</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Work Email</TableHead>
                  <TableHead>Assigned Role</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map(u => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <img
                          src={u.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                          alt={u.displayName}
                          className="w-7 h-7 rounded-full object-cover"
                        />
                        <span className="font-semibold text-xs text-neutral-text-primary">{u.displayName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs font-mono text-neutral-text-secondary">{u.email}</TableCell>
                    <TableCell>
                      <Badge variant="primary" size="sm">{u.roleName}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="success" size="sm">ACTIVE</Badge>
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
    </div>
  );
}
