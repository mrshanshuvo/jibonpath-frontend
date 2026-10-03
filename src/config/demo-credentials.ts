import { Role } from "@/types/entities.types";

export interface DemoAccount {
  role: Role;
  name: string;
  email: string;
  password: string;
  badge: string;
  description: string;
  phone: string;
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    role: Role.ADMIN,
    name: "System Admin",
    email: "admin@ambulance.dev",
    password: "Admin@123",
    badge: "Admin Control",
    description:
      "Full oversight of fleet, drivers, active dispatches, revenue, and system audit logs.",
    phone: "01700000001",
  },
  {
    role: Role.PATIENT,
    name: "Patient One",
    email: "patient1@ambulance.dev",
    password: "Patient@123",
    badge: "Caller / Patient",
    description:
      "Book emergency ambulances with GPS coordinates, track dispatches, and settle fees.",
    phone: "01700000003",
  },
  {
    role: Role.DRIVER,
    name: "Driver One",
    email: "driver1@ambulance.dev",
    password: "Driver@123",
    badge: "Paramedic Driver",
    description:
      "View assigned emergency requests, navigate to pickup, update patient transit status.",
    phone: "01700000002",
  },
];
