import { NextResponse } from 'next/server';
import { createHandler } from '@/lib/api-handler';
import { prisma } from '@/lib/prisma';
import { getTicket } from '@/lib/services/ticket.service';
import { createNotificationForRole } from '@/lib/services/notification.service';
import { logActivity } from '@/lib/services/activity.service';
import { createMessageSchema } from '@/lib/validations/message.schema';
import { can, canAccessTicket } from '@/lib/permissions';
import { ValidationError, ForbiddenError } from '@/lib/errors';
import { getAdminDb } from '@/lib/firebase-admin';
import { COLLECTIONS, DEFAULT_TENANT_ID } from '@/lib/constants';
import type { Role } from '@/types';

const firestore = () => getAdminDb();

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

  const mapped = filtered.map((row) => ({
    id: row.id,
    body: row.body,
    messageType: row.messageType,
    createdBy: row.createdBy,
    createdByName: row.createdByName,
    createdByRole: row.createdByRole,
    attachments: row.attachments || [],
    isEdited: row.isEdited,
    editedAt: row.editedAt ? new Date(row.editedAt).getTime() : null,
    tenantId: row.tenantId,
    createdAt: new Date(row.createdAt).getTime(),
    updatedAt: new Date(row.updatedAt).getTime(),
  }));

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
    const timestamp = Date.now();

    const messageData = await prisma.ticketMessage.create({
      data: {
        ticketId: params.id,
        body: parsed.data.body,
        messageType: parsed.data.messageType,
        createdBy: user.uid,
        createdByName: user.email,
        createdByRole: user.role,
        attachments: [],
        tenantId: DEFAULT_TENANT_ID,
      },
    });

    let status = ticket.status;
    if (user.role === 'client' && ticket.status !== 'closed') {
      status = 'waiting_on_agent';
    } else if (user.role !== 'client' && ticket.status !== 'closed') {
      status = 'waiting_on_client';
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

    // Write to Firestore for real-time delivery
    const rtMessage = {
      body: messageData.body,
      messageType: messageData.messageType,
      createdBy: messageData.createdBy,
      createdByName: messageData.createdByName,
      createdByRole: messageData.createdByRole,
      attachments: messageData.attachments || [],
      isEdited: messageData.isEdited,
      editedAt: messageData.editedAt ? new Date(messageData.editedAt).getTime() : null,
      tenantId: messageData.tenantId,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const messageRef = firestore()
      .collection(COLLECTIONS.TICKETS)
      .doc(params.id)
      .collection(COLLECTIONS.MESSAGES)
      .doc(messageData.id);

    await messageRef.set(rtMessage);

    // Update ticket in Firestore
    await firestore()
      .collection(COLLECTIONS.TICKETS)
      .doc(params.id)
      .update({
        lastActivityAt: timestamp,
        lastMessageAt: timestamp,
        lastMessageBy: user.uid,
        lastMessageByRole: user.role,
        lastMessagePreview: parsed.data.body.substring(0, 100),
        messageCount: (ticket.messageCount || 0) + 1,
        status: status,
        updatedAt: timestamp,
      });

    if (parsed.data.messageType === 'public') {
      const targetRole = user.role === 'client' ? 'agent' : 'client';
      await createNotificationForRole(targetRole as Role, {
        type: 'message.added',
        title: `New message on ${ticket.ticketNumber}`,
        body: parsed.data.body.substring(0, 100),
        ticketId: params.id,
        ticketNumber: ticket.ticketNumber,
        actorId: user.uid,
        actorName: user.email,
        metadata: { messageType: parsed.data.messageType },
      });
    }

    await logActivity({
      action: 'message.created',
      entityType: 'ticket',
      entityId: params.id,
      performedBy: user.uid,
      performedByName: user.email,
      metadata: { messageType: parsed.data.messageType, preview: parsed.data.body.substring(0, 100) },
    });

    const response = {
      id: messageData.id,
      body: rtMessage.body,
      messageType: rtMessage.messageType,
      createdBy: rtMessage.createdBy,
      createdByName: rtMessage.createdByName,
      createdByRole: rtMessage.createdByRole,
      attachments: rtMessage.attachments,
      isEdited: rtMessage.isEdited,
      editedAt: rtMessage.editedAt,
      tenantId: rtMessage.tenantId,
      createdAt: rtMessage.createdAt,
      updatedAt: rtMessage.updatedAt,
    };

    return NextResponse.json({ message: response, status }, { status: 201 });
  },
  { permissions: ['message.create'] }
);
