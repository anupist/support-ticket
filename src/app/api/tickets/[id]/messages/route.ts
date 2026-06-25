import { NextResponse } from 'next/server';
import { createHandler } from '@/lib/api-handler';
import { prisma } from '@/lib/prisma';
import { getTicket } from '@/lib/services/ticket.service';
import { createNotificationForRole, createNotificationForStaff } from '@/lib/services/notification.service';
import { logActivity } from '@/lib/services/activity.service';
import { createMessageSchema } from '@/lib/validations/message.schema';
import { can, canAccessTicket } from '@/lib/permissions';
import { ValidationError, ForbiddenError } from '@/lib/errors';
import { DEFAULT_TENANT_ID } from '@/lib/constants';
import { triggerNotification, triggerNotificationBatch } from '@/lib/pusher-server';
import { sendTicketMessageEmail } from '@/lib/services/mail.service';
import type { Role } from '@/types';

export const GET = createHandler(async (req, { user, params }) => {
  const ticket = await getTicket(params.id);

  if (!canAccessTicket(user.role as Role, user.uid, ticket.createdBy)) {
    throw new ForbiddenError();
  }

  const messages = await prisma.ticketMessage.findMany({
    where: { ticketId: params.id },
    orderBy: { createdAt: 'asc' },
    take: 50,
  });

  const filtered = messages.filter((row) => {
    if (row.messageType === 'internal_note' && !can(user.role as Role, 'message.view_internal')) {
      return false;
    }
    return true;
  });

  const userIds = [...new Set(filtered.map((m) => m.createdBy))];
  const userRecords = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, displayName: true, avatarUrl: true },
  });
  const userMap = new Map(userRecords.map((u) => [u.id, u]));

  const mapped = filtered.map((row) => {
    const sender = userMap.get(row.createdBy);
    return {
      id: row.id,
      body: row.body,
      messageType: row.messageType,
      createdBy: row.createdBy,
      createdByName: sender?.displayName || row.createdByName,
      createdByAvatarUrl: sender?.avatarUrl || '',
      createdByRole: row.createdByRole,
      attachments: row.attachments || [],
      isEdited: row.isEdited,
      editedAt: row.editedAt ? new Date(row.editedAt).getTime() : null,
      tenantId: row.tenantId,
      createdAt: new Date(row.createdAt).getTime(),
      updatedAt: new Date(row.updatedAt).getTime(),
    };
  });

  return NextResponse.json({ messages: mapped });
});

export const POST = createHandler(
  async (req, { user, params }) => {
    const body = await req.json();
    const parsed = createMessageSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError(
        Object.fromEntries(
          parsed.error.errors.map((e) => [e.path.join('.'), [e.message]])
        )
      );
    }

    const ticket = await getTicket(params.id);

    if (!canAccessTicket(user.role as Role, user.uid, ticket.createdBy)) {
      throw new ForbiddenError();
    }

    if (parsed.data.messageType === 'internal_note' && !can(user.role as Role, 'message.reply_internal')) {
      throw new ForbiddenError();
    }

    const now = new Date();

    let attachments: any[] = [];
    if (parsed.data.attachmentIds?.length) {
      const mediaRecords = await prisma.media.findMany({
        where: { id: { in: parsed.data.attachmentIds }, userId: user.uid },
      });
      attachments = mediaRecords.map((m) => ({
        id: m.id,
        fileName: m.originalName,
        fileSize: m.size,
        mimeType: m.mimeType,
        url: `/api/media/${m.id}`,
        uploadedAt: now.getTime(),
      }));
    }

    const messageData = await prisma.ticketMessage.create({
      data: {
        ticketId: params.id,
        body: parsed.data.body,
        messageType: parsed.data.messageType,
        createdBy: user.uid,
        createdByName: user.displayName || user.email,
        createdByRole: user.role,
        attachments: attachments,
        tenantId: DEFAULT_TENANT_ID,
      },
    });

    let status = ticket.status;
    if (user.role !== 'client' && ticket.status !== 'closed' && ticket.status !== 'resolved') {
      status = 'in_progress';
    }

    await prisma.ticket.update({
      where: { id: params.id },
      data: {
        lastActivityAt: now,
        lastMessageAt: now,
        lastMessageBy: user.uid,
        lastMessageByRole: user.role,
        lastMessagePreview: parsed.data.body.substring(0, 100),
        messageCount: (ticket.messageCount || 0) + 1,
        status,
      },
    });

    const messagePayload = {
      ticketId: params.id,
      message: {
        id: messageData.id,
        body: messageData.body,
        messageType: messageData.messageType,
        createdBy: messageData.createdBy,
        createdByName: messageData.createdByName,
        createdByAvatarUrl: user.avatarUrl,
        createdByRole: messageData.createdByRole,
        attachments: messageData.attachments || [],
        isEdited: messageData.isEdited,
        editedAt: messageData.editedAt ? new Date(messageData.editedAt).getTime() : null,
        tenantId: DEFAULT_TENANT_ID,
        createdAt: new Date(messageData.createdAt).getTime(),
        updatedAt: new Date(messageData.updatedAt).getTime(),
      },
    };

    if (parsed.data.messageType === 'public') {
      const isClientSender = user.role === 'client';
      const targetRoles: string[] = isClientSender ? ['agent', 'super_admin'] : ['client'];

      if (isClientSender) {
        await createNotificationForStaff({
          type: 'message.added',
          title: `New message on ${ticket.ticketNumber}`,
          body: parsed.data.body.substring(0, 100),
          ticketId: params.id,
          ticketNumber: ticket.ticketNumber,
          actorId: user.uid,
          actorName: user.displayName || user.email,
          metadata: { messageType: parsed.data.messageType },
        });
      } else {
        await createNotificationForRole('client', {
          type: 'message.added',
          title: `New message on ${ticket.ticketNumber}`,
          body: parsed.data.body.substring(0, 100),
          ticketId: params.id,
          ticketNumber: ticket.ticketNumber,
          actorId: user.uid,
          actorName: user.displayName || user.email,
          metadata: { messageType: parsed.data.messageType },
        });
      }

      const recipientUsers = await prisma.user.findMany({
        where: {
          role: { in: targetRoles },
          tenantId: DEFAULT_TENANT_ID,
          isActive: true,
        },
        select: { id: true, email: true, displayName: true },
      });
      const recipientIds = recipientUsers.map((u) => u.id);
      if (recipientIds.length > 0) {
        await triggerNotificationBatch(recipientIds, 'ticket.new-message', messagePayload);
      }

      const messageLink = `${process.env.NEXT_PUBLIC_APP_URL}/${isClientSender ? 'admin' : 'portal'}/tickets/${params.id}`;
      for (const r of recipientUsers) {
        await sendTicketMessageEmail(r.email, r.displayName, ticket.ticketNumber, user.displayName || user.email, parsed.data.body.substring(0, 200), messageLink).catch(() => {});
      }
    } else if (user.role !== 'client') {
      await triggerNotification(ticket.createdBy, 'ticket.new-message', messagePayload);

      const creator = await prisma.user.findUnique({ where: { id: ticket.createdBy }, select: { email: true, displayName: true } });
      if (creator) {
        const clientLink = `${process.env.NEXT_PUBLIC_APP_URL}/portal/tickets/${params.id}`;
        await sendTicketMessageEmail(creator.email, creator.displayName, ticket.ticketNumber, user.displayName || user.email, parsed.data.body.substring(0, 200), clientLink).catch(() => {});
      }
    }

    await logActivity({
      action: 'message.created',
      entityType: 'ticket',
      entityId: params.id,
      performedBy: user.uid,
      performedByName: user.displayName || user.email,
      metadata: { messageType: parsed.data.messageType, preview: parsed.data.body.substring(0, 100) },
    });

    const response = {
      id: messageData.id,
      body: messageData.body,
      messageType: messageData.messageType,
      createdBy: messageData.createdBy,
      createdByName: messageData.createdByName,
      createdByAvatarUrl: user.avatarUrl,
      createdByRole: messageData.createdByRole,
      attachments: messageData.attachments || [],
      isEdited: messageData.isEdited,
      editedAt: messageData.editedAt ? new Date(messageData.editedAt).getTime() : null,
      tenantId: messageData.tenantId,
      createdAt: new Date(messageData.createdAt).getTime(),
      updatedAt: new Date(messageData.updatedAt).getTime(),
    };

    return NextResponse.json({ message: response, status }, { status: 201 });
  },
  { permissions: ['message.create'] }
);