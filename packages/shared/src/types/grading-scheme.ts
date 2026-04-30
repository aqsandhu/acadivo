/**
 * Grading Scheme domain types
 */

import type { GradeScale } from "./result";
export { GradeScale } from "./result";

export interface GradingScheme {
  id: string;
  tenantId: string;
  name: string;
  isDefault: boolean;
  scales: GradeScale[];
  academicYear: string;
  createdAt: Date;
  updatedAt: Date;
}
