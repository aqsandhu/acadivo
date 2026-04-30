/**
 * Pakistani-specific validation schemas
 */

import { z } from "zod";

// ── CNIC Validation ──
// Pakistani CNIC format: 5 digits - 7 digits - 1 digit
// Example: 35201-1234567-1
export const cnicSchema = z.string().regex(
  /^\d{5}-\d{7}-\d$/,
  "CNIC must be in format #####-#######-#"
);

export const cnicOptionalSchema = z.string().regex(
  /^\d{5}-\d{7}-\d$/,
  "CNIC must be in format #####-#######-#"
).optional().or(z.literal(""));

// ── Pakistani Phone Validation ──
// Format: +92 3XX XXXXXXX or +923XXXXXXXXX
export const pakistaniPhoneSchema = z.string().regex(
  /^\+92\s?3\d{2}\s?\d{7}$/,
  "Phone must be in format +92 3XX XXXXXXX"
);

export const pakistaniPhoneOptionalSchema = z.string().regex(
  /^\+92\s?3\d{2}\s?\d{7}$/,
  "Phone must be in format +92 3XX XXXXXXX"
).optional().or(z.literal(""));

// ── Pakistani Payment Methods ──
export const pakistaniPaymentMethodSchema = z.enum([
  "JAZZCASH",
  "EASYPAYSA",
  "BANK_TRANSFER",
  "CASH",
  "CHEQUE",
  "CARD",
  "ONLINE",
]);

// ── Fee Installment (Qist) Validation ──
export const createInstallmentPlanSchema = z.object({
  feeRecordId: z.string().uuid("Invalid fee record ID"),
  numberOfInstallments: z.number().int().min(2).max(12),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be YYYY-MM-DD"),
  intervalDays: z.number().int().min(7).max(90).default(30),
});

export const payInstallmentSchema = z.object({
  installmentId: z.string().uuid("Invalid installment ID"),
  amount: z.number().positive("Amount must be positive"),
  method: pakistaniPaymentMethodSchema,
  transactionId: z.string().max(200).optional(),
  remarks: z.string().max(1000).optional(),
});

// ── Helper: Format phone to Pakistani standard ──
export function formatPakistaniPhone(phone: string): string {
  const cleaned = phone.replace(/\s/g, "").replace(/^0/, "+92");
  if (cleaned.startsWith("92") && !cleaned.startsWith("+92")) {
    return `+${cleaned}`;
  }
  return cleaned;
}

// ── Helper: Validate and format CNIC ──
export function formatCNIC(cnic: string): string {
  const cleaned = cnic.replace(/\D/g, "");
  if (cleaned.length === 13) {
    return `${cleaned.slice(0, 5)}-${cleaned.slice(5, 12)}-${cleaned.slice(12)}`;
  }
  return cnic;
}

// ── Helper: Check if number is Pakistani ──
export function isPakistaniNumber(phone: string): boolean {
  const normalized = phone.replace(/\s/g, "").replace(/^00/, "+");
  return normalized.startsWith("+92") || normalized.startsWith("0092");
}
