# Task 5 Report: Frontend Upload API Client

## Status

Completed.

## What changed

- Added frontend API helpers for the production scan upload flow in `orders.api.ts`:
  - `createProductionScanUploadIntent`
  - `confirmProductionScanUpload`
  - `createProductionScanDownloadUrl`
- Added request/response TypeScript interfaces for the new upload endpoints.
- Expanded `ExternalFileReference` to support private S3-backed metadata without persisting signed URLs.
- Updated the upload gateway to support the private presigned upload flow while preserving the legacy synchronous call shape used by the current UI.
- Kept local validation in place before any upload attempt.
- Added tests for:
  - upload intent creation
  - upload confirmation
  - download URL request
  - async presigned upload flow
  - existing simulated upload fallback behavior

## TDD notes

- Added the new API tests first and verified they failed because the new client helpers did not exist.
- Added the gateway async-flow test first and verified failure against the old synchronous implementation.
- Implemented the minimum code to satisfy the failing tests.

## Validation

- `npx vitest run src/features/biteplaner/orders/orders.api.test.ts src/features/demo/externalUploadGateway.test.ts`
- `npm run typecheck`
- Searched touched files for mojibake markers and found no matches after edits.

## Constraints checked

- No backend files were modified.
- No secrets were introduced in frontend code.
- No signed URL, download URL, or public URL is stored in file reference types or persisted metadata.
- The private-bucket flow is handled only as transient request/response data inside the gateway.
- Existing local file validation remains enforced before upload.

## Files changed

- `project/nexor/src/features/biteplaner/orders/orders.api.ts`
- `project/nexor/src/features/biteplaner/orders/orders.api.test.ts`
- `project/nexor/src/features/demo/biteplanerFlow.ts`
- `project/nexor/src/features/demo/externalUploadGateway.ts`
- `project/nexor/src/features/demo/externalUploadGateway.test.ts`

## Concerns

- The current UI still uses the legacy synchronous upload path. I preserved that path intentionally so Task 6 can wire the new async upload flow without breaking the current screen in the meantime.

## Review follow-up

- Updated `uploadProductionRequestFile(input)` so every object-input path now returns `Promise<ExternalFileReference>`, including the simulated fallback branch.
- Left the legacy `(file, purpose)` overload synchronous for the existing UI call site.
- Updated the gateway tests to assert the object-input fallback with `await`/`resolves` instead of relying on synchronous return behavior.

## Follow-up fix notes

- Tightened `uploadProductionRequestFile(input)` so the object-input fallback path is explicitly Promise-based, matching the advertised `Promise<ExternalFileReference>` contract while preserving the legacy synchronous `(file, purpose)` overload.
- Updated the object-input tests to assert the fallback returns a Promise before awaiting it, and kept the rejection path async.