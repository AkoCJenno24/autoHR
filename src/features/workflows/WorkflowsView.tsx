import React, { useState } from 'react';
import { db } from '@/lib/db';
import { WorkflowDefinition, WorkflowInstance } from '@/types';
import {
  GitMerge,
  Layers,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Plus,
  Play,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function WorkflowsView() {
  const workflows = db.getWorkflows();
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowDefinition>(workflows[0]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-neutral-text-primary tracking-tight">
            Workflow & Automation Engine
          </h2>
          <p className="text-xs sm:text-sm text-neutral-text-muted mt-1">
            Configure multi-step approvals, conditional escalation branches, dynamic approver resolution, and SLA timers.
          </p>
        </div>

        <Badge variant="primary" size="md">
          Versioned & Immutable Orchestration
        </Badge>
      </div>

      {/* Workflow Definitions Selector Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {workflows.map(wf => {
          const isSelected = selectedWorkflow.id === wf.id;
          return (
            <Card
              key={wf.id}
              onClick={() => setSelectedWorkflow(wf)}
              className={`p-5 cursor-pointer transition-all ${
                isSelected ? 'ring-2 ring-primary border-primary bg-blue-50/20' : 'hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${isSelected ? 'bg-primary text-white' : 'bg-slate-100 text-slate-700'}`}>
                    <GitMerge className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-neutral-text-primary">{wf.name}</h4>
                    <p className="text-xs text-neutral-text-muted font-mono">{wf.code} · v{wf.version}.0</p>
                  </div>
                </div>
                <Badge variant={wf.isActive ? 'success' : 'neutral'} size="sm">
                  {wf.isActive ? 'ACTIVE' : 'DRAFT'}
                </Badge>
              </div>

              <div className="mt-4 pt-3 border-t border-neutral-border/50 flex items-center justify-between text-xs text-neutral-text-muted">
                <span>Module: <strong>{wf.module}</strong></span>
                <span>{wf.steps.length} Approval Steps</span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Visual Workflow Steps Visualizer */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Visual Approval Pipeline: {selectedWorkflow.name}</CardTitle>
              <CardDescription>Deterministic sequential execution flow and SLA resolution</CardDescription>
            </div>
            <Badge variant="info" size="sm">Sequential Execution</Badge>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 overflow-x-auto py-4">
            {/* Start Node */}
            <div className="flex flex-col items-center text-center p-4 bg-slate-100 rounded-xl border border-slate-200 shrink-0 w-44">
              <span className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-bold mb-2">
                0
              </span>
              <h5 className="text-xs font-bold text-neutral-text-primary">Trigger Event</h5>
              <p className="text-[10px] text-neutral-text-muted mt-1">Initiator submits request</p>
            </div>

            <ArrowRight className="w-6 h-6 text-neutral-text-muted hidden md:block shrink-0" />

            {/* Configured Steps */}
            {selectedWorkflow.steps.map((step, idx) => (
              <React.Fragment key={step.stepNumber}>
                <div className="flex flex-col items-center text-center p-4 bg-white rounded-xl border-2 border-primary/40 shadow-sm shrink-0 w-56 space-y-1 relative">
                  <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold mb-1 shadow-xs">
                    {step.stepNumber}
                  </span>
                  <h5 className="text-xs font-bold text-neutral-text-primary">{step.title}</h5>
                  <Badge variant="primary" size="sm">{step.approverType}</Badge>
                  <p className="text-[10px] text-neutral-text-muted flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3 text-warning" /> SLA: {step.slaHours} Hours
                  </p>
                </div>

                {idx < selectedWorkflow.steps.length - 1 && (
                  <ArrowRight className="w-6 h-6 text-neutral-text-muted hidden md:block shrink-0" />
                )}
              </React.Fragment>
            ))}

            <ArrowRight className="w-6 h-6 text-neutral-text-muted hidden md:block shrink-0" />

            {/* End / Final Node */}
            <div className="flex flex-col items-center text-center p-4 bg-emerald-50 rounded-xl border border-emerald-200 shrink-0 w-44">
              <span className="w-8 h-8 rounded-full bg-success text-white flex items-center justify-center text-xs font-bold mb-2 shadow-xs">
                ✓
              </span>
              <h5 className="text-xs font-bold text-emerald-900">Approved & Finalized</h5>
              <p className="text-[10px] text-emerald-700 mt-1">Auto-sync with Leave/Payroll</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
