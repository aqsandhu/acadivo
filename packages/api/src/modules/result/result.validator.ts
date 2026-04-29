import { body, param } from "express-validator";

export const compileResult = [
  body("studentId").notEmpty().isUUID(),
  body("classId").notEmpty().isUUID(),
  body("sectionId").notEmpty().isUUID(),
  body("academicYear").notEmpty().isString(),
  body("term").notEmpty().isIn(["FIRST", "SECOND", "THIRD", "FINAL"]),
  body("teacherRemarks").optional().trim(),
  body("principalRemarks").optional().trim(),
];

export const updateResult = [
  body("teacherRemarks").optional().trim(),
  body("principalRemarks").optional().trim(),
  body("status").optional().isIn(["PASS", "FAIL", "PROMOTED"]),
];

export const createGradingScheme = [
  body("name").notEmpty().trim().isLength({ max: 100 }),
  body("grades").isArray({ min: 1 }).withMessage("At least one grade range is required"),
  body("grades.*.grade").notEmpty().isString(),
  body("grades.*.minPercentage").isFloat({ min: 0, max: 100 }),
  body("grades.*.maxPercentage").isFloat({ min: 0, max: 100 }),
  body("grades.*.gpa").optional().isFloat(),
  body("academicYear").notEmpty().isString(),
  body("isDefault").optional().isBoolean(),
];
