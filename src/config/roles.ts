import { Role } from "@/types/entities.types";
import { ROUTES } from "./routes";

export const ROLE_DEFAULT_REDIRECT: Record<Role, string> = {
  [Role.ADMIN]: ROUTES.ADMIN.DASHBOARD,
  [Role.DRIVER]: ROUTES.DRIVER.DASHBOARD,
  [Role.PATIENT]: ROUTES.PATIENT.DASHBOARD,
};

export const ROUTE_PERMISSIONS: {
  prefix: string;
  allowedRoles: Role[];
}[] = [
  { prefix: "/admin", allowedRoles: [Role.ADMIN] },
  { prefix: "/driver", allowedRoles: [Role.DRIVER] },
  { prefix: "/patient", allowedRoles: [Role.PATIENT] },
];

export function getAllowedRolesForPath(pathname: string): Role[] | null {
  const match = ROUTE_PERMISSIONS.find((route) => pathname.startsWith(route.prefix));
  return match ? match.allowedRoles : null;
}
