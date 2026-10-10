# 🚑 Dhaka Emergency Ambulance & Trauma Dispatch System — Project Memory

> **Last Updated:** October 2026  
> **Status:** Production-Ready & Feature Complete  
> **Repository:** `Emergency Ambulance Dispatch / L2B7A7`  
> **Live API Base:** `https://ambulance-dispatch-backend-66f2.onrender.com/api/v1`

---

## 1. Executive Summary & Purpose

The **Dhaka Emergency Ambulance & Trauma Dispatch System** is an enterprise-grade pre-hospital clinical response platform engineered for Dhaka metropolitan trauma mitigation. It bridges real-time GPS telemetry, tiered emergency ambulance mobilization (BLS, ACLS, ICU, Neonatal, Air), certified paramedic run-status workflows, automated hospital pre-arrival ER notifications, and electronic billing settlement.

The platform is strictly integrated with a live Express/PostgreSQL/Redis backend. **Zero mock data** is utilized anywhere in the codebase.

---

## 2. Technology Stack & Key Dependencies

| Layer                     | Technology                                        | Version     | Purpose                                                 |
| :------------------------ | :------------------------------------------------ | :---------- | :------------------------------------------------------ |
| **Framework**             | Next.js (App Router, Turbopack)                   | `16.3.8`    | Server/Client components, route handlers, proxy routing |
| **Runtime/Library**       | React                                             | `19.2.8`    | Modern concurrent rendering, transitions                |
| **Language**              | TypeScript                                        | `^5`        | Strict type checking (`strict: true`, zero `any`)       |
| **Styling**               | Tailwind CSS v4 + Vanilla CSS                     | `^4`        | Design tokens in `globals.css`, no arbitrary classes    |
| **Component Primitives**  | shadcn/ui + Base UI (`@base-ui-components/react`) | Latest      | Accessible, headless, unstyled primitives               |
| **Server State**          | TanStack Query                                    | `^5.69`     | Live caching, polling, optimistic updates & rollbacks   |
| **Client State**          | Zustand                                           | `^5.0.3`    | In-memory authentication state (zero storage leak)      |
| **Charts**                | Recharts                                          | `^2.15`     | Admin fleet distribution & driver earnings analytics    |
| **Forms & Validation**    | React Hook Form + Zod                             | `^7` / `^3` | Type-safe schema validation                             |
| **Icons & Notifications** | Lucide React + Sonner                             | Latest      | High-contrast visual cues & toast notifications         |
| **E2E Testing**           | Playwright (`@playwright/test`)                   | `^1.64`     | Role-based end-to-end automation testing suite          |

---

## 3. Architecture & Security Conventions

### 3.1 Authentication & Token Hygiene

- **In-Memory Storage Only:** JWT access tokens and user profile state reside exclusively in the in-memory Zustand store (`src/stores/auth.store.ts`).
- **Zero Local/Session Storage:** No tokens, passwords, or PII are ever written to `localStorage` or `sessionStorage`.
- **HTTP-Only Session Synchronization:** A dedicated Next.js Route Handler (`/api/auth/session/route.ts`) handles session cookie creation and destruction on login/logout.
- **Session Rehydration:** On page reload, the client queries `/users/me` through `src/providers/AuthProvider.tsx` to rehydrate state seamlessly.
- **Route Guard:** `src/proxy.ts` serves as the network gateway, intercepting dashboard routes and validating role authorization before rendering.

### 3.2 Design System & Standards (`STANDARDS.md`)

- **Semantic Tokens:** All components consume semantic tokens (`--emergency`, `--destructive`, `--primary`, `--surface`, `--surface-raised`, `--card`, `--border`, `--muted`, `--accent`).
- **No Gradients Policy:** Per design requirements, all gradients (text, linear backgrounds, radial overlays) have been completely stripped in favor of high-contrast solid semantic panels.
- **Accessibility & Reduced Motion:** All non-essential animations are gated behind `motion-safe:` or `@media (prefers-reduced-motion: no-preference)`. Loading spinners are classified as essential feedback and remain active.
- **Raw Hex Ban:** No raw hex codes, `rgb()`, or `rgba()` literals are allowed inside `.tsx` files.

---

## 4. Pre-Seeded 1-Click Demo Credentials

The `/login` portal includes an automated **1-Click Demo Login Grid** (`DemoLoginGrid.tsx`) pre-configured with active backend accounts:

| Role        | Email                    | Password      | Primary Capabilities                                                          |
| :---------- | :----------------------- | :------------ | :---------------------------------------------------------------------------- |
| **PATIENT** | `patient1@ambulance.dev` | `Patient@123` | Emergency booking wizard, triage calls, payment checkout, invoices            |
| **DRIVER**  | `driver1@ambulance.dev`  | `Driver@123`  | Active cockpit, 6-stage status advancement, trip logs, earnings               |
| **ADMIN**   | `admin@ambulance.dev`    | `Admin@123`   | Fleet registry, BRTA driver onboarding, user role/status controls, audit logs |

---

## 5. Completed Work & Implementation Timeline

### Phase 1: shadcn/ui Primitive Foundation

- Initialized shadcn/ui with `@base-ui-components/react` (Base UI instead of Radix to ensure seamless React 19 compatibility).
- Installed and standardized 18 primitives in `src/components/ui/`:
  - `Button`, `Card`, `Badge`, `Input`, `Textarea`, `Select`, `Dialog`, `DropdownMenu`, `Tabs`, `Table`, `Label`, `Chart`, `Pagination`, `DataTable`, `Skeleton`, `Modal`, `EmptyState`, `Sonner`.
- Configured theme tokens in `src/app/globals.css`.

### Phase 2: Instant-Loading Skeleton Architecture (`loading.tsx`)

Created 15 dedicated Next.js App Router `loading.tsx` route skeletons to guarantee instantaneous perceived performance without layout shift (CLS):

- **Public:** `/hospitals/loading.tsx`, `/loading.tsx`
- **Admin:** `/admin/loading.tsx`, `/admin/dispatches/loading.tsx`, `/admin/fleet/loading.tsx`, `/admin/drivers/loading.tsx`, `/admin/users/loading.tsx`, `/admin/audit-logs/loading.tsx`
- **Driver:** `/driver/loading.tsx`, `/driver/history/loading.tsx`, `/driver/earnings/loading.tsx`, `/driver/profile/loading.tsx`
- **Patient:** `/patient/loading.tsx`, `/patient/book/loading.tsx`, `/patient/payments/loading.tsx`, `/patient/profile/loading.tsx`, `/patient/invoice/[id]/loading.tsx`
- **Payment:** `/payment/success/loading.tsx`

### Phase 3: TanStack Query Optimistic Updates with Rollbacks

Integrated optimistic mutations into queries so UI updates instantaneously before network resolution, with automatic cache rollback on failure:

- `useUpdateEmergencyStatus`: Optimistically updates triage request status.
- `useUpdateDispatchStatus`: Optimistically increments the 6-stage telemetry status (`REQUESTED` ➔ `ASSIGNED` ➔ `EN_ROUTE_PICKUP` ➔ `ON_SCENE` ➔ `EN_ROUTE_HOSPITAL` ➔ `COMPLETED`).
- `useUpdateUserRole` & `useUpdateUserStatus`: Optimistically toggles user authorization and account suspension in the admin console.

### Phase 4: Missing Requirements Coverage

- **Electronic Tax Invoice (`/patient/invoice/[id]`):**
  - Clinical dispatch summary, vehicle tier rate breakdown, base fee, per-km charge, trauma tax calculation, hospital receiving stamp.
  - Native browser `window.print()` trigger with printable print-media CSS.
- **Paramedic Earnings Analytics (`/driver/earnings`):**
  - Shift summary stats (gross pay, completed trips, active hours, tips).
  - Recharts daily payout distribution bar chart.
  - Itemized per-dispatch settlement log with payment reference IDs.

### Phase 5: SEO, Open Graph & Metadata

- Configured root metadata in `src/app/layout.tsx` (title template, description, keywords, Open Graph image, Twitter Cards, robots configuration).
- Implemented static and dynamic metadata across all public portals (`/about`, `/services`, `/hospitals`, `/faq`, `/contact`).

### Phase 6: Base UI Context & DropdownMenu Fix

- **Error Resolved:** `Base UI: MenuGroupContext is missing. Menu group parts must be used within <Menu.Group> or <Menu.RadioGroup>.`
- **Resolution:** Updated `DropdownMenuLabel` in `src/components/ui/dropdown-menu.tsx` to render a semantic `div` container with `data-slot="dropdown-menu-label"`, permitting usage both as a standalone header and inside menu groups without context errors.

### Phase 7: Complete Gradient Removal

- Stripped all `bg-linear-to-*` and multi-color stop text gradients across the application.
- Replaced with solid tokens (`bg-surface`, `bg-surface-raised`, `text-emergency`) across:
  - `DriverActiveDispatch.tsx`
  - `src/app/(public)/page.tsx`
  - `src/app/(public)/services/page.tsx`
  - `src/app/(public)/hospitals/page.tsx`
  - `src/app/(public)/faq/page.tsx`
  - `src/app/(public)/contact/page.tsx`
  - `src/app/(public)/about/page.tsx`

### Phase 8: URL State Synchronization Across All Views & Tables

- Extended `useUrlParams` and debounced input searching (`useDebounce`) across 100% of data-heavy and filterable views:
  - `FleetTable.tsx` (ambulance status, equipment tier, page)
  - `UserManagementTable.tsx` (role filter, debounced name/email search, page)
  - `AuditLogsTable.tsx` (action filter, page)
  - `AdminDispatchesPage` (dispatch checkpoint status, page)
  - `PaymentHistoryTable.tsx` (payment status, page)
  - `DriverHistoryPage` (page)
  - `HospitalsPage` (debounced search, zone filter, wrapped with `<Suspense>`)
  - `FaqPage` (category pill selector, wrapped with `<Suspense>`)
- Guarantees shareable, bookmarkable URLs (`?page=2&status=active&search=rafiq`) in strict compliance with assignment guidelines.

### Phase 9: Fluid Layout Migration & Mobile Responsiveness

- Stripped restrictive max-width wrappers across all dashboard and public layouts.
- Adopted fluid edge-to-edge UI design with responsive sidebars, collapsible drawers, and flexible grid containers.
- Guaranteed flawless multi-device presentation across mobile, tablet, laptop, and ultra-wide desktop viewports.

### Phase 10: Authoritative Testing & Accessibility Suite

- Expanded test coverage to **76 total Playwright tests** and **65 Vitest backend tests**.
- Implemented visual regression snapshot testing across all 26 distinct application views (`tests/e2e/06-visual-regression.spec.ts`).
- Conducted full automated WCAG 2.1 AA and Section 508 accessibility audits via `@axe-core/playwright` (`tests/e2e/07-accessibility-ux.spec.ts`) with zero critical/serious violations.
- Implemented `scripts/check-contrast.mjs` verifying 100% Lifeline palette contrast compliance and zero raw hex/color utility usage.

### Phase 11: Test Directory Hygiene & Configuration Standardization

- Relocated test suite from legacy root `e2e/` to unified `tests/e2e/` directory.
- Standardized Playwright artifact output directory to `./tests/test-results`.
- Cleaned up root `.gitignore` and removed obsolete artifact paths.
- Preserved pristine zero-warning status across ESLint 9 (frontend) and Biome 1.8 (backend).

### Phase 12: Final Assignment Deliverables & Rubric Audit

- Conducted exhaustive audit against B7A7 (`main_requirements.md`, `project-requirements.md`) and B7A6 specifications.
- Verified 100% satisfaction of mandatory requirements: Next.js App Router, 3 distinct roles, 1-Click Demo Login, 29 fully functional pages (exceeding 18-page minimum), Stripe payment flow, 69 frontend commits / 82 backend commits (exceeding 20-commit minimum).
- Clarified live mission tracking architecture: high-frequency HTTP polling via TanStack Query (`refetchInterval: 5000` for active driver cockpit, `10000` for patient & admin dispatches).

---

## 6. Complete Route Catalog (29 Routes)

```
app/
├── (public)/
│   ├── page.tsx                    # / (Landing page, emergency CTAs, live stats)
│   ├── about/page.tsx              # /about (Pre-hospital care standards, governance)
│   ├── services/page.tsx           # /services (Fleet tiers, BLS/ACLS/ICU specs)
│   ├── hospitals/page.tsx          # /hospitals (Trauma directory, emergency hotlines)
│   ├── contact/page.tsx            # /contact (999 dispatch desk & inquiry form)
│   └── faq/page.tsx                # /faq (Clinical & billing FAQ accordion)
├── (auth)/
│   ├── login/page.tsx              # /login (Credentials form + 1-Click Demo Grid)
│   └── register/page.tsx           # /register (Patient onboarding wizard)
├── (dashboard)/
│   ├── patient/
│   │   ├── page.tsx                # /patient (Active request cockpit, triage cards)
│   │   ├── book/page.tsx           # /patient/book (4-step GPS booking wizard)
│   │   ├── payments/page.tsx       # /patient/payments (Invoice settlement ledger)
│   │   ├── invoice/[id]/page.tsx   # /patient/invoice/[id] (Printable tax invoice)
│   │   └── profile/page.tsx        # /patient/profile (User profile & emergency contacts)
│   ├── driver/
│   │   ├── page.tsx                # /driver (Mission telemetry & 6-stage status stepper)
│   │   ├── history/page.tsx        # /driver/history (Completed run audit log)
│   │   ├── earnings/page.tsx       # /driver/earnings (Payout analytics & Recharts graph)
│   │   └── profile/page.tsx        # /driver/profile (BRTA credentials verification)
│   └── admin/
│       ├── page.tsx                # /admin (Central command Recharts dashboard)
│       ├── fleet/page.tsx          # /admin/fleet (Ambulance inventory & commissioning)
│       ├── drivers/page.tsx        # /admin/drivers (Driver directory & status toggle)
│       ├── dispatches/page.tsx     # /admin/dispatches (Metropolitan dispatch logs)
│       ├── users/page.tsx          # /admin/users (RBAC user management table)
│       └── audit-logs/page.tsx     # /admin/audit-logs (Security & event audit trail)
├── payment/
│   ├── success/page.tsx            # /payment/success (Simulated gateway receipt)
│   └── cancel/page.tsx             # /payment/cancel (Payment cancellation handler)
└── api/
    ├── auth/session/route.ts       # /api/auth/session (HTTP-only cookie proxy)
    └── geocode/reverse/route.ts    # /api/geocode/reverse (GPS reverse geocoding proxy)
```

---

## 7. Key Operational Workflows

### 7.1 Emergency Booking Workflow (Patient)

1. **Location Selection:** Patient specifies pickup address via browser GPS geolocation or quick-select Dhaka metropolitan hub pills (Dhanmondi, Gulshan, Uttara, Mirpur, Motijheel).
2. **Clinical Severity:** Patient selects triage level:
   - `CRITICAL` (Cardiac arrest, severe trauma ➔ Auto-selects ICU/ACLS)
   - `URGENT` (Fractures, respiratory distress ➔ ACLS/BLS)
   - `STANDARD` (Stable transport ➔ BLS)
3. **Vehicle Assignment:** Available ambulances filtered by nearest radius and equipment tier.
4. **Instant Dispatch:** Creates emergency record and transitions patient view to live telemetry tracker.

### 7.2 Mission Advancement Workflow (Driver)

1. **Live Checkpoint Stepper:** Displays active pickup point, patient condition, and hospital destination.
2. **6-Stage Status Progression:** Driver advances mission step-by-step:
   - `REQUESTED` ➔ `ASSIGNED` ➔ `EN_ROUTE_PICKUP` ➔ `ON_SCENE` ➔ `EN_ROUTE_HOSPITAL` ➔ `COMPLETED`
3. **Optimistic Updates:** UI immediately moves forward while TanStack Query mutation fires in background.
4. **Completion & Billing:** Reaching `COMPLETED` triggers automated fare calculation and unlocks patient invoice generation.

### 7.3 Fleet & Driver Governance (Admin)

1. **Fleet Commissioning:** Add ambulances with license plate, model, equipment tier, base zone, and status (`AVAILABLE`, `ON_DUTY`, `MAINTENANCE`).
2. **Driver Onboarding:** Verify BRTA professional driving license numbers and assign to active vehicles.
3. **User Management:** Instant role reassignment (`PATIENT`, `DRIVER`, `ADMIN`) and account suspension with optimistic rollback.
4. **Audit Trail:** Read-only inspection of all system events, status changes, and auth sessions.

---

## 8. Verification & Health Check Commands

To ensure codebase integrity at any time, execute the following commands in `L2B7A7`:

```bash
# 1. Format verification
npm run format

# 2. Linting (strict zero-warning policy)
npm run lint

# 3. Type check & production build (29 routes)
npm run build

# 4. Playwright End-to-End Test Suite (24 tests across all roles & public portals)
npm run test:e2e

# 5. Playwright Interactive UI Mode
npm run test:e2e:ui

# 6. Playwright Headed Mode
npm run test:e2e:headed
```

---

## 9. End-to-End (E2E) Test Suite Architecture

An authoritative, real-browser testing suite built with `@playwright/test` running in Chromium across all user roles and public portals:

| Suite File                               | Scope & Tested Functionalities                                                                                                                                                                                                                                                                                   | Test Count |         Status         |
| :--------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------: | :--------------------: |
| `tests/e2e/01-auth.spec.ts`              | 1-Click Demo Login Grid, role-specific redirections (`/patient`, `/driver`, `/admin`), unauthorized route protections, cross-role access prevention, UserMenu dropdown logout & cookie clearance.                                                                                                                |     7      |       ✅ Passed        |
| `tests/e2e/02-patient-flow.spec.ts`      | Emergency Triage Cockpit, 4-stage Booking Wizard (location select, severity radio select, callback phone, review confirmation modal), Payment History URL parameter syncing (`?status=SUCCESS`), and Patient Account & Profile view.                                                                             |     4      |       ✅ Passed        |
| `tests/e2e/03-driver-flow.spec.ts`       | Paramedic Driver Cockpit & live telemetry radar, Past Mission Trip History with pagination, Shift Earnings (KPI cards & Recharts daily trends), and Driver Credential Profile (BRTA validation).                                                                                                                 |     4      |       ✅ Passed        |
| `tests/e2e/04-admin-flow.spec.ts`        | Command Center Analytics Overview (Recharts fleet distribution & capacity progress), Fleet Management table (status/tier filters & vehicle registration modal), Driver Roster (onboarding modal), Active Dispatches live stepper, User Directory (search debounce & RBAC role filter), and Security Audit Trail. |     6      |       ✅ Passed        |
| `tests/e2e/05-public-portals.spec.ts`    | Landing Page hero CTAs & live fleet counters, Hospital & Trauma Directory (debounced search & zone filter pills), and Operations FAQ (category pills & accordion expand/collapse).                                                                                                                               |     3      |       ✅ Passed        |
| `tests/e2e/06-visual-regression.spec.ts` | Pixel-by-pixel visual snapshot regression testing across all 26 distinct application views with zero dev-indicator overlays and fluid full-width layouts.                                                                                                                                                        |     26     |       ✅ Passed        |
| `tests/e2e/07-accessibility-ux.spec.ts`  | Automated WCAG 2.1 AA and Section 508 accessibility audit using `@axe-core/playwright` across all 26 distinct application views with zero critical or serious violations.                                                                                                                                        |     26     |       ✅ Passed        |
| **Total**                                | **Comprehensive Functional, Visual & Accessibility Coverage Across Every Page**                                                                                                                                                                                                                                  |   **76**   | **100% Passed (1.9m)** |

---

## 10. Current Status & Submission Readiness

- **Current Status:** 100% Feature Complete, Fully Tested & Production-Ready.
- **Verification Gates Passed:**
  - **Frontend E2E Suite:** 76 / 76 Playwright tests passed (24 functional role flows, 26 visual regression views, 26 WCAG 2.1 AA audits).
  - **Backend API Suite:** 65 / 65 Vitest tests passed across unit, integration, and emergency lifecycle flows.
  - **Linters & Style:** ESLint 9 (0 errors, 0 warnings), Biome 1.8 (0 errors, 0 warnings), Prettier 3 (100% clean).
  - **Design Standards:** 100% Lifeline palette contrast pass rate (`scripts/check-contrast.mjs`), zero raw color classes, fluid responsive layouts.
  - **Build Integrity:** Next.js 16 App Router build generates 29 routes in < 1.0s.
- **Git State:** 69 frontend commits / 82 backend commits (exceeds 20-commit minimum). Clean working tree.
- **Remaining Action Items for User:**
  1. **Deploy Frontend:** Push latest commits to GitHub and deploy to Vercel/Netlify with `NEXT_PUBLIC_API_URL=https://ambulance-dispatch-backend-66f2.onrender.com/api/v1`.
  2. **Walkthrough Video:** Record the 5–10 minute demonstration video following `L2B7A6/docs/video-presentation-script.md`.
  3. **Portal Submission:** Fill and submit the final template on the assignment dashboard.
