// ═══════════════════════════════════════════════════
// Shared User Service — CRUD with Auto ID Generation
// ═══════════════════════════════════════════════════

import { PrismaClient, User, UserRole, Prisma } from '@prisma/client';

export interface CreateUserData {
  email: string;
  passwordHash: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  phone: string;
  tenantId: string;
  uniqueId?: string; // if not provided, auto-generated
  cnic?: string;
  avatar?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  dateOfBirth?: Date;
  address?: string;
  city?: string;
  isActive?: boolean;
  isVerified?: boolean;
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  cnic?: string;
  avatar?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  dateOfBirth?: Date;
  address?: string;
  city?: string;
  isActive?: boolean;
}

// ── Auto ID generation ──

const ROLE_PREFIX: Record<string, string> = {
  PRINCIPAL: 'PRC',
  ADMIN: 'ADM',
  TEACHER: 'TCH',
  STUDENT: 'STD',
  PARENT: 'PAR',
};

export async function generateUniqueId(
  prisma: PrismaClient,
  role: UserRole,
  tenantId: string,
  schoolCode?: string
): Promise<string> {
  const prefix = ROLE_PREFIX[role] || 'USR';
  const code = schoolCode || tenantId.slice(0, 6).toUpperCase();

  let count = 0;
  switch (role) {
    case 'TEACHER':
      count = await prisma.teacher.count({ where: { tenantId } });
      break;
    case 'STUDENT':
      count = await prisma.student.count({ where: { tenantId } });
      break;
    case 'PARENT':
      count = await prisma.parent.count({ where: { tenantId } });
      break;
    case 'ADMIN':
      count = await prisma.schoolAdmin.count({ where: { tenantId } });
      break;
    case 'PRINCIPAL':
      count = await prisma.principal.count({ where: { tenantId } });
      break;
    default:
      count = await prisma.user.count({ where: { tenantId, role } });
  }

  return `${prefix}-${code}-${String(count + 1).padStart(3, '0')}`;
}

// ── Create User ──

export async function createUser(
  prisma: PrismaClient,
  data: CreateUserData,
  schoolCode?: string
): Promise<User> {
  const uniqueId = data.uniqueId || (await generateUniqueId(prisma, data.role, data.tenantId, schoolCode));

  const user = await prisma.user.create({
    data: {
      ...data,
      uniqueId,
    },
  });

  return user;
}

// ── Update User ──

export async function updateUser(
  prisma: PrismaClient,
  userId: string,
  data: UpdateUserData
): Promise<User> {
  return prisma.user.update({
    where: { id: userId },
    data,
  });
}

// ── Find User by ID (with role profile) ──

export async function findUserById(
  prisma: PrismaClient,
  userId: string,
  tenantId: string
): Promise<User | null> {
  return prisma.user.findFirst({
    where: { id: userId, tenantId },
  });
}

// ── Find User by uniqueId ──

export async function findUserByUniqueId(
  prisma: PrismaClient,
  uniqueId: string,
  tenantId: string
): Promise<User | null> {
  return prisma.user.findFirst({
    where: { uniqueId, tenantId },
  });
}

// ── List Users ──

export interface ListUsersOptions {
  tenantId: string;
  role?: UserRole;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export async function listUsers(
  prisma: PrismaClient,
  options: ListUsersOptions
): Promise<{ users: User[]; total: number }> {
  const { tenantId, role, isActive, search, page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = options;

  const where: Prisma.UserWhereInput = { tenantId };
  if (role) where.role = role;
  if (isActive !== undefined) where.isActive = isActive;
  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { uniqueId: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  return { users, total };
}

// ── Deactivate / Reactivate ──

export async function setUserActive(
  prisma: PrismaClient,
  userId: string,
  isActive: boolean
): Promise<User> {
  return prisma.user.update({
    where: { id: userId },
    data: { isActive },
  });
}
