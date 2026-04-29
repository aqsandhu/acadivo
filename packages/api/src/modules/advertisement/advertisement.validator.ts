import { body, param } from "express-validator";

export const createAd = [
  body("title").notEmpty().trim().isLength({ min: 2, max: 200 }),
  body("description").notEmpty().trim(),
  body("imageUrl").optional().isURL(),
  body("linkUrl").optional().isURL(),
  body("targetAudience").optional().isIn(["ALL", "STUDENTS", "PARENTS", "TEACHERS", "PRINCIPALS", "ADMIN"]),
  body("targetCities").optional().isArray(),
  body("targetCities.*").optional().isString(),
  body("targetSchoolTypes").optional().isArray(),
  body("targetSchoolTypes.*").optional().isString(),
  body("startDate").notEmpty().isISO8601(),
  body("endDate").notEmpty().isISO8601(),
  body("priority").optional().isInt({ min: 0, max: 100 }),
  body("status").optional().isIn(["ACTIVE", "PENDING", "EXPIRED"]),
];

export const updateAd = [
  body("title").optional().trim().isLength({ min: 2, max: 200 }),
  body("description").optional().trim(),
  body("imageUrl").optional().isURL(),
  body("linkUrl").optional().isURL(),
  body("targetAudience").optional().isIn(["ALL", "STUDENTS", "PARENTS", "TEACHERS", "PRINCIPALS", "ADMIN"]),
  body("targetCities").optional().isArray(),
  body("targetSchoolTypes").optional().isArray(),
  body("startDate").optional().isISO8601(),
  body("endDate").optional().isISO8601(),
  body("priority").optional().isInt({ min: 0, max: 100 }),
  body("status").optional().isIn(["ACTIVE", "PENDING", "EXPIRED"]),
];

export const updateStatus = [
  body("status").notEmpty().isIn(["ACTIVE", "PENDING", "EXPIRED"]),
];

export const trackInteraction = [
  body("tenantId").optional().isUUID(),
  body("studentId").optional().isUUID(),
];
