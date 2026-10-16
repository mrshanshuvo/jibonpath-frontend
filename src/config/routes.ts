export const ROUTES = {
  // Section 15 exact canonical keys
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
    requests: "/patient",
    book: "/patient/book",
    payments: "/patient/payments",
    invoice: (id: string) => `/patient/invoice/${id}`,
    profile: "/patient/profile",
  },
  driver: {
    root: "/driver",
    active: "/driver",
    history: "/driver/history",
    earnings: "/driver/earnings",
    profile: "/driver/profile",
  },
  admin: {
    root: "/admin",
    analytics: "/admin",
    fleet: "/admin/fleet",
    drivers: "/admin/drivers",
    dispatches: "/admin/dispatches",
    mobilize: (id: string) => `/admin/dispatches/${id}/mobilize`,
    users: "/admin/users",
    auditLogs: "/admin/audit-logs",
  },
  payment: {
    success: "/payment/success",
    cancel: "/payment/cancel",
  },

  // Uppercase namespace aliases for backwards compatibility
  PUBLIC: {
    HOME: "/",
    ABOUT: "/about",
    SERVICES: "/services",
    HOSPITALS: "/hospitals",
    CONTACT: "/contact",
    FAQ: "/faq",
  },
  AUTH: {
    LOGIN: "/login",
    REGISTER: "/register",
  },
  PATIENT: {
    DASHBOARD: "/patient",
    BOOK: "/patient/book",
    PAYMENTS: "/patient/payments",
    INVOICE: (id: string) => `/patient/invoice/${id}`,
    PROFILE: "/patient/profile",
  },
  DRIVER: {
    DASHBOARD: "/driver",
    HISTORY: "/driver/history",
    EARNINGS: "/driver/earnings",
    PROFILE: "/driver/profile",
  },
  ADMIN: {
    DASHBOARD: "/admin",
    FLEET: "/admin/fleet",
    DRIVERS: "/admin/drivers",
    DISPATCHES: "/admin/dispatches",
    MOBILIZE: (id: string) => `/admin/dispatches/${id}/mobilize`,
    USERS: "/admin/users",
    LOGS: "/admin/audit-logs",
  },
  PAYMENT: {
    SUCCESS: "/payment/success",
    CANCEL: "/payment/cancel",
  },
} as const;

export type AppRoutes = typeof ROUTES;
