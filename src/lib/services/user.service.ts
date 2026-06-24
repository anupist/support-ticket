import { prisma } from '@/lib/prisma';
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';
import { COLLECTIONS, DEFAULT_TENANT_ID } from '@/lib/constants';
import type { User } from '@/types';
import { NotFoundError } from '@/lib/errors';

const firestore = () => getAdminDb();

interface CreateUserServiceInput {
  id: string;
  email: string;
  displayName: string;
  role?: string;
}

export async function createUser(input: CreateUserServiceInput): Promise<User> {
  await getAdminAuth().setCustomUserClaims(input.id, {
    role: input.role || 'client',
    tenantId: DEFAULT_TENANT_ID,
  });

  const user = await prisma.user.create({
    data: {
      id: input.id,
      email: input.email,
      displayName: input.displayName,
      role: input.role || 'client',
      tenantId: DEFAULT_TENANT_ID,
      organizationId: DEFAULT_TENANT_ID,
      preferences: { notifications: { email: false, push: false } } as any,
      metadata: { lastLoginAt: null, ticketCount: 0 } as any,
    },
  });

  const result = mapUserRow(user);

  await firestore().collection(COLLECTIONS.USERS).doc(user.id).set(result);

  return result;
}

export async function getUser(userId: string): Promise<User> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
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
  await getAdminAuth().setCustomUserClaims(userId, {
    role,
    tenantId: DEFAULT_TENANT_ID,
  });

  await prisma.user.update({
    where: { id: userId },
    data: { role },
  });

  await firestore()
    .collection(COLLECTIONS.USERS)
    .doc(userId)
    .update({ role, updatedAt: Date.now() });
}

function mapUserRow(row: any): User {
  return {
    id: row.id,
    email: row.email,
    displayName: row.displayName,
    avatarURL: row.avatarURL || '',
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
