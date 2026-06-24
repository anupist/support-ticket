import { prisma } from '@/lib/prisma';
import { DEFAULT_TENANT_ID } from '@/lib/constants';

interface ActivityLogInput {
  action: string;
  entityType: string;
  entityId: string;
  performedBy: string;
  performedByName: string;
  metadata?: Record<string, unknown>;
}

export async function logActivity(input: ActivityLogInput): Promise<string> {
  const entry = await prisma.activityLog.create({
    data: {
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      performedBy: input.performedBy,
      performedByName: input.performedByName,
      metadata: (input.metadata || {}) as any,
      tenantId: DEFAULT_TENANT_ID,
    },
  });

  return entry.id;
}

export async function getEntityActivity(
  entityType: string,
  entityId: string,
  limitCount = 50
) {
  const entries = await prisma.activityLog.findMany({
    where: {
      entityType,
      entityId,
    },
    orderBy: { createdAt: 'desc' },
    take: limitCount,
  });

  return entries.map((row) => ({
    id: row.id,
    action: row.action,
    entityType: row.entityType,
    entityId: row.entityId,
    performedBy: row.performedBy,
    performedByName: row.performedByName,
    metadata: row.metadata,
    tenantId: row.tenantId,
    createdAt: new Date(row.createdAt).getTime(),
  }));
}
