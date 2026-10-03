export const ROUTES = {
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
    PROFILE: "/patient/profile",
  },
  DRIVER: {
    DASHBOARD: "/driver",
    HISTORY: "/driver/history",
    PROFILE: "/driver/profile",
  },
  ADMIN: {
    DASHBOARD: "/admin",
    FLEET: "/admin/fleet",
    DRIVERS: "/admin/drivers",
    DISPATCHES: "/admin/dispatches",
    USERS: "/admin/users",
    LOGS: "/admin/audit-logs",
  },
  PAYMENT: {
    SUCCESS: "/payment/success",
    CANCEL: "/payment/cancel",
  },
} as const;

export type AppRoutes = typeof ROUTES;
