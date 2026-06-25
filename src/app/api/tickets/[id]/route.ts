import { NextResponse } from 'next/server';
import { createHandler } from '@/lib/api-handler';
import { prisma } from '@/lib/prisma';
import { getTicket, updateTicket } from '@/lib/services/ticket.service';
import { createNotificationForStaff } from '@/lib/services/notification.service';
import { logActivity } from '@/lib/services/activity.service';
import { sendTicketStatusEmail } from '@/lib/services/mail.service';
import { updateTicketSchema } from '@/lib/validations/ticket.schema';
import { canTransitionStatus, canAccessTicket } from '@/lib/permissions';
import { ValidationError, ForbiddenError } from '@/lib/errors';
import { DEFAULT_TENANT_ID } from '@/lib/constants';
import type { Role } from '@/types';

export const GET = createHandler(async (req, { user, params }) => {
  const ticket = await getTicket(params.id);

  if (!canAccessTicket(user.role as Role, user.uid, ticket.createdBy)) {
    throw new ForbiddenError('You do not have access to this ticket');
  }

  return NextResponse.json({ ticket });
});

export const PATCH = createHandler(
  async (req, { user, params }) => {
    const body = await req.json();
    const parsed = updateTicketSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError(
        Object.fromEntries(
          parsed.error.errors.map((e) => [e.path.join('.'), [e.message]])
        )
      );
    }

    const ticket = await getTicket(params.id);

    if (parsed.data.status && !canTransitionStatus(user.role as Role, ticket.status, parsed.data.status)) {
      throw new ForbiddenError('Cannot transition to this status');
    }

    const updated = await updateTicket(params.id, parsed.data);

    if (parsed.data.status) {
      const statusLink = `${process.env.NEXT_PUBLIC_APP_URL}/admin/tickets/${ticket.id}`;

      await createNotificationForStaff({
        type: 'ticket.status_changed',
        title: `Ticket ${ticket.ticketNumber}: Status changed to ${parsed.data.status}`,
        body: `Status changed from ${ticket.status} to ${parsed.data.status}`,
        ticketId: ticket.id,
        ticketNumber: ticket.ticketNumber,
        actorId: user.uid,
        actorName: user.displayName || user.email,
        metadata: { from: ticket.status, to: parsed.data.status },
      });

      const creator = await prisma.user.findUnique({ where: { id: ticket.createdBy } });
      if (creator) {
        await sendTicketStatusEmail(creator.email, creator.displayName, ticket.ticketNumber, ticket.status, parsed.data.status, statusLink).catch(() => {});
      }

      await logActivity({
        action: 'ticket.status_changed',
        entityType: 'ticket',
        entityId: ticket.id,
        performedBy: user.uid,
        performedByName: user.displayName || user.email,
        metadata: { from: ticket.status, to: parsed.data.status },
      });
    }

    return NextResponse.json({ ticket: updated });
  },
  { permissions: ['ticket.update_status'] }
);
