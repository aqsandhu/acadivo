import { Router } from "express";
import { authenticate, authorize } from "../../middleware/auth";
import { validateRequest } from "../../middleware/validateRequest";
import * as controller from "./result.controller";
import * as validator from "./result.validator";

const router = Router();

router.use(authenticate);

// ── Results ───────────────────────────────────
router.get("/student/:studentId", controller.getStudentResults);
router.get("/class/:classId", controller.getClassResults);
router.get("/class/:classId/rankings", controller.getClassRankings);
router.get("/:id", controller.getResultById);
router.post("/", authorize("PRINCIPAL", "ADMIN", "TEACHER"), validator.compileResult, validateRequest, controller.compileResult);
router.put("/:id", authorize("PRINCIPAL", "ADMIN"), validator.updateResult, validateRequest, controller.updateResult);
router.delete("/:id", authorize("PRINCIPAL", "ADMIN"), controller.deleteResult);

// ── Grading Schemes ───────────────────────────
router.get("/grading-schemes", controller.getGradingSchemes);
router.post("/grading-schemes", authorize("PRINCIPAL", "ADMIN"), validator.createGradingScheme, validateRequest, controller.createGradingScheme);
router.put("/grading-schemes/:id/default", authorize("PRINCIPAL", "ADMIN"), controller.setDefaultGradingScheme);

// ── Marks ─────────────────────────────────────
router.get("/marks/student/:studentId", authorize("PRINCIPAL", "ADMIN", "TEACHER"), controller.getStudentMarks);
router.get("/marks/class/:classId", authorize("PRINCIPAL", "ADMIN", "TEACHER"), controller.getClassMarks);
router.get("/marks/analysis", authorize("PRINCIPAL", "ADMIN"), controller.getMarksAnalysis);

export default router;
