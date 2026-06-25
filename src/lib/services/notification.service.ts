import { prisma } from '@/lib/prisma';
import { DEFAULT_TENANT_ID } from '@/lib/constants';
import { triggerNotification, triggerNotificationBatch } from '@/lib/pusher-server';
import type { NotificationType, Role } from '@/types';

export interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  ticketId: string;
  ticketNumber: string;
  actorId: string;
  actorName: string;
  metadata?: Record<string, string>;
}

export async function createNotification(
  input: CreateNotificationInput
): Promise<string> {
  const notification = await prisma.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      title: input.title,
      body: input.body,
      ticketId: input.ticketId,
      ticketNumber: input.ticketNumber,
      actorId: input.actorId,
      actorName: input.actorName,
      isRead: false,
      metadata: (input.metadata || {}),
      tenantId: DEFAULT_TENANT_ID,
    },
  });

  const payload = {
    notification: {
      id: notification.id,
      userId: notification.userId,
      type: notification.type,
      title: notification.title,
      body: notification.body,
      ticketId: notification.ticketId,
      ticketNumber: notification.ticketNumber,
      actorId: notification.actorId,
      actorName: notification.actorName,
      isRead: notification.isRead,
      readAt: notification.readAt ? new Date(notification.readAt).getTime() : null,
      metadata: notification.metadata,
      tenantId: notification.tenantId,
      createdAt: new Date(notification.createdAt).getTime(),
      updatedAt: new Date(notification.updatedAt).getTime(),
    },
  };

  await triggerNotification(input.userId, 'notification.created', payload);

  return notification.id;
}

function mapNotificationRow(row: any) {
  return {
    id: row.id,
    userId: row.userId,
    type: row.type,
    title: row.title,
    body: row.body,
    ticketId: row.ticketId,
    ticketNumber: row.ticketNumber,
    actorId: row.actorId,
    actorName: row.actorName,
    isRead: row.isRead,
    readAt: row.readAt ? new Date(row.readAt).getTime() : null,
    metadata: row.metadata,
    tenantId: row.tenantId,
    createdAt: new Date(row.createdAt).getTime(),
    updatedAt: new Date(row.updatedAt).getTime(),
  };
}

export async function createNotificationForRole(
  role: Role,
  input: Omit<CreateNotificationInput, 'userId'>
): Promise<void> {
  const users = await prisma.user.findMany({
    where: {
      role,
      tenantId: DEFAULT_TENANT_ID,
      isActive: true,
    },
    select: { id: true },
  });

  if (users.length === 0) return;

  const notifications = await Promise.all(
    users.map((user) =>
      prisma.notification.create({
        data: {
          userId: user.id,
          type: input.type,
          title: input.title,
          body: input.body,
          ticketId: input.ticketId,
          ticketNumber: input.ticketNumber,
          actorId: input.actorId,
          actorName: input.actorName,
          isRead: false,
          metadata: (input.metadata || {}),
          tenantId: DEFAULT_TENANT_ID,
        },
      })
    )
  );

  const userIds = notifications.map((n) => n.userId);
  const payloads = notifications.map((n) => ({
    notification: mapNotificationRow(n),
  }));

  await triggerNotificationBatch(userIds, 'notification.created', payloads[0]);
}

export async function markNotificationAsRead(notificationId: string): Promise<void> {
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
  });

  if (!notification) return;

  await prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true, readAt: new Date() },
  });

  await triggerNotification(notification.userId, 'notification.marked-read', {
    notificationId,
  });
}

export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  await prisma.notification.updateMany({
    where: {
      userId,
      isRead: false,
    },
    data: { isRead: true, readAt: new Date() },
  });

  await triggerNotification(userId, 'notification.all-read', { userId });
}