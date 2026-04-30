import { Router } from "express";
import { authenticate, authorize } from "../../middleware/auth";
import { validateRequest } from "../../middleware/validateRequest";
import * as controller from "./fee.controller";
import * as validator from "./fee.validator";

const router = Router();

router.use(authenticate);

// ── Fee Structures ────────────────────────────
router.get("/structures", controller.getFeeStructures);
router.get("/structures/:id", controller.getFeeStructureById);
router.post(
  "/structures",
  authorize("PRINCIPAL", "ADMIN"),
  validator.createFeeStructure,
  validateRequest,
  controller.createFeeStructure
);
router.put(
  "/structures/:id",
  authorize("PRINCIPAL", "ADMIN"),
  validator.updateFeeStructure,
  validateRequest,
  controller.updateFeeStructure
);
router.delete("/structures/:id", authorize("PRINCIPAL", "ADMIN"), controller.deactivateFeeStructure);

// ── Fee Records ───────────────────────────────
router.get("/records", controller.getFeeRecords);
router.get("/records/:id", controller.getFeeRecordById);
router.post(
  "/records",
  authorize("PRINCIPAL", "ADMIN"),
  validator.createFeeRecord,
  validateRequest,
  controller.createFeeRecord
);
router.put(
  "/records/:id",
  authorize("PRINCIPAL", "ADMIN"),
  validator.updateFeeRecord,
  validateRequest,
  controller.updateFeeRecord
);
router.post(
  "/records/:id/pay",
  authorize("PRINCIPAL", "ADMIN"),
  validator.recordPayment,
  validateRequest,
  controller.recordPayment
);

// ── Defaulters & Summary ──────────────────────
router.get("/defaulters", authorize("PRINCIPAL", "ADMIN"), controller.getDefaulters);
router.get("/summary", authorize("PRINCIPAL", "ADMIN"), controller.getFeeSummary);

// ── Installments ──────────────────────────────
router.post(
  "/records/:id/installments",
  authorize("PRINCIPAL", "ADMIN"),
  validator.createInstallments,
  validateRequest,
  controller.createInstallments
);
router.get("/records/:id/installments", controller.getInstallments);

// ── Qist (Installment Plan) ───────────────────
router.post(
  "/installments/plan",
  authorize("PRINCIPAL", "ADMIN"),
  validator.createInstallmentPlan,
  validateRequest,
  controller.createInstallmentPlan
);
router.post(
  "/installments/pay",
  authorize("PRINCIPAL", "ADMIN", "PARENT"),
  validator.payInstallment,
  validateRequest,
  controller.payInstallment
);
router.get("/installments/summary/:studentId", controller.getInstallmentSummary);

export default router;
