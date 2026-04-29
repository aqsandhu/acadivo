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
  ANNUAL = "ANNUAL",
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
  status: PaymentStatus;
  method?: PaymentMethod;
  transactionId?: string;
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum PaymentStatus {
  PAID = "PAID",
  PENDING = "PENDING",
  PARTIAL = "PARTIAL",
  OVERDUE = "OVERDUE",
  WAIVED = "WAIVED",
}

export enum PaymentMethod {
  CASH = "CASH",
  BANK_TRANSFER = "BANK_TRANSFER",
  CHEQUE = "CHEQUE",
  CARD = "CARD",
  ONLINE = "ONLINE",
}
