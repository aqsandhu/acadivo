// ─────────────────────────────────────────────
// Validate Middleware — Express-Validator wrapper
// ─────────────────────────────────────────────

import { Request, Response, NextFunction } from "express";
import { validationResult, ValidationChain } from "express-validator";
import { ApiError } from "../lib/ApiError";

export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    await Promise.all(validations.map((v) => v.run(req)));
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }
    const extractedErrors = errors.array().map((err) => ({
      field: err.type === "field" ? err.path : err.type,
      message: err.msg,
    }));
    next(ApiError.badRequest("Validation failed", extractedErrors));
  };
};
