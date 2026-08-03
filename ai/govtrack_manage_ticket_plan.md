# GovTrack Manage Ticket Implementation Plan

## Goal

Add a focused agency workflow for locating a generated ticket by tracking number and updating its status. The existing service-card dashboard remains responsible for generating receipts, while ticket management is handled through a modal.

This remains a frontend-only prototype using browser local storage. The interface will state that the requester will be notified by email, but no real email will be sent.

## 1. Add the Manage Ticket Action

- Add a large, full-width **Manage Ticket** button below the BIR service cards.
- Visually separate the action from the receipt-generation cards.
- Open the Manage Ticket modal when agency staff press the button.

## 2. Build the Ticket Search Modal

- Add a tracking-number input using the receipt format, such as `GOVTRACK-2026-XXXXXXX`.
- Add a **Find Ticket** button.
- Trim whitespace and match tracking numbers case-insensitively.
- Show an inline error when no matching ticket exists.
- Allow the modal to close through:
  - A close button
  - The Escape key
  - The modal backdrop
- Prevent the dashboard from scrolling while the modal is open.
- Move focus into the modal when it opens and return focus to the Manage Ticket button when it closes.

## 3. Display the Located Ticket

After finding a ticket, replace the search form with a compact ticket summary containing:

- Tracking number
- BIR service
- Current status
- Date generated
- Notification email, when available

All ticket details will be read-only. Status will be the only editable value.

## 4. Add Status Controls

- Allow staff to change the status only to:
  - Completed
  - Rejected
- Do not include New as a selectable destination.
- Disable submission until staff select a status different from the current status.
- Add an **Update Status** button.
- Persist the selected status through the existing `updateRequest` store function.
- Update the ticket's `lastUpdated` timestamp automatically.

## 5. Handle Successful Updates

- Close and reset the modal after a successful update.
- Show a temporary success toast over the agency dashboard.
- Include the selected status in the message, for example:

  > Ticket updated to Completed. The requester will be notified via email.

- Always include the email-notification statement, even if the ticket does not have a saved email address.
- Keep email delivery simulated; no backend or email provider will be added.

## 6. Add the Success Toast

- Position the toast near the upper-right or lower-right corner of the viewport.
- Include a success icon and dismiss button.
- Automatically dismiss the toast after approximately four seconds.
- Use `role="status"` and `aria-live="polite"` so assistive technology announces the update.
- Ensure the toast does not block primary dashboard controls on mobile.

## 7. Modal and Control Styling

- Match the agency dashboard's existing blue visual language.
- Use a clear modal title, close control, form labels, and visible focus states.
- Make the modal responsive for narrow mobile screens.
- Keep the tracking input and status controls large enough for agency counter use.
- Give Completed and Rejected options distinguishable visual treatments without relying on color alone.
- Show a loading or disabled state while applying the update to prevent duplicate submissions.

## 8. Public Tracking Integration

- Continue using the same local ticket record so public tracking reflects status changes immediately.
- Confirm that Completed and Rejected render correctly in the existing public status timeline.
- Preserve the original tracking number, service, agency, generated date, and notification email.

## 9. Verification

- Verify that the Manage Ticket button appears below the service-card grid.
- Verify that the button opens the modal.
- Verify that valid tracking numbers retrieve the correct ticket.
- Verify that lookup ignores letter case and surrounding whitespace.
- Verify that invalid tracking numbers show an inline error.
- Verify that only Completed and Rejected can be selected.
- Verify that the status and `lastUpdated` timestamp persist after refreshing.
- Verify that public tracking displays the updated status.
- Verify that the modal closes and resets after a successful update.
- Verify that the success toast appears, can be dismissed, and automatically expires.
- Verify modal keyboard behavior, focus handling, background scroll locking, and mobile layout.

## Final Flow

1. Agency staff open the dashboard.
2. Staff press the large **Manage Ticket** button below the service cards.
3. Staff enter a tracking number and locate the ticket.
4. The modal shows the ticket details and current status.
5. Staff select Completed or Rejected and confirm the update.
6. The modal closes and a toast confirms that the status was updated and the requester will be notified by email.
7. The public tracking page reflects the new status.
