// ═══════════════════════════════════════════════
// Import Service — Business logic for bulk imports
// ═══════════════════════════════════════════════

import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/ApiError";
import { logger } from "../../utils/logger";
import { hashPassword } from "../../utils/password";

export interface ParentImportRow {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: string;
  studentEmail: string;
  relation: string;
  occupation?: string;
  emergencyContact?: string;
}

function generateRandomPassword(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%";
  let pwd = "";
  for (let i = 0; i < 12; i++) {
    pwd += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pwd;
}

export async function importParents(
  tenantId: string,
  rows: ParentImportRow[],
  defaultPassword?: string
) {
  const fallbackPassword = defaultPassword || generateRandomPassword();
  const result = {
    success: true,
    totalRows: rows.length,
    imported: 0,
    failed: 0,
    errors: [] as Array<{ row: number; field: string; message: string }>,
    warnings: [] as Array<{ row: number; message: string }>,
  };

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2;

    try {
      if (!row.firstName) result.errors.push({ row: rowNum, field: "firstName", message: "First name is required" });
      if (!row.lastName) result.errors.push({ row: rowNum, field: "lastName", message: "Last name is required" });
      if (!row.email) result.errors.push({ row: rowNum, field: "email", message: "Email is required" });
      if (!row.phone) result.errors.push({ row: rowNum, field: "phone", message: "Phone is required" });
      if (!row.studentEmail) result.errors.push({ row: rowNum, field: "studentEmail", message: "Student email is required" });

      if (result.errors.some((e) => e.row === rowNum)) {
        result.failed++;
        continue;
      }

      // Find student by email
      const studentUser = await prisma.user.findUnique({
        where: { email_tenantId: { email: row.studentEmail, tenantId } },
        include: { student: true },
      });

      if (!studentUser || !studentUser.student) {
        result.errors.push({ row: rowNum, field: "studentEmail", message: `Student with email '${row.studentEmail}' not found` });
        result.failed++;
        continue;
      }

      // Check if parent user exists
      let parentUser = await prisma.user.findUnique({
        where: { email_tenantId: { email: row.email, tenantId } },
      });

      if (!parentUser) {
        const passwordHash = await hashPassword(fallbackPassword);
        const uniqueId = `PRT-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

        parentUser = await prisma.user.create({
          data: {
            uniqueId,
            email: row.email,
            passwordHash,
            role: "PARENT",
            tenantId,
            firstName: row.firstName,
            lastName: row.lastName,
            phone: row.phone,
            gender: row.gender?.toUpperCase() === "MALE" ? "MALE" : row.gender?.toUpperCase() === "FEMALE" ? "FEMALE" : "OTHER",
            isActive: true,
          },
        });

        await prisma.parent.create({
          data: {
            userId: parentUser.id,
            tenantId,
            occupation: row.occupation,
            emergencyContact: row.emergencyContact,
          },
        });
      }

      // Link parent to student
      const existingLink = await prisma.studentParent.findUnique({
        where: { studentId_parentId: { studentId: studentUser.id, parentId: parentUser.id } },
      });

      if (!existingLink) {
        await prisma.studentParent.create({
          data: {
            tenantId,
            studentId: studentUser.id,
            parentId: parentUser.id,
            relation: (row.relation?.toUpperCase() as any) || "OTHER",
            isPrimary: false,
          },
        });
      }

      result.imported++;
      logger.info(`[BulkImport] Imported parent ${row.email} (row ${rowNum})`);
    } catch (err: any) {
      result.errors.push({ row: rowNum, field: "general", message: err.message });
      result.failed++;
      logger.error(`[BulkImport] Failed to import parent row ${rowNum}: ${err.message}`);
    }
  }

  result.success = result.failed === 0;
  return result;
}
