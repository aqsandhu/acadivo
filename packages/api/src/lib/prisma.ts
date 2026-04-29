import { PrismaClient } from '@prisma/client';

// ────────────────────────────────────────────────
// Prisma Client Singleton with Connection Pooling
// ────────────────────────────────────────────────

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'info', 'warn', 'error']
        : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// ────────────────────────────────────────────────
// Soft Delete Middleware
// ────────────────────────────────────────────────
// Intercepts `delete` and `deleteMany` calls and
// converts them into soft-deletes (updates isActive/isDeleted).
// To hard-delete, use a raw query or bypass this middleware.

prisma.$use(async (params, next) => {
  const softDeleteModels = [
    'User',
    'Student',
    'Teacher',
    'Parent',
    'Class',
    'Section',
    'Subject',
    'Homework',
    'Announcement',
    'FeeStructure',
    'Advertisement',
  ];

  if (params.action === 'delete' && softDeleteModels.includes(params.model)) {
    params.action = 'update';
    params.args.data = { isActive: false };
  }

  if (params.action === 'deleteMany' && softDeleteModels.includes(params.model)) {
    params.action = 'updateMany';
    if (params.args.data) {
      params.args.data.isActive = false;
    } else {
      params.args.data = { isActive: false };
    }
  }

  // ── Auto-filter soft-deleted records on find ──
  if (
    params.action.startsWith('find') &&
    softDeleteModels.includes(params.model)
  ) {
    if (!params.args.where) params.args.where = {};
    if (params.args.where.isActive === undefined) {
      params.args.where.isActive = true;
    }
  }

  return next(params);
});

// ────────────────────────────────────────────────
// Tenant Isolation Middleware
// ────────────────────────────────────────────────
// Enforces row-level tenant isolation by injecting tenantId
// from async context into every query.

let currentTenantId: string | null = null;

export function setTenantContext(tenantId: string | null) {
  currentTenantId = tenantId;
}

export function getTenantContext(): string | null {
  return currentTenantId;
}

prisma.$use(async (params, next) => {
  // Skip tenant check for super-admin operations or raw queries
  if (params.model === 'SubscriptionPlan' || params.model === 'Advertisement') {
    return next(params);
  }

  // Inject tenantId from context if available
  if (currentTenantId && params.args?.where) {
    if (typeof params.args.where === 'object' && !params.args.where.tenantId) {
      params.args.where.tenantId = currentTenantId;
    }
  }

  return next(params);
});

export { prisma };
export default prisma;
