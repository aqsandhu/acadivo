import { body, param } from "express-validator";

export const createFeeStructure = [
  body("feeType").notEmpty().isIn([
    "TUITION", "ADMISSION", "EXAM", "LAB", "SPORTS", "LIBRARY", "TRANSPORT", "MISC"
  ]),
  body("amount").notEmpty().isDecimal().withMessage("Valid amount is required"),
  body("frequency").notEmpty().isIn(["MONTHLY", "QUARTERLY", "YEARLY", "ONE_TIME"]),
  body("academicYear").notEmpty().isString(),
  body("classId").optional().isUUID(),
  body("dueDay").optional().isInt({ min: 1, max: 31 }),
  body("lateFeePerDay").optional().isDecimal(),
];

export const updateFeeStructure = [
  body("feeType").optional().isIn([
    "TUITION", "ADMISSION", "EXAM", "LAB", "SPORTS", "LIBRARY", "TRANSPORT", "MISC"
  ]),
  body("amount").optional().isDecimal(),
  body("frequency").optional().isIn(["MONTHLY", "QUARTERLY", "YEARLY", "ONE_TIME"]),
  body("academicYear").optional().isString(),
  body("classId").optional().isUUID(),
  body("dueDay").optional().isInt({ min: 1, max: 31 }),
  body("lateFeePerDay").optional().isDecimal(),
  body("isActive").optional().isBoolean(),
];

export const createFeeRecord = [
  body("studentId").notEmpty().isUUID(),
  body("feeStructureId").notEmpty().isUUID(),
  body("amount").notEmpty().isDecimal(),
  body("discountAmount").optional().isDecimal(),
  body("discountReason").optional().trim(),
  body("dueDate").notEmpty().isISO8601(),
  body("remarks").optional().trim(),
];

export const updateFeeRecord = [
  body("amount").optional().isDecimal(),
  body("discountAmount").optional().isDecimal(),
  body("discountReason").optional().trim(),
  body("dueDate").optional().isISO8601(),
  body("status").optional().isIn(["PAID", "UNPAID", "PARTIAL", "WAIVED"]),
  body("remarks").optional().trim(),
];

export const recordPayment = [
  body("amount").notEmpty().isDecimal().withMessage("Payment amount is required"),
  body("method").notEmpty().isIn(["CASH", "BANK_TRANSFER", "EASYPAYSA", "JAZZCASH", "CHEQUE", "CARD", "ONLINE"]),
  body("transactionId").optional().trim(),
];

export const createInstallments = [
  body("count").notEmpty().isInt({ min: 2, max: 12 }).withMessage("Installment count must be between 2 and 12"),
  body("startDate").notEmpty().isISO8601(),
  body("intervalDays").notEmpty().isInt({ min: 1 }).withMessage("Interval days must be at least 1"),
];

export const createInstallmentPlan = [
  body("feeRecordId").notEmpty().isUUID(),
  body("numberOfInstallments").notEmpty().isInt({ min: 2, max: 12 }),
  body("startDate").notEmpty().isISO8601(),
  body("intervalDays").optional().isInt({ min: 7, max: 90 }),
];

export const payInstallment = [
  body("installmentId").notEmpty().isUUID(),
  body("amount").notEmpty().isDecimal(),
  body("method").notEmpty().isIn(["CASH", "BANK_TRANSFER", "EASYPAYSA", "JAZZCASH", "CHEQUE", "CARD", "ONLINE"]),
  body("transactionId").optional().trim(),
  body("remarks").optional().trim(),
];
