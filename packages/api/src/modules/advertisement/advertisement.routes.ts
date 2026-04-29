import { Router } from "express";
import { authenticate, authorize } from "../../middleware/auth";
import { validateRequest } from "../../middleware/validation";
import * as controller from "./advertisement.controller";
import * as validator from "./advertisement.validator";

const router = Router();

// ── Public Ad Routes (authenticated) ────────────
router.use(authenticate);

router.get("/", controller.getActiveAds);
router.get("/:id", controller.getAdById);
router.post("/:id/view", validator.trackInteraction, validateRequest, controller.trackImpression);
router.post("/:id/click", validator.trackInteraction, validateRequest, controller.trackClick);

// ── Super Admin Routes ──────────────────────────
router.get("/admin/advertisements", authorize("SUPER_ADMIN"), controller.getAllAds);
router.post("/admin/advertisements", authorize("SUPER_ADMIN"), validator.createAd, validateRequest, controller.createAd);
router.put("/admin/advertisements/:id", authorize("SUPER_ADMIN"), validator.updateAd, validateRequest, controller.updateAd);
router.delete("/admin/advertisements/:id", authorize("SUPER_ADMIN"), controller.deleteAd);
router.put("/admin/advertisements/:id/status", authorize("SUPER_ADMIN"), validator.updateStatus, validateRequest, controller.updateAdStatus);
router.get("/admin/advertisements/:id/stats", authorize("SUPER_ADMIN"), controller.getAdStats);

export default router;
