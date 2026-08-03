# GovTrack Agency Receipt Flow Implementation Plan

## Goal

Change GovTrack so the public can only track government services, while agency staff generate service receipts from the agency dashboard.

The initial agency catalog will contain all nine Bureau of Internal Revenue (BIR) services already represented in the application. This remains a frontend-only prototype using browser local storage; email notification enrollment will be simulated and will not send real email.

## 1. Make the Public Experience Tracking-Only

- Replace the homepage "Request a Service" CTA with "Track a Service" linking to `/status`.
- Update the header, mobile navigation, footer, and homepage copy to remove public request language.
- Completely remove the following public routes and their page components:
  - `/request`
  - `/request/:processId`
  - `/confirmation/:serial`
- Keep public statistics and status tracking available.

## 2. Convert the Agency Dashboard into a BIR Service Catalog

- Replace the existing summary cards, filters, and request list with cards for these BIR services:
  1. Business Tax Registration and TIN
  2. Certificate of Registration
  3. Authority to Print Invoices
  4. Registration of Books of Accounts
  5. Branch or Facility Registration
  6. Update of Registration Information
  7. Tax Clearance Application
  8. Business Closure or Registration Cancellation
  9. Computerized Accounting System Registration
- Give every service a stable ID, estimated processing time, and concise description.
- Make the entire service card accessible and clearly indicate that selecting it generates a receipt.
- Remove the existing agency request list, request-detail route, and status-management interface.

## 3. Generate a Record Immediately

- Generate a unique serial code when agency staff select a service card.
- Create a browser-local record containing:
  - Serial code
  - BIR service
  - Bureau of Internal Revenue
  - Submission date
  - Initial status
  - Estimated processing time
  - Optional notification email
- Do not ask for business, applicant, address, contact, or registration information.
- Navigate to a protected agency receipt route such as `/agency/receipt/:serial`.
- Replace the existing fixed serial generator with collision-resistant generation.

## 4. Create an On-Screen Receipt

- Build a reusable receipt display closely matching the current generated PDF.
- Include:
  - Branded blue header and red accent
  - Receipt title
  - Large serial code
  - Submission date
  - Tracking QR code
  - Selected BIR service
  - Assigned agency
  - Current status
  - Estimated processing time
  - Tracking instructions
- Make the receipt responsive on desktop and mobile.
- Provide actions to copy the serial code, download the receipt, and generate another receipt.

## 5. Align the PDF and Screen Output

- Extract the inline PDF logic from `src/pages/Confirmation.tsx` into reusable receipt-generation code.
- Change the PDF from a business-request receipt to a service-only receipt.
- Keep the PDF content and visual structure synchronized with the on-screen receipt.
- Preserve the QR code linking to `/status?serial=...`.
- Add loading and error feedback for QR and PDF generation.

## 6. Add Optional Prototype Notifications

- Place an optional email input on the generated receipt page.
- Validate and save the email address to the local record.
- Confirm that notification enrollment was saved without claiming that an email was sent.
- Keep notification behavior localStorage-only, with no backend or email provider.

## 7. Update Data and Persistence

- Expand service typing and data from the current two-service model to all nine BIR services.
- Adjust the stored record model so business and applicant fields are not required for generated receipts.
- Keep generated records compatible with public status lookup.
- Update public status display so service-only records do not show empty business or applicant sections.
- Preserve existing seeded records only where they remain useful for the tracking and statistics prototype.

## 8. Remove Obsolete Code

- Remove `RequestForm.tsx`, `Confirmation.tsx`, and `RequestDetails.tsx` after reusable receipt behavior has been relocated.
- Remove obsolete routes, redirects, imports, links, and request-form styles.
- Update wording such as "submitted through GovTrack" and "request a service" throughout the public and agency interfaces.

## 9. Verification

- Run lint and focused TypeScript/Vite checks.
- Verify that every public CTA leads to tracking.
- Verify that removed request and confirmation routes are no longer registered.
- Verify that all nine BIR service cards generate unique receipts.
- Verify that refreshing a receipt page preserves its record.
- Verify that email enrollment persists locally.
- Verify that the PDF and on-screen receipt display matching information.
- Verify that the QR code and public status lookup resolve the generated serial.
- Verify that desktop and mobile layouts remain usable.

## Final Flow

1. Agency staff sign in and see the nine BIR service cards.
2. Staff select a service, immediately creating a tracking record and receipt.
3. The receipt page displays the serial code, QR code, service details, and optional email enrollment.
4. Staff can download the matching PDF receipt and provide it to the requester.
5. The requester uses the serial code or QR code to track the service through the public site.
