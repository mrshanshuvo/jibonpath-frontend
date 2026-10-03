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

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: string[] | Record<string, string[]> | unknown;
}

export class ApiError extends Error {
  status: number;
  errors?: string[] | Record<string, string[]> | unknown;

  constructor(message: string, status = 400, errors?: string[] | Record<string, string[]> | unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}
