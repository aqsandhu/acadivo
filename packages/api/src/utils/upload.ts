/**
 * @file src/utils/upload.ts
 * @description Multer configuration and Cloudinary upload helper.
 */

import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { env } from "../config/env";
import { ApiError } from "./ApiError";

// ── Cloudinary Config ──
if (env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
  });
}

// ── Multer Memory Storage ──
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
    files: 5,
  },
  fileFilter: (_req, file, cb) => {
    const allowedImageMimes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    const allowedDocMimes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    const allowed = [...allowedImageMimes, ...allowedDocMimes];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new ApiError("Only images (jpeg, png, webp, gif) and PDF/DOC files are allowed", 400));
    }
  },
});

export type UploadFile = Express.Multer.File;

/**
 * Upload a single file buffer to Cloudinary.
 * @param file - Multer file object
 * @param folder - Cloudinary folder path
 * @returns Secure URL of uploaded asset
 */
export async function uploadToCloudinary(
  file: UploadFile,
  folder = "acadivo/general"
): Promise<string> {
  if (!env.CLOUDINARY_CLOUD_NAME) {
    throw ApiError.internal("Cloudinary is not configured");
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: file.mimetype.startsWith("image/") ? "image" : "raw",
        public_id: `${Date.now()}_${file.originalname.split(".")[0]}`,
      },
      (error, result) => {
        if (error || !result) {
          reject(ApiError.internal(`Cloudinary upload failed: ${error?.message || "Unknown error"}`));
        } else {
          resolve(result.secure_url);
        }
      }
    );
    stream.end(file.buffer);
  });
}

/**
 * Upload multiple files to Cloudinary.
 */
export async function uploadMultipleToCloudinary(
  files: UploadFile[],
  folder = "acadivo/general"
): Promise<string[]> {
  return Promise.all(files.map((f) => uploadToCloudinary(f, folder)));
}
