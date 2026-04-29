/**
 * @file src/config/database.ts
 * @description Database connection configuration and Prisma client export.
 * Re-exports the singleton PrismaClient from `src/lib/prisma.ts`.
 */

import { prisma } from "../lib/prisma";

export { prisma };
export default prisma;
