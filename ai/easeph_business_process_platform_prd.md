# Codex Build Brief
## EasePH Government Process Demo Platform

Build a polished **frontend-only prototype** for EasePH. This is only for demonstration purposes.

Do not add a backend, database, API, real authentication, real email sending, or real government integrations.

Use mock data and browser state only.

---

## 1. Demo Scope

The platform has two sides:

### A. Public Side

A visitor can:

1. Choose and submit one of the available government business processes.
2. Receive a generated serial code.
3. Download a sample PDF receipt.
4. See a simulated message saying the receipt was emailed.
5. Check the request status using the serial code.
6. View a public dashboard of agency processing statistics.

### B. Agency Side

A demo agency employee can:

1. Log in using fixed demo credentials.
2. View submitted requests.
3. Open a request.
4. See its serial code, submission date, notes, and current status.
5. Change the status.
6. Enter an approval date.
7. Mark the request as completed.

---

## 2. Users

Keep the user model minimal.

### Public User

No account or login is needed.

The public user may act as:

- A business submitting a request
- A requester checking a status
- A visitor viewing public statistics

### Agency User

Use one fixed demo account only.

```text
Email: demo@easeph.org
Password: demo123
```

No signup, password reset, role management, or multiple agency accounts are needed.

---

## 3. Required Pages

Create only these pages:

1. Homepage
2. Process Request Form
3. Submission Confirmation
4. Public Status Lookup
5. Public Statistics Dashboard
6. Agency Login
7. Agency Requests Dashboard
8. Agency Request Details

---

## 4. Homepage

Include:

- EasePH branding
- Short explanation of the platform
- Primary button: `Start a Request`
- Secondary button: `Check Status`
- Link to `Public Dashboard`
- Two active process cards:
  - `BIR Registration`
  - `New Business Permit`
- A few disabled `Coming Soon` process cards for visual context

Suggested headline:

> Government business processes, made easier to request and track.

---

## 5. Process Request Form

Use one reusable multi-step form for both active processes.

The user must first choose:

- `BIR Registration`
- `New Business Permit`

The selected process should determine the displayed agency, form title, confirmation details, receipt details, and request list entry.

### Step 1: Business Details

- Business name
- Applicant name
- Email address
- Contact number

### Step 2: Location

- Region
- City
- Barangay
- Business address

Use sample selectable locations such as:

- National Capital Region
- Quezon City
- Greater Lagro

### Step 3: Request Details

Use a few process-specific fields.

#### BIR Registration

- Registration type
- Taxpayer type
- Business type
- Notes

#### New Business Permit

- Business type
- Line of business
- DTI or SEC registration number
- Notes

### Step 4: Review

Show a summary of the entered information before submission.

### Form Requirements

- Validate required fields in the browser.
- Show a visible step indicator.
- Do not send anything to a server.
- Save the submitted request in `localStorage`.
- Generate a unique-looking serial code.

Example:

```text
EASE-2026-7K9M2Q
```

---

## 6. Submission Confirmation

After submission, show:

- Success message
- Serial code
- Process name
- Business name
- Date submitted
- Assigned agency based on the selected process:
  - BIR Registration → `Bureau of Internal Revenue`
  - New Business Permit → `Quezon City Business Permits and Licensing Department`
- Current status: `New`
- Estimated processing time
- `Download Receipt` button
- `Check Status` button

Also show:

> A copy of your receipt has been sent to your email.

This is simulated. Do not send a real email.

---

## 7. PDF Receipt

Generate the receipt on the client side using a library such as `jsPDF`.

Include:

- EasePH branding
- Receipt title
- Serial code
- Process name
- Business name
- Applicant name
- Submission date
- Assigned agency
- Current status
- Estimated processing time
- Instructions for checking the request status

The PDF does not need official legal validity.

---

## 8. Public Status Lookup

Create a page with:

- Serial code input
- Search button
- Example serial code helper text

The lookup must work for:

- Requests submitted during the current demo
- A few predefined mock requests

For a valid serial code, show:

- Process name
- Agency
- Date submitted
- Current status
- Last updated
- Approval date, when available
- Requester-facing note
- Visual status timeline

Use a simple two-step status display:

```text
New → Completed
```

For an invalid code, show a clear error message.

Do not display sensitive fields such as full address, email, phone number, or internal notes.

---

## 9. Public Statistics Dashboard

Use only mock or seeded data.

The statistics dashboard should represent a broader government process ecosystem, not only the two processes available in the request form.

Seed statistics for **50 common business-facing government processes across different agencies**.

Only these two processes need working request forms:

- BIR Registration
- New Business Permit

The other 48 processes are included only in the public statistics dataset. They do not need request forms, detail pages, or agency workflows.

### Geographic Navigation

Allow users to switch between:

- National
- Regional
- City
- Barangay

Suggested drill-down:

```text
Philippines → NCR → Quezon City → Greater Lagro
```

### Simple Filters

Keep the dashboard easy to understand.

Include:

- Agency filter
- Searchable process filter
- Geographic level selector

Default to `All Agencies` and `All Processes`.

Do not render 50 process cards at once. Use a dropdown, searchable selector, or compact table.

### Main Metrics

Display only:

- Total requests
- New requests
- Completed requests
- Average processing time
- Percentage completed on time
- Overdue requests

### Charts and Lists

Include only a few clear visualizations:

- New versus completed requests
- Requests over time
- Average processing time by area
- Top 10 processes by request volume
- Requests grouped by agency

Use the 50-process mock catalog as the underlying dataset.

Use realistic but fictional values.

Do not make the dashboard too dense.

---

## 10. Agency Login

Use fixed demo credentials only.

Successful login should open the agency requests dashboard.

Incorrect credentials should show an error.

Store login state in browser state or `localStorage`.

No real authentication is needed.

---

## 11. Agency Requests Dashboard

Show:

### Summary Cards

Keep the dashboard extremely simple with only two cards:

- New
- Completed

### Request List

Each request should show:

- Serial code
- Process
- Responsible agency
- Business name
- Date submitted
- Current status
- Approval date

Include:

- Search by serial code or business name
- Process filter
- Status filter with only `New` and `Completed`

Seed around 6 to 8 mock requests.

A request submitted through the public form must appear in this list.

---

## 12. Agency Request Details

Show:

- Serial code
- Process
- Responsible agency
- Business name
- Applicant name
- Email
- Contact number
- Address
- Date submitted
- Request notes
- Current status
- Approval date
- Request history

Allow the agency user to:

- Enter an approval date
- Add a requester-facing note
- Mark the request as completed

New submissions should automatically have the status `New`.

Save changes in `localStorage`.

Changes must also appear on the public status lookup page.

---

## 13. Statuses

Use only these two statuses:

```text
New
Completed
```

A submitted request starts as `New`.

When the agency finishes the request, it becomes `Completed`.

Do not build a workflow engine or intermediate statuses.

---

## 14. General Process Behavior

Both processes should use the same simple request lifecycle:

```text
New → Completed
```

The app should use shared components and a shared request data structure so the prototype feels like a general government process platform rather than a BIR-only application.

The public statistics dashboard may show all 50 catalog processes, but only BIR Registration and New Business Permit are interactive.

Do not create separate portals or separate logins for each agency. The single demo agency account can view and complete requests for the two interactive processes.

---

## 15. Mock Data

Separate the mock data into two layers:

1. **Interactive request data** for the two working process forms
2. **Public statistics data** covering 50 business-facing processes

### 15.1 Interactive Request Data

Include:

- Two active processes:
  - BIR Registration
  - New Business Permit
- Six to eight sample requests split between `New` and `Completed`
- Requests created through the public form during the demo

Each interactive request should include:

- Serial code
- Process ID
- Process name
- Responsible agency
- Business name
- Applicant name
- Email
- Contact number
- Address
- Date submitted
- Status: `New` or `Completed`
- Approval date
- Requester-facing notes
- Last updated

Only these requests need to appear in the agency portal and public serial-code lookup.

### 15.2 Fifty-Process Statistics Catalog

Create a catalog containing the following 50 representative business-facing processes.

These are mock dashboard labels for presentation purposes. They are not an official, exhaustive, or legally authoritative checklist.

#### Department of Trade and Industry

1. Business Name Registration
2. Business Name Renewal
3. Business Name Information Update

#### Securities and Exchange Commission

4. Stock Corporation Registration
5. One Person Corporation Registration
6. Non-stock Corporation Registration
7. Partnership Registration
8. Amendment of Articles or Company Information
9. General Information Sheet Filing
10. Audited Financial Statements Filing

#### Cooperative Development Authority

11. Cooperative Registration
12. Amendment of Cooperative Registration

#### Bureau of Internal Revenue

13. Business Tax Registration and TIN
14. Certificate of Registration
15. Authority to Print Invoices
16. Registration of Books of Accounts
17. Branch or Facility Registration
18. Update of Registration Information
19. Tax Clearance Application
20. Business Closure or Registration Cancellation
21. Computerized Accounting System Registration

#### Barangay and Local Government Units

22. Barangay Business Clearance
23. New Business or Mayor's Permit
24. Business Permit Renewal
25. Business Permit Amendment
26. Business Retirement or Closure
27. Locational or Zoning Clearance
28. Sanitary Permit
29. Health Certificate for Business Employees

#### Office of the Building Official or City Engineering Office

30. Building Permit
31. Occupancy Permit
32. Signage or Sign Permit

#### Bureau of Fire Protection

33. Fire Safety Inspection Certificate for New Business
34. Fire Safety Inspection Certificate Renewal

#### Social Security System

35. Employer Registration
36. Employee Registration or Reporting

#### Philippine Health Insurance Corporation

37. Employer Registration
38. Employee Registration or Reporting

#### Pag-IBIG Fund

39. Employer Registration
40. Employee Registration or Reporting

#### Department of Labor and Employment

41. Establishment Registration under Rule 1020
42. Alien Employment Permit

#### Food and Drug Administration

43. License to Operate for Food Establishment
44. License to Operate for Drug Establishment
45. License to Operate for Medical Device Establishment
46. Product Registration or Notification

#### Department of Environment and Natural Resources / Environmental Management Bureau

47. Environmental Compliance Certificate
48. Certificate of Non-Coverage

#### Bureau of Customs

49. Importer Accreditation

#### Intellectual Property Office of the Philippines

50. Trademark Registration

### 15.3 Process Catalog Shape

Each catalog process should contain:

```ts
type ProcessCatalogItem = {
  id: string;
  name: string;
  agencyId: string;
  agencyName: string;
  category: string;
  governmentLevel: "national" | "local";
  isRequestableInDemo: boolean;
};
```

Set `isRequestableInDemo` to `true` only for:

- BIR Registration
- New Business Permit

### 15.4 Statistics Shape

Use pre-seeded aggregate statistics rather than creating thousands of fake request records.

Each statistics entry may contain:

```ts
type ProcessStatistic = {
  processId: string;
  geographicLevel: "national" | "regional" | "city" | "barangay";
  geographicName: string;
  totalRequests: number;
  newRequests: number;
  completedRequests: number;
  overdueRequests: number;
  averageProcessingDays: number;
  onTimeCompletionRate: number;
  monthlyVolume: Array<{
    month: string;
    newRequests: number;
    completedRequests: number;
  }>;
};
```

Seed statistics for:

- Philippines
- National Capital Region
- Quezon City
- Greater Lagro

The numbers should remain internally consistent:

```text
totalRequests = newRequests + completedRequests
overdueRequests <= newRequests
onTimeCompletionRate is between 0 and 100
```

Vary the request volume by process so the dashboard has believable high-volume and low-volume processes.

### 15.5 Suggested Mock Distribution

For the national view:

- High-volume processes: 15,000 to 60,000 total requests
- Medium-volume processes: 3,000 to 15,000 total requests
- Lower-volume or specialized processes: 300 to 3,000 total requests

For smaller geographic levels, scale the figures down while preserving realistic proportions.

All figures must be visibly treated as demo data and must not be presented as real government statistics.

---

## 16. State and Persistence

Use:

- React state for temporary interface state
- `localStorage` for demo requests, login state, and status updates

On first load:

1. Check whether demo data exists.
2. If not, seed the mock requests.
3. Allow the user to reset the demo data.

No backend persistence is required.

---

## 17. Design Direction

The prototype should feel:

- Modern
- Trustworthy
- Simple
- Friendly
- Government-ready
- Easy to present

Use:

- Clean white or light neutral backgrounds
- Blue, green, or teal accents
- Clear cards
- Large status badges
- Simple charts
- Responsive layouts
- Plain language

Avoid:

- Dense admin screens
- Too many filters
- Complex permission systems
- Excessive form fields
- Features outside the demo flow

---

## 18. Suggested Stack

Use a simple frontend stack:

- React or Next.js
- TypeScript
- Tailwind CSS
- A lightweight component library
- Recharts
- `localStorage`
- `jsPDF`

Do not create:

- API routes
- Database schemas
- Server actions
- Authentication providers
- Environment variables
- Email integrations
- Cloud storage integrations

---

## 19. Main Demo Flow

The prototype should support this presentation:

1. Open the homepage.
2. Choose either `BIR Registration` or `New Business Permit`.
3. Complete and submit the selected process form.
4. Show the generated serial code.
5. Download the receipt.
6. Show the simulated email confirmation.
7. Open the agency login.
8. Log in using the demo account.
9. Find the newly submitted request.
10. Open it.
11. Enter an approval date.
12. Mark the request as `Completed`.
13. Open the public status lookup.
14. Enter the serial code.
15. Show the updated `Completed` status.
16. Open the public dashboard.
17. Drill down from national to barangay.

---

## 20. Acceptance Criteria

The prototype is complete when:

- All required pages are implemented.
- Both process forms work without a backend.
- Submission generates a serial code.
- A PDF receipt can be downloaded.
- A simulated email confirmation is shown.
- The new request appears in the agency dashboard.
- The fixed demo login works.
- Agency completion updates are saved in `localStorage`.
- The completed status appears in the public lookup.
- The public dashboard uses a 50-process mock catalog covering multiple agencies.
- Users can filter statistics by agency and process.
- The public dashboard shows seeded statistics.
- National-to-barangay navigation works.
- The app runs locally without service credentials.
- The interface is responsive and presentation-ready.

---

## 21. Codex Instructions

Build the prototype directly from this brief.

Prioritize:

1. A complete clickable flow
2. Visual polish
3. Believable mock interactions
4. Simple frontend code
5. Easy local setup

Do not overengineer the project.

Do not add features that are not listed.

Do not build request forms or agency workflows for all 50 statistical processes. Only the two active processes are interactive.

Do not create a backend.

Use only the minimum code needed to make the demo feel complete.
