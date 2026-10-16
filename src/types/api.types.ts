import type {
  Ambulance,
  EmergencyRequest,
  Hospital,
  Driver,
  Dispatch,
  Payment,
  User,
  AuditLog,
} from "./entities.types";

export interface ApiResponse<T> {
  success: true;
  message: string;
  data: T;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
  hasMore?: boolean;
}

export interface PaginationLinks {
  self: string;
  first: string;
  prev: string | null;
  next: string | null;
  last: string;
}

export interface PaginatedData<T> {
  data: T[];
  meta: PaginationMeta;
  links?: PaginationLinks;
}

export type PaginatedResponse<T> = ApiResponse<PaginatedData<T>>;

// Standardized collection response shapes (JSON:API / RFC-8288 + legacy backward-compatibility)
export interface AmbulancesResponseData {
  data: Ambulance[];
  ambulances: Ambulance[];
  meta: PaginationMeta;
  links?: PaginationLinks;
}

export interface RequestsResponseData {
  data: EmergencyRequest[];
  requests: EmergencyRequest[];
  meta: PaginationMeta;
  links?: PaginationLinks;
}

export interface HospitalsResponseData {
  data: Hospital[];
  hospitals: Hospital[];
  meta: PaginationMeta;
  links?: PaginationLinks;
}

export interface DriversResponseData {
  data: Driver[];
  drivers: Driver[];
  meta: PaginationMeta;
  links?: PaginationLinks;
}

export interface DispatchesResponseData {
  data: Dispatch[];
  dispatches: Dispatch[];
  meta: PaginationMeta;
  links?: PaginationLinks;
}

export interface PaymentsResponseData {
  data: Payment[];
  payments: Payment[];
  meta: PaginationMeta;
  links?: PaginationLinks;
}

export interface UsersResponseData {
  data: User[];
  users: User[];
  meta: PaginationMeta;
  links?: PaginationLinks;
}

export interface AuditLogsResponseData {
  data: AuditLog[];
  logs: AuditLog[];
  meta: PaginationMeta;
  links?: PaginationLinks;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: string[] | Record<string, string[]> | unknown;
}

export class ApiError extends Error {
  readonly success = false as const;
  status: number;
  errors?: string[] | Record<string, string[]> | unknown;

  constructor(
    message: string,
    status = 400,
    errors?: string[] | Record<string, string[]> | unknown,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}
