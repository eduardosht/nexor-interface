# Pending Registration Storage Hardening Design

## Context

The frontend currently defines `nexor_pending_registration` as a `sessionStorage` payload capable of storing email, full name, role, document type, document number, company name, and consents. That shape is read by `useAuth` and `Conta` to reconcile a backend profile after an auth session exists.

This is a privacy risk because CPF/CNPJ can remain available to any script running in the page during the browser session. The safer direction is to stop persisting document numbers in client-side storage and make the continuation path rely on backend state or an explicit user retry.

## Decision

Use the stricter approach: the frontend must not write or require `documentNumber` in `sessionStorage` for pending registration reconciliation.

The compatibility boundary is read-only: if an old pending payload already exists with document data, the frontend may use it once for migration/reconciliation and must clear it immediately after success, known conflict, or invalid shape. New writes must reject document numbers in storage.

## Goals

- Prevent new CPF/CNPJ values from being persisted in `sessionStorage` under `nexor_pending_registration`.
- Keep the app from crashing if old payloads exist in a user's browser.
- Preserve consent reconciliation when it can be done safely without document data.
- Make failure explicit when profile creation still needs document data, instead of silently storing it client-side.
- Update the cookie/storage disclosure page so it no longer claims documents are preserved in this storage item.

## Non-Goals

- Redesign the full registration backend.
- Change admin views that display document numbers returned by authorized APIs.
- Encrypt browser storage. Encryption in frontend JavaScript would not materially reduce XSS exposure because the key must also be available to the page.
- Change Supabase auth behavior.

## Proposed Architecture

`pending-registration.ts` becomes the boundary for privacy enforcement. It should expose a safe payload type that excludes `documentNumber` and `documentType`, plus a legacy reader that can identify old unsafe payloads only long enough to clear or reconcile them.

`useAuth` and `Conta` should stop assuming pending registration can create a profile with document data. They should submit consents when the email matches, clear pending storage after successful consent handling, and avoid calling `/v1/auth/profile` unless the pending payload has all required profile fields from a legacy payload.

If no backend profile exists and no safe server-side profile can be resolved, the UI should leave the user in the account fallback state and surface the existing account/profile load behavior. A later dedicated backend task can introduce a one-time pending registration token if fully automatic profile completion is required.

## Data Flow

1. Registration code that calls `savePendingRegistration` passes only safe fields: email, full name, role, optional company name, and consents.
2. `savePendingRegistration` strips any accidental `documentNumber` and `documentType` fields before writing to storage.
3. `loadPendingRegistration` returns safe pending data and clears invalid objects.
4. `loadLegacyPendingRegistrationForMigration` can return old data with document fields, but only for immediate reconciliation and cleanup.
5. `useAuth` and `Conta` reconcile consents for safe payloads. They may create a profile only when using a legacy payload that already exists.
6. Storage is cleared after successful reconciliation, duplicate/conflict responses, invalid payloads, or email mismatch.

## Error Handling

- Invalid JSON or invalid pending registration shapes are cleared and treated as absent.
- Email mismatch clears the pending payload to avoid retaining another user's registration data in the same browser session.
- Consent API `403` and `409` remain non-fatal because the existing flow already treats them as idempotent or forbidden repeats.
- Profile API `403` and `409` remain non-fatal for legacy migration only.
- Other API errors should still bubble through the current auth/account error paths.

## Testing

Add focused tests for `pending-registration.ts`:

- New saves do not persist `documentNumber` or `documentType` even if an unsafe object is passed.
- Safe payloads round-trip through `sessionStorage`.
- Legacy payloads can be loaded through the migration reader.
- Invalid payloads are cleared.

Update focused auth/account tests so profile creation from safe pending storage is no longer expected, while consent reconciliation still occurs.

Run:

- `npm run test:run -- src/lib/pending-registration.test.ts src/hooks/useAuth.test.tsx src/pages/Conta/Conta.test.tsx src/pages/Cookies/Cookies.test.tsx`
- `npm run typecheck`
- `npm run build`

## Rollout Notes

This change may stop automatic profile completion for any flow that depends exclusively on browser storage for CPF/CNPJ after email authentication. That is intentional for the stricter privacy posture. If product still needs automatic completion, the follow-up should be backend-owned: create a short-lived pending registration record or token and store only the opaque id in the browser.