import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { db } from '@/lib/db';
import { User, NotificationItem, NotificationIncident } from '@/types';
import { formatDateTime } from '@/lib/utils';
import {
  Bell,
  AlertTriangle,
  CheckCircle2,
  Mail,
  Smartphone,
  ShieldAlert,
  Send,
  RefreshCw,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

export function NotificationsView() {
  const { currentUser } = useOutletContext<{ currentUser: User }>();
  const [activeTab, setActiveTab] = useState('inbox');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [incidents, setIncidents] = useState<NotificationIncident[]>([]);

  const loadData = () => {
    setNotifications(db.getNotifications(currentUser.id));
    setIncidents(db.getIncidents());
  };

  useEffect(() => {
    loadData();
    const unsub = db.subscribe(loadData);
    return () => unsub();
  }, [currentUser]);

  const handleMarkAllRead = () => {
    db.markAllNotificationsAsRead(currentUser.id);
  };

  const handleTestDispatch = () => {
    db.getNotifications().unshift({
      id: `notif_test_${Date.now()}`,
      organizationId: 'org_acme',
      recipientUserId: currentUser.id,
      title: 'Automated SLA & Incident Drill Notification',
      message: 'Multi-channel provider failover test completed with zero packet drop.',
      channel: 'IN_APP',
      priority: 'HIGH',
      module: 'INCIDENT',
      isRead: false,
      status: 'SENT',
      createdAt: new Date().toISOString(),
    });
    loadData();
  };

  const tabs = [
    { id: 'inbox', label: 'My Notifications', count: notifications.filter(n => !n.isRead).length, icon: <Bell className="w-4 h-4" /> },
    { id: 'admin', label: 'Provider Health & Incidents', icon: <ShieldAlert className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-neutral-text-primary tracking-tight">
            Notification Center & Event Routing
          </h2>
          <p className="text-xs sm:text-sm text-neutral-text-muted mt-1">
            Multi-channel dispatch pipeline (In-App, Email, SMS) with failover and SEV incident handling.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleTestDispatch}>
            <Send className="w-4 h-4" /> Send Test Broadcast
          </Button>
          <Button variant="primary" size="sm" onClick={handleMarkAllRead}>
            <CheckCircle2 className="w-4 h-4" /> Mark All as Read
          </Button>
        </div>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab 1: Inbox */}
      {activeTab === 'inbox' && (
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="text-base">Notification History</CardTitle>
            <CardDescription>Activity updates, approvals, time clock alerts, and payslips</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-neutral-border/60">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-xs text-neutral-text-muted">
                  No notifications recorded.
                </div>
              ) : (
                notifications.map(n => (
                  <div
                    key={n.id}
                    onClick={() => db.markNotificationAsRead(n.id)}
                    className={`p-4 sm:p-5 flex items-start justify-between gap-4 cursor-pointer transition-colors ${
                      !n.isRead ? 'bg-blue-50/30' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-xl mt-0.5 shrink-0 ${!n.isRead ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600'}`}>
                        <Bell className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className={`text-xs sm:text-sm ${!n.isRead ? 'font-bold text-neutral-text-primary' : 'font-medium text-neutral-text-secondary'}`}>
                            {n.title}
                          </h4>
                          <Badge variant="neutral" size="sm">{n.channel}</Badge>
                        </div>
                        <p className="text-xs text-neutral-text-muted mt-1 leading-relaxed">{n.message}</p>
                        <span className="text-[10px] text-neutral-text-muted mt-1.5 block font-mono">
                          {formatDateTime(n.createdAt)}
                        </span>
                      </div>
                    </div>

                    {!n.isRead && (
                      <span className="w-2.5 h-2.5 rounded-full bg-primary shrink-0 mt-2" />
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab 2: Provider Health & Incidents */}
      {activeTab === 'admin' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-5">
              <span className="text-xs font-semibold text-neutral-text-muted uppercase">In-App WebSocket Channel</span>
              <h4 className="text-lg font-bold text-success mt-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-5 h-5" /> 100% Operational
              </h4>
              <p className="text-[11px] text-neutral-text-muted mt-1">Average Latency: 12ms</p>
            </Card>
            <Card className="p-5">
              <span className="text-xs font-semibold text-neutral-text-muted uppercase">Transactional Email Service</span>
              <h4 className="text-lg font-bold text-success mt-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-5 h-5" /> Active & Verified
              </h4>
              <p className="text-[11px] text-neutral-text-muted mt-1">Provider Failover: Enabled</p>
            </Card>
            <Card className="p-5">
              <span className="text-xs font-semibold text-neutral-text-muted uppercase">Active Incidents</span>
              <h4 className="text-lg font-bold text-neutral-text-primary mt-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-5 h-5 text-success" /> 0 Active (SEV-1/2)
              </h4>
              <p className="text-[11px] text-neutral-text-muted mt-1">All SLA thresholds within target</p>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
