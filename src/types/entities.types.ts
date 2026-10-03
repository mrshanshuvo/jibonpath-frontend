// ============================================================================
// ENUMS (Exact match to backend Prisma schema)
// ============================================================================

export enum Role {
  PATIENT = "PATIENT",
  DRIVER = "DRIVER",
  ADMIN = "ADMIN",
}

export enum Priority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

export enum RequestStatus {
  PENDING = "PENDING",
  DISPATCHED = "DISPATCHED",
  CANCELLED = "CANCELLED",
  COMPLETED = "COMPLETED",
}

export enum DispatchStatus {
  DISPATCHED = "DISPATCHED",
  EN_ROUTE = "EN_ROUTE",
  PATIENT_PICKUP = "PATIENT_PICKUP",
  HOSPITAL_SELECTED = "HOSPITAL_SELECTED",
  HOSPITAL_ARRIVAL = "HOSPITAL_ARRIVAL",
  COMPLETED = "COMPLETED",
}

export enum AmbulanceStatus {
  AVAILABLE = "AVAILABLE",
  DISPATCHED = "DISPATCHED",
  MAINTENANCE = "MAINTENANCE",
  RETIRED = "RETIRED",
}

export enum AmbulanceType {
  BASIC = "BASIC",
  ADVANCED_LIFE_SUPPORT = "ADVANCED_LIFE_SUPPORT",
  INTENSIVE_CARE = "INTENSIVE_CARE",
}

export enum PaymentStatus {
  PENDING = "PENDING",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
}

export enum PaymentGateway {
  STRIPE = "STRIPE",
  BKASH = "BKASH",
  SSLCOMMERZ = "SSLCOMMERZ",
}

// ============================================================================
// ENTITY MODELS
// ============================================================================

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string | null;
  address?: string | null;
  avatarUrl?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface Ambulance {
  id: string;
  vehicleNumber: string;
  type: AmbulanceType;
  status: AmbulanceStatus;
  make?: string | null;
  year?: number | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  driver?: Driver | null;
}

export interface Driver {
  id: string;
  userId: string;
  licenseNumber: string;
  ambulanceId?: string | null;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  user?: User;
  ambulance?: Ambulance | null;
}

export interface Hospital {
  id: string;
  name: string;
  address: string;
  lat?: number | null;
  lng?: number | null;
  phone: string;
  capacity?: number | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface TripStatusLog {
  id: string;
  dispatchId: string;
  status: DispatchStatus;
  note?: string | null;
  updatedByUserId: string;
  createdAt: string;
  updatedBy?: User;
}

export interface Dispatch {
  id: string;
  requestId: string;
  ambulanceId: string;
  driverId: string;
  hospitalId?: string | null;
  status: DispatchStatus;
  dispatchedAt: string;
  completedAt?: string | null;
  updatedAt: string;
  request?: EmergencyRequest;
  ambulance?: Ambulance;
  driver?: Driver;
  hospital?: Hospital | null;
  tripStatusLogs?: TripStatusLog[];
}

export interface Payment {
  id: string;
  requestId: string;
  amount: number;
  currency: string;
  gateway: PaymentGateway;
  gatewayTxnId?: string | null;
  sessionId?: string | null;
  status: PaymentStatus;
  createdAt: string;
  updatedAt: string;
  request?: EmergencyRequest;
}

export interface EmergencyRequest {
  id: string;
  callerId: string;
  priority: Priority;
  status: RequestStatus;
  pickupAddress: string;
  pickupLat?: number | null;
  pickupLng?: number | null;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  caller?: User;
  dispatch?: Dispatch | null;
  payment?: Payment | null;
}

export interface AuditLog {
  id: string;
  actorId: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  actor?: User;
}

// ============================================================================
// AUTH & SESSION MODELS
// ============================================================================

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken?: string;
}
