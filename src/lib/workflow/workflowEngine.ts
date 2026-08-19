import { WorkflowDefinition, WorkflowInstance, WorkflowInstanceStatus, ID, Employee, User } from '@/types';
import { generateId } from '@/lib/utils';
import { addHours } from 'date-fns';

export function startWorkflowInstance(
  definition: WorkflowDefinition,
  entityId: ID,
  initiator: { id: ID; name: string },
  organizationId: ID
): WorkflowInstance {
  const firstStep = definition.steps[0];
  const stepHistories = definition.steps.map(s => ({
    stepNumber: s.stepNumber,
    stepTitle: s.title,
    action: (s.stepNumber === 1 ? 'PENDING' : 'PENDING') as 'PENDING' | 'APPROVED' | 'REJECTED' | 'SKIPPED',
  }));

  return {
    id: generateId('wf_inst'),
    organizationId,
    workflowDefinitionId: definition.id,
    workflowName: definition.name,
    module: definition.module,
    entityId,
    initiatorEmployeeId: initiator.id,
    initiatorName: initiator.name,
    currentStepNumber: 1,
    totalSteps: definition.steps.length,
    status: 'IN_PROGRESS',
    stepHistories,
    startedAt: new Date().toISOString(),
  };
}

export function advanceWorkflowStep(
  instance: WorkflowInstance,
  definition: WorkflowDefinition,
  action: 'APPROVED' | 'REJECTED',
  approver: { name: string; comments?: string }
): WorkflowInstance {
  const currentStep = instance.currentStepNumber;
  const updatedHistories = [...instance.stepHistories];

  const historyIndex = updatedHistories.findIndex(h => h.stepNumber === currentStep);
  if (historyIndex >= 0) {
    updatedHistories[historyIndex] = {
      ...updatedHistories[historyIndex],
      approverName: approver.name,
      action: action,
      comments: approver.comments,
      timestamp: new Date().toISOString(),
    };
  }

  if (action === 'REJECTED') {
    return {
      ...instance,
      status: 'REJECTED',
      stepHistories: updatedHistories,
      completedAt: new Date().toISOString(),
    };
  }

  // If approved and more steps exist
  if (currentStep < instance.totalSteps) {
    return {
      ...instance,
      currentStepNumber: currentStep + 1,
      stepHistories: updatedHistories,
    };
  }

  // All steps approved
  return {
    ...instance,
    status: 'COMPLETED',
    stepHistories: updatedHistories,
    completedAt: new Date().toISOString(),
  };
}
