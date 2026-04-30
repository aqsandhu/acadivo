/**
 * @file src/modules/upload/upload.routes.ts
 * @description Upload endpoints with multer validation.
 */

import { Router } from "express";
import multer from "multer";
import { ApiError } from "../../utils/ApiError";
import { uploadToCloudinary, uploadMultipleToCloudinary } from "../../utils/upload";

const router = Router();

// ── Multer Configuration ──
const storage = multer.memoryStorage();

const fileFilter = (_req: any, file: any, cb: any) => {
  const allowedMimes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/plain",
  ];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(ApiError.badRequest("File type not allowed", "INVALID_FILE_TYPE"), false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
  fileFilter,
});

// ── Upload Single Image ──
router.post("/image", upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) {
      throw ApiError.badRequest("No image file provided", "NO_FILE");
    }
    const url = await uploadToCloudinary(req.file, "acadivo/images");
    res.status(200).json({
      success: true,
      message: "Image uploaded successfully",
      data: {
        url,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ── Upload Single Document ──
router.post("/document", upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) {
      throw ApiError.badRequest("No document file provided", "NO_FILE");
    }
    const url = await uploadToCloudinary(req.file, "acadivo/documents");
    res.status(200).json({
      success: true,
      message: "Document uploaded successfully",
      data: {
        url,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ── Upload Multiple Files ──
router.post("/multiple", upload.array("files", 5), async (req, res, next) => {
  try {
    if (!req.files || (req.files as any[]).length === 0) {
      throw ApiError.badRequest("No files provided", "NO_FILES");
    }
    const files = req.files as Express.Multer.File[];
    const urls = await uploadMultipleToCloudinary(files, "acadivo/general");
    res.status(200).json({
      success: true,
      message: `${files.length} files uploaded successfully`,
      data: files.map((f, i) => ({
        url: urls[i],
        originalName: f.originalname,
        mimetype: f.mimetype,
        size: f.size,
      })),
    });
  } catch (err) {
    next(err);
  }
});

export default router;
