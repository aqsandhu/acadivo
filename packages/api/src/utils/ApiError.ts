/**
 * @file src/utils/ApiError.ts
 * @description Custom error class extending Error with HTTP status code and operational flag.
 */

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly code: string;
  public readonly details?: Record<string, string[]>;

  /**
   * @param message - Human-readable error message
   * @param statusCode - HTTP status code
   * @param isOperational - True if this is a known/expected error (not a crash)
   * @param code - Machine-readable error code
   * @param details - Optional validation / error details
   */
  constructor(
    message: string,
    statusCode = 500,
    isOperational = true,
    code = "INTERNAL_ERROR",
    details?: Record<string, string[]>
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  /** 400 Bad Request */
  static badRequest(message = "Bad Request", code = "BAD_REQUEST"): ApiError {
    return new ApiError(message, 400, true, code);
  }

  /** 401 Unauthorized */
  static unauthorized(message = "Unauthorized", code = "UNAUTHORIZED"): ApiError {
    return new ApiError(message, 401, true, code);
  }

  /** 403 Forbidden */
  static forbidden(message = "Forbidden", code = "FORBIDDEN"): ApiError {
    return new ApiError(message, 403, true, code);
  }

  /** 404 Not Found */
  static notFound(message = "Not Found", code = "NOT_FOUND"): ApiError {
    return new ApiError(message, 404, true, code);
  }

  /** 409 Conflict */
  static conflict(message = "Conflict", code = "CONFLICT"): ApiError {
    return new ApiError(message, 409, true, code);
  }

  /** 422 Unprocessable Entity */
  static unprocessable(message = "Unprocessable Entity", code = "UNPROCESSABLE"): ApiError {
    return new ApiError(message, 422, true, code);
  }

  /** 500 Internal Server Error */
  static internal(message = "Internal Server Error", code = "INTERNAL_ERROR"): ApiError {
    return new ApiError(message, 500, false, code);
  }
}
