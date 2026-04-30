// ─────────────────────────────────────────────
// Parent Middleware — Ownership validation helpers
// ─────────────────────────────────────────────

import { Response, NextFunction } from "express";
import { AuthRequest } from "../../middleware/auth";
import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/ApiError";

// Extend AuthRequest with childLink for downstream use
declare module "../../middleware/auth" {
  interface AuthRequest {
    childLink?: Awaited<ReturnType<typeof prisma.studentParent.findFirst>>;
  }
}

/**
 * Middleware that verifies the :studentId param belongs to the authenticated parent.
 * Use on any route where parents access child-specific data.
 */
export async function validateChildOwnership(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  const parentId = req.user!.id;
  const studentId = req.params.studentId;

  if (!studentId) {
    return next(ApiError.badRequest("Student ID is required", "MISSING_STUDENT_ID"));
  }

  const link = await prisma.studentParent.findFirst({
    where: { parentId, studentId },
  });

  if (!link) {
    return next(ApiError.forbidden("You can only access your own children", "NOT_YOUR_CHILD"));
  }

  // Attach the validated link to the request for downstream use
  req.childLink = link;
  next();
}
