/**
 * Fee/Payment domain types
 */

export interface FeeStructure {
  id: string;
  tenantId: string;
  name: string;
  classId?: string;
  amount: number;
  frequency: FeeFrequency;
  dueDay: number;
  lateFee?: number;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum FeeFrequency {
  MONTHLY = "MONTHLY",
  QUARTERLY = "QUARTERLY",
  SEMESTERLY = "SEMESTERLY",
  YEARLY = "YEARLY",
  ONE_TIME = "ONE_TIME",
}

export interface FeePayment {
  id: string;
  studentId: string;
  feeStructureId: string;
  tenantId: string;
  amount: number;
  paidAmount: number;
  discount?: number;
  fine?: number;
  dueDate: Date;
  paidDate?: Date;
  status: FeeStatus;
  method?: PaymentMethod;
  transactionId?: string;
  receiptNumber?: string;
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum FeeStatus {
  PAID = "PAID",
  UNPAID = "UNPAID",
  PARTIAL = "PARTIAL",
  WAIVED = "WAIVED",
  OVERDUE = "OVERDUE",
}

export enum PaymentMethod {
  CASH = "CASH",
  BANK_TRANSFER = "BANK_TRANSFER",
  EASYPAYSA = "EASYPAYSA",
  JAZZCASH = "JAZZCASH",
  CHEQUE = "CHEQUE",
  CARD = "CARD",
  ONLINE = "ONLINE",
}

export interface Installment {
  id: string;
  tenantId: string;
  feeRecordId: string;
  studentId?: string;
  feeStructureId?: string;
  amount: number;
  paidAmount: number;
  dueDate: Date;
  paidDate?: Date;
  status: FeeStatus;
  paymentMethod?: PaymentMethod;
  transactionId?: string;
  receiptNumber?: string;
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FeeDiscount {
  id: string;
  tenantId: string;
  studentId: string;
  feeStructureId?: string;
  amount: number;
  percentage?: number;
  reason?: string;
  approvedBy?: string;
  effectiveDate: Date;
  expiryDate?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
