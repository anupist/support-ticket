import { prisma } from '@/lib/prisma';
import { getAdminDb } from '@/lib/firebase-admin';
import { COLLECTIONS, DEFAULT_TENANT_ID } from '@/lib/constants';
import type { NotificationType, Role } from '@/types';

const firestore = () => getAdminDb();

interface CreateNotificationInput {
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
      metadata: (input.metadata || {}) as any,
      tenantId: DEFAULT_TENANT_ID,
    },
  });

  const rtDoc = {
    userId: input.userId,
    type: input.type,
    title: input.title,
    body: input.body,
    ticketId: input.ticketId,
    ticketNumber: input.ticketNumber,
    actorId: input.actorId,
    actorName: input.actorName,
    isRead: false,
    readAt: null,
    metadata: input.metadata || {},
    tenantId: DEFAULT_TENANT_ID,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  await firestore().collection(COLLECTIONS.NOTIFICATIONS).doc(notification.id).set(rtDoc);

  return notification.id;
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

  const timestamp = Date.now();

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
          metadata: (input.metadata || {}) as any,
          tenantId: DEFAULT_TENANT_ID,
        },
      })
    )
  );

  const batch = firestore().batch();
  notifications.forEach((n) => {
    const ref = firestore().collection(COLLECTIONS.NOTIFICATIONS).doc(n.id);
    batch.set(ref, {
      userId: n.userId,
      type: input.type,
      title: input.title,
      body: input.body,
      ticketId: input.ticketId,
      ticketNumber: input.ticketNumber,
      actorId: input.actorId,
      actorName: input.actorName,
      isRead: false,
      readAt: null,
      metadata: input.metadata || {},
      tenantId: DEFAULT_TENANT_ID,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
  });
  await batch.commit();
}

export async function markNotificationAsRead(notificationId: string): Promise<void> {
  const now = new Date();
  const timestamp = Date.now();

  await prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true, readAt: now },
  });

  await firestore()
    .collection(COLLECTIONS.NOTIFICATIONS)
    .doc(notificationId)
    .update({ isRead: true, readAt: timestamp, updatedAt: timestamp });
}

export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  const now = new Date();
  const timestamp = Date.now();

  const unread = await prisma.notification.findMany({
    where: {
      userId,
      isRead: false,
    },
    select: { id: true },
  });

  if (unread.length > 0) {
    await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: { isRead: true, readAt: now },
    });

    const batch = firestore().batch();
    unread.forEach((n) => {
      const ref = firestore().collection(COLLECTIONS.NOTIFICATIONS).doc(n.id);
      batch.update(ref, { isRead: true, readAt: timestamp, updatedAt: timestamp });
    });
    await batch.commit();
  }
}
