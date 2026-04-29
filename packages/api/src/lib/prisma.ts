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
    // Connection pooling is handled by PostgreSQL driver natively,
    // but we can tune Prisma's connection limit here.
    // In production, use DATABASE_URL with `?connection_limit=20` etc.
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
  // Uncomment to automatically hide inactive records:
  //
  // if (
  //   params.action.startsWith('find') &&
  //   softDeleteModels.includes(params.model)
  // ) {
  //   if (!params.args.where) params.args.where = {};
  //   if (params.args.where.isActive === undefined) {
  //     params.args.where.isActive = true;
  //   }
  // }

  return next(params);
});

// ────────────────────────────────────────────────
// Tenant Isolation Middleware (Concept)
// ────────────────────────────────────────────────
// Uncomment and adapt to enforce row-level tenant isolation.
// This validates that every query includes the correct tenantId
// based on the authenticated user's tenant context.
/*
prisma.$use(async (params, next) => {
  // Skip tenant check for super-admin operations or raw queries
  if (params.model === 'SubscriptionPlan' || params.model === 'Advertisement') {
    return next(params);
  }

  // Example: inject tenantId from async context (e.g., AsyncLocalStorage)
  // const tenantId = getCurrentTenantId();
  // if (tenantId && params.args.where) {
  //   params.args.where.tenantId = tenantId;
  // }

  // TODO: Implement with your tenant context provider
  // (e.g., ClsService, AsyncLocalStorage, or request-scoped DI)

  return next(params);
});
*/

export { prisma };
export default prisma;
