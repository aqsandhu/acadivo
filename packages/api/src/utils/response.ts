// ═══════════════════════════════════════════════════
// Shared API Response Utilities
// ═══════════════════════════════════════════════════

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: { code: string; details?: unknown };
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function successResponse<T>(
  data: T,
  message = 'Success',
  meta?: PaginationMeta
): ApiResponse<T> {
  return { success: true, message, data, meta };
}

export function errorResponse(
  code: string,
  message: string,
  details?: unknown
): ApiResponse<never> {
  return { success: false, message, error: { code, details } };
}

export function paginate<T>(
  items: T[],
  total: number,
  page: number,
  limit: number
): { data: T[]; meta: PaginationMeta } {
  const totalPages = Math.ceil(total / limit) || 1;
  return {
    data: items,
    meta: { page, limit, total, totalPages },
  };
}

export function buildPaginationMeta(
  page: number,
  limit: number,
  total: number
): PaginationMeta {
  const totalPages = Math.ceil(total / limit) || 1;
  return { page, limit, total, totalPages };
}
