import { body, param } from "express-validator";

export const createReportRequest = [
  body("studentId").notEmpty().isUUID().withMessage("Valid studentId is required"),
  body("teacherId").notEmpty().isUUID().withMessage("Valid teacherId is required"),
  body("reportType").notEmpty().isIn(["PROGRESS", "ATTENDANCE", "BEHAVIOR", "COMPREHENSIVE"]),
];

export const generateReport = [
  body("teacherRemarks").optional().trim(),
  body("principalRemarks").optional().trim(),
];

export const createReportTemplate = [
  body("name").notEmpty().trim().isLength({ min: 2, max: 100 }),
  body("description").optional().trim(),
  body("type").notEmpty().isIn(["PROGRESS", "ATTENDANCE", "BEHAVIOR", "COMPREHENSIVE"]),
  body("sections").isArray({ min: 1 }).withMessage("At least one section is required"),
  body("sections.*").isString().notEmpty(),
];
