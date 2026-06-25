import { prisma } from '@/lib/prisma';
import { DEFAULT_TENANT_ID } from '@/lib/constants';
import { hashPassword } from '@/lib/auth';
import type { User } from '@/types';
import { NotFoundError, ConflictError } from '@/lib/errors';

interface CreateUserServiceInput {
  email: string;
  password: string;
  displayName: string;
  role?: string;
}

export async function createUser(input: CreateUserServiceInput): Promise<User> {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw new ConflictError('Email already in use');

  const user = await prisma.user.create({
    data: {
      id: crypto.randomUUID(),
      email: input.email,
      passwordHash: hashPassword(input.password),
      displayName: input.displayName,
      role: input.role || 'client',
      tenantId: DEFAULT_TENANT_ID,
      organizationId: DEFAULT_TENANT_ID,
      preferences: { notifications: { email: false, push: false } },
      metadata: { lastLoginAt: null, ticketCount: 0 },
    },
  });

  return mapUserRow(user);
}

export async function getUser(userId: string): Promise<User> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) throw new NotFoundError('User');
  return mapUserRow(user);
}

export async function getUserByEmail(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) throw new NotFoundError('User');
  return mapUserRow(user);
}

export async function getUsersByTenant(tenantId: string) {
  const users = await prisma.user.findMany({
    where: { tenantId },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  return users.map(mapUserRow);
}

export async function updateUserRole(userId: string, role: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { role },
  });
}

function mapUserRow(row: any): User {
  return {
    id: row.id,
    email: row.email,
    displayName: row.displayName,
    avatarURL: row.avatarUrl || '',
    role: row.role,
    tenantId: row.tenantId,
    organizationId: row.organizationId,
    isActive: row.isActive,
    preferences: row.preferences || { notifications: { email: false, push: false } },
    metadata: row.metadata || { lastLoginAt: null, ticketCount: 0 },
    createdAt: new Date(row.createdAt).getTime(),
    updatedAt: new Date(row.updatedAt).getTime(),
  };
}