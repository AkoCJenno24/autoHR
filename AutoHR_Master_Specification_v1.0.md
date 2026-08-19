# AutoHR --- Master Product & Engineering Specification

## Antigravity Build Instructions --- v1.0

> **Status:** Master source of truth for AutoHR\
> **Target:** Antigravity coding agent / developer environment\
> **Architecture:** Modular, multi-tenant, employee-centered HR
> platform\
> **Backend migration:** Firebase (replacing Supabase)

------------------------------------------------------------------------

# 1. READ THIS FIRST

AutoHR is a complete, responsive/mobile-first Human Resources platform.

This document is the primary implementation guide. Antigravity must use
it as the source of truth when generating, modifying, or refactoring
AutoHR.

## Non-negotiable principles

1.  Build production-quality software, not a mockup.
2.  Preserve multi-tenancy and tenant isolation.
3.  Security must be enforced server-side, never only in the UI.
4.  Every important business action must be auditable.
5.  Use reusable platform services instead of duplicating logic in
    individual modules.
6.  Prefer configuration over hard-coded company-specific rules.
7.  Do not introduce modules that are explicitly out of scope.
8.  Maintain a consistent design system across the entire application.
9.  Keep the architecture modular so future modules can reuse the same
    engines.
10. Do not replace an existing architecture decision merely because a
    different implementation is easier.

------------------------------------------------------------------------

# 2. PRODUCT VISION

AutoHR is an end-to-end HR platform designed to automate HR operations
while giving employees a strong self-service experience.

The platform should reduce manual HR work through:

-   Employee self-service
-   Workflow automation
-   Approval automation
-   Notifications
-   Attendance automation
-   Leave automation
-   Payroll workflows
-   Documents
-   Tasks
-   Reporting
-   Auditability
-   Future AI-assisted HR operations

Core philosophy:

``` text
Business Modules
      ↓
Shared Platform Engines
      ↓
Security + Rules + Events
      ↓
Workflow + Tasks + Notifications
      ↓
Audit + Analytics
```

------------------------------------------------------------------------

# 3. PRODUCT SCOPE

## In scope

### Core HR

-   Employee management
-   Organization management
-   Employment records
-   Employee history
-   Employee self-service
-   Employee profile
-   Employee documents

### Attendance

-   Attendance records
-   Clock in/out
-   Schedules
-   Shifts
-   Overtime
-   Attendance exceptions
-   Attendance approvals

### Leave

-   Leave types
-   Leave policies
-   Leave balances
-   Leave requests
-   Approval workflows
-   Leave history

### Payroll

-   Payroll profiles
-   Payroll periods
-   Earnings
-   Deductions
-   Adjustments
-   Payroll calculations
-   Payroll approval
-   Payroll finalization
-   Payslips
-   Payroll audit history

### Platform automation

-   Workflow engine
-   Approval engine
-   Task engine
-   Notification engine
-   Rules engine
-   Event architecture
-   Scheduler
-   SLA engine
-   Audit engine

### Enterprise platform

-   Multi-tenancy
-   Authentication
-   RBAC
-   Fine-grained authorization
-   Tenant isolation
-   Reporting
-   Analytics
-   Integrations
-   Security administration

## Explicitly out of scope

Do NOT add these modules unless the product scope is explicitly changed
later:

-   Recruitment / ATS
-   Job posting
-   Interviews
-   Performance management
-   Training / LMS
-   Expenses
-   Inventory
-   Accounting
-   CRM
-   Project management
-   Sales
-   Customer management

------------------------------------------------------------------------

# 4. DELIVERY STRATEGY

AutoHR is built incrementally.

## Phase 1 --- Foundation

-   Firebase authentication
-   Firebase/Firestore data layer
-   Multi-tenancy
-   Organization
-   Employees
-   RBAC
-   Security rules
-   Audit
-   Administration

## Phase 2 --- Core HR

-   Attendance
-   Leave
-   Documents
-   Employee self-service

## Phase 3 --- Automation Platform

-   Workflow engine
-   Approval engine
-   Task engine
-   Notification engine
-   Rules engine
-   Event architecture
-   Scheduler

## Phase 4 --- Payroll

-   Payroll profiles
-   Payroll periods
-   Payroll calculation
-   Payroll approval
-   Payslips
-   Payroll finalization

## Phase 5 --- Enterprise Intelligence

-   Advanced reporting
-   Analytics
-   Integrations
-   AI-assisted capabilities
-   Advanced compliance features

Do not attempt to implement every phase simultaneously.

------------------------------------------------------------------------

# 5. TECHNOLOGY STACK

## Frontend

-   React
-   TypeScript
-   Vite
-   React Router
-   shadcn/ui
-   Tailwind CSS
-   Lucide icons

## Backend / Cloud

The backend is moving from Supabase to Firebase.

Use:

-   Firebase Authentication
-   Cloud Firestore
-   Firebase Storage
-   Cloud Functions
-   Firebase App Check
-   Firebase Cloud Messaging where push notifications are required
-   Firebase Hosting where appropriate

Do NOT introduce Supabase dependencies into the new implementation.

## Supporting architecture

Use:

-   TypeScript end-to-end where practical
-   Firestore transactions/batched writes for atomic business operations
-   Cloud Functions for privileged server-side operations
-   Firestore Security Rules for data authorization
-   Firebase Storage Security Rules for files
-   Structured logging
-   Automated testing
-   Environment-specific Firebase projects/configuration

------------------------------------------------------------------------

# 6. FIREBASE ARCHITECTURE

## Firebase services

### Authentication

Firebase Authentication is responsible for identity.

Supported authentication methods should be configurable, starting with:

-   Email/password
-   Password reset
-   Email verification

Additional providers can be added later.

Authentication identity must remain separate from the employee business
record.

Conceptually:

``` text
Firebase Auth User
       ↓
Application User
       ↓
Employee
       ↓
Organization / Tenant
```

## Firestore

Firestore stores application data.

Use document collections with clear tenant boundaries.

Recommended high-level model:

``` text
organizations/{organizationId}
    employees/{employeeId}
    departments/{departmentId}
    locations/{locationId}
    positions/{positionId}
    roles/{roleId}
    workflows/{workflowId}
    notificationRules/{ruleId}
```

For high-volume operational data, use carefully designed top-level
collections with `organizationId` where required for scalable querying.

Do not blindly nest everything under employees or organizations. Choose
collection structure based on query patterns, security rules, indexing,
and expected scale.

## Storage

Firebase Storage is used for:

-   Employee documents
-   HR attachments
-   Workflow attachments
-   Payslips
-   Other authorized files

Never expose sensitive files through public URLs.

## Cloud Functions

Use Cloud Functions for:

-   Privileged operations
-   Payroll calculations that require server trust
-   Workflow execution
-   Scheduled jobs
-   Notification dispatch
-   Provider failover
-   Audit operations that should not be client-controlled
-   Integration webhooks
-   Data maintenance
-   Security-sensitive business logic

Never rely on client-side code for authorization or trusted
calculations.

------------------------------------------------------------------------

# 7. MULTI-TENANCY

The primary security boundary is the organization/tenant.

Conceptually:

``` text
Tenant
 ├── Organization data
 ├── Employees
 ├── Departments
 ├── Locations
 ├── Positions
 ├── Attendance
 ├── Leave
 ├── Payroll
 ├── Documents
 ├── Workflows
 ├── Tasks
 ├── Notifications
 └── Reports
```

Every tenant-owned record must be associated with its organization.

Rules:

1.  A user must belong to an organization before accessing tenant data.
2.  Client requests must never be trusted to choose an arbitrary
    organization.
3.  Firestore Security Rules must validate tenant membership.
4.  Cloud Functions must revalidate tenant context.
5.  Cross-tenant reads/writes must be denied by default.
6.  Admin privileges must be explicit.
7.  Global/system records must be clearly separated from tenant records.

------------------------------------------------------------------------

# 8. ORGANIZATION MODEL

The organization hierarchy must be flexible.

A small company may use:

``` text
Organization
└── Employees
```

A larger organization may use:

``` text
Organization
├── Business Units
├── Branches / Locations
├── Departments
├── Teams
├── Positions
└── Employees
```

Do not require every company to use every hierarchy level.

Recommended core entities:

-   Organization
-   Business unit
-   Location
-   Department
-   Team
-   Position
-   Employee

------------------------------------------------------------------------

# 9. EMPLOYEE MODEL

Employee is the central HR business entity.

Employee profile can include:

``` text
Personal information
Contact information
Employment information
Organization
Position
Manager
Location
Payroll profile
Attendance profile
Leave profile
Documents
History
```

Keep sensitive data separated where stronger access controls are
required.

------------------------------------------------------------------------

# 10. EMPLOYEE STATUS AND EMPLOYMENT TYPE

Do NOT hard-code these as database enums.

Each organization must be able to configure its own values.

Example status values:

-   Pre-employment
-   Active
-   On Leave
-   Suspended
-   Terminated
-   Resigned
-   Retired

Example employment types:

-   Regular
-   Probationary
-   Contractual
-   Part-time
-   Seasonal
-   Intern
-   Temporary

Organizations may add or rename values according to their policies.

------------------------------------------------------------------------

# 11. EMPLOYEE HISTORY

Important HR changes must be historically traceable.

Examples:

-   Department change
-   Position change
-   Manager change
-   Employment status change
-   Employment type change
-   Location change
-   Compensation-related change

Never overwrite important historical information without preserving its
history.

------------------------------------------------------------------------

# 12. RBAC AND AUTHORIZATION

Use layered authorization:

``` text
Authentication
      ↓
Tenant Membership
      ↓
Role
      ↓
Permission
      ↓
Resource
      ↓
Record-level policy
      ↓
Action
```

Support:

-   System roles
-   Custom roles
-   Permissions
-   Role-permission mapping
-   Organization-specific roles
-   Delegated authority
-   Temporary authority
-   Segregation of duties
-   Approval authority

Example permissions:

``` text
employee.read
employee.create
employee.update
employee.archive

leave.read
leave.create
leave.approve
leave.reject

attendance.read
attendance.correct
attendance.approve

payroll.read
payroll.process
payroll.approve
payroll.finalize
```

Permissions must be checked server-side.

------------------------------------------------------------------------

# 13. DESIGN SYSTEM

AutoHR must have one consistent visual language.

## Design principles

-   Professional
-   Clean
-   Enterprise-grade
-   Calm
-   Minimal
-   Highly readable
-   Mobile-first
-   Accessible
-   Consistent
-   Information-dense without feeling crowded

Avoid flashy gradients, excessive shadows, excessive rounded cards, and
inconsistent colors.

Use color primarily for meaning and state.

## Uniform color palette

Use these design tokens as the default AutoHR palette:

### Primary

``` text
Primary:        #2563EB
Primary Hover:  #1D4ED8
Primary Soft:   #DBEAFE
```

### Secondary

``` text
Secondary:      #0F172A
Secondary Soft: #F1F5F9
```

### Success

``` text
Success:        #16A34A
Success Soft:   #DCFCE7
```

### Warning

``` text
Warning:        #D97706
Warning Soft:   #FEF3C7
```

### Danger

``` text
Danger:         #DC2626
Danger Soft:    #FEE2E2
```

### Information

``` text
Info:           #0891B2
Info Soft:      #CFFAFE
```

### Neutral

``` text
Background:     #F8FAFC
Surface:        #FFFFFF
Border:         #E2E8F0
Text Primary:   #0F172A
Text Secondary: #475569
Text Muted:     #64748B
Disabled:       #94A3B8
```

## Color usage rules

-   Blue = primary actions and navigation emphasis.
-   Green = success/approved/completed.
-   Amber = warning/pending/attention.
-   Red = error/rejected/critical.
-   Cyan = information.
-   Neutral colors = structure and secondary information.

Never use red merely for visual decoration.

Never assign different colors to the same semantic state in different
modules.

------------------------------------------------------------------------

# 14. TYPOGRAPHY

Use a modern sans-serif interface.

Recommended stack:

``` css
font-family:
Inter,
ui-sans-serif,
system-ui,
-apple-system,
BlinkMacSystemFont,
"Segoe UI",
sans-serif;
```

Typography should prioritize:

1.  Readability
2.  Hierarchy
3.  Consistency
4.  Density appropriate for enterprise applications

------------------------------------------------------------------------

# 15. UI COMPONENT SYSTEM

Use shadcn/ui as the base component system.

Common components:

-   Button
-   Input
-   Select
-   Combobox
-   Checkbox
-   Radio
-   Switch
-   Date picker
-   Dialog
-   Drawer
-   Dropdown
-   Tabs
-   Tooltip
-   Popover
-   Alert
-   Badge
-   Card
-   Table
-   Data table
-   Pagination
-   Skeleton
-   Toast
-   Form
-   Command menu

Do not create a new visual style for each module.

Extend the design system instead.

------------------------------------------------------------------------

# 16. RESPONSIVE DESIGN

Primary target:

**Responsive/mobile-first web application.**

Breakpoints should support:

-   Mobile
-   Tablet
-   Desktop
-   Large desktop

Desktop dashboards can use side navigation.

Mobile should use:

-   Compact navigation
-   Bottom navigation where appropriate
-   Drawers
-   Responsive tables
-   Card/list alternatives
-   Touch-friendly controls

Do not simply shrink desktop interfaces onto mobile screens.

------------------------------------------------------------------------

# 17. MAIN NAVIGATION

## Employee

``` text
Dashboard
My Tasks
Notifications
Attendance
Leave
Payroll
Documents
Profile
```

## Manager / HR / Admin

``` text
Dashboard
Employees
Organization
Attendance
Leave
Payroll
Tasks
Workflows
Notifications
Reports
Administration
```

Navigation must be permission-aware.

Users should only see modules they can access.

------------------------------------------------------------------------

# 18. WORKFLOW ENGINE

Central reusable workflow platform.

Capabilities:

-   Sequential approvals
-   Parallel approvals
-   Conditional branches
-   Dynamic approvers
-   Delegation
-   Escalation
-   Sub-workflows
-   Timers
-   SLA
-   Automated actions
-   Manual tasks
-   Notifications
-   Integration actions
-   Pause/resume
-   Cancellation
-   Rejection/resubmission
-   Versioning
-   Simulation
-   Audit

Workflow lifecycle:

``` text
Draft
 ↓
Validate
 ↓
Simulate
 ↓
Review
 ↓
Approve
 ↓
Publish
 ↓
Active
 ↓
Deprecated
 ↓
Retired
```

Published versions are immutable.

Existing workflow instances continue using their original workflow
version unless an explicit migration is performed.

------------------------------------------------------------------------

# 19. TASK ENGINE

Every human workflow action becomes a task.

Task fields should conceptually include:

``` text
Task ID
Organization ID
Workflow Instance
Task Type
Title
Description
Assignee
Role
Priority
SLA
Due Date
Status
Business Record
Available Actions
Comments
Attachments
Created At
Completed At
```

Task states:

``` text
Open
Assigned
In Progress
Blocked
Completed
Cancelled
Expired
```

------------------------------------------------------------------------

# 20. APPROVAL ENGINE

Support:

``` text
All must approve
Any one can approve
2 of 3
Minimum count
Percentage/quorum
Required role + additional approvals
```

Dynamic approvers can be resolved from:

-   Manager hierarchy
-   Position
-   Role
-   Department
-   Location
-   Job level
-   Amount
-   Business unit
-   Policy

Prevent self-approval by default.

Support segregation-of-duties rules.

------------------------------------------------------------------------

# 21. NOTIFICATION ENGINE

Notification pipeline:

``` text
Business Event
      ↓
Notification Rule
      ↓
Conditions
      ↓
Recipient Resolution
      ↓
Privacy
      ↓
Preferences
      ↓
Quiet Hours
      ↓
Template
      ↓
Priority
      ↓
Queue
      ↓
Provider Routing
      ↓
Delivery
      ↓
Audit
```

Channels:

-   In-app
-   Email
-   SMS
-   Push
-   Digest

Capabilities:

-   Multiple providers
-   Failover
-   Retry with exponential backoff and jitter
-   Idempotency
-   Deduplication
-   Rate limiting
-   Circuit breakers
-   Dead-letter queues
-   Replay/reprocessing
-   Provider health monitoring
-   Cost-aware routing
-   SLA monitoring
-   Incident management
-   Postmortems

------------------------------------------------------------------------

# 22. NOTIFICATION INCIDENT MANAGEMENT

Major notification failures automatically become incidents.

Incident lifecycle:

``` text
Detected
 ↓
Created
 ↓
Triaged
 ↓
Investigating
 ↓
Mitigating
 ↓
Monitoring
 ↓
Resolved
 ↓
Postmortem
```

Severity:

``` text
SEV-1 Critical
SEV-2 High
SEV-3 Medium
SEV-4 Low
```

Severity is calculated using configurable signals such as:

-   Volume
-   Affected users
-   Notification criticality
-   Duration
-   Provider scope
-   Business impact
-   Compliance impact
-   Security impact

Incident features:

-   Automatic escalation
-   SLA
-   Communication timeline
-   Evidence capture
-   Provider information
-   Root cause
-   Corrective actions
-   Preventive actions
-   Postmortem
-   Recurring incident analysis

------------------------------------------------------------------------

# 23. SLA ENGINE

SLA support applies to workflows, tasks, and incidents.

Support:

-   24×7 calendars
-   Business-hour calendars
-   Holidays
-   Weekends
-   Regional calendars
-   Time zones
-   On-call schedules
-   Pause/resume policies
-   Warnings
-   At-risk state
-   Breaches
-   Escalation

The exact calendar/policy used for historical calculations must remain
auditable.

------------------------------------------------------------------------

# 24. EVENT ARCHITECTURE

Use an event-driven internal architecture.

Core concepts:

``` text
Event
Event Type
Event Version
Tenant ID
Correlation ID
Source
Timestamp
Payload
```

Use transactional/outbox-style reliability where needed.

Events should support:

-   Versioning
-   Validation
-   Idempotency
-   Replay
-   Dead-letter handling
-   Correlation
-   Ordering where required

Example:

``` text
LeaveApproved
    ├── Notification
    ├── Audit
    ├── Attendance
    └── Payroll
```

------------------------------------------------------------------------

# 25. ATTENDANCE

Attendance flow:

``` text
Schedule
 ↓
Shift
 ↓
Clock In
 ↓
Clock Out
 ↓
Attendance Record
 ↓
Rules
 ↓
Exceptions
 ↓
Approval
 ↓
Payroll
```

Support:

-   Shifts
-   Schedules
-   Breaks
-   Overtime
-   Late arrival
-   Early departure
-   Absence
-   Corrections
-   Exceptions
-   Manager approval

------------------------------------------------------------------------

# 26. LEAVE

Leave flow:

``` text
Employee
 ↓
Leave Request
 ↓
Balance Validation
 ↓
Policy Validation
 ↓
Workflow
 ↓
Approval
 ↓
Attendance
 ↓
Payroll
 ↓
Notification
```

Leave policies must be configurable by organization.

------------------------------------------------------------------------

# 27. PAYROLL

Payroll is a high-security module.

Flow:

``` text
Payroll Period
 ↓
Employee Payroll Profiles
 ↓
Attendance
 ↓
Leave
 ↓
Earnings
 ↓
Deductions
 ↓
Adjustments
 ↓
Calculation
 ↓
Validation
 ↓
Approval
 ↓
Finalization
 ↓
Payslip
```

Important rules:

-   Finalized payroll is immutable.
-   Corrections require controlled adjustment workflows.
-   Payroll access is permission-restricted.
-   Payroll actions are audited.
-   Payslips are securely stored.
-   Sensitive payroll data must not appear in ordinary logs.

------------------------------------------------------------------------

# 28. DOCUMENT MANAGEMENT

Documents support:

-   Employee documents
-   Contracts
-   HR forms
-   Policies
-   Payslips
-   Attachments
-   Versioning
-   Expiration
-   Access control
-   Workflow
-   Future e-signature integration

Files must be private by default.

------------------------------------------------------------------------

# 29. AUDIT

Every important business operation should generate an audit event.

Examples:

``` text
Employee Created
Employee Updated
Employee Archived
Role Changed
Permission Changed
Leave Submitted
Leave Approved
Leave Rejected
Attendance Corrected
Payroll Processed
Payroll Approved
Payroll Finalized
Workflow Published
Workflow Executed
Notification Sent
Document Accessed
```

Audit records should include:

``` text
Actor
Organization
Action
Resource
Resource ID
Timestamp
Previous State
New State
Correlation ID
```

Critical audit streams should be tamper-evident.

------------------------------------------------------------------------

# 30. REPORTING

Three levels:

## Operational

-   Pending approvals
-   Absences
-   Late employees
-   Open tasks
-   Failed notifications

## Management

-   Attendance trends
-   Leave utilization
-   Payroll cost
-   Approval performance
-   Workforce trends

## Enterprise

-   Workforce analytics
-   Compliance
-   SLA performance
-   Workflow bottlenecks
-   Notification provider performance
-   System health

Reports must respect authorization.

------------------------------------------------------------------------

# 31. SEARCH

Implement global search as a platform capability.

Search should eventually cover:

-   Employees
-   Departments
-   Positions
-   Documents
-   Leave requests
-   Attendance records
-   Payroll records where authorized
-   Tasks
-   Workflows

Never return a search result that the user is not authorized to access.

------------------------------------------------------------------------

# 32. ERROR HANDLING

Use standardized error responses.

Conceptually:

``` json
{
  "code": "LEAVE_BALANCE_INSUFFICIENT",
  "message": "Insufficient leave balance.",
  "correlationId": "..."
}
```

Do not expose:

-   Stack traces
-   Secrets
-   Database internals
-   Provider credentials
-   Sensitive information

to end users.

------------------------------------------------------------------------

# 33. OBSERVABILITY

Monitor:

-   Application errors
-   Function errors
-   API latency
-   Firestore errors
-   Workflow failures
-   Queue depth
-   Notification latency
-   Notification failures
-   Provider health
-   SLA breaches
-   Authentication anomalies

Use correlation IDs across:

``` text
User Request
 ↓
Business Operation
 ↓
Workflow
 ↓
Event
 ↓
Notification
 ↓
Provider
```

------------------------------------------------------------------------

# 34. SECURITY

Security principles:

-   Least privilege
-   Secure defaults
-   Server-side authorization
-   Tenant isolation
-   Encryption
-   Private file storage
-   Secret management
-   App Check
-   Input validation
-   Output filtering
-   Audit logging
-   Rate limiting
-   Abuse prevention
-   Secure session handling
-   Dependency updates

Never place Firebase Admin credentials in frontend code.

Never trust a client-supplied role, tenant ID, payroll amount, approval
status, or security decision.

------------------------------------------------------------------------

# 35. FIREBASE SECURITY RULES

Security Rules are part of the application architecture, not an
afterthought.

Every tenant-owned Firestore document must have a validated organization
relationship.

Rules should deny by default.

Conceptually:

``` text
request.auth != null
AND
user belongs to organization
AND
user has required permission
AND
record belongs to organization
```

Privileged operations can be routed through Cloud Functions.

------------------------------------------------------------------------

# 36. PERFORMANCE

Design for scale from the beginning.

Use:

-   Appropriate Firestore indexes
-   Pagination
-   Cursor-based queries
-   Denormalized read models where appropriate
-   Cached reference data
-   Background processing
-   Cloud Functions for heavy operations
-   Batched writes
-   Transactions
-   Async notifications
-   Avoid unbounded queries
-   Avoid loading entire collections into the browser

------------------------------------------------------------------------

# 37. DATA RETENTION

Retention must be configurable by data category.

Different policies can apply to:

-   Audit records
-   Employee history
-   Documents
-   Notifications
-   Workflow events
-   Payroll
-   Attendance

Do not permanently delete records merely because they are no longer
visible in the UI.

Use archive/retention policies where appropriate.

------------------------------------------------------------------------

# 38. DEVELOPMENT RULES FOR ANTIGRAVITY

Before implementing a feature:

1.  Identify the domain.
2.  Check whether an existing platform engine can handle it.
3.  Reuse existing components.
4.  Reuse existing authorization.
5.  Reuse existing audit.
6.  Reuse existing workflow.
7.  Reuse existing notification.
8.  Reuse existing design tokens.
9.  Add tests.
10. Update documentation.

Do not create duplicated versions of:

-   Buttons
-   Tables
-   Modals
-   Notifications
-   Approval logic
-   Authorization logic
-   Audit logic
-   Tenant checks
-   Workflow logic

------------------------------------------------------------------------

# 39. CODE ORGANIZATION

Recommended frontend structure:

``` text
src/
├── app/
├── components/
│   ├── ui/
│   ├── layout/
│   ├── forms/
│   └── data/
├── features/
│   ├── auth/
│   ├── employees/
│   ├── organization/
│   ├── attendance/
│   ├── leave/
│   ├── payroll/
│   ├── documents/
│   ├── workflows/
│   ├── tasks/
│   ├── notifications/
│   └── reports/
├── lib/
│   ├── firebase/
│   ├── auth/
│   ├── permissions/
│   ├── validation/
│   ├── formatting/
│   └── utils/
├── hooks/
├── routes/
├── types/
└── styles/
```

Backend:

``` text
functions/
├── auth/
├── employees/
├── workflows/
├── notifications/
├── payroll/
├── scheduled/
├── integrations/
├── audit/
└── shared/
```

------------------------------------------------------------------------

# 40. VALIDATION

Use schema validation consistently.

Recommended:

-   Zod for TypeScript runtime validation
-   TypeScript compile-time checking
-   Firebase Security Rules
-   Server-side validation in Cloud Functions

Never assume frontend validation is sufficient.

------------------------------------------------------------------------

# 41. TESTING

Testing strategy:

## Unit tests

-   Rules
-   Calculations
-   Permissions
-   Validation
-   Date/time handling

## Integration tests

-   Firebase
-   Workflows
-   Notifications
-   Payroll
-   Authentication

## Security tests

-   Cross-tenant access
-   Unauthorized role access
-   Privilege escalation
-   Document access
-   Payroll access

## End-to-end tests

Critical journeys:

``` text
Login
Employee creation
Leave request
Leave approval
Attendance correction
Payroll processing
Payslip access
Workflow approval
Notification delivery
```

------------------------------------------------------------------------

# 42. LOCALIZATION

AutoHR should be localization-ready from the beginning.

Support:

-   English initially
-   Additional languages later
-   RTL-ready layout
-   Date formats
-   Number formats
-   Currency
-   Time zones
-   Localized notifications

Do not hard-code user-facing strings throughout components.

------------------------------------------------------------------------

# 43. TIME AND DATE RULES

Store timestamps consistently.

Use:

-   UTC for stored timestamps
-   Organization/user timezone for presentation
-   Explicit timezone handling for schedules and SLA calculations

Never calculate business deadlines using the browser's local timezone
without applying the organization's configured policy.

------------------------------------------------------------------------

# 44. ACCESSIBILITY

Target strong accessibility.

Use:

-   Semantic HTML
-   Keyboard navigation
-   Visible focus
-   Accessible labels
-   Screen-reader-friendly controls
-   Sufficient contrast
-   Error messaging
-   Reduced-motion support where appropriate

Do not communicate important information by color alone.

------------------------------------------------------------------------

# 45. DESIGN IMPLEMENTATION RULES

Every new screen must use the AutoHR design system.

Do not introduce:

-   Random colors
-   Random border radii
-   Random shadows
-   Inconsistent typography
-   Different button styles
-   Different status colors
-   Decorative gradients without a product reason

Use the established semantic colors.

------------------------------------------------------------------------

# 46. INITIAL ROUTING

Recommended routes:

``` text
/
 /login
 /dashboard

 /employees
 /employees/:id

 /organization
 /organization/departments
 /organization/locations
 /organization/positions

 /attendance
 /leave
 /leave/requests

 /payroll
 /payroll/payslips

 /tasks
 /workflows
 /notifications

 /documents
 /reports

 /admin
 /admin/users
 /admin/roles
 /admin/permissions
 /admin/settings
 /admin/audit
```

Routes must be permission-aware.

------------------------------------------------------------------------

# 47. FIRST IMPLEMENTATION MILESTONE

Do not start with Payroll.

Build the first vertical slice:

``` text
Firebase Authentication
        ↓
Organization
        ↓
User
        ↓
Employee
        ↓
Role
        ↓
Permission
        ↓
Dashboard
        ↓
Audit
```

Success criteria:

-   User can sign in.
-   User is associated with an organization.
-   Authorized user can create an employee.
-   Employee appears in the employee list.
-   Employee profile can be viewed.
-   Unauthorized users cannot access restricted employee data.
-   Actions create audit events.
-   Cross-tenant access is denied.
-   UI follows the AutoHR design system.
-   Mobile layout works.

------------------------------------------------------------------------

# 48. SECOND IMPLEMENTATION MILESTONE

After the foundation works:

``` text
Attendance
   +
Leave
   ↓
Workflow Engine
   ↓
Task Engine
   ↓
Notification Engine
```

The important objective is to prove that all major platform engines can
work together.

------------------------------------------------------------------------

# 49. THIRD IMPLEMENTATION MILESTONE

Payroll:

``` text
Employee
 ↓
Payroll Profile
 ↓
Attendance / Leave
 ↓
Payroll Calculation
 ↓
Validation
 ↓
Approval Workflow
 ↓
Finalization
 ↓
Payslip
 ↓
Notification
 ↓
Audit
```

------------------------------------------------------------------------

# 50. AI READINESS

AI is a future capability, not a replacement for deterministic HR rules.

AI may eventually assist with:

-   HR question answering
-   Policy explanations
-   Employee self-service
-   Document extraction
-   Anomaly detection
-   Workflow recommendations
-   Report generation
-   HR analytics
-   Payroll anomaly identification

AI must not silently make high-impact HR decisions.

Human approval and deterministic policy engines remain authoritative for
sensitive HR actions.

------------------------------------------------------------------------

# 51. ANTIGRAVITY OPERATING INSTRUCTIONS

When working on AutoHR:

### Before coding

-   Read this file.
-   Inspect the existing project.
-   Preserve working functionality.
-   Identify the affected domain.
-   Check reusable services/components.

### While coding

-   Follow TypeScript strictness.
-   Follow the design tokens.
-   Follow Firebase architecture.
-   Follow tenant isolation.
-   Follow RBAC.
-   Add audit events for important actions.
-   Add validation.
-   Add tests.
-   Avoid duplicated business logic.

### Before completing a task

Verify:

``` text
[ ] Build succeeds
[ ] TypeScript passes
[ ] Tests pass
[ ] Security rules considered
[ ] Tenant isolation preserved
[ ] Authorization enforced
[ ] Audit behavior implemented
[ ] Responsive UI verified
[ ] Design system followed
[ ] No secrets committed
[ ] Documentation updated
```

------------------------------------------------------------------------

# 52. CRITICAL DO-NOT-DO LIST

Do NOT:

-   Reintroduce Supabase.
-   Add excluded modules.
-   Put Firebase Admin credentials in frontend code.
-   Trust client-provided tenant IDs.
-   Trust client-provided roles.
-   Allow client-side-only authorization.
-   Expose private documents publicly.
-   Hard-code employee status values.
-   Hard-code employment types.
-   Duplicate workflow engines inside individual modules.
-   Duplicate notification systems.
-   Bypass audit logging for important actions.
-   Create a separate color system for a new module.
-   Make finalized payroll silently editable.
-   Use a user's browser timezone as the authoritative business
    timezone.
-   Break existing functionality to add a new feature.

------------------------------------------------------------------------

# 53. MASTER ARCHITECTURE

The final target architecture is:

``` text
                         AUTOHR
                           │
        ┌──────────────────┼──────────────────┐
        ↓                  ↓                  ↓
     Employee          Management         Administration
     Self-Service      Operations
        │                  │                  │
        └──────────────────┼──────────────────┘
                           ↓
                 ┌───────────────────┐
                 │ Business Modules  │
                 ├───────────────────┤
                 │ Employees         │
                 │ Attendance        │
                 │ Leave             │
                 │ Payroll           │
                 │ Documents         │
                 └─────────┬─────────┘
                           ↓
                 ┌───────────────────┐
                 │ Platform Engines  │
                 ├───────────────────┤
                 │ Workflow          │
                 │ Tasks             │
                 │ Notifications     │
                 │ Rules             │
                 │ Events            │
                 │ Scheduler         │
                 │ SLA               │
                 └─────────┬─────────┘
                           ↓
                 ┌───────────────────┐
                 │ Platform Services │
                 ├───────────────────┤
                 │ Firebase Auth     │
                 │ Firestore         │
                 │ Storage           │
                 │ Cloud Functions   │
                 │ Security Rules    │
                 │ Audit             │
                 └─────────┬─────────┘
                           ↓
                 ┌───────────────────┐
                 │ Analytics / AI    │
                 └───────────────────┘
```

------------------------------------------------------------------------

# 54. SOURCE OF TRUTH

When a future implementation decision conflicts with this specification:

1.  Preserve previously locked product scope.
2.  Preserve security and tenant isolation.
3.  Preserve auditability.
4.  Prefer reusable platform services.
5.  Prefer configurable business rules.
6.  Prefer the established AutoHR design system.
7.  Prefer maintainability and scalability.
8.  Ask the product owner only when the decision materially changes
    product behavior or scope.

**AutoHR is not just a collection of HR screens. It is a reusable HR
automation platform.**

------------------------------------------------------------------------

# END OF AUTOHR MASTER SPECIFICATION
