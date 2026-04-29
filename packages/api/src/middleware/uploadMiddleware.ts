/**
 * @file src/middleware/uploadMiddleware.ts
 * @description Multer upload middleware factory for images and documents.
 */

import { Request, Response, NextFunction } from "express";
import multer from "multer";
import { upload, UploadFile } from "../utils/upload";
import { ApiError } from "../utils/ApiError";

/**
 * Middleware factory for single file upload.
 * @param fieldName - Form field name for the file
 */
export function uploadSingle(fieldName: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const middleware = upload.single(fieldName);
    middleware(req, res, (err: any) => {
      if (err instanceof multer.MulterError) {
        return next(ApiError.badRequest(`Upload error: ${err.message}`, "UPLOAD_ERROR"));
      } else if (err) {
        return next(err);
      }
      next();
    });
  };
}

/**
 * Middleware factory for multiple file uploads.
 * @param fieldName - Form field name
 * @param maxCount - Maximum number of files
 */
export function uploadArray(fieldName: string, maxCount = 5) {
  return (req: Request, res: Response, next: NextFunction) => {
    const middleware = upload.array(fieldName, maxCount);
    middleware(req, res, (err: any) => {
      if (err instanceof multer.MulterError) {
        return next(ApiError.badRequest(`Upload error: ${err.message}`, "UPLOAD_ERROR"));
      } else if (err) {
        return next(err);
      }
      next();
    });
  };
}

export { UploadFile };
