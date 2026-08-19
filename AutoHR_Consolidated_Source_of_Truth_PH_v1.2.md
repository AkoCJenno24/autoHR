# AutoHR --- Consolidated Source of Truth & Philippines Product Lock

## Antigravity Implementation Specification --- v1.2

> **Status:** Binding product and engineering specification\
> **Existing project:** Continue from the current AutoHR repository. Do
> not rebuild from scratch.\
> **Precedence:** This v1.2 file overrides older AutoHR specifications
> where they conflict.

------------------------------------------------------------------------

## 1. Product Identity

AutoHR is a **Philippines-only employee-management and HR-automation
SaaS**.

Vision: one system for employee needs that reduces repetitive HR work
while improving employee transparency, self-service, automation,
control, security, and auditability.

AutoHR is built around reusable platform engines: Workflow, Approval,
Tasks, Notifications, Rules, Events, Scheduler, SLA, and Audit.

------------------------------------------------------------------------

## 2. Philippines-Only Lock

Do not build a country selector or multi-country payroll.

Defaults:

``` text
Country: Philippines
Country Code: PH
Currency: Philippine Peso
Currency Code: PHP
Currency Symbol: ₱
Locale: en-PH
Default Company Timezone: Asia/Manila
```

The product may remain technically maintainable/localization-ready, but
the business product is exclusively for Philippine companies.

------------------------------------------------------------------------

## 3. Company / Tenant Model

Each customer company is an isolated tenant.

``` text
Company
├── Settings
├── Organization Structure
├── Users
├── Employees
├── Roles & Permissions
├── Attendance
├── Leave
├── Payroll
├── Documents
├── Workflows
├── Tasks
├── Notifications
├── Reports
└── Audit
```

Cross-company access must be denied in Firestore, Security Rules, Cloud
Functions, Storage, reports, search, workflows, notifications, and
background jobs.

------------------------------------------------------------------------

## 4. Signup and Automatic Owner

The user who signs up and creates a company automatically becomes that
company's **Owner** and initial administrator.

``` text
Sign Up
→ Firebase Auth User
→ Create Company
→ AutoHR User Profile
→ Company Membership
→ OWNER Authority
→ Initial Admin Permissions
→ Philippine Defaults
→ Dashboard
```

The user must not wait for approval.

OWNER is a protected built-in company authority. It cannot be
self-assigned through frontend/client writes. Initial company creation
and Owner assignment must use trusted/atomic server-controlled logic
where necessary.

Company Owner is not the same as an AutoHR platform-wide super admin.

------------------------------------------------------------------------

## 5. Company Initialization

On company creation initialize:

``` text
countryCode = PH
currencyCode = PHP
currencySymbol = ₱
locale = en-PH
timezone = Asia/Manila
```

Also initialize required built-in roles, permissions, membership, and
company configuration.

Do not ask the Owner to choose country or currency during onboarding.

------------------------------------------------------------------------

## 6. Core Product Principles

AutoHR must remain:

-   Employee-centered
-   HR-automation-focused
-   Transparent
-   Self-service-oriented
-   Secure
-   Auditable
-   Configurable
-   Responsive/mobile-first
-   Multi-tenant
-   Permission-aware
-   Modular
-   Production-oriented

Prefer automation and configuration over repetitive manual HR work and
company-specific hard-coding.

------------------------------------------------------------------------

## 7. In-Scope Modules

### Core HR

-   Company and organization management
-   Employee management
-   Employee profiles
-   Employment records/history
-   Employee self-service
-   HR requests
-   Employee documents
-   Permissions
-   Audit

### Attendance

-   Schedules/shifts
-   Attendance/clock logs
-   Missing logs
-   Late/early/absence
-   Breaks/overtime
-   Exceptions
-   Corrections/overrides
-   Approval
-   Payroll impact

### Leave

-   Leave types/policies
-   Balances
-   Requests
-   Approval workflow
-   Balance updates
-   Attendance/payroll impact
-   Notifications/history

### Payroll

-   Payroll profiles
-   Payroll periods
-   Earnings/deductions
-   Adjustments
-   Attendance/leave inputs
-   Calculation
-   Validation
-   Approval
-   Finalization
-   Payslips
-   Corrections
-   Employee transparency

### Platform Engines

-   Workflow
-   Approval
-   Tasks
-   Notifications
-   Rules
-   Events
-   Scheduler
-   SLA
-   Audit

### Platform

-   Firebase Authentication
-   Tenant isolation
-   RBAC
-   Fine-grained authorization
-   Reporting/analytics
-   Integrations
-   Administration
-   Future AI assistance

------------------------------------------------------------------------

## 8. Explicitly Out of Scope

Do not add:

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

Do not add placeholder navigation/cards/collections for these without a
future explicit scope change.

------------------------------------------------------------------------

## 9. Employee Self-Service and Transparency

Employee-facing experience includes:

``` text
Dashboard
My Tasks
Notifications
Attendance
Leave
Payroll / Payslips
Documents
Profile
HR Requests
```

Employees should securely see information AutoHR already knows,
including relevant attendance, missing logs, leave balances/status,
approved corrections, payslips/payroll details, tasks, documents, and
notifications.

Transparency does not override RBAC or privacy.

------------------------------------------------------------------------

## 10. Flexible Organization Structure

Support both simple and complex companies.

``` text
Small:
Company
└── Employees
```

``` text
Larger:
Company
├── Business Units
├── Branches / Locations
├── Departments
├── Teams
├── Positions
└── Employees
```

Do not require every hierarchy level.

------------------------------------------------------------------------

## 11. Employee Model

Employee is the central HR entity:

``` text
Employee
├── Personal / Contact
├── Employment
├── Organization / Position / Manager / Location
├── Payroll Profile
├── Attendance
├── Leave
├── Documents
├── Tasks / Notifications
└── History
```

Firebase Auth identity and Employee HR record are separate objects and
may be linked.

------------------------------------------------------------------------

## 12. Configurable Employee Status and Employment Type

Do not hard-code these as rigid enums.

Default employee-status examples:

``` text
Pre-Employment
Active
On Leave
Suspended
Terminated
Resigned
Retired
```

Default employment-type examples:

``` text
Regular
Probationary
Contractual
Part-time
Seasonal
Intern
Temporary
```

Companies can configure allowed values.

Important changes must preserve employee history, including department,
position, manager, location, status, employment type, employment period,
and relevant payroll-profile changes.

------------------------------------------------------------------------

## 13. Attendance Rules

Core flow:

``` text
Schedule
→ Attendance Logs
→ Validation
→ Missing Log / Exception Detection
→ Correction / Override
→ Approval when required
→ Final Attendance
→ Payroll Input / Recalculation
```

Locked behavior:

-   Missing logs trigger notifications.
-   Attendance corrections/overrides are controlled and audited.
-   Overrides requiring approval cannot silently affect payroll.
-   Approved changes that affect payroll must trigger the appropriate
    recalculation/adjustment logic according to payroll state.
-   Employees can see authorized attendance records/exceptions.
-   Managers/HR receive tasks/notifications when action is required.

------------------------------------------------------------------------

## 14. Leave Rules

``` text
Leave Request
→ Balance Validation
→ Policy Validation
→ Shared Approval Workflow
→ Approved/Rejected
→ Balance Update
→ Attendance Update
→ Payroll Impact if applicable
→ Notification
→ Audit
```

Leave balances and request status must be transparent to employees. Do
not create a separate leave-only approval architecture.

------------------------------------------------------------------------

## 15. Payroll

Automatic payroll/deductions/payslips are major priorities.

``` text
Payroll Period
→ Payroll Profiles
→ Attendance + Leave
→ Earnings + Deductions
→ Adjustments
→ Calculation
→ Validation
→ Approval
→ Finalization
→ Payslip
→ Employee Transparency
```

Because AutoHR is Philippines-only, payroll architecture must support
Philippine requirements such as, where applicable:

-   SSS
-   PhilHealth
-   Pag-IBIG / HDMF
-   Withholding tax
-   Other lawful earnings/deductions

Do not invent statutory rates. Model statutory rules centrally with
effective dates so rate changes remain historically correct.

------------------------------------------------------------------------

## 16. Payroll Finalization and Corrections

Finalized payroll is immutable.

``` text
Calculated
→ Validated
→ Approved
→ Finalized
→ LOCKED
```

Corrections use controlled adjustment/correction workflows and audit
history. Do not silently edit finalized payroll.

Sensitive payroll data must not appear in ordinary logs.

Payslips are private, authorization-protected, securely stored,
historically retained according to policy, and tied to the correct
employee/company/payroll period.

------------------------------------------------------------------------

## 17. Workflow Engine

Shared platform capability supporting:

-   Sequential/parallel approvals
-   Conditions
-   Dynamic approvers
-   Delegation
-   Escalation
-   Timers/SLA
-   Automated/manual actions
-   Tasks
-   Notifications
-   Sub-workflows
-   Pause/resume
-   Cancellation
-   Rejection/resubmission
-   Versioning
-   Simulation
-   Audit

Lifecycle:

``` text
Draft → Validate → Simulate → Review → Approve → Publish → Active → Deprecated → Retired
```

Published versions are immutable. Running instances stay on their
original version unless explicitly migrated.

------------------------------------------------------------------------

## 18. Approval Engine

Support:

``` text
All must approve
Any one can approve
2 of 3
Minimum count
Percentage/quorum
Required role + additional approvals
```

Approvers may be resolved from manager hierarchy, position, role,
department/team, location, job level, value threshold, and policy.

Prevent inappropriate self-approval and support segregation of duties.

------------------------------------------------------------------------

## 19. Task Engine

Human workflow actions become centralized tasks.

``` text
Task ID
Company ID
Workflow Instance
Business Record
Type / Title / Description
Assignee / Role
Priority
SLA / Due Date
Status
Actions
Comments / Attachments
Created / Completed
```

States may include Open, Assigned, In Progress, Blocked, Completed,
Cancelled, Expired.

Provide a unified **My Tasks** experience.

------------------------------------------------------------------------

## 20. Notification Engine

``` text
Business Event
→ Rule
→ Conditions
→ Recipients
→ Privacy
→ Preferences / Quiet Hours
→ Template
→ Priority / Queue
→ Provider Routing
→ Delivery
→ Audit
```

Channels:

-   In-app
-   Email
-   SMS
-   Push
-   Digest

Support provider failover, retry/backoff/jitter, idempotency,
deduplication, rate limiting, circuit breakers, dead-letter handling,
replay, provider health, SLA, localization readiness, template
versioning, and privacy.

Notification Center categories can include All, Requires Action,
Conversations, Approvals, Payroll, Attendance, Leave, Documents, Alerts,
System.

------------------------------------------------------------------------

## 21. Notification Incident Management and SLA

Major notification failures can become incidents:

``` text
Detected → Created → Triaged → Investigating → Mitigating → Monitoring → Resolved → Postmortem
```

Severity: SEV-1 through SEV-4 based on impact.

SLA supports 24×7/business-hour calendars, weekends, configured
Philippine holidays, time zones, pause/resume, warnings, at-risk,
breach, and escalation. Preserve historical policy/calendar versions.

------------------------------------------------------------------------

## 22. Event Architecture

Events carry:

``` text
Event ID
Event Type
Event Version
Company ID
Correlation ID
Source
Timestamp
Payload
```

Support validation, idempotency, replay, dead-letter handling,
correlation, and ordering where required.

Example:

``` text
LeaveApproved
├── Leave Balance
├── Attendance
├── Payroll
├── Notification
└── Audit
```

------------------------------------------------------------------------

## 23. Audit

Audit is first-class.

Audit important actions including company creation,
users/roles/permissions, employee changes, attendance corrections, leave
actions, payroll calculation/approval/finalization/correction, payslip
generation, workflows, notifications, and sensitive document access.

Capture actor, company, action, resource, resource ID, timestamp,
previous/new state, correlation ID, and workflow/task context where
appropriate.

Critical audit history must not be client-rewritable.

------------------------------------------------------------------------

## 24. Real Firebase Authentication

Production flow must use real Firebase Authentication, not live
personas.

Required:

-   Signup
-   Login
-   Logout
-   Auth-state listener
-   Session restoration
-   Password reset
-   Protected routes
-   AutoHR user profile
-   Company membership
-   Account status
-   RBAC

``` text
Firebase Auth
→ AutoHR User
→ Company Membership
→ Account Status
→ Role / Permission
→ Protected App
```

Valid Firebase authentication alone does not guarantee app access.

Application account states may include Active, Inactive, Suspended,
Pending Setup.

------------------------------------------------------------------------

## 25. RBAC and Owner Security

``` text
Authentication
→ Company Membership
→ Role
→ Permission
→ Resource
→ Record Policy
→ Action
```

Support built-in/custom roles, permissions, company assignments,
delegation, temporary authority, approval authority, and segregation of
duties.

Frontend permission checks control visibility only. Firestore
Rules/Cloud Functions enforce actual access.

`OWNER` is protected, automatically assigned to the first company
creator, company-scoped, and cannot be self-assigned through client
writes.

------------------------------------------------------------------------

## 26. Technology Stack

Frontend:

-   React
-   TypeScript
-   Vite
-   React Router
-   shadcn/ui
-   Tailwind CSS
-   Lucide icons

Firebase:

-   Firebase Authentication
-   Cloud Firestore
-   Firebase Storage
-   Cloud Functions
-   Firebase App Check
-   Firebase Cloud Messaging where needed
-   Firebase Hosting where appropriate

Engineering:

-   TypeScript end-to-end where practical
-   Zod/runtime validation
-   Firestore transactions/batches
-   Structured logging
-   Automated tests
-   Environment-specific Firebase configuration

Do not reintroduce Supabase.

------------------------------------------------------------------------

## 27. Firestore / Storage / Functions Security

Design Firestore around company boundaries and real query patterns. Do
not blindly nest everything.

Deny by default.

Must be impossible:

``` text
Company A user → Company B data
User → promotes self to OWNER/ADMIN
User → changes own permissions
Employee → finalizes payroll directly
Employee → performs restricted self-approval
Unauthorized user → private payslip/document
```

Firebase Storage files are private by default.

Use Cloud Functions for privileged operations such as company
creation/Owner assignment, sensitive role changes, trusted payroll
calculation/finalization, workflows, scheduled jobs, notifications,
integrations, and trusted audit operations.

Never expose Firebase Admin credentials in frontend code.

------------------------------------------------------------------------

## 28. Responsive UI

AutoHR is mobile-first and must work from approximately 320px through
large desktop widths.

Desktop can use persistent sidebar; mobile uses a drawer/mobile
navigation.

Requirements:

-   No major horizontal overflow
-   Responsive dashboard grids
-   Responsive tables/lists
-   Forms stack on mobile
-   Dialogs fit viewport
-   Employee Profile stacks appropriately
-   Navigation is permission-aware
-   Touch targets are comfortable
-   Do not simply shrink desktop UI

Test approximately: 320, 375, 390, 430, 768, 1024, 1280, 1440, 1920px.

------------------------------------------------------------------------

## 29. Uniform Design System

Visual identity: professional, clean, enterprise-grade, calm, minimal,
readable, consistent.

Palette:

``` text
Primary        #2563EB
Primary Hover  #1D4ED8
Primary Soft   #DBEAFE
Secondary      #0F172A
Secondary Soft #F1F5F9
Success        #16A34A
Success Soft   #DCFCE7
Warning        #D97706
Warning Soft   #FEF3C7
Danger         #DC2626
Danger Soft    #FEE2E2
Info           #0891B2
Info Soft      #CFFAFE
Background     #F8FAFC
Surface        #FFFFFF
Border         #E2E8F0
Text Primary   #0F172A
Text Secondary #475569
Text Muted     #64748B
Disabled       #94A3B8
```

Semantic use: blue primary/action, green success, amber pending/warning,
red error/rejected/critical, cyan information.

Avoid flashy gradients, arbitrary colors, excessive shadows, excessive
rounded cards, and inconsistent styles.

Use Inter/system sans-serif typography and shared shadcn/ui components.

------------------------------------------------------------------------

## 30. Navigation

Employee:

``` text
Dashboard
My Tasks
Notifications
Attendance
Leave
Payroll
Documents
Profile
HR Requests
```

Manager/HR/Admin may also see:

``` text
Employees
Organization
Workflows
Reports
Administration
```

Only show modules the current user can access.

------------------------------------------------------------------------

## 31. Documents, Reporting, Search

Documents include employee documents, contracts, forms, policies,
payslips, attachments, versioning, expiration, access control, workflow,
and future e-signature integration.

Reports cover operational, management, and enterprise views while
respecting permissions.

Global search may cover authorized employees, organization records,
documents, leave, attendance, payroll, tasks, and workflows. Never leak
inaccessible results.

------------------------------------------------------------------------

## 32. Time, Locale, Currency

Store timestamps consistently (prefer UTC) and present using
business/user policy.

Default business timezone is `Asia/Manila`.

Currency is PHP/₱. Locale is `en-PH`.

Do not use browser timezone as authoritative business time.

English is the initial locale. Keep localization-ready without adding
country selection.

------------------------------------------------------------------------

## 33. Security, Validation, Accessibility

Mandatory security: least privilege, secure defaults, server-side
authorization, tenant isolation, private storage, secret management,
validation, audit, rate limiting, abuse prevention, App Check, secure
sessions, dependency updates.

Never trust client-supplied company ID, role, permission, payroll
amount, approval/finalization state, Owner authority, or security
decision.

Use TypeScript, Zod/runtime validation, Security Rules, and Cloud
Function validation.

Accessibility: semantic HTML, keyboard navigation, focus states, labels,
screen-reader support, contrast, clear errors, touch targets, reduced
motion where appropriate.

------------------------------------------------------------------------

## 34. Testing

Unit: rules, calculations, permissions, validation, dates, payroll,
leave, attendance.

Integration: Firebase Auth, Firestore, Storage, workflows,
notifications, payroll, company initialization.

Security: cross-company access, role escalation, Owner escalation, admin
access, documents/payslips, payroll, direct Firestore writes.

Critical E2E journeys:

``` text
Sign Up
Create Company
Automatic Owner Assignment
Login / Logout / Session Restore
Employee Creation
Attendance Exception / Correction Approval
Leave Request / Approval
Payroll Processing / Finalization
Payslip Access
Workflow Approval
Notification Delivery
```

------------------------------------------------------------------------

## 35. Delivery Phases

### Phase 1 --- Foundation

Firebase Auth, Company/Tenant, Automatic Owner, Organization, Employees,
RBAC, Security Rules, Audit, Administration, Responsive Shell.

### Phase 2 --- Core HR

Attendance, Leave, Documents, Employee Self-Service.

### Phase 3 --- Automation

Workflow, Approval, Tasks, Notifications, Rules, Events, Scheduler, SLA.

### Phase 4 --- Payroll

Payroll Profiles, Philippine Payroll Rules, Periods, Calculation,
Deductions, Validation, Approval, Finalization, Payslips, Corrections.

### Phase 5 --- Intelligence

Advanced reporting, analytics, integrations, AI-assisted capabilities,
advanced compliance.

Do not implement all phases at once unless explicitly instructed.

------------------------------------------------------------------------

## 36. Current Immediate Priority

The Master Specification has already been executed. Reconcile the
current project against this source of truth.

Immediate implementation:

``` text
1. Inspect existing project
2. Preserve completed work
3. Enforce Philippines-only defaults
4. Remove unnecessary country/multi-currency UX
5. Implement/verify real Firebase signup
6. Implement/verify company creation
7. Securely assign initial user as OWNER
8. Initialize PH / PHP / en-PH / Asia-Manila defaults
9. Verify login/logout/session restoration/password reset
10. Verify company membership
11. Verify RBAC/protected routes
12. Verify Firestore/Storage tenant isolation
13. Remove production live-persona authentication
14. Complete responsive UI correction
15. Run security/auth/responsive QA
16. Fix regressions
```

Required onboarding result:

``` text
NEW USER
→ SIGN UP
→ CREATE COMPANY
→ PHILIPPINE DEFAULTS INITIALIZED
→ USER BECOMES COMPANY OWNER
→ PROTECTED DASHBOARD
→ OWNER CONFIGURES COMPANY / EMPLOYEES
```

------------------------------------------------------------------------

## 37. Automation-First Behavior

Examples:

``` text
Missing attendance log
→ detect automatically
→ notify employee/manager
```

``` text
Leave approved
→ update balance
→ update attendance
→ notify parties
→ feed payroll if applicable
```

``` text
Approved attendance correction
→ update trusted attendance
→ trigger payroll recalculation/adjustment logic
→ audit
```

``` text
Payroll finalized
→ lock result
→ generate/protect payslip
→ notify employee
→ audit
```

Automation must respect approvals, authorization, and audit.

------------------------------------------------------------------------

## 38. Do Not Duplicate Platform Engines

Before implementing module logic, reuse shared Workflow, Approval, Task,
Notification, Rules, Event, Authorization, and Audit systems.

Do not build leave-only approvals, attendance-only notifications,
payroll-only task systems, or separate authorization/audit systems per
module.

------------------------------------------------------------------------

## 39. Critical Do-Not-Do List

Do NOT:

-   Turn AutoHR into a multi-country product
-   Add country selection
-   Add ordinary onboarding currency selection
-   Reintroduce Supabase
-   Use live personas as production authentication
-   Trust client-supplied tenant/role/permission data
-   Allow self-promotion to Owner/Admin
-   Expose Firebase Admin credentials
-   Expose private payslips/documents
-   Hard-code employee status/employment type
-   Scatter Philippine statutory rates through UI code
-   Invent statutory rates
-   Retroactively apply new rates to finalized historical payroll
-   Silently edit finalized payroll
-   Bypass attendance-override approval
-   Bypass audit
-   Duplicate platform engines
-   Add excluded modules
-   Introduce arbitrary design colors
-   Break responsive behavior
-   Use browser timezone as authoritative business time
-   Rebuild working features unnecessarily

------------------------------------------------------------------------

## 40. Source-of-Truth Precedence

``` text
1. AutoHR_Consolidated_Source_of_Truth_PH_v1.2.md
2. AutoHR_FollowUp_Responsive_UI_Firebase_Auth_v1.1.md
3. AutoHR_Master_Specification_v1.0.md
4. Existing implementation details that do not conflict with the above
```

This v1.2 Philippines-only decision overrides any older generic
multi-country assumption.

This v1.2 signup → company creation → automatic Owner flow overrides any
older incomplete assumption that a user already has organization
membership.

------------------------------------------------------------------------

## 41. Final Architecture

``` text
                         AUTOHR
                  PHILIPPINES ONLY
                         │
                  Company / Tenant
                         │
               Initial User = OWNER
                         │
      ┌──────────────────┼──────────────────┐
      ↓                  ↓                  ↓
Employee Self-Service HR/Managers      Administration
      └──────────────────┼──────────────────┘
                         ↓
               Business Modules
          Employees / Attendance / Leave
             Payroll / Documents
                         ↓
                Platform Engines
      Workflow / Approval / Tasks / Notifications
        Rules / Events / Scheduler / SLA / Audit
                         ↓
                Firebase Platform
       Auth / Firestore / Storage / Functions
          Security Rules / App Check / FCM
                         ↓
                 Reports / Future AI
```

------------------------------------------------------------------------

## 42. Final Instruction to Antigravity

Treat the existing repository as the starting point.

Do not regenerate AutoHR.

Inspect, reconcile, improve, secure, test, and preserve working
functionality.

The foundation is not complete until a real new user can:

``` text
Sign Up
→ Create Company
→ Automatically Become OWNER
→ Receive Philippine Company Defaults
→ Enter Protected AutoHR
→ Create/Manage Company HR Data According to Permissions
→ Logout
→ Log Back In
→ Restore the Correct Company Context Securely
```

All of this must work responsively on mobile, tablet, and desktop and
must preserve company isolation, RBAC, auditability, and the AutoHR
design system.

# END OF AUTOHR CONSOLIDATED SOURCE OF TRUTH v1.2
