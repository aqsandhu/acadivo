// ─────────────────────────────────────────────
// Teacher Validator — Express-Validator rules
// ─────────────────────────────────────────────

import { body, param, query } from "express-validator";

export const attendanceMarkValidator = [
  body("classId").notEmpty().withMessage("classId is required"),
  body("sectionId").notEmpty().withMessage("sectionId is required"),
  body("records").isArray({ min: 1 }).withMessage("records array required"),
  body("records.*.studentId").notEmpty(),
  body("records.*.status").isIn(["PRESENT", "ABSENT", "LATE", "LEAVE", "HALF_DAY"]),
];

export const attendanceUpdateValidator = [
  body("status").isIn(["PRESENT", "ABSENT", "LATE", "LEAVE", "HALF_DAY"]),
];

export const homeworkCreateValidator = [
  body("title").notEmpty().trim().isLength({ min: 2, max: 200 }),
  body("description").notEmpty().trim(),
  body("subjectId").notEmpty(),
  body("classId").notEmpty(),
  body("sectionId").notEmpty(),
  body("dueDate").isISO8601().toDate(),
  body("maxMarks").optional().isInt({ min: 1 }),
];

export const homeworkUpdateValidator = [
  body("title").optional().trim().isLength({ min: 2, max: 200 }),
  body("description").optional().trim(),
  body("dueDate").optional().isISO8601().toDate(),
  body("maxMarks").optional().isInt({ min: 1 }),
  body("isActive").optional().isBoolean(),
];

export const gradeSubmissionValidator = [
  body("submissionId").notEmpty(),
  body("marks").isInt({ min: 0 }),
  body("feedback").optional().trim(),
];

export const marksCreateValidator = [
  body("studentId").notEmpty(),
  body("subjectId").notEmpty(),
  body("classId").notEmpty(),
  body("sectionId").notEmpty(),
  body("examType").isIn(["QUIZ", "MIDTERM", "FINAL", "ASSIGNMENT", "PROJECT"]),
  body("totalMarks").isInt({ min: 1 }),
  body("obtainedMarks").isInt({ min: 0 }),
  body("remarks").optional().trim(),
  body("academicYear").optional().trim(),
];

export const marksUpdateValidator = [
  body("totalMarks").optional().isInt({ min: 1 }),
  body("obtainedMarks").optional().isInt({ min: 0 }),
  body("remarks").optional().trim(),
];

export const answerQuestionValidator = [
  body("answer").notEmpty().trim(),
  body("isPublic").isBoolean(),
  body("classId").optional(),
  body("sectionId").optional(),
];

export const generateReportValidator = [
  body("attendancePercentage").isFloat({ min: 0, max: 100 }),
  body("behaviorAssessment").notEmpty().trim(),
  body("teacherComments").notEmpty().trim(),
  body("pdfUrl").optional().trim(),
];

export const sendMessageValidator = [
  body("receiverId").notEmpty(),
  body("content").notEmpty().trim(),
  body("attachments").optional().isArray(),
];

export const notifyClassValidator = [
  body("classId").notEmpty(),
  body("sectionId").notEmpty(),
  body("title").notEmpty().trim(),
  body("body").notEmpty().trim(),
];

export const notifyStudentValidator = [
  body("studentId").notEmpty(),
  body("title").notEmpty().trim(),
  body("body").notEmpty().trim(),
];

export const attendanceReportQueryValidator = [
  query("classId").optional(),
  query("sectionId").optional(),
  query("month").optional().matches(/^\d{4}-\d{2}$/),
];
