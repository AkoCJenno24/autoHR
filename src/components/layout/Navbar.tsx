import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { db } from '@/lib/db';
import { User, NotificationItem } from '@/types';
import { formatTime, formatDateTime } from '@/lib/utils';
import {
  Menu,
  Search,
  Bell,
  Clock,
  LogOut,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
  User as UserIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link, useNavigate } from 'react-router-dom';

interface NavbarProps {
  currentUser: User;
  onOpenSearch: () => void;
  onToggleMobileMenu: () => void;
}

export function Navbar({ currentUser, onOpenSearch, onToggleMobileMenu }: NavbarProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [clockStatus, setClockStatus] = useState<'CLOCKED_IN' | 'CLOCKED_OUT'>('CLOCKED_OUT');
  const [clockTime, setClockTime] = useState<string | null>(null);

  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const update = () => {
      const userNotifs = db.getNotifications(currentUser.id);
      setNotifications(userNotifs);

      const today = new Date().toISOString().split('T')[0];
      const rec = db.getClockRecords().find(c => c.employeeId === currentUser.employeeId && c.date === today);
      if (rec && rec.clockInTime && !rec.clockOutTime) {
        setClockStatus('CLOCKED_IN');
        setClockTime(rec.clockInTime);
      } else {
        setClockStatus('CLOCKED_OUT');
        setClockTime(null);
      }
    };
    update();
    const unsub = db.subscribe(update);
    return () => unsub();
  }, [currentUser]);

  // Click outside listener for dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleQuickClock = () => {
    if (clockStatus === 'CLOCKED_OUT') {
      db.clockIn(currentUser.employeeId);
    } else {
      db.clockOut(currentUser.employeeId);
    }
  };

  const handleLogout = async () => {
    setShowUserMenu(false);
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-neutral-border h-16 flex items-center justify-between px-3 sm:px-6">
      {/* Left: Mobile Hamburger & Search */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {/* Hamburger on Mobile */}
        <button
          onClick={onToggleMobileMenu}
          className="md:hidden p-2 text-neutral-text-muted hover:text-neutral-text-primary rounded-xl hover:bg-neutral-bg transition-colors shrink-0"
          title="Toggle navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-text-muted bg-neutral-bg hover:bg-neutral-border/40 rounded-xl border border-neutral-border transition-colors w-36 sm:w-60 md:w-72"
        >
          <Search className="w-4 h-4 shrink-0" />
          <span className="truncate text-xs">Search…</span>
          <kbd className="hidden sm:inline-block ml-auto text-[10px] bg-white px-1.5 py-0.5 rounded-md border border-neutral-border font-mono text-neutral-text-muted">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right: Clock, Notifications, User */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* Quick Clock */}
        <button
          onClick={handleQuickClock}
          className={`hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
            clockStatus === 'CLOCKED_IN'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
              : 'bg-neutral-bg text-neutral-text-secondary border-neutral-border hover:bg-neutral-border/50'
          }`}
        >
          <Clock className={`w-3.5 h-3.5 ${clockStatus === 'CLOCKED_IN' ? 'text-success' : 'text-neutral-text-muted'}`} />
          <span>{clockStatus === 'CLOCKED_IN' ? `In since ${formatTime(clockTime || undefined)}` : 'Clock in'}</span>
        </button>

        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-neutral-text-muted hover:text-neutral-text-primary rounded-xl hover:bg-neutral-bg transition-colors"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-danger text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] max-w-sm sm:w-96 bg-white rounded-2xl shadow-dropdown border border-neutral-border overflow-hidden z-50 animate-fade-in">
              <div className="p-4 border-b border-neutral-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-neutral-text-primary">Notifications</h4>
                  {unreadCount > 0 && <Badge variant="primary" size="sm">{unreadCount} new</Badge>}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={() => db.markAllNotificationsAsRead(currentUser.id)}
                    className="text-xs text-primary hover:underline font-medium"
                  >
                    Clear all
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-neutral-border/50">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-xs text-neutral-text-muted">
                    <CheckCircle2 className="w-6 h-6 text-success mx-auto mb-2 opacity-60" />
                    You're all caught up.
                  </div>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      onClick={() => db.markNotificationAsRead(n.id)}
                      className={`p-4 hover:bg-neutral-bg transition-colors cursor-pointer ${
                        !n.isRead ? 'bg-primary-soft/30' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-xs ${!n.isRead ? 'font-semibold text-neutral-text-primary' : 'text-neutral-text-secondary'}`}>
                          {n.title}
                        </p>
                        {!n.isRead && <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1" />}
                      </div>
                      <p className="text-[11px] text-neutral-text-muted mt-1 leading-relaxed line-clamp-2">{n.message}</p>
                      <span className="text-[10px] text-neutral-text-muted mt-1.5 block">
                        {formatDateTime(n.createdAt)}
                      </span>
                    </div>
                  ))
                )}
              </div>

              <div className="p-3 border-t border-neutral-border text-center">
                <Link
                  to="/notifications"
                  onClick={() => setShowNotifications(false)}
                  className="text-xs text-primary font-medium hover:underline inline-flex items-center gap-1"
                >
                  View all <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="relative pl-1 sm:pl-2 border-l border-neutral-border/60" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1 rounded-xl hover:bg-neutral-bg transition-colors text-left"
          >
            <img
              src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
              alt={currentUser.displayName}
              className="w-8 h-8 rounded-full object-cover border border-neutral-border"
            />
            <div className="hidden lg:block">
              <p className="text-xs font-semibold text-neutral-text-primary leading-none truncate max-w-[120px]">
                {currentUser.displayName}
              </p>
              <p className="text-[10px] text-neutral-text-muted mt-0.5 truncate max-w-[120px]">
                {currentUser.roleName}
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-neutral-text-muted hidden sm:block" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-dropdown border border-neutral-border overflow-hidden z-50 animate-fade-in p-1.5 space-y-0.5">
              <div className="px-3 py-2.5 rounded-xl bg-neutral-bg space-y-0.5 mb-1">
                <p className="text-xs font-bold text-neutral-text-primary truncate">{currentUser.displayName}</p>
                <p className="text-[11px] text-neutral-text-muted truncate">{currentUser.email}</p>
                <Badge variant="primary" size="sm" className="mt-1">{currentUser.roleName}</Badge>
              </div>

              <Link
                to={`/employees/${currentUser.employeeId}`}
                onClick={() => setShowUserMenu(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-xs text-neutral-text-secondary hover:text-neutral-text-primary hover:bg-neutral-bg rounded-xl transition-colors"
              >
                <UserIcon className="w-4 h-4 text-neutral-text-muted" />
                <span>My profile</span>
              </Link>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-danger hover:bg-danger-soft rounded-xl transition-colors font-medium text-left"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
