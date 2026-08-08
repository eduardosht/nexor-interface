# Biteplaner category sport Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the dentist-facing Biteplaner model choice and make sport category the canonical production input while preserving legacy orders.

**Architecture:** New draft requests carry `color`, `quantity`, `sportCategory`, age, sex and uploads; `model` becomes nullable at the commerce boundary. Read models retain nullable legacy `model` for old orders, while operational views prefer the sport category.

**Tech Stack:** React, TypeScript, Vitest, Fastify, Zod, PostgreSQL repository layer.

## Global Constraints

- Do not define a mold type or sport-to-characteristic mapping in this change.
- Preserve the required production fields and private S3 upload flow.
- Preserve Portuguese UTF-8 text and compatibility with historical `model` values.

### Task 1: Frontend purchase contract and UI

**Files:**
- Modify: `project/nexor/src/pages/painel/Compra/index.test.tsx`
- Modify: `project/nexor/src/pages/painel/Compra/index.tsx`
- Modify: `project/nexor/src/features/commerce/biteplanerPurchase.types.ts`

- [x] Write a failing test asserting the purchase page has no model input and the draft payload contains sport category, color and quantity without `model`.
- [x] Run the focused Compra test and verify it fails because the current UI still renders the model field and sends it.
- [x] Remove model state/options/effect, model payload property and model copy; keep color and quantity in the summary.
- [x] Run the focused test and verify it passes.

### Task 2: Backend draft contract

**Files:**
- Modify: `../nexor-backend/project/api/src/routes/commerce.routes.ts`
- Modify: `../nexor-backend/project/api/src/services/commerce-checkout.service.ts`
- Modify: `../nexor-backend/project/api/src/repositories/commerce.repository.ts`
- Test: `../nexor-backend/project/api/tests/services/commerce-checkout.service.test.ts`
- Test: `../nexor-backend/project/api/tests/routes/commerce.routes.test.ts`

- [x] Add failing route/service coverage for a draft request without `model`.
- [x] Run the focused backend tests and verify the request is rejected by the old schema/contract.
- [x] Make `model` optional/null for new drafts and persist `sportCategory` as the canonical technical field without inventing a mold type.
- [x] Run the focused backend tests and verify they pass.

### Task 3: Operational displays and compatibility

**Files:**
- Modify: `project/nexor/src/features/commerce/biteplanerDentistOrders.types.ts`
- Modify: `project/nexor/src/pages/painel/BiteplanerOrders/BiteplanerOrders.tsx`
- Modify: `project/nexor/src/pages/painel/BiteplanerOrders/BiteplanerOrderDetail.tsx`
- Modify: `project/nexor/src/pages/painel/admin/AdminOrders.tsx`
- Modify: `project/nexor/src/pages/painel/ProducaoDentista/ProductionRequestFields.tsx`
- Modify: `project/nexor/src/pages/painel/ProducaoDentista/DentalAnamnesisRecord.tsx`

- [x] Add failing assertions for the category label in the operational summary.
- [x] Prefer `sportCategory` in new records and fall back to legacy `model` only where necessary.
- [x] Run affected frontend tests and ensure historical fixtures remain valid.

### Task 4: Full verification

- [x] Run backend build and commerce tests.
- [x] Run frontend typecheck, focused purchase/operational tests and build.
- [x] Run `git diff --check` and scan touched UI files for mojibake markers.
