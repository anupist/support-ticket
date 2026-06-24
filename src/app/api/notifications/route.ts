import { NextResponse } from 'next/server';
import { createHandler } from '@/lib/api-handler';
import { prisma } from '@/lib/prisma';
import { markAllNotificationsAsRead } from '@/lib/services/notification.service';

export const GET = createHandler(async (req, { user }) => {
  const notifications = await prisma.notification.findMany({
    where: {
      userId: user.uid,
      tenantId: user.tenantId,
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  const mapped = notifications.map((row) => ({
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
  }));

  return NextResponse.json({ notifications: mapped });
});

export const POST = createHandler(async (req, { user }) => {
  await markAllNotificationsAsRead(user.uid);
  return NextResponse.json({ success: true });
});
