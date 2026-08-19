import { AuditEvent, ID, User } from '@/types';
import { generateCorrelationId, generateId } from '@/lib/utils';

export function createAuditEvent(params: {
  organizationId: ID;
  actor: User;
  action: string;
  module: AuditEvent['module'];
  resourceType: string;
  resourceId: string;
  previousState?: Record<string, any>;
  newState?: Record<string, any>;
  correlationId?: string;
  ipAddress?: string;
}): AuditEvent {
  return {
    id: generateId('audit'),
    organizationId: params.organizationId,
    actorId: params.actor.id,
    actorName: params.actor.displayName,
    actorRole: params.actor.roleName,
    action: params.action,
    module: params.module,
    resourceType: params.resourceType,
    resourceId: params.resourceId,
    previousState: params.previousState ? JSON.parse(JSON.stringify(params.previousState)) : undefined,
    newState: params.newState ? JSON.parse(JSON.stringify(params.newState)) : undefined,
    correlationId: params.correlationId || generateCorrelationId(),
    ipAddress: params.ipAddress || '127.0.0.1 (Client)',
    timestamp: new Date().toISOString(),
  };
}
