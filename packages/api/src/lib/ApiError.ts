// ─────────────────────────────────────────────
// ApiError — Domain-specific HTTP error class
// ─────────────────────────────────────────────

export class ApiError extends Error {
  statusCode: number;
  errors?: unknown;
  isOperational: boolean;

  constructor(
    message: string,
    statusCode: number,
    errors?: unknown,
    isOperational = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = "Bad Request", errors?: unknown) {
    return new ApiError(message, 400, errors);
  }

  static unauthorized(message = "Unauthorized") {
    return new ApiError(message, 401);
  }

  static forbidden(message = "Forbidden") {
    return new ApiError(message, 403);
  }

  static notFound(message = "Not Found") {
    return new ApiError(message, 404);
  }

  static conflict(message = "Conflict") {
    return new ApiError(message, 409);
  }

  static internal(message = "Internal Server Error") {
    return new ApiError(message, 500, undefined, false);
  }
}
