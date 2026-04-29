/**
 * @file src/modules/auth/auth.routes.ts
 * @description Auth route definitions with middleware wiring.
 */

import { Router } from "express";
import * as controller from "./auth.controller";
import * as validator from "./auth.validator";
import { validateBody } from "../../middleware/validateRequest";
import { authMiddleware } from "../../middleware/auth";
import { authLimiter } from "../../middleware/rateLimiter";
import { uploadSingle } from "../../middleware/uploadMiddleware";

const router = Router();

// Public routes
router.post("/register", authLimiter, validateBody(validator.registerValidator), controller.register);
router.post("/login", authLimiter, validateBody(validator.loginValidator), controller.login);
router.post("/refresh", validateBody(validator.refreshValidator), controller.refresh);
router.post("/forgot-password", authLimiter, validateBody(validator.forgotPasswordValidator), controller.forgotPassword);
router.post("/reset-password", validateBody(validator.resetPasswordValidator), controller.resetPassword);
router.post("/verify-otp", validateBody(validator.verifyOTPValidator), controller.verifyOTP);
router.post("/resend-otp", authLimiter, validateBody(validator.resendOTPValidator), controller.resendOTP);
router.post("/verify-2fa", validateBody(validator.verify2FAValidator), controller.verify2FA);
router.post("/2fa/login", validateBody(validator.verify2FAValidator), controller.verify2FALogin);
router.post("/setup-parent-password", validateBody(validator.setupParentPasswordValidator), controller.setupParentPassword);

// Authenticated routes
router.post("/logout", authMiddleware, validateBody(validator.logoutValidator), controller.logout);
router.post("/change-password", authMiddleware, validateBody(validator.changePasswordValidator), controller.changePassword);
router.post("/setup-2fa", authMiddleware, validateBody(validator.setup2FAValidator), controller.setup2FA);
router.post("/2fa/setup", authMiddleware, validateBody(validator.setup2FAValidator), controller.setup2FA);
router.post("/2fa/verify", authMiddleware, validateBody(validator.verify2FAValidator), controller.verify2FA);
router.post("/2fa/disable", authMiddleware, validateBody(validator.disable2FAValidator), controller.disable2FA);
router.get("/me", authMiddleware, controller.getMe);
router.put("/me", authMiddleware, uploadSingle("avatar"), validateBody(validator.updateProfileValidator), controller.updateMe);

export default router;
