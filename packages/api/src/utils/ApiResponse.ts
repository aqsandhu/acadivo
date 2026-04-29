/**
 * @file src/utils/ApiResponse.ts
 * @description Standardized API response wrapper for all endpoints.
 */

import { Response } from "express";

export interface ApiResponseMeta {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
}

export interface ApiResponsePayload<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: { code: string; details?: any };
  meta?: ApiResponseMeta;
}

/**
 * Standardized JSON response helper class.
 */
export class ApiResponse {
  static success<T>(
    res: Response,
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
    res: Response,
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
    res: Response,
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

  static noContent(res: Response) {
    return res.status(204).send();
  }
}

/**
 * Create a success response payload.
 */
export function successResponse<T>(
  data: T,
  message = "Success",
  meta?: ApiResponseMeta
): ApiResponsePayload<T> {
  return { success: true, message, data, meta };
}

/**
 * Create an error response payload.
 */
export function errorResponse(
  message: string,
  code = "INTERNAL_ERROR",
  details?: any
): ApiResponsePayload<never> {
  return { success: false, message, error: { code, details } };
}
