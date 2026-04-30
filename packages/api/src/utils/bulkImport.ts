// ═══════════════════════════════════════════════
// Bulk Import Service — CSV/Excel parser for bulk data import
// ═══════════════════════════════════════════════

import { prisma } from "../lib/prisma";
import { ApiError } from "./ApiError";
import { logger } from "./logger";

// ── Types ──

export interface ImportResult {
  success: boolean;
  totalRows: number;
  imported: number;
  failed: number;
  errors: Array<{ row: number; field: string; message: string }>;
  warnings: Array<{ row: number; message: string }>;
}

export interface StudentImportRow {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: string;
  dateOfBirth?: string;
  address?: string;
  city?: string;
  rollNumber: string;
  className: string;
  sectionName: string;
  guardianName: string;
  guardianPhone: string;
  guardianRelation: string;
  guardianCNIC?: string;
  bloodGroup?: string;
  medicalNotes?: string;
}

export interface TeacherImportRow {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: string;
  dateOfBirth?: string;
  address?: string;
  city?: string;
  qualifications?: string;
  specialization?: string;
  experience?: string;
  joiningDate?: string;
  bio?: string;
  cnic?: string;
}

// ── CSV Parser ──

export function parseCSV(csvText: string): Record<string, string>[] {
  const lines = csvText.trim().split("\n").filter((l) => l.trim());
  if (lines.length < 2) throw ApiError.badRequest("CSV must have a header row and at least one data row");

  const headers = parseCSVLine(lines[0]);
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h.trim().toLowerCase().replace(/\s+/g, "_")] = values[idx]?.trim() || "";
    });
    rows.push(row);
  }

  return rows;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

// ── Validation Helpers ──

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone: string): boolean {
  return phone.length >= 10 && /^[\d+\-()\s]+$/.test(phone);
}

function isValidDate(dateStr: string): boolean {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  return !isNaN(d.getTime());
}

// ── Bulk Student Import ──

export async function importStudents(
  tenantId: string,
  rows: StudentImportRow[],
  defaultPassword: string = "Acadivo@123"
): Promise<ImportResult> {
  const result: ImportResult = {
    success: true,
    totalRows: rows.length,
    imported: 0,
    failed: 0,
    errors: [],
    warnings: [],
  };

  // Get existing classes and sections for the tenant
  const classes = await prisma.class.findMany({ where: { tenantId, isActive: true } });
  const sections = await prisma.section.findMany({ where: { tenantId, isActive: true } });

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2; // +2 because row 1 is header

    try {
      // Validate required fields
      if (!row.firstName) result.errors.push({ row: rowNum, field: "firstName", message: "First name is required" });
      if (!row.lastName) result.errors.push({ row: rowNum, field: "lastName", message: "Last name is required" });
      if (!row.email) result.errors.push({ row: rowNum, field: "email", message: "Email is required" });
      else if (!isValidEmail(row.email)) result.errors.push({ row: rowNum, field: "email", message: "Invalid email format" });
      if (!row.phone) result.errors.push({ row: rowNum, field: "phone", message: "Phone is required" });
      else if (!isValidPhone(row.phone)) result.errors.push({ row: rowNum, field: "phone", message: "Invalid phone format" });
      if (!row.rollNumber) result.errors.push({ row: rowNum, field: "rollNumber", message: "Roll number is required" });
      if (!row.className) result.errors.push({ row: rowNum, field: "className", message: "Class name is required" });
      if (!row.sectionName) result.errors.push({ row: rowNum, field: "sectionName", message: "Section name is required" });
      if (!row.guardianName) result.errors.push({ row: rowNum, field: "guardianName", message: "Guardian name is required" });
      if (!row.guardianPhone) result.errors.push({ row: rowNum, field: "guardianPhone", message: "Guardian phone is required" });

      if (result.errors.some((e) => e.row === rowNum)) {
        result.failed++;
        continue;
      }

      // Find class and section
      const classRow = classes.find((c) => c.name.toLowerCase() === row.className.toLowerCase());
      if (!classRow) {
        result.errors.push({ row: rowNum, field: "className", message: `Class '${row.className}' not found` });
        result.failed++;
        continue;
      }

      const sectionRow = sections.find(
        (s) => s.name.toLowerCase() === row.sectionName.toLowerCase() && s.classId === classRow.id
      );
      if (!sectionRow) {
        result.errors.push({ row: rowNum, field: "sectionName", message: `Section '${row.sectionName}' not found in class '${row.className}'` });
        result.failed++;
        continue;
      }

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email_tenantId: { email: row.email, tenantId } },
      });
      if (existingUser) {
        result.errors.push({ row: rowNum, field: "email", message: `Email '${row.email}' already exists` });
        result.failed++;
        continue;
      }

      // Check roll number uniqueness
      const existingRoll = await prisma.student.findFirst({
        where: { rollNumber: row.rollNumber, tenantId },
      });
      if (existingRoll) {
        result.errors.push({ row: rowNum, field: "rollNumber", message: `Roll number '${row.rollNumber}' already exists` });
        result.failed++;
        continue;
      }

      // Create user
      const { hashPassword } = await import("./password");
      const passwordHash = await hashPassword(defaultPassword);
      const uniqueId = `STD-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

      const user = await prisma.user.create({
        data: {
          uniqueId,
          email: row.email,
          passwordHash,
          role: "STUDENT",
          tenantId,
          firstName: row.firstName,
          lastName: row.lastName,
          phone: row.phone,
          gender: row.gender?.toUpperCase() === "MALE" ? "MALE" : row.gender?.toUpperCase() === "FEMALE" ? "FEMALE" : "OTHER",
          dateOfBirth: row.dateOfBirth ? new Date(row.dateOfBirth) : undefined,
          address: row.address,
          city: row.city,
          isActive: true,
        },
      });

      // Create student profile
      await prisma.student.create({
        data: {
          userId: user.id,
          tenantId,
          rollNumber: row.rollNumber,
          classId: classRow.id,
          sectionId: sectionRow.id,
          guardianName: row.guardianName,
          guardianPhone: row.guardianPhone,
          guardianRelation: row.guardianRelation || "Guardian",
          guardianCNIC: row.guardianCNIC,
          bloodGroup: row.bloodGroup,
          medicalNotes: row.medicalNotes,
        },
      });

      result.imported++;
      logger.info(`[BulkImport] Imported student ${row.email} (row ${rowNum})`);
    } catch (err: any) {
      result.errors.push({ row: rowNum, field: "general", message: err.message });
      result.failed++;
      logger.error(`[BulkImport] Failed to import student row ${rowNum}: ${err.message}`);
    }
  }

  result.success = result.failed === 0;
  return result;
}

// ── Bulk Teacher Import ──

export async function importTeachers(
  tenantId: string,
  rows: TeacherImportRow[],
  defaultPassword: string = "Acadivo@123"
): Promise<ImportResult> {
  const result: ImportResult = {
    success: true,
    totalRows: rows.length,
    imported: 0,
    failed: 0,
    errors: [],
    warnings: [],
  };

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2;

    try {
      // Validate required fields
      if (!row.firstName) result.errors.push({ row: rowNum, field: "firstName", message: "First name is required" });
      if (!row.lastName) result.errors.push({ row: rowNum, field: "lastName", message: "Last name is required" });
      if (!row.email) result.errors.push({ row: rowNum, field: "email", message: "Email is required" });
      else if (!isValidEmail(row.email)) result.errors.push({ row: rowNum, field: "email", message: "Invalid email format" });
      if (!row.phone) result.errors.push({ row: rowNum, field: "phone", message: "Phone is required" });
      else if (!isValidPhone(row.phone)) result.errors.push({ row: rowNum, field: "phone", message: "Invalid phone format" });

      if (result.errors.some((e) => e.row === rowNum)) {
        result.failed++;
        continue;
      }

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email_tenantId: { email: row.email, tenantId } },
      });
      if (existingUser) {
        result.errors.push({ row: rowNum, field: "email", message: `Email '${row.email}' already exists` });
        result.failed++;
        continue;
      }

      // Create user
      const { hashPassword } = await import("./password");
      const passwordHash = await hashPassword(defaultPassword);
      const uniqueId = `TCH-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

      const user = await prisma.user.create({
        data: {
          uniqueId,
          email: row.email,
          passwordHash,
          role: "TEACHER",
          tenantId,
          firstName: row.firstName,
          lastName: row.lastName,
          phone: row.phone,
          cnic: row.cnic,
          gender: row.gender?.toUpperCase() === "MALE" ? "MALE" : row.gender?.toUpperCase() === "FEMALE" ? "FEMALE" : "OTHER",
          dateOfBirth: row.dateOfBirth && isValidDate(row.dateOfBirth) ? new Date(row.dateOfBirth) : undefined,
          address: row.address,
          city: row.city,
          isActive: true,
        },
      });

      // Create teacher profile
      await prisma.teacher.create({
        data: {
          userId: user.id,
          tenantId,
          qualifications: row.qualifications,
          specialization: row.specialization,
          experience: row.experience ? parseInt(row.experience) || undefined : undefined,
          joiningDate: row.joiningDate && isValidDate(row.joiningDate) ? new Date(row.joiningDate) : undefined,
          bio: row.bio,
        },
      });

      result.imported++;
      logger.info(`[BulkImport] Imported teacher ${row.email} (row ${rowNum})`);
    } catch (err: any) {
      result.errors.push({ row: rowNum, field: "general", message: err.message });
      result.failed++;
      logger.error(`[BulkImport] Failed to import teacher row ${rowNum}: ${err.message}`);
    }
  }

  result.success = result.failed === 0;
  return result;
}

// ── Parent Import Row Type ──

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

// ── Bulk Parent Import ──

export async function importParents(
  tenantId: string,
  rows: ParentImportRow[],
  defaultPassword: string = "Acadivo@123"
): Promise<ImportResult> {
  const result: ImportResult = {
    success: true,
    totalRows: rows.length,
    imported: 0,
    failed: 0,
    errors: [],
    warnings: [],
  };

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2;

    try {
      if (!row.firstName) result.errors.push({ row: rowNum, field: "firstName", message: "First name is required" });
      if (!row.lastName) result.errors.push({ row: rowNum, field: "lastName", message: "Last name is required" });
      if (!row.email) result.errors.push({ row: rowNum, field: "email", message: "Email is required" });
      else if (!isValidEmail(row.email)) result.errors.push({ row: rowNum, field: "email", message: "Invalid email format" });
      if (!row.phone) result.errors.push({ row: rowNum, field: "phone", message: "Phone is required" });
      else if (!isValidPhone(row.phone)) result.errors.push({ row: rowNum, field: "phone", message: "Invalid phone format" });
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
        const passwordHash = await hashPassword(defaultPassword);
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

// ── Generate Error Report ──

export function generateErrorReport(result: ImportResult): string {
  let report = `Bulk Import Report\n`;
  report += `==================\n\n`;
  report += `Total Rows: ${result.totalRows}\n`;
  report += `Successfully Imported: ${result.imported}\n`;
  report += `Failed: ${result.failed}\n\n`;

  if (result.errors.length > 0) {
    report += `Errors:\n`;
    report += `-------\n`;
    for (const err of result.errors) {
      report += `Row ${err.row} [${err.field}]: ${err.message}\n`;
    }
  }

  if (result.warnings.length > 0) {
    report += `\nWarnings:\n`;
    report += `---------\n`;
    for (const warn of result.warnings) {
      report += `Row ${warn.row}: ${warn.message}\n`;
    }
  }

  return report;
}
