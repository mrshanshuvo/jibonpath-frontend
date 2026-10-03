# 🚑 Dhaka Emergency Ambulance & Trauma Dispatch System (Frontend)

[![Next.js 16](https://img.shields.io/badge/Next.js-16.3.8-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.2.8-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript 5](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![TanStack Query v5](https://img.shields.io/badge/TanStack_Query-v5-FF4154?style=for-the-badge&logo=react-query)](https://tanstack.com/query)
[![Zustand](https://img.shields.io/badge/Zustand-v5-brown?style=for-the-badge)](https://zustand-demo.pmnd.rs/)
[![Prettier 3](https://img.shields.io/badge/Code_Style-Prettier_3-F7B93E?style=for-the-badge&logo=prettier)](https://prettier.io/)

A state-of-the-art emergency medical dispatch and fleet telemetry frontend engineered for Dhaka metropolitan trauma response. Connected directly to an active production Express/PostgreSQL/Redis backend, this platform provides role-based clinical triage, live telemetry mission advancement, automated electronic billing, and administrative governance.

---

## 🚀 Live Production Backend API

- **Base URL:** `https://ambulance-dispatch-backend-66f2.onrender.com/api/v1`
- **Architecture:** Express.js + Prisma ORM + PostgreSQL + Redis Telemetry Caching
- **Integration Policy:** Zero mock data; all views, queries, and mutations reflect live database records.

---

## 🔑 Pre-Seeded 1-Click Demo Accounts

The `/login` portal includes an automated **1-Click Demo Login Grid** pre-configured with operational credentials:

| Role        | Email                 | Password      | Access Capabilities                                                             |
| :---------- | :-------------------- | :------------ | :------------------------------------------------------------------------------ |
| **PATIENT** | `patient@example.com` | `password123` | Emergency booking wizard, triage calls, payment checkout, tax invoices          |
| **DRIVER**  | `driver@example.com`  | `password123` | Active dispatch telemetry cockpit, 6-stage status advancement, trip logs        |
| **ADMIN**   | `admin@example.com`   | `password123` | Fleet management, BRTA driver onboarding, user role/status controls, audit logs |

---

## 🏛️ System Architecture & Engineering Standards

- **Next.js 16 App Router & Route Groups:**
  - `(public)`: High-performance public pages (SEO optimized with metadata, zero client bundle bloat).
  - `(auth)`: Login (with 1-click grid) and registration with Zod client-side validation.
  - `(dashboard)`: Authenticated shell with role-aware navigation, responsive drawer, telemetry status badge, and breadcrumbs.
  - `payment/`: Multi-gateway checkout reconciliation (`/payment/success`, `/payment/cancel`).
- **Strict Role-Based Network Guard:**
  - Enforced via Next.js 16 `src/proxy.ts` (acting as network gateway/middleware) inspecting session cookies and redirecting unauthorized roles.
- **In-Memory Token & Server Cookie Hygiene:**
  - Pure in-memory Zustand store (`src/stores/auth.store.ts`) for client state.
  - Synchronized with HTTP-only session cookies via Next.js Route Handler (`/api/auth/session`).
  - Automatic session rehydration from `/users/me` on browser refresh.
  - **Zero sensitive tokens stored in `localStorage` or `sessionStorage`**.
- **Design System & Tailwind CSS v4:**
  - Strict compliance with `STANDARDS.md`. Zero arbitrary bracket values (e.g. `p-[13px]` is forbidden).
  - Curated semantic design tokens (`emergency`, `surface`, `card`, `border`, `primary`, `muted`).
  - High-contrast clinical dark-mode aesthetic with emergency strobe indicators.

---

## 🗺️ Complete Route Catalog (27 Static & Dynamic Routes)

### 1. Public Portals

- `/` — Homepage featuring emergency call-to-action hero, 24/7 response stats, live fleet preview.
- `/about` — Clinical pre-hospital care philosophy, governance, and Dhaka dispatch benchmarks.
- `/services` — Fleet tier specifications (BLS, ACLS, ICU, Neonatal, Air), onboard equipment checklists, standard fare tariffs.
- `/hospitals` — Dhaka trauma center directory with emergency hotline triggers and trauma tier badges.
- `/contact` — Central dispatch hotline directory, 999 integration desk, and priority inquiry form.
- `/faq` — Searchable, accordion-driven clinical and billing FAQs.

### 2. Authentication

- `/login` — Split credential login form alongside the 1-Click Demo Login Grid.
- `/register` — Patient registration wizard with automatic session creation.

### 3. Patient Portal

- `/patient` — Patient operational dashboard, active emergency triage requests, and payment settlement actions.
- `/patient/book` — 4-stage Emergency Booking Wizard with browser GPS coordinates, Dhaka quick-pickup points, and clinical triage priority selection.
- `/patient/payments` — Settlement history table with status badges and payment gateway breakdown.
- `/patient/invoice/[id]` — Printable electronic medical transport invoice (`window.print()`).
- `/patient/profile` — Account security details and contact information.

### 4. Paramedic Driver Portal

- `/driver` — Real-time Driver Cockpit with active mission telemetry, route addresses, and 1-click 6-stage status advancement button.
- `/driver/history` — Completed dispatch run logs with mileage, duration, and patient triage level.
- `/driver/profile` — BRTA professional driver license verification and vehicle assignment.

### 5. Central Dispatch & Administrative Governance

- `/admin` — Real-time operations overview with Recharts telemetry distribution and fleet capacity gauges.
- `/admin/fleet` — Ambulance fleet registry, operational status filters, commissioning modal, and maintenance locks.
- `/admin/drivers` — Paramedic driver directory and BRTA license commissioning wizard.
- `/admin/dispatches` — Metropolitan dispatch logs with full 6-stage audit checkpoints.
- `/admin/users` — Role-based access control manager (role toggles, suspend/activate account, soft delete).
- `/admin/audit-logs` — Immutable audit trail of system events, logins, dispatch state modifications, and payments.

### 6. Payment Gateways

- `/payment/success` — Transaction receipt confirmation after simulated gateway approval.
- `/payment/cancel` — Graceful fallback on user payment cancellation with retry action.

---

## 💻 Local Development & Verification

### 1. Installation

```bash
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_API_URL=https://ambulance-dispatch-backend-66f2.onrender.com/api/v1
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Code Quality & Format Checks

```bash
# Verify formatting across all files
npm run format:check

# Auto-format all source code with Prettier 3
npm run format

# Run ESLint checks (0 errors, 0 warnings enforced)
npm run lint

# Compile production bundle
npm run build
```

---

## 📦 Tech Stack Summary

| Layer                    | Technologies                                                  |
| :----------------------- | :------------------------------------------------------------ |
| **Framework**            | Next.js 16.3.8 (App Router, Turbopack, Server Route Handlers) |
| **Runtime & Language**   | React 19.2.8, TypeScript 5 (Strict Mode)                      |
| **Styling**              | Tailwind CSS v4, Lucide Icons, clsx, tailwind-merge           |
| **State & Server Cache** | TanStack React Query v5, Zustand v5                           |
| **Form Handling**        | React Hook Form, Zod v3                                       |
| **Visualizations**       | Recharts v3                                                   |
| **Feedback**             | Sonner (Toast notifications)                                  |
| **Code Hygiene**         | ESLint 9, Prettier 3                                          |

---

Developed for **Emergency Ambulance & Metropolitan Trauma Dispatch Operations**.
