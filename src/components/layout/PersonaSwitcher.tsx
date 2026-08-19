import React from 'react';
import { db } from '@/lib/db';
import { User, ID } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Users, ShieldCheck, Briefcase, UserCheck } from 'lucide-react';

export function PersonaSwitcher({
  currentUser,
  onUserChange,
}: {
  currentUser: User;
  onUserChange: (userId: ID) => void;
}) {
  const users = db.getUsers();

  const getRoleIcon = (roleType: string) => {
    switch (roleType) {
      case 'HR_ADMIN':
        return <ShieldCheck className="w-3.5 h-3.5 text-primary" />;
      case 'DEPT_MANAGER':
        return <Briefcase className="w-3.5 h-3.5 text-warning" />;
      default:
        return <UserCheck className="w-3.5 h-3.5 text-success" />;
    }
  };

  return (
    <div className="bg-slate-900 text-white text-xs px-3 py-1.5 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800">
      <div className="flex items-center gap-2 font-medium">
        <Users className="w-4 h-4 text-primary-soft shrink-0" />
        <span className="text-slate-300">Live Persona Testing:</span>
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        {users.map(u => {
          const isSelected = u.id === currentUser.id;
          return (
            <button
              key={u.id}
              onClick={() => onUserChange(u.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all font-medium ${
                isSelected
                  ? 'bg-primary text-white shadow-sm ring-1 ring-white/20'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {getRoleIcon(u.roleType)}
              <span>{u.displayName}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded ${isSelected ? 'bg-primary-hover text-white' : 'bg-slate-900 text-slate-400'}`}>
                {u.roleName}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
