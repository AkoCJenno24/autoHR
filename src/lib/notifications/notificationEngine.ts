import { NotificationItem, NotificationIncident, NotificationChannel, NotificationPriority, ID } from '@/types';
import { generateId } from '@/lib/utils';

export function createNotification(params: {
  organizationId: ID;
  recipientUserId: ID;
  recipientEmail?: string;
  title: string;
  message: string;
  channel?: NotificationChannel;
  priority?: NotificationPriority;
  module?: string;
  link?: string;
}): NotificationItem {
  return {
    id: generateId('notif'),
    organizationId: params.organizationId,
    recipientUserId: params.recipientUserId,
    recipientEmail: params.recipientEmail,
    title: params.title,
    message: params.message,
    channel: params.channel || 'IN_APP',
    priority: params.priority || 'NORMAL',
    module: params.module || 'GENERAL',
    link: params.link,
    isRead: false,
    status: 'SENT',
    createdAt: new Date().toISOString(),
    sentAt: new Date().toISOString(),
  };
}

export function createIncident(params: {
  organizationId: ID;
  title: string;
  severity: NotificationIncident['severity'];
  affectedChannel: NotificationChannel;
  failedCount: number;
  rootCause?: string;
}): NotificationIncident {
  return {
    id: generateId('inc'),
    organizationId: params.organizationId,
    title: params.title,
    severity: params.severity,
    status: 'DETECTED',
    affectedChannel: params.affectedChannel,
    failedCount: params.failedCount,
    rootCause: params.rootCause,
    detectedAt: new Date().toISOString(),
  };
}
