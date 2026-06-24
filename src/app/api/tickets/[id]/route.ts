import { NextResponse } from 'next/server';
import { createHandler } from '@/lib/api-handler';
import { getTicket, updateTicket } from '@/lib/services/ticket.service';
import { createNotificationForRole } from '@/lib/services/notification.service';
import { logActivity } from '@/lib/services/activity.service';
import { updateTicketSchema } from '@/lib/validations/ticket.schema';
import { canTransitionStatus, canAccessTicket } from '@/lib/permissions';
import { ValidationError, ForbiddenError } from '@/lib/errors';
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
      await createNotificationForRole('agent', {
        type: 'ticket.status_changed',
        title: `Ticket ${ticket.ticketNumber}: Status changed to ${parsed.data.status}`,
        body: `Status changed from ${ticket.status} to ${parsed.data.status}`,
        ticketId: ticket.id,
        ticketNumber: ticket.ticketNumber,
        actorId: user.uid,
        actorName: user.email,
        metadata: { from: ticket.status, to: parsed.data.status },
      });

      await logActivity({
        action: 'ticket.status_changed',
        entityType: 'ticket',
        entityId: ticket.id,
        performedBy: user.uid,
        performedByName: user.email,
        metadata: { from: ticket.status, to: parsed.data.status },
      });
    }

    return NextResponse.json({ ticket: updated });
  },
  { permissions: ['ticket.update_status'] }
);
