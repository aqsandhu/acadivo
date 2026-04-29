// ─────────────────────────────────────────────
// ApiResponse — Standardized JSON response wrapper
// ─────────────────────────────────────────────

export interface ApiResponseMeta {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
}

export class ApiResponse {
  static success<T>(
    res: import("express").Response,
    data: T,
    message = "Success",
    statusCode = 200,
    meta?: ApiResponseMeta
  ) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      meta,
    });
  }

  static error(
    res: import("express").Response,
    message = "An error occurred",
    statusCode = 500,
    errors?: unknown
  ) {
    return res.status(statusCode).json({
      success: false,
      message,
      errors,
    });
  }

  static paginated<T>(
    res: import("express").Response,
    data: T[],
    page: number,
    limit: number,
    total: number,
    message = "Success"
  ) {
    return this.success(res, data, message, 200, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  }

  static noContent(res: import("express").Response) {
    return res.status(204).send();
  }
}
