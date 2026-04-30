/**
 * Result Detail domain types
 * Individual subject results
 */

export interface ResultDetail {
  id: string;
  tenantId: string;
  resultId: string;
  subjectId: string;
  totalMarks: number;
  obtainedMarks: number;
  grade: string;
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}
