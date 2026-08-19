import { HumanTask, TaskStatus, TaskPriority, ID } from '@/types';
import { generateId } from '@/lib/utils';
import { addHours, isAfter, parseISO } from 'date-fns';

export function createHumanTask(params: {
  organizationId: ID;
  workflowInstanceId?: ID;
  module: HumanTask['module'];
  title: string;
  description: string;
  assignedToUserId?: ID;
  assignedToRoleId?: ID;
  assignedToName?: string;
  priority?: TaskPriority;
  slaHours?: number;
  entityType: string;
  entityId: string;
  actions?: Array<'APPROVE' | 'REJECT' | 'COMPLETE' | 'REASSIGN'>;
}): HumanTask {
  const slaHours = params.slaHours || 24;
  const dueDate = addHours(new Date(), slaHours).toISOString();

  return {
    id: generateId('task'),
    organizationId: params.organizationId,
    workflowInstanceId: params.workflowInstanceId,
    module: params.module,
    title: params.title,
    description: params.description,
    assignedToUserId: params.assignedToUserId,
    assignedToRoleId: params.assignedToRoleId,
    assignedToName: params.assignedToName,
    priority: params.priority || 'MEDIUM',
    status: 'OPEN',
    dueDate,
    slaHours,
    isBreached: false,
    entityType: params.entityType,
    entityId: params.entityId,
    actions: params.actions || ['APPROVE', 'REJECT'],
    createdAt: new Date().toISOString(),
  };
}

export function updateTaskStatus(
  task: HumanTask,
  newStatus: TaskStatus
): HumanTask {
  return {
    ...task,
    status: newStatus,
    completedAt: newStatus === 'COMPLETED' || newStatus === 'CANCELLED' ? new Date().toISOString() : undefined,
  };
}

export function checkTaskSla(task: HumanTask): boolean {
  if (task.status === 'COMPLETED' || task.status === 'CANCELLED') {
    return false;
  }
  try {
    return isAfter(new Date(), parseISO(task.dueDate));
  } catch {
    return false;
  }
}
