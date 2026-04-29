/**
 * @file src/utils/pagination.ts
 * @description Pagination helper for calculating skip, limit, page, and totalPages.
 */

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginationResult {
  skip: number;
  limit: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Calculate pagination values from page/limit and total count.
 */
export function getPagination(
  params: PaginationParams,
  total: number
): PaginationResult {
  const page = Math.max(1, params.page);
  const limit = Math.max(1, Math.min(params.limit, 100));
  const skip = (page - 1) * limit;
  const totalPages = Math.ceil(total / limit) || 1;

  return {
    skip,
    limit,
    page,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

/**
 * Build standard pagination meta for ApiResponse.
 */
export function buildPaginationMeta(
  page: number,
  limit: number,
  total: number
) {
  const totalPages = Math.ceil(total / limit) || 1;
  return { page, limit, total, totalPages };
}
