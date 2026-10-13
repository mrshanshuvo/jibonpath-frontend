# 🎙️ Video Recording Walkthrough Script: JibonPath Lifeline (Frontend / Fullstack)

**Project:** Dhaka Emergency Ambulance & Trauma Dispatch System  
**Target Duration:** ~7 Minutes 30 Seconds (Within the 5–10 minute requirement)  
**Language:** English (or Bengali equivalent using the provided timestamps)  
**Recording Tool:** Loom or OBS (Shareable 1080p link)

---

## 📋 Pre-Recording Setup Checklist (Keep These Open in Tabs)

Before clicking **Record**, ensure the following applications and tabs are prepared:

1. **Browser Tab 1:** `http://localhost:3000/` (Homepage — public view, logged out).
2. **Browser Tab 2:** `http://localhost:3000/login` (Auth Portal — ready to show the 1-Click Demo Login Grid).
3. **Browser Tab 3 (DevTools open):** Chrome DevTools open on the **Network** tab (set throttling to "Fast 4G" or normal to demonstrate TanStack Query caching and skeletons).
4. **VS Code Window:** Root directory opened at `Emergency Ambulance Dispatch / L2B7A7`, with the file explorer open highlighting `src/app`.
5. **Terminal Tab:** Terminal open ready to show the passing **Playwright (76/76)** and **Vitest (65/65)** test results.

---

## ⏱️ Timeline Cheat-Sheet

| Timestamp       | Segment                                         | Key Focus / Actions                                                                       | Screen View                           |
| :-------------- | :---------------------------------------------- | :---------------------------------------------------------------------------------------- | :------------------------------------ |
| **0:00 – 1:15** | **1. Project Overview & UI/UX Philosophy**      | Trauma problem statement, design system tokens, zero gradients, WCAG AA contrast.         | Browser (`/`)                         |
| **1:15 – 2:30** | **2. Next.js App Router Architecture**          | Server vs Client component split, 17 `loading.tsx` skeletons, `src/proxy.ts` gatekeeper.  | VS Code & Browser                     |
| **2:30 – 4:15** | **3. 1-Click Demo Login & 3 Distinct Roles**    | 1-Click grid, Patient Cockpit, Paramedic Driver Stepper, Admin Command Center.            | Browser (`/login`, dashboards)        |
| **4:15 – 5:30** | **4. API Integration, Caching & URL State**     | DevTools Network tab, TanStack Query caching, debounced search & bookmarkable URL params. | Browser (Tables & DevTools)           |
| **5:30 – 6:45** | **5. Complex Workflows, Validation & Payments** | 4-step Booking Wizard, Zod validation errors, Stripe payment checkout, printable invoice. | Browser (`/patient/book`, `/payment`) |
| **6:45 – 7:45** | **6. Responsive Design & Automated Testing**    | DevTools mobile device toolbar, Playwright (76/76) & Vitest (65/65), final wrap-up.       | Browser & Terminal                    |

---

## 🎬 Step-by-Step Script & Narration

---

### Segment 1: Project Overview & UI/UX Philosophy (0:00 – 1:15)

#### 🖥️ What to Show:

- Start on the **Landing Page** (`http://localhost:3000/`).
- Scroll smoothly through the hero section, live metropolitan telemetry counters (Active Fleet, Avg Response Time, Dispatched), the fleet tier cards (BLS, ACLS, ICU, Neonatal, Air), and the trauma hospital quick-dial section.

#### 🗣️ What to Say:

> _"Hello everyone! Welcome to the walkthrough of the **Dhaka Emergency Ambulance & Trauma Dispatch System**, built with Next.js 16 App Router, TypeScript, and Tailwind CSS v4._
>
> _In emergency medical triage across metropolitan Dhaka, every second counts. Traditional dispatching relies on fragmented phone calls, zero telemetry, and manual billing. Our platform solves this by uniting **Patients**, **Paramedic Drivers**, and **Central Admin Dispatchers** in a unified, real-time command interface._
>
> _From a UI/UX perspective, we engineered an authoritative, high-contrast clinical dark-mode aesthetic compliant with WCAG 2.1 AA standards. Notice that we adhere to a strict **zero-gradient** policy—using solid semantic design tokens like `--emergency`, `--surface`, and `--border` to ensure maximum legibility during high-stress clinical situations._
>
> _Crucially, this frontend uses **zero mock data**. Every single statistic, ambulance, and hospital you see is fetched live from our production Express/PostgreSQL/Redis backend."_

---

### Segment 2: Next.js App Router Architecture (1:15 – 2:30)

#### 🖥️ What to Show:

- Switch to **VS Code**.
- Expand `src/app/` in the explorer:
  - Point to `(public)`, `(auth)`, `(dashboard)`, and `payment/`.
  - Open `src/app/(public)/page.tsx` to highlight a **Server Component**.
  - Open `src/app/(dashboard)/patient/book/page.tsx` to highlight a **Client Component (`"use client"`)**.
  - Show `src/proxy.ts` (Route Protection Gateway) and open any `loading.tsx` file (e.g., `src/app/(dashboard)/patient/loading.tsx`).

#### 🗣️ What to Say:

> _"Let's look at the architectural foundation in Next.js 16._
>
> _We follow a strict Server vs. Client Component split:_
>
> - _All public and marketing pages—such as our Homepage, About, Services, and Hospitals directory—are **Server Components by default**. This means zero client-side JavaScript bloat, blazing-fast initial server rendering, and full SEO indexing with Next.js Metadata API._
> - _We only introduce the `'use client'` directive where direct client-side state, form hooks, or browser event listeners are required—such as our interactive booking wizard or telemetry steppers._
>
> _For route protection, our gateway middleware in `src/proxy.ts` intercepts requests at the edge. It reads secure session cookies and blocks unauthorized roles before pages are even rendered._
>
> _Furthermore, to eliminate Cumulative Layout Shift (CLS), we built **17 dedicated route skeletons** using `loading.tsx`. Whenever data is fetching, users see instantaneous layout outlines instead of blank screens or jarring spinners."_

---

### Segment 3: 1-Click Demo Login & Role-Based UI (2:30 – 4:15)

#### 🖥️ What to Show:

- Navigate to `http://localhost:3000/login`.
- Point out the **1-Click Demo Login Grid** (`DemoLoginGrid.tsx`).

#### 🗣️ What to Say:

> _"Now let's demonstrate Authentication and Role-Based UI Rendering across our 3 distinct roles: **Patient**, **Driver**, and **Admin**._
>
> _To allow immediate evaluation without typing credentials, we implemented a **1-Click Demo Login Grid** right on the login page._
>
> _Let's test **Role 1: The Patient**._  
> _[Click 'Login as Patient']_  
> _Instantly, we are authenticated via in-memory Zustand tokens synchronized with HTTP-only cookies, and redirected to `/patient`._  
> _Notice the Patient's layout: they have access to their Emergency Cockpit, Active Triage Cards, Booking Wizard, and Settlement Ledger. They do not have access to administrative controls._
>
> _Now let's log out._  
> _[Click User Avatar ➔ Log Out]_  
> _The session cookie is cleared, and we return to `/login`._
>
> _Next, let's test **Role 2: Paramedic Driver**._  
> _[Click 'Login as Driver']_  
> _We are routed to `/driver`. Notice how the navigation completely transforms! The driver sees an active **Mission Telemetry Cockpit** with a live 6-stage status stepper—from `REQUESTED` all the way to `COMPLETED`—along with trip history and paramedic shift earnings with Recharts analytics._
>
> _Finally, let's log in as **Role 3: Central System Admin**._  
> _[Log out ➔ Click 'Login as Admin']_  
> _The Admin dashboard unlocks centralized metropolitan operations: real-time fleet utilization charts, BRTA driver onboarding, active dispatches, RBAC user permissions, and an immutable security audit trail._
>
> _If an unauthorized role tries to force-navigate to `/admin` in the URL bar, `src/proxy.ts` immediately blocks them."_

---

### Segment 4: API Integration, Caching & URL State Synchronization (4:15 – 5:30)

#### 🖥️ What to Show:

- In the Admin view, navigate to **Fleet Management** (`/admin/fleet`) or **User Directory** (`/admin/users`).
- Open **Chrome DevTools (Network Tab)**.
- Filter the table by Equipment Tier (`ACLS`) or status (`AVAILABLE`).
- Type into the search input (e.g., `Rafiq` or `Admin`).
- Point to the browser **URL address bar** showing `?page=1&status=AVAILABLE&search=Rafiq`.

#### 🗣️ What to Say:

> _"Next, let's look at API integration, caching, and state management._
>
> _We use **TanStack Query v5** for server-state caching. When navigating between views, subsequent visits load instantaneously from cache with background revalidation._
>
> _Look at the browser URL bar as I interact with the table:_  
> _[Select tier filter and type in search]_  
> _Notice that every filter, search query, and pagination index is strictly synchronized with the URL query parameters using `useSearchParams` and a 300ms debounced input hook._
>
> _This means any view—like `?status=AVAILABLE&page=2`—is 100% bookmarkable and shareable._
>
> _We also implemented **Optimistic UI Updates with automatic rollbacks**. When an admin updates a user's role or status, the UI updates in zero milliseconds; if the backend rejects the change, TanStack Query automatically rolls back the cache and displays a toast notification via Sonner."_

---

### Segment 5: Complex Workflows, Validation & Payments (5:30 – 6:45)

#### 🖥️ What to Show:

- Log back in as **Patient** and go to `/patient/book`.
- Trigger validation error: Click "Next" without selecting or submit invalid phone number. Show Zod error messages.
- Fill valid info: Click location pill (e.g. `Gulshan Circle 2`), pick triage severity (`CRITICAL`), enter emergency phone, confirm review modal, and click "Dispatch Ambulance".
- Navigate to `/patient/payments` ➔ Click "Pay Now" on a completed trip.
- Show the **Stripe Checkout** redirect, and simulate return to `/payment/success`.
- Open `/patient/invoice/[id]` to show the **Printable Tax Invoice** (`window.print()`).

#### 🗣️ What to Say:

> _"Now let's examine our complex multi-step workflows and payment gateway integration._
>
> _Here is our **4-Stage Emergency Booking Wizard** at `/patient/book`:_  
> _All form steps are managed via **React Hook Form + Zod** schema validation._  
> _[Trigger validation error]_  
> _If a user submits an incomplete step or an invalid phone number, Zod instantly renders accessible, human-readable error messages._
>
> _Now let's complete the booking:_  
> _1. We can use browser GPS geolocation or quick-select Dhaka metropolitan hub pills like Gulshan or Dhanmondi._  
> _2. We select the clinical triage priority—Critical, Urgent, or Standard._  
> _3. In the final step, a confirmation modal itemizes the estimated tariff before dispatching._
>
> _Once a trip is completed, the patient can settle their bill._  
> _We integrated **Stripe Checkout** in test mode. When clicking 'Pay Now', the frontend calls our backend to create a real checkout session, redirects the patient, and upon completion, returns them to our verified `/payment/success` receipt screen._
>
> _Patients can also view their **Electronic Tax Invoice** at `/patient/invoice/[id]`, which features printable print-media CSS for immediate hospital filing."_

---

### Segment 6: Mobile Responsiveness & Automated Tests Wrap-Up (6:45 – 7:45)

#### 🖥️ What to Show:

- In the browser, toggle **Chrome DevTools Device Toolbar** (switch to iPhone 14 / iPad viewport).
- Show the mobile responsive drawer, fluid cards, and readable tables with zero horizontal overflow.
- Switch to the **Terminal** and show the final test output:
  - Playwright E2E: `76 passed`
  - Vitest Backend: `65 passed`
  - Linters: ESLint & Biome `0 errors`

#### 🗣️ What to Say:

> _"To ensure usability on the go, our entire application is built mobile-first with **fluid edge-to-edge layouts**._  
> _[Resize DevTools window and toggle mobile drawer]_  
> _The navigation adapts seamlessly into a responsive drawer, data tables stack smoothly, and all touch targets meet clinical accessibility standards._
>
> _Finally, our codebase is backed by rigorous automated testing:_
>
> - _Our **Playwright E2E suite** runs **76 automated tests** across all 3 roles, covering 24 critical user journeys, 26 pixel-perfect visual regression snapshots, and 26 WCAG 2.1 AA accessibility audits via `@axe-core/playwright`._
> - _Our Express backend is backed by **65 Vitest tests** covering transactions, concurrency, and emergency lifecycles._
> - _And both codebases maintain a strict zero-warning policy across ESLint, Biome, and Prettier._
>
> _In summary, the JibonPath Ambulance Dispatch System is a production-ready, accessible, and resilient full-stack application built to modern web engineering standards._
>
> _Thank you very much for watching!"_

---

## 💡 Quick Tips for a High-Scoring Video

1. **Speak clearly and at a steady pace** — aim for around 7 to 8 minutes.
2. **Keep the Network tab visible** during Segment 4 to prove real API integration (evaluators look for this).
3. **Show the 1-Click Demo Login in action** — it demonstrates the role-based UI requirement in seconds.
4. **If using Loom:** Set sharing to **"Anyone with the link can view"** before submitting.
5. **If using OBS / Google Drive:** Ensure access is set to **"Anyone with the link" → Viewer** (do not leave it restricted).
