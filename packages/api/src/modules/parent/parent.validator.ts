// ─────────────────────────────────────────────
// Parent Validator — Express-Validator rules
// ─────────────────────────────────────────────

import { body, param, query } from "express-validator";

export const reportRequestValidator = [
  body("studentId").notEmpty(),
  body("teacherId").notEmpty(),
  body("reportType").isIn(["PROGRESS", "ATTENDANCE", "BEHAVIOR", "COMPREHENSIVE"]),
];

export const askQuestionValidator = [
  body("teacherId").notEmpty(),
  body("question").notEmpty().trim().isLength({ min: 5 }),
];

export const sendMessageValidator = [
  body("receiverId").notEmpty(),
  body("content").notEmpty().trim(),
  body("attachments").optional().isArray(),
];
