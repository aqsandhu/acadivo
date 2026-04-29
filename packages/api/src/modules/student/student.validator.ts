// ─────────────────────────────────────────────
// Student Validator — Express-Validator rules
// ─────────────────────────────────────────────

import { body, param, query } from "express-validator";

export const updateProfileValidator = [
  body("avatar").optional().trim(),
  body("address").optional().trim(),
  body("phone").optional().trim().isMobilePhone("any"),
];

export const submitHomeworkValidator = [
  body("submissionText").optional().trim(),
  body("attachments").optional().isArray(),
];

export const askQuestionValidator = [
  body("teacherId").notEmpty(),
  body("subjectId").notEmpty(),
  body("question").notEmpty().trim().isLength({ min: 5 }),
];

export const sendMessageValidator = [
  body("receiverId").notEmpty(),
  body("content").notEmpty().trim(),
  body("attachments").optional().isArray(),
];
