/**
 * @file src/utils/ApiResponse.ts
 * @description Standardized API response wrapper for all endpoints.
 */

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: { code: string; details?: any };
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Create a success response payload.
 */
export function successResponse<T>(
  data: T,
  message = "Success",
  meta?: ApiResponse<T>["meta"]
): ApiResponse<T> {
  return { success: true, message, data, meta };
}

/**
 * Create an error response payload.
 */
export function errorResponse(
  message: string,
  code = "INTERNAL_ERROR",
  details?: any
): ApiResponse<never> {
  return { success: false, message, error: { code, details } };
}
