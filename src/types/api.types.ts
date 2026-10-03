import type {
  Ambulance,
  EmergencyRequest,
  Hospital,
  Driver,
  Dispatch,
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
}

export interface PaginatedData<T> {
  data: T[];
  meta: PaginationMeta;
}

export type PaginatedResponse<T> = ApiResponse<PaginatedData<T>>;

// Exact backend response shapes (matching L2B7A6 service returns)
export interface AmbulancesResponseData {
  ambulances: Ambulance[];
  meta: PaginationMeta;
}

export interface RequestsResponseData {
  requests: EmergencyRequest[];
  meta: PaginationMeta;
}

export interface HospitalsResponseData {
  hospitals: Hospital[];
  meta: PaginationMeta;
}

export interface DriversResponseData {
  drivers: Driver[];
  meta: PaginationMeta;
}

export interface DispatchesResponseData {
  dispatches: Dispatch[];
  meta: PaginationMeta;
}

export interface UsersResponseData {
  users: User[];
  meta: PaginationMeta;
}

export interface AuditLogsResponseData {
  logs: AuditLog[];
  meta: PaginationMeta;
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
