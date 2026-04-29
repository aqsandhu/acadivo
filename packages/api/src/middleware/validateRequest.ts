/**
 * @file src/middleware/validateRequest.ts
 * @description Express-validator / Joi request validation middleware wrapper.
 */

import { Request, Response, NextFunction, RequestHandler } from "express";
import { validationResult, ValidationChain } from "express-validator";
import Joi from "joi";
import { ApiError } from "../utils/ApiError";

/**
 * Wrap express-validator chains and return a middleware that bails on first error.
 */
export function validateRequest(validations: ValidationChain[]): RequestHandler {
  return async (req: Request, _res: Response, next: NextFunction) => {
    await Promise.all(validations.map((v) => v.run(req)));
    const errors = validationResult(req);
    if (errors.isEmpty()) return next();
    const extracted = errors.array().map((e) => ({ field: e.type === "field" ? e.path : e.type, message: e.msg }));
    next(ApiError.badRequest("Validation failed", "VALIDATION_ERROR").message);
    // Actually we need to throw properly; Express error handler will catch
    // But since this is middleware, we call next with error:
    next(new ApiError("Validation failed", 400, true, "VALIDATION_ERROR"));
  };
}

/**
 * Validate request body with a Joi schema.
 */
export function validateBody(schema: Joi.ObjectSchema): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) {
      const details = error.details.map((d) => ({ field: d.path.join("."), message: d.message }));
      return next(new ApiError("Validation failed", 400, true, "VALIDATION_ERROR"));
    }
    req.body = value;
    next();
  };
}

/**
 * Validate request params with a Joi schema.
 */
export function validateParams(schema: Joi.ObjectSchema): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.params, { abortEarly: false });
    if (error) {
      return next(new ApiError("Invalid URL parameters", 400, true, "INVALID_PARAMS"));
    }
    req.params = value;
    next();
  };
}

/**
 * Validate request query with a Joi schema.
 */
export function validateQuery(schema: Joi.ObjectSchema): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.query, { abortEarly: false });
    if (error) {
      return next(new ApiError("Invalid query parameters", 400, true, "INVALID_QUERY"));
    }
    req.query = value;
    next();
  };
}
