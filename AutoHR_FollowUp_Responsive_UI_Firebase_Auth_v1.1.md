# AutoHR --- Follow-Up Implementation Specification

## Responsive UI + Real Firebase Authentication

### Post-Master-Specification Implementation --- v1.1

> **Status:** Follow-up engineering task\
> **Prerequisite:** `AutoHR_Master_Specification_v1.0.md` has already
> been executed.\
> **Primary objectives:**\
> 1. Fix and normalize the existing AutoHR responsive UI/design.\
> 2. Replace live-persona/mock authentication with real Firebase
> Authentication, real sessions, logout, protected routes, tenant
> membership, and authorization.

------------------------------------------------------------------------

# 1. EXECUTION RULES

This is a follow-up to the already-executed AutoHR Master Specification.

**Do not rebuild the application from scratch.**

Before making changes:

1.  Inspect the current repository and running application.
2.  Identify what the Master Specification already implemented.
3.  Preserve existing working functionality.
4.  Preserve the current AutoHR architecture.
5.  Preserve Firebase as backend/authentication.
6.  Preserve multi-tenancy, RBAC, auditability, and the established
    design system.
7.  Make targeted improvements instead of unnecessary rewrites.
8.  Do not introduce Supabase.
9.  Do not reintroduce excluded modules.
10. Run the application after changes and fix regressions before
    completion.

The two workstreams are:

``` text
WORKSTREAM A
Responsive UI + Design Quality

WORKSTREAM B
Real Firebase Authentication + Authorization
```

------------------------------------------------------------------------

# 2. WORKSTREAM A --- RESPONSIVE UI

## Goal

Make AutoHR genuinely usable on:

-   Mobile phones
-   Tablets
-   Laptops
-   Desktop monitors
-   Large desktop displays

Do not simply shrink the desktop interface.

The mobile experience must be intentionally designed.

------------------------------------------------------------------------

# 3. RESPONSIVE AUDIT

Before modifying components, inspect the entire existing UI for:

-   Fixed widths
-   Fixed heights
-   `min-width` causing overflow
-   Horizontal page overflow
-   Sidebar overflow
-   Header overflow
-   Navigation problems
-   Dashboard grid problems
-   Cards that overflow
-   Tables wider than viewport
-   Forms that remain multi-column on phones
-   Dialogs/modals exceeding viewport
-   Dropdowns leaving the viewport
-   Long employee names
-   Long department/position names
-   Filter toolbars
-   Search controls
-   Charts
-   Tabs
-   Employee profile
-   Notification screens
-   Task screens
-   Admin screens
-   Touch target sizes
-   Text wrapping
-   Excessive mobile padding

Fix shared layout patterns instead of applying dozens of isolated CSS
patches.

------------------------------------------------------------------------

# 4. RESPONSIVE BREAKPOINTS

Use the project's existing Tailwind configuration wherever possible.

Target approximately:

``` text
Mobile        < 640px
Small Tablet  640–767px
Tablet        768–1023px
Desktop       1024–1279px
Large Desktop 1280px+
```

Avoid unnecessary custom breakpoints.

Prefer CSS/Tailwind responsive behavior over JavaScript viewport
detection.

------------------------------------------------------------------------

# 5. APPLICATION SHELL

Desktop:

``` text
┌───────────────────────────────────────────────┐
│ Header                                        │
├───────────────┬───────────────────────────────┤
│ Sidebar       │ Main Content                  │
│               │                               │
│               │                               │
└───────────────┴───────────────────────────────┘
```

Mobile:

``` text
┌─────────────────────────┐
│ Mobile Header           │
├─────────────────────────┤
│                         │
│ Main Content            │
│                         │
├─────────────────────────┤
│ Mobile Navigation       │
└─────────────────────────┘
```

Requirements:

-   Desktop sidebar may remain persistent.
-   Tablet sidebar may collapse into compact/icon mode.
-   Mobile must not show the full desktop sidebar permanently.
-   Use a drawer/sheet and/or appropriate mobile navigation.
-   Main content must use available width.
-   Prevent page-level horizontal overflow.

------------------------------------------------------------------------

# 6. HEADER

The header must:

-   Remain usable at 320px width.
-   Keep menu, page identity, notifications, and account access
    available.
-   Truncate long names gracefully.
-   Avoid excessive horizontal padding.
-   Maintain consistent height.
-   Never force the page wider than the viewport.

Possible behavior:

``` text
Desktop:
[Menu] [Page Title]             [Search] [Bell] [User]

Mobile:
[Menu] [Page Title]                    [Bell]
```

Less-important controls can move into menus on mobile.

------------------------------------------------------------------------

# 7. SIDEBAR AND NAVIGATION

Desktop:

-   Persistent sidebar is acceptable.
-   Active route must be obvious.
-   Groups must remain readable.
-   Sidebar width should be consistent.

Tablet:

-   Compact/collapsible behavior is acceptable.

Mobile:

-   Use drawer/sheet or mobile navigation.
-   Ensure touch-friendly items.
-   Closing the navigation after route selection should feel natural.
-   Do not expose inaccessible modules.

Navigation must remain permission-aware.

------------------------------------------------------------------------

# 8. DASHBOARD

Dashboard cards must adapt automatically.

Desktop:

``` text
┌────────┬────────┬────────┬────────┐
│ Card   │ Card   │ Card   │ Card   │
└────────┴────────┴────────┴────────┘
```

Tablet:

``` text
┌────────┬────────┐
│ Card   │ Card   │
├────────┼────────┤
│ Card   │ Card   │
└────────┴────────┘
```

Mobile:

``` text
┌──────────────────┐
│ Card             │
├──────────────────┤
│ Card             │
├──────────────────┤
│ Card             │
└──────────────────┘
```

Do not hard-code card widths.

------------------------------------------------------------------------

# 9. TABLES AND DATA LISTS

Tables are a high-priority responsive area.

Requirements:

-   Never allow a table to break the entire page width.
-   Use a contained horizontal scroll area when many columns are
    essential.
-   Keep key identifying columns accessible.
-   Hide lower-priority columns at smaller breakpoints where
    appropriate.
-   Consider mobile card/list representations for
    employee/task/notification data.
-   Keep row actions accessible.
-   Avoid tiny fonts simply to force all columns onto a phone.
-   Pagination must work on mobile.
-   Filters must wrap or collapse intelligently.

------------------------------------------------------------------------

# 10. FORMS

Desktop forms may use multiple columns.

Example:

``` text
First Name       Last Name
Email            Phone
Department       Position
Location         Manager
```

Mobile should become:

``` text
First Name
Last Name
Email
Phone
Department
Position
Location
Manager
```

Requirements:

-   Avoid fixed input widths.
-   Inputs should generally fill their responsive container.
-   Labels must remain visible.
-   Validation messages must not break layout.
-   Button groups should stack when necessary.
-   Date pickers/selects/comboboxes must remain usable on mobile.

------------------------------------------------------------------------

# 11. DIALOGS, MODALS, DRAWERS

Requirements:

-   Respect viewport width.
-   Respect viewport height.
-   Long content must scroll internally.
-   Actions must remain reachable.
-   Mobile keyboards must not hide critical controls.
-   Large desktop dialogs may become near-full-screen sheets/drawers on
    mobile.
-   Maintain focus management and Escape behavior.

------------------------------------------------------------------------

# 12. EMPLOYEE PROFILE

Treat the Employee Profile as a priority screen.

Desktop may use:

``` text
┌───────────────────────────────────────┐
│ Employee Header                       │
├───────────────┬───────────────────────┤
│ Summary       │ Employment            │
├───────────────┴───────────────────────┤
│ Tabs                                  │
├───────────────────────────────────────┤
│ Content                               │
└───────────────────────────────────────┘
```

Mobile:

``` text
Employee Header
      ↓
Summary
      ↓
Employment
      ↓
Scrollable/Responsive Tabs
      ↓
Content
```

Do not squeeze desktop columns onto mobile.

------------------------------------------------------------------------

# 13. DESIGN SYSTEM NORMALIZATION

Continue using the established AutoHR design palette.

## Primary

``` text
Primary:        #2563EB
Primary Hover:  #1D4ED8
Primary Soft:   #DBEAFE
```

## Secondary

``` text
Secondary:      #0F172A
Secondary Soft: #F1F5F9
```

## Success

``` text
Success:        #16A34A
Success Soft:   #DCFCE7
```

## Warning

``` text
Warning:        #D97706
Warning Soft:   #FEF3C7
```

## Danger

``` text
Danger:         #DC2626
Danger Soft:    #FEE2E2
```

## Information

``` text
Info:           #0891B2
Info Soft:      #CFFAFE
```

## Neutral

``` text
Background:     #F8FAFC
Surface:        #FFFFFF
Border:         #E2E8F0
Text Primary:   #0F172A
Text Secondary: #475569
Text Muted:     #64748B
Disabled:       #94A3B8
```

Do not introduce arbitrary module-specific colors.

Normalize inconsistent:

-   Border radii
-   Shadows
-   Padding
-   Gaps
-   Button heights
-   Input heights
-   Typography
-   Badges
-   Status colors
-   Cards
-   Tables
-   Dialogs
-   Page headers

Reuse shared shadcn/ui-based components and design tokens.

------------------------------------------------------------------------

# 14. TOUCH AND ACCESSIBILITY

Important interactive controls should have approximately 40--44px or
larger effective touch targets where practical.

Verify:

-   Keyboard navigation
-   Visible focus
-   Semantic HTML
-   Accessible labels
-   Screen-reader behavior
-   Dialog focus trapping
-   Color contrast
-   Error messaging
-   Reduced-motion support where appropriate

Do not communicate state by color alone.

------------------------------------------------------------------------

# 15. WORKSTREAM B --- REAL FIREBASE AUTHENTICATION

The current live-persona/mock authentication must be removed from the
production application flow.

Use:

``` text
Firebase Authentication
        ↓
Authenticated Firebase User
        ↓
Application User Profile
        ↓
Organization Membership
        ↓
Role / Permissions
        ↓
Protected AutoHR
```

Firebase Authentication is the source of truth for identity.

Firestore is the source of truth for AutoHR application-level membership
and authorization relationships.

------------------------------------------------------------------------

# 16. REAL LOGIN

Implement a production login flow with:

-   Email
-   Password
-   Sign In button
-   Loading state
-   Input validation
-   Friendly error messages
-   Password visibility toggle
-   Forgot Password
-   Session persistence

Use the Firebase Authentication SDK.

Do not authenticate through:

-   Local component state
-   LocalStorage flags
-   Fake users
-   Hard-coded personas
-   Demo roles

------------------------------------------------------------------------

# 17. AUTH PROVIDER / AUTH STATE

Create or reuse one centralized authentication provider/context.

Conceptually:

``` text
AuthProvider
 ├── firebaseUser
 ├── appUser
 ├── loading
 ├── isAuthenticated
 ├── login()
 ├── logout()
 ├── resetPassword()
 └── refreshProfile()
```

Use Firebase's authentication state listener.

Do not create multiple independent Firebase auth listeners throughout
the component tree.

------------------------------------------------------------------------

# 18. SESSION RESTORATION

The application must wait for Firebase authentication initialization.

Correct flow:

``` text
App Starts
    ↓
Auth Loading
    ↓
Firebase Auth State Resolved
    ↓
┌────────────────┬─────────────────┐
│ Authenticated  │ Unauthenticated │
└───────┬────────┴────────┬────────┘
        ↓                 ↓
 Load App Profile       Login
        ↓
 Application
```

Do not briefly display the login screen while restoring a valid session.

A browser refresh while logged in should keep the user logged in.

------------------------------------------------------------------------

# 19. REAL LOGOUT

Logout must:

1.  Call Firebase `signOut`.
2.  Clear application user/auth state.
3.  Clear sensitive cached data where appropriate.
4.  Navigate to `/login`.
5.  Prevent protected routes from remaining accessible.
6.  Prevent stale tenant/user data from remaining visible.

------------------------------------------------------------------------

# 20. PROTECTED ROUTES

Protect all authenticated areas, including:

``` text
/dashboard
/employees
/organization
/attendance
/leave
/payroll
/tasks
/workflows
/notifications
/documents
/reports
/admin
```

Unauthenticated:

``` text
Protected Route
      ↓
/login
```

Authenticated users visiting `/login` may be redirected to their
authorized landing page.

------------------------------------------------------------------------

# 21. APPLICATION USER PROFILE

After Firebase authentication, retrieve the AutoHR user profile from
Firestore.

Conceptually:

``` text
users/{uid}
```

Suggested fields:

``` text
uid
email
displayName
organizationId
employeeId
status
createdAt
updatedAt
```

Do not merge the Firebase identity record and employee HR record into
one concept.

------------------------------------------------------------------------

# 22. ORGANIZATION MEMBERSHIP

A Firebase user must have a valid tenant/organization relationship
before tenant data can be accessed.

Flow:

``` text
Firebase Auth
      ↓
AutoHR User
      ↓
Organization Membership
      ↓
Account Status
      ↓
Role / Permission
      ↓
Application
```

If membership is missing or invalid:

-   Do not expose tenant data.
-   Display an appropriate setup/access state.
-   Do not allow the browser to arbitrarily choose another organization.

------------------------------------------------------------------------

# 23. ACCOUNT STATES

Application account state is separate from Firebase authentication
state.

Support:

``` text
Active
Inactive
Suspended
Pending Setup
```

Example:

``` text
Firebase authenticated
+
AutoHR account suspended
=
Application access denied
```

------------------------------------------------------------------------

# 24. RBAC AND AUTHORIZATION

Do not trust roles or permissions supplied by frontend state.

Conceptually:

``` text
User
 ↓
Organization Membership
 ↓
Role
 ↓
Permissions
 ↓
Resource / Action
```

Frontend authorization:

``` text
Should this user SEE this menu/button?
```

Backend/security authorization:

``` text
Can this user ACTUALLY perform this read/write?
```

Both are required.

Critical authorization must be enforced by Firestore Security Rules
and/or trusted Cloud Functions.

------------------------------------------------------------------------

# 25. FIRESTORE SECURITY RULES

Review the existing Firestore Security Rules as part of this task.

The following must be impossible:

``` text
Organization A User
      ↓
manually changes organizationId
      ↓
reads Organization B data
```

Also prevent:

``` text
User
→ modifies own role
→ becomes SUPER_ADMIN
```

``` text
User
→ modifies own permissions
```

``` text
User
→ modifies another organization's employee
```

``` text
Employee
→ directly writes an approval/finalization state
```

Security should deny by default.

------------------------------------------------------------------------

# 26. REMOVE LIVE PERSONA / MOCK AUTH

Search the repository for authentication simulation patterns such as:

``` text
mockUser
fakeUser
demoUser
persona
livePersona
live persona
testPersona
selectedUser
selectedPersona
currentPersona
isDemo
mockAuth
fakeAuth
localStorage auth
hard-coded user
hard-coded role
```

For each occurrence determine whether it is:

1.  Production simulation code
2.  Development-only tooling
3.  Automated test fixture

Remove production simulation from the normal application flow.

Do not unnecessarily delete useful automated-test fixtures; isolate them
from production authentication.

The user-facing application must no longer require persona switching to
test normal access.

------------------------------------------------------------------------

# 27. PASSWORD RESET

Implement Firebase password reset.

``` text
Login
 ↓
Forgot Password
 ↓
Enter Email
 ↓
Firebase Password Reset
 ↓
Confirmation
```

Provide clear success/failure feedback.

Avoid unnecessary account-enumeration behavior.

------------------------------------------------------------------------

# 28. AUTH ERROR UX

Map Firebase errors to understandable AutoHR messages.

Handle:

-   Invalid credentials
-   Invalid email
-   Disabled account
-   Too many attempts
-   Network failure
-   Password reset failure
-   Session/authentication problem
-   Unauthorized access
-   Missing organization membership
-   Missing application profile
-   Suspended AutoHR account

Do not show raw Firebase error internals to ordinary users.

------------------------------------------------------------------------

# 29. LOGIN SCREEN DESIGN

The login screen must follow the AutoHR design system.

Requirements:

-   Responsive at 320px and above
-   Clean professional layout
-   AutoHR branding
-   Full-width mobile form
-   Comfortable touch targets
-   Keyboard-friendly
-   Clear focus states
-   Clear loading state
-   Clear error state
-   Primary blue for main Sign In action
-   No horizontal overflow

Do not over-design the login page with unnecessary gradients or
decorative effects.

------------------------------------------------------------------------

# 30. FIREBASE ENVIRONMENT CONFIGURATION

Use environment variables for Firebase web configuration.

Support the project's environment strategy, ideally:

``` text
Development
Staging
Production
```

Never expose or commit:

-   Firebase Admin SDK private keys
-   Service-account JSON
-   Private integration secrets

Firebase Admin credentials must never be included in frontend code.

------------------------------------------------------------------------

# 31. AUTHORIZATION TESTS

At minimum test:

## Unauthenticated route access

``` text
No Firebase Session
→ /dashboard
→ /login
```

## Valid login

``` text
Valid Firebase User
→ Login
→ Profile/Membership resolved
→ Dashboard
```

## Logout

``` text
Authenticated
→ Logout
→ Firebase Session Removed
→ /login
→ Protected Routes Blocked
```

## Refresh

``` text
Authenticated
→ Browser Refresh
→ Session Restored
→ Application Remains Available
```

## Tenant isolation

``` text
Organization A User
→ Organization B Data
→ DENIED
```

## Role restriction

``` text
Employee
→ Admin Operation
→ DENIED
```

## Direct URL authorization

``` text
Employee
→ manually enters /admin
→ access denied / redirected appropriately
```

## Suspended account

``` text
Valid Firebase Credentials
+
Suspended AutoHR User
→ Application Access Denied
```

------------------------------------------------------------------------

# 32. RESPONSIVE QA MATRIX

Test approximately:

``` text
320px
375px
390px
430px
768px
1024px
1280px
1440px
1920px
```

Review:

``` text
Login
Dashboard
Sidebar
Header
Navigation
Employee List
Employee Profile
Employee Forms
Tables
Filters
Search
Dialogs
Dropdowns
Notifications
Tasks
Organization
Admin Pages
```

Verify:

-   No major page-level horizontal overflow
-   No inaccessible actions
-   No unreadably small text
-   No overlapping UI
-   No clipped dialogs
-   No desktop sidebar forced onto mobile
-   No broken mobile forms

------------------------------------------------------------------------

# 33. PERFORMANCE CHECK

After implementation verify:

-   No duplicate Firebase auth listeners
-   No repeated unnecessary profile reads
-   No unnecessary viewport event listeners
-   No unbounded Firestore queries
-   Lists remain paginated
-   No excessive layout shifts
-   No sensitive cached data after logout
-   No obvious render loops

------------------------------------------------------------------------

# 34. DEFINITION OF DONE --- RESPONSIVE UI

This workstream is complete when:

``` text
[ ] Login works on mobile/tablet/desktop
[ ] Dashboard adapts correctly
[ ] Sidebar/navigation adapts correctly
[ ] Header adapts correctly
[ ] Employee list is usable on mobile
[ ] Employee profile is usable on mobile
[ ] Forms stack correctly
[ ] Tables do not break page layout
[ ] Dialogs remain usable
[ ] Touch controls are appropriate
[ ] AutoHR palette is consistently applied
[ ] Typography is consistent
[ ] Spacing is consistent
[ ] Existing functionality remains intact
[ ] No major horizontal overflow remains
```

------------------------------------------------------------------------

# 35. DEFINITION OF DONE --- AUTHENTICATION

Authentication is complete when:

``` text
[ ] Real Firebase login works
[ ] Mock/persona login is removed from production flow
[ ] Firebase auth state listener is implemented
[ ] Session restoration works
[ ] Browser refresh keeps valid session
[ ] Real Firebase logout works
[ ] Protected routes work
[ ] Firestore application profile loads
[ ] Organization membership is validated
[ ] Account status is enforced
[ ] Role restrictions are enforced
[ ] Tenant isolation is enforced
[ ] Forgot-password works
[ ] Suspended users are denied application access
[ ] No sensitive credentials exist in frontend
[ ] Security Rules have been reviewed/tested
```

------------------------------------------------------------------------

# 36. ENGINEERING QUALITY GATE

Before marking the task complete:

``` text
[ ] TypeScript passes
[ ] Production build passes
[ ] Existing tests pass
[ ] New auth tests pass
[ ] Security Rules validated
[ ] Responsive QA completed
[ ] No Supabase dependency introduced
[ ] No production persona/mock auth remains
[ ] No secrets committed
[ ] No existing AutoHR functionality unintentionally removed
```

If an existing test fails because the old test explicitly depends on
persona/mock authentication, update that test to use an appropriate
isolated fixture or Firebase emulator strategy instead of preserving
mock authentication in production.

------------------------------------------------------------------------

# 37. IMPLEMENTATION ORDER

Antigravity should execute this task in this order:

``` text
01. Inspect current repository and running app
02. Identify implementation created from Master Specification
03. Audit global responsive layout
04. Normalize design tokens/shared components
05. Fix application shell
06. Fix sidebar/navigation
07. Fix header
08. Fix dashboard
09. Fix tables/lists
10. Fix forms
11. Fix dialogs/drawers
12. Fix Employee Profile
13. Responsive QA

14. Inspect existing live-persona/mock authentication
15. Verify current Firebase initialization
16. Implement centralized AuthProvider
17. Implement real Firebase login
18. Implement auth initialization/loading state
19. Implement session restoration
20. Implement real logout
21. Implement protected routes
22. Load AutoHR user profile
23. Validate organization membership
24. Enforce account status
25. Integrate role/permission UI behavior
26. Review/enforce Firestore Security Rules
27. Remove production persona/mock authentication
28. Implement password reset
29. Run auth/authorization tests
30. Run tenant-isolation tests
31. Run TypeScript/build/tests
32. Perform final responsive + authentication QA
```

------------------------------------------------------------------------

# 38. IMPORTANT: DO NOT STOP AT UI-ONLY AUTH

A login page that visually accepts an email/password is **not
sufficient**.

The required architecture is:

``` text
Real User
   ↓
Firebase Authentication
   ↓
Firebase Session
   ↓
AutoHR User Profile
   ↓
Organization Membership
   ↓
Account Status
   ↓
Role / Permissions
   ↓
Protected AutoHR
```

Logout must terminate the real Firebase session.

Refreshing the browser must restore a valid Firebase session.

Protected routes must not depend on a mock `isLoggedIn` variable.

------------------------------------------------------------------------

# 39. IMPORTANT: DO NOT STOP AT DESKTOP RESPONSIVENESS

The objective is not:

``` text
Desktop UI
+
a few responsive classes
```

The objective is:

``` text
Mobile
Tablet
Laptop
Desktop
Large Desktop
       ↓
Same AutoHR Design System
       ↓
Layout Appropriate to Device
       ↓
Usable HR Application
```

Test the actual application at multiple widths before completion.

------------------------------------------------------------------------

# 40. FINAL ANTIGRAVITY INSTRUCTION

The AutoHR Master Specification has already been executed.

Treat the current repository as the starting point.

Do not regenerate AutoHR.

Improve it.

The final result of this follow-up must provide:

``` text
AUTOHR
├── Consistent responsive UI
├── Mobile-ready navigation
├── Responsive dashboard
├── Responsive employee experience
├── Responsive tables/forms/dialogs
│
└── Real Authentication
    ├── Firebase Login
    ├── Session Restoration
    ├── Logout
    ├── Password Reset
    ├── Protected Routes
    ├── Organization Membership
    ├── RBAC
    └── Tenant Isolation
```

Preserve the architecture and business decisions from
`AutoHR_Master_Specification_v1.0.md`.

Inspect first. Modify carefully. Test the real application. Fix
regressions. Do not mark the task complete until both responsiveness and
real Firebase authentication are functioning end-to-end.

------------------------------------------------------------------------

# END OF FOLLOW-UP SPECIFICATION
