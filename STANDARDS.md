# 🚑 Emergency Ambulance Dispatch — Frontend Standards & Protocols

> **This document is the project constitution.**
> Every developer (human or AI) working on this project MUST read and follow these rules.
> When in doubt, refer here first — not instinct, not habit.

---

## 📋 Table of Contents

1. [Architecture Rules](#1-architecture-rules)
2. [Folder & File Structure](#2-folder--file-structure)
3. [Naming Conventions](#3-naming-conventions)
4. [TypeScript Rules](#4-typescript-rules)
5. [Component Rules (Server vs Client)](#5-component-rules-server-vs-client)
6. [Data Fetching & State Rules](#6-data-fetching--state-rules)
7. [Form & Validation Rules](#7-form--validation-rules)
8. [Styling & CSS Rules](#8-styling--css-rules)
9. [Import & Export Rules](#9-import--export-rules)
10. [Authentication & RBAC Rules](#10-authentication--rbac-rules)
11. [API Client Rules](#11-api-client-rules)
12. [Git & Commit Rules](#12-git--commit-rules)
13. [Performance Rules](#13-performance-rules)
14. [Error Handling Rules](#14-error-handling-rules)
15. [URL & Navigation Rules](#15-url--navigation-rules)

---

## 1. Architecture Rules

### The Three Inviolable Laws

```
LAW 1: app/ is for ROUTING ONLY.
LAW 2: features/ are DOMAIN ISOLATED — no cross-feature imports.
LAW 3: Every feature's public API is its index.ts ONLY.
```

### Layer Hierarchy (top = most specific, bottom = most shared)

```
app/          <- Routes, layouts, loading.tsx, error.tsx, not-found.tsx
features/     <- Domain business logic (auth, emergency, dispatch, fleet, hospital, payment, admin)
components/   <- Shared, reusable UI primitives only
stores/       <- Global Zustand client state
hooks/        <- Cross-feature shared custom hooks
lib/          <- Infrastructure (api-client, utils)
config/       <- Static app config (routes, roles, demo credentials)
types/        <- Shared TypeScript contracts
middleware.ts <- Edge-level RBAC guard
```

### What belongs WHERE — decision table

| Code type | Location |
|---|---|
| Route/page entry point | `app/` |
| Business logic for a domain | `features/<domain>/` |
| API query hooks for a domain | `features/<domain>/api/` |
| Components used by ONE feature | `features/<domain>/components/` |
| Components used by 2+ features | `components/ui/` or `components/layout/` |
| Custom hook used by ONE feature | `features/<domain>/hooks/` |
| Custom hook used by 2+ features | `hooks/` |
| Zustand store | `stores/` |
| Fetch client config | `lib/api-client.ts` |
| Utility functions (cn, format) | `lib/utils.ts` |
| App-wide constants, route maps | `config/` |
| TypeScript entity types | `types/entities.types.ts` |
| API response wrapper types | `types/api.types.ts` |

---

## 2. Folder & File Structure

### Canonical Project Structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   ├── page.tsx
│   │   │   └── loading.tsx
│   │   └── register/
│   │       ├── page.tsx
│   │       └── loading.tsx
│   ├── (public)/
│   │   ├── page.tsx               # Home / Landing
│   │   ├── about/page.tsx
│   │   ├── services/page.tsx
│   │   ├── hospitals/page.tsx
│   │   ├── contact/page.tsx
│   │   └── faq/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx             # Dashboard shell (sidebar + header)
│   │   ├── patient/
│   │   │   ├── page.tsx           # My Requests
│   │   │   ├── book/page.tsx      # Emergency Booking Wizard
│   │   │   ├── payments/page.tsx  # Payment History
│   │   │   └── profile/page.tsx
│   │   ├── driver/
│   │   │   ├── page.tsx           # Active Dispatch
│   │   │   ├── history/page.tsx
│   │   │   └── profile/page.tsx
│   │   └── admin/
│   │       ├── page.tsx           # Analytics Dashboard
│   │       ├── fleet/page.tsx
│   │       ├── drivers/page.tsx
│   │       ├── dispatches/page.tsx
│   │       ├── users/page.tsx
│   │       └── audit-logs/page.tsx
│   ├── payment/
│   │   ├── success/page.tsx
│   │   └── cancel/page.tsx
│   ├── layout.tsx
│   ├── loading.tsx
│   ├── not-found.tsx
│   └── error.tsx
│
├── features/
│   ├── auth/
│   │   ├── api/
│   │   │   └── auth.queries.ts    # useLogin, useRegister, useMe, useLogout
│   │   ├── components/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   └── DemoLoginGrid.tsx
│   │   ├── hooks/
│   │   │   └── useAuth.ts
│   │   ├── types.ts
│   │   └── index.ts               # Public API
│   ├── emergency/
│   │   ├── api/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── types.ts
│   │   └── index.ts
│   ├── dispatch/
│   ├── fleet/
│   ├── hospital/
│   ├── payment/
│   └── admin/
│
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Badge.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   ├── Skeleton.tsx
│   │   ├── DataTable.tsx
│   │   ├── Pagination.tsx
│   │   ├── EmptyState.tsx
│   │   └── index.ts
│   └── layout/
│       ├── Navbar.tsx
│       ├── Footer.tsx
│       ├── DashboardSidebar.tsx
│       ├── UserMenu.tsx
│       └── index.ts
│
├── config/
│   ├── routes.ts
│   ├── roles.ts
│   └── demo-credentials.ts
│
├── hooks/
│   ├── useDebounce.ts
│   ├── useUrlParams.ts
│   └── useMediaQuery.ts
│
├── lib/
│   ├── api-client.ts
│   └── utils.ts
│
├── stores/
│   └── auth.store.ts
│
├── types/
│   ├── api.types.ts
│   └── entities.types.ts
│
└── middleware.ts
```

### Rules for `app/` pages

```tsx
// CORRECT — page.tsx is a thin import/export shell
import { RequestList } from "@/features/emergency";
export default function PatientRequestsPage() {
  return <RequestList />;
}

// WRONG — no business logic inside app/ pages
export default function PatientRequestsPage() {
  const [requests, setRequests] = useState([]);
  useEffect(() => { fetch('/api/requests').then(...) }, []);
  return <div>{requests.map(...)}</div>
}
```

---

## 3. Naming Conventions

### Files

| Type | Convention | Example |
|---|---|---|
| React Component | PascalCase | `LoginForm.tsx` |
| Hook | camelCase with `use` prefix | `useAuth.ts` |
| Utility / helper | camelCase | `formatDate.ts` |
| Type file | camelCase + `.types.ts` suffix | `api.types.ts` |
| API query file | camelCase + `.queries.ts` suffix | `auth.queries.ts` |
| Store file | camelCase + `.store.ts` suffix | `auth.store.ts` |
| Config file | camelCase | `routes.ts` |
| Feature barrel | always `index.ts` | `index.ts` |

### Variables & Functions

```ts
// Components — PascalCase
export function LoginForm() {}

// Hooks — camelCase, must start with "use"
export function useAuth() {}
export function useDebounce<T>(value: T, delay: number) {}

// Constants — SCREAMING_SNAKE_CASE
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
export const MAX_FILE_SIZE_MB = 5;

// Types & Interfaces — PascalCase, no "I" prefix
type ApiResponse<T> = { success: boolean; data: T; message: string };
interface User { id: string; name: string; role: Role }

// Enums — PascalCase name, SCREAMING_SNAKE_CASE values
enum Role { PATIENT = "PATIENT", DRIVER = "DRIVER", ADMIN = "ADMIN" }

// Query key factories — arrays
const emergencyKeys = {
  all: ["emergency"] as const,
  list: (filters: RequestFilters) => [...emergencyKeys.all, "list", filters] as const,
};
```

### CSS Classes (Tailwind)

```tsx
// Use cn() for conditional classes — never string concatenation
import { cn } from "@/lib/utils";
<button className={cn("px-4 py-2 rounded", isActive && "bg-primary text-white")} />

// NEVER use string interpolation with Tailwind — purger cannot detect it
<button className={`px-4 py-2 bg-${color}-500`} />   // BANNED
```

---

## 4. TypeScript Rules

### Non-negotiable rules

```ts
// BANNED — no `any` type ever
const data: any = response.json();

// Use unknown for untrusted data, then narrow
const data: unknown = response.json();
if (isApiResponse(data)) { ... }

// BANNED — type assertions without justification
const user = session as User;

// Use type guards instead
function isUser(val: unknown): val is User {
  return typeof val === "object" && val !== null && "role" in val;
}

// BANNED — implicit return types on exported functions
export function formatDate(date: string) { ... }

// Explicit return types on all exported functions
export function formatDate(date: string): string { ... }
```

### Type file rules

- All entity types live in `src/types/entities.types.ts`.
- API wrapper types live in `src/types/api.types.ts`.
- Feature-specific types live in `src/features/<domain>/types.ts`.
- Never define types inline inside component files unless they are component prop types.

```ts
// Component prop types inline is fine
type ButtonProps = {
  variant: "primary" | "secondary";
  isLoading?: boolean;
  children: React.ReactNode;
};

export function Button({ variant, isLoading, children }: ButtonProps) {}
```

---

## 5. Component Rules (Server vs Client)

### The Decision Rule

```
Is the component interactive? (onClick, useState, useEffect, browser API)
  YES -> "use client" directive at the TOP of the file
  NO  -> Server Component by default (no directive needed)
```

### Server Component (default — no directive)

```tsx
// Server Component: data fetching, static UI, SEO
import { getHospitals } from "@/features/hospital";

export default async function HospitalsPage() {
  const hospitals = await getHospitals(); // Direct server-side fetch
  return <HospitalList hospitals={hospitals} />;
}
```

### Client Component (explicit opt-in)

```tsx
"use client"; // MUST be at the very top, before any imports

import { useState } from "react";

export function SearchInput({ onSearch }: { onSearch: (q: string) => void }) {
  const [value, setValue] = useState("");
  return <input value={value} onChange={(e) => { setValue(e.target.value); onSearch(e.target.value); }} />;
}
```

### Component Rules

1. Never add `"use client"` to a component that doesn't need it.
2. Push `"use client"` as far down the tree as possible — to leaf components only.
3. Never put `"use client"` on a layout or page unless absolutely unavoidable.
4. Feature `index.ts` barrels must NOT mix Server and Client Component exports.
5. Loading states must use Next.js `loading.tsx` files (not inline spinners in page components).

---

## 6. Data Fetching & State Rules

### Server State vs Client State

| Data type | Tool |
|---|---|
| Data from the API (requests, dispatches, fleet) | TanStack Query |
| Auth session (user, token, role) | Zustand (`auth.store.ts`) |
| UI-only state (sidebar open, modal open) | local `useState` in component |
| Multi-step form state across steps | Zustand or React context scoped to the wizard |

### TanStack Query rules

```ts
// Always use structured query key factories — never raw strings
export const emergencyKeys = {
  all: ["emergency"] as const,
  list: (filters: RequestFilters) => [...emergencyKeys.all, "list", filters] as const,
  detail: (id: string) => [...emergencyKeys.all, "detail", id] as const,
};

// Always define staleTime
const { data } = useQuery({
  queryKey: emergencyKeys.list(filters),
  queryFn: () => api.getRequests(filters),
  staleTime: 30 * 1000,
});

// Always invalidate related queries on mutations
const mutation = useMutation({
  mutationFn: api.updateDispatchStatus,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: dispatchKeys.all });
  },
});

// NEVER use useEffect + fetch for data that TanStack Query can handle
useEffect(() => {
  fetch('/api/requests').then(r => r.json()).then(setData);
}, []);
// BANNED ^^^
```

### Zustand store rules

```ts
// Typed slices, clear actions
interface AuthState {
  user: User | null;
  accessToken: string | null;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  setAuth: (user, accessToken) => set({ user, accessToken }),
  clearAuth: () => set({ user: null, accessToken: null }),
}));

// Use selector pattern to prevent unnecessary re-renders
const user = useAuthStore((state) => state.user);   // CORRECT
const store = useAuthStore();                         // WRONG — subscribes to ALL changes
```

---

## 7. Form & Validation Rules

```ts
// ALWAYS use React Hook Form + Zod resolver
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

// Derive type FROM schema — never write it separately as a duplicate interface
type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });
}
```

### Form rules

1. Every form MUST have a Zod schema — no unvalidated forms.
2. Schema type is always derived with `z.infer<typeof schema>`.
3. Show field-level errors inline below each input, not only as a toast.
4. Disable submit button while form is submitting (`formState.isSubmitting`).
5. Show loading indicator on the submit button while submitting.
6. Reset form after successful submission unless UX requires otherwise.
7. Multi-step forms use a single top-level `useForm` with all steps' data — not separate forms per step.

---

## 8. Styling & CSS Rules

### Tailwind CSS rules

```tsx
// Use the cn() helper for all conditional classes
import { cn } from "@/lib/utils"; // cn = clsx + tailwind-merge

// Mobile-first: start with base (mobile), add md: lg: xl: overrides
<div className="flex flex-col md:flex-row gap-4 md:gap-8" />

// NEVER hardcode pixel values — use Tailwind scale
<div style={{ marginTop: "12px" }} />   // BANNED
<div className="mt-3" />                // CORRECT

// NEVER use arbitrary values unless there is no Tailwind equivalent
<div className="h-[347px]" />                   // BANNED — use h-80 or h-96
<div className="h-[calc(100vh-64px)]" />         // OK — justified, no Tailwind equivalent

// NEVER use dynamic class interpolation — Tailwind cannot purge it
<div className={`bg-${color}-500`} />           // BANNED

// Use explicit class maps instead
const colorMap = { red: "bg-red-500", green: "bg-green-500" };
<div className={colorMap[color]} />              // CORRECT
```

### Design Token Rules (Tailwind CSS v4 @theme)

Define ALL design tokens in `src/app/globals.css`. Never use raw color hex values in components.

```css
@theme inline {
  --color-primary: hsl(221 83% 53%);
  --color-primary-foreground: hsl(0 0% 98%);
  --color-emergency: hsl(0 84% 55%);
  --color-emergency-foreground: hsl(0 0% 98%);
  --color-success: hsl(142 71% 45%);
  --color-warning: hsl(38 92% 50%);
  --color-surface: hsl(222 47% 11%);
  --color-card: hsl(222 47% 16%);
  --color-border: hsl(222 47% 22%);
  --radius-DEFAULT: 0.5rem;
}
```

---

## 9. Import & Export Rules

### Import ordering

Always follow this order:

```ts
// 1. React / Next.js core
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

// 2. Third-party libraries
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

// 3. Internal — absolute imports via @/ alias ONLY (no relative ../../)
import { Button } from "@/components/ui";
import { useAuth } from "@/features/auth";
import { ROUTES } from "@/config/routes";
import type { User } from "@/types/entities.types";

// 4. Local relative imports (only within the same feature folder)
import { LoginSchema } from "./types";
```

### Barrel export rules

```ts
// features/auth/index.ts — ONLY export what external code needs
export { LoginForm } from "./components/LoginForm";
export { DemoLoginGrid } from "./components/DemoLoginGrid";
export { useAuth } from "./hooks/useAuth";
export type { AuthUser, LoginPayload } from "./types";

// Do NOT export internal implementation details
// export { authQueryKeys } from "./api/auth.queries";  // internal — BANNED
```

### Cross-feature import rules

```ts
// OK — importing from shared layers
import { Button } from "@/components/ui";
import { useDebounce } from "@/hooks/useDebounce";
import { api } from "@/lib/api-client";
import type { User } from "@/types/entities.types";

// OK — importing from another feature's public index.ts
import { useAuth } from "@/features/auth";

// BANNED — importing from inside another feature (bypassing its public API)
import { loginSchema } from "@/features/auth/types";              // BANNED
import { authQueryKeys } from "@/features/auth/api/auth.queries"; // BANNED
import { tokenHelpers } from "@/features/auth/utils";             // BANNED
```

---

## 10. Authentication & RBAC Rules

### Token storage

- **Access token** — Zustand store (in-memory). Never in localStorage.
- **Refresh token** — HTTP-only cookie (server-set). Never in localStorage or Zustand.
- **Never store tokens in `localStorage`** — XSS vulnerable.

### Middleware (Edge RBAC)

```ts
// middleware.ts — runs at the edge before the page renders
// Responsibilities:
// 1. Check if route is protected
// 2. Verify the session cookie exists
// 3. Check role matches the required role for that route prefix
// 4. Redirect to /login?redirect=<path> if unauthenticated
// 5. Redirect to correct dashboard if wrong role accesses a portal

export const config = {
  matcher: ["/patient/:path*", "/driver/:path*", "/admin/:path*"],
};
```

### Role to Route Access Map (`config/roles.ts`)

| Route prefix | Allowed roles |
|---|---|
| `/patient/*` | `PATIENT` only |
| `/driver/*` | `DRIVER` only |
| `/admin/*` | `ADMIN` only |
| `/login`, `/register` | Unauthenticated only — redirect logged-in users to their dashboard |

---

## 11. API Client Rules

### All API calls go through the centralized client

```ts
// CORRECT
import { api } from "@/lib/api-client";
const requests = await api.get<PaginatedResponse<EmergencyRequest>>("/requests");

// BANNED — never call fetch directly in components or query hooks
const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/requests`);
```

### API client responsibilities

1. Inject Bearer token from Zustand store on every request automatically.
2. Handle 401 Unauthorized — attempt token refresh once, retry request, then logout.
3. Parse errors consistently into `ApiError` shape: `{ message, status, errors }`.
4. Never throw raw `Response` objects — always throw typed `ApiError`.
5. Log errors in development — never in production.

### Response type rules

```ts
type ApiResponse<T> = {
  success: true;
  message: string;
  data: T;
};

type ApiError = {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
};

type PaginatedResponse<T> = ApiResponse<{
  data: T[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}>;
```

---

## 12. Git & Commit Rules

### Conventional Commits — MANDATORY

```
<type>(<scope>): <short description>

Types:
  feat     — new feature
  fix      — bug fix
  refactor — code change that neither fixes a bug nor adds a feature
  style    — formatting, whitespace (no logic change)
  docs     — documentation only
  test     — adding or fixing tests
  chore    — build process, dependency updates
  perf     — performance improvement
  ci       — CI/CD pipeline changes

Scopes (use the feature or layer name):
  auth, emergency, dispatch, fleet, hospital, payment, admin
  ui, layout, middleware, config, lib, types, store

Examples:
  feat(auth): add one-click demo login grid for 3 roles
  feat(emergency): implement multi-step booking wizard with GPS input
  fix(dispatch): correct status stepper not advancing to PATIENT_PICKUP
  refactor(fleet): extract ambulance filter into shared hook
  docs: update STANDARDS with API client retry logic
  chore: upgrade @tanstack/react-query to v5.104
```

### Branch rules

```
main                          — production-ready, deployed to Vercel
dev                           — integration branch, always must build
feature/<scope>/<description> — e.g. feature/auth/demo-login-grid
fix/<scope>/<description>     — e.g. fix/dispatch/status-stepper
```

### Commit size rule

- One logical change per commit.
- Never commit `"wip"`, `"fix"`, `"update"`, or `"changes"` — not meaningful.
- Minimum 20 meaningful commits required by submission deadline.

---

## 13. Performance Rules

1. `next/image` for ALL images — never raw `<img>` tags.
2. Every data-fetching page must have a `loading.tsx` with skeleton UI (not a spinner).
3. Lazy load heavy components below the fold with `dynamic(() => import(...), { ssr: false })`.
4. Recharts components must be dynamically imported — they are client-only heavy libraries.
5. `useSearchParams` must be wrapped in `Suspense` — Next.js requirement, no exceptions.
6. Debounce all search inputs by at least 300ms before triggering API calls.
7. Do not `invalidateQueries` broadly — always invalidate the most specific query key.
8. Use `select` in TanStack Query to transform/filter data at the hook level.

---

## 14. Error Handling Rules

### The Three Layers

```
Layer 1: API Client level  — parse HTTP errors into ApiError, never let raw errors bubble up
Layer 2: Component level   — useQuery/useMutation onError -> toast notification
Layer 3: Page level        — error.tsx catches rendering crashes with a retry UI
```

### Toast rules (Sonner)

```ts
// CORRECT — human-readable messages
toast.error("Failed to create request. Please try again.");
toast.success("Ambulance dispatched successfully!");

// BANNED — never expose raw server error messages to users
toast.error(error.message); // Could be "Internal Server Error" — useless to the user
```

### error.tsx rules

- Every protected route group `(dashboard)` must have its own `error.tsx`.
- Every public route group `(public)` must have `error.tsx`.
- `error.tsx` must show: human-friendly message + "Try Again" button + "Go Home" link.
- Never show a blank screen or stack trace to the user.

### Empty state rules

- Every list/table view must render an `<EmptyState />` component when data is `[]`.
- `EmptyState` must have: an icon, a title, a description, and optionally a CTA button.
- Never render an empty `<div />` or `null` for empty data.

---

## 15. URL & Navigation Rules

### URL as single source of truth

All filterable, searchable, and paginated pages MUST sync state to URL params.

```ts
// URL-synced filters example
// /admin/fleet?status=AVAILABLE&type=BASIC&page=2&limit=10

// Use the shared useUrlParams hook
const { params, setParam, setParams } = useUrlParams();
const status = params.get("status") ?? "ALL";
const page = Number(params.get("page") ?? "1");

// BANNED — storing filter state only in useState (lost on refresh)
const [status, setStatus] = useState("ALL");
```

### Navigation rules

```ts
// CORRECT — use typed ROUTES constants
import { ROUTES } from "@/config/routes";
router.push(ROUTES.patient.requests);
router.push(ROUTES.admin.fleet);

// BANNED — hardcoded route strings in components
router.push("/admin/fleet");  // Breaks if routes change
```

### config/routes.ts is the single source of route truth

```ts
export const ROUTES = {
  home: "/",
  about: "/about",
  services: "/services",
  hospitals: "/hospitals",
  contact: "/contact",
  faq: "/faq",
  login: "/login",
  register: "/register",
  patient: {
    root: "/patient",
    book: "/patient/book",
    payments: "/patient/payments",
    profile: "/patient/profile",
  },
  driver: {
    root: "/driver",
    history: "/driver/history",
    profile: "/driver/profile",
  },
  admin: {
    root: "/admin",
    fleet: "/admin/fleet",
    drivers: "/admin/drivers",
    dispatches: "/admin/dispatches",
    users: "/admin/users",
    auditLogs: "/admin/audit-logs",
  },
  payment: {
    success: "/payment/success",
    cancel: "/payment/cancel",
  },
} as const;
```

---

## Quick Reference — The "Never Do" List

| NEVER | INSTEAD |
|---|---|
| `any` type | `unknown` + type guard |
| Raw `fetch()` in components | `api` client + TanStack Query |
| `localStorage` for tokens | HTTP-only cookie (refresh) + Zustand (access) |
| Hardcoded route strings | `ROUTES` constants from `config/routes.ts` |
| `"use client"` on pages/layouts | Push interactivity to leaf components |
| Raw `<img>` tags | `<Image>` from `next/image` |
| Dynamic Tailwind class interpolation | Explicit class maps |
| Import from inside another feature's internals | Import from feature's `index.ts` only |
| Business logic in `app/` pages | Move to `features/<domain>/` |
| `useState` for server data | TanStack Query |
| Full-page spinners as loading state | Skeleton `loading.tsx` |
| `"update"` or `"wip"` commit messages | Conventional commit format |
| Empty `<div />` for no-data states | `<EmptyState />` component |

---

*Last updated: October 2026 — Emergency Ambulance Dispatch Frontend*
