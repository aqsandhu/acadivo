import { Router } from "express";
import { authenticate, authorize } from "../../middleware/auth";
import { validateBody, validateQuery } from "../../middleware/validateRequest";
import * as controller from "./report.controller";
import * as validator from "./report.validator";

const router = Router();

router.use(authenticate);

router.get("/requests", validateQuery(validator.listRequestsValidator), controller.listRequests);
router.post("/requests", validateBody(validator.createRequestValidator), controller.createRequest);
router.get("/requests/:id", controller.getRequest);
router.put("/requests/:id/status", authorize(["TEACHER", "PRINCIPAL", "ADMIN"]), validateBody(validator.updateStatusValidator), controller.updateRequestStatus);

export default router;
