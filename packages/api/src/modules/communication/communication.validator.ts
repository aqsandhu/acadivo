import { body } from "express-validator";

export const createAnnouncement = [
  body("title").trim().notEmpty().withMessage("Title is required").isLength({ max: 200 }),
  body("content").trim().notEmpty().withMessage("Content is required"),
  body("priority").optional().isIn(["LOW", "NORMAL", "HIGH", "URGENT"]),
  body("targetAudience")
    .optional()
    .isIn(["ALL", "TEACHERS", "STUDENTS", "PARENTS", "ADMIN", "CLASS"]),
  body("targetClassId").optional().isUUID(),
  body("targetSectionId").optional().isUUID(),
  body("expiresAt").optional().isISO8601(),
];

export const updateAnnouncement = [
  body("title").optional().trim().isLength({ max: 200 }),
  body("content").optional().trim(),
  body("priority").optional().isIn(["LOW", "NORMAL", "HIGH", "URGENT"]),
  body("targetAudience")
    .optional()
    .isIn(["ALL", "TEACHERS", "STUDENTS", "PARENTS", "ADMIN", "CLASS"]),
  body("targetClassId").optional().isUUID(),
  body("targetSectionId").optional().isUUID(),
  body("expiresAt").optional().isISO8601(),
];

export const sendMessage = [
  body("receiverId").notEmpty().isUUID().withMessage("Valid receiverId is required"),
  body("content").trim().notEmpty().withMessage("Message content is required"),
  body("messageType").optional().isIn(["TEXT", "IMAGE", "FILE", "VOICE"]),
  body("replyToId").optional().isUUID(),
];

export const sendGroupMessage = [
  body("receiverIds").isArray({ min: 1 }).withMessage("At least one receiver is required"),
  body("receiverIds.*").isUUID(),
  body("content").trim().notEmpty().withMessage("Message content is required"),
  body("messageType").optional().isIn(["TEXT", "IMAGE", "FILE", "VOICE"]),
];
