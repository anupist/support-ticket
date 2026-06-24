import { NextResponse } from 'next/server';
import { createHandler } from '@/lib/api-handler';
import { getTicket, updateTicket } from '@/lib/services/ticket.service';
import { createNotification } from '@/lib/services/notification.service';
import { logActivity } from '@/lib/services/activity.service';
import { assignTicketSchema } from '@/lib/validations/ticket.schema';
import { getUser } from '@/lib/services/user.service';
import { ValidationError } from '@/lib/errors';

export const POST = createHandler(
  async (req, { user, params }) => {
    const body = await req.json();
    const parsed = assignTicketSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError(
        Object.fromEntries(
          parsed.error.errors.map((e) => [e.path.join('.'), [e.message]])
        )
      );
    }

    const ticket = await getTicket(params.id);
    const assignedUser = await getUser(parsed.data.assignedTo);

    await updateTicket(params.id, {
      assignedTo: parsed.data.assignedTo,
    });

    await createNotification({
      userId: parsed.data.assignedTo,
      type: 'ticket.assigned',
      title: `Ticket ${ticket.ticketNumber} assigned to you`,
      body: ticket.subject,
      ticketId: ticket.id,
      ticketNumber: ticket.ticketNumber,
      actorId: user.uid,
      actorName: user.email,
      metadata: { assignedBy: user.uid },
    });

    await logActivity({
      action: 'ticket.assigned',
      entityType: 'ticket',
      entityId: ticket.id,
      performedBy: user.uid,
      performedByName: user.email,
      metadata: { assignedTo: parsed.data.assignedTo, assignedToName: assignedUser.displayName },
    });

    return NextResponse.json({ success: true });
  },
  { permissions: ['ticket.assign'] }
);
