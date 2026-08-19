import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth/AuthContext';
import { Permission, SystemRoleType } from '@/types';
import { hasPermission, canAccessModule, getModuleFromPath, getUserAllowedModules } from '@/lib/permissions/rbac';
import { db } from '@/lib/db';
import { ShieldAlert, Lock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: Permission;
  requiredRole?: SystemRoleType;
}

export function ProtectedRoute({
  children,
  requiredPermission,
  requiredRole,
}: ProtectedRouteProps) {
  const { user, loading, isAuthenticated, hasOrg, logout, firebaseUser } = useAuth();
  const location = useLocation();

  // 1. Loading — show spinner
  if (loading) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center p-4"
        style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, #1A1225 0%, #0A0812 100%)' }}
      >
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
          style={{ background: 'linear-gradient(135deg, #5B4CF5 0%, #8B5CF6 100%)' }}
        >
          <svg width="20" height="18" viewBox="0 0 20 18" fill="none">
            <rect x="0" y="0" width="20" height="4" rx="2" fill="white" fillOpacity="0.95"/>
            <rect x="4" y="7" width="12" height="4" rx="2" fill="white" fillOpacity="0.7"/>
            <rect x="8" y="14" width="4" height="4" rx="2" fill="white" fillOpacity="0.45"/>
          </svg>
        </div>
        <div className="mt-4 flex items-center gap-2 text-sm text-slate-400">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          <span>Loading…</span>
        </div>
      </div>
    );
  }

  // 2. Firebase authed but no org → go set up company
  if (firebaseUser && !hasOrg && !user) {
    return <Navigate to="/onboarding" replace />;
  }

  // 3. Not authenticated → go to login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 4. Account suspended
  if (!user.isActive) {
    return (
      <div className="min-h-screen bg-[#0A0812] flex flex-col items-center justify-center p-6 text-center text-white">
        <div className="max-w-md bg-white/5 p-8 rounded-2xl border border-red-500/20 shadow-2xl space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white font-display">Account suspended</h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Your account has been deactivated. Contact your HR admin to restore access.
          </p>
          <Button variant="outline" size="sm" onClick={() => logout()} className="w-full mt-2">
            Sign out
          </Button>
        </div>
      </div>
    );
  }

  const customRoles = db.getRoles();

  // 5. Module-level access protection
  const targetModule = getModuleFromPath(location.pathname);
  if (targetModule && !canAccessModule(user, targetModule, customRoles)) {
    const allowedModules = getUserAllowedModules(user, customRoles);
    const fallbackPath = allowedModules.includes('dashboard')
      ? '/dashboard'
      : allowedModules.length > 0
      ? `/${allowedModules[0]}`
      : '/login';

    // If current path is already fallback, avoid infinite loop
    if (location.pathname !== fallbackPath) {
      return <Navigate to={fallbackPath} replace />;
    }
  }

  // 6. Explicit Permission gate
  if (requiredPermission && !hasPermission(user, requiredPermission, customRoles)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
