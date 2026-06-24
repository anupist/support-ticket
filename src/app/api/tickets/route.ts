import { NextResponse } from 'next/server';
import { createHandler } from '@/lib/api-handler';
import { createTicket, getTicketsByFilter } from '@/lib/services/ticket.service';
import { createNotificationForRole } from '@/lib/services/notification.service';
import { logActivity } from '@/lib/services/activity.service';
import { createTicketSchema } from '@/lib/validations/ticket.schema';
import { ValidationError } from '@/lib/errors';

export const GET = createHandler(async (req, { user }) => {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const priority = searchParams.get('priority');

  const tickets = await getTicketsByFilter({
    tenantId: user.tenantId,
    status: status || undefined,
    priority: priority || undefined,
    createdBy: user.role === 'client' ? user.uid : undefined,
  });

  return NextResponse.json({ tickets });
});

export const POST = createHandler(
  async (req, { user }) => {
    const body = await req.json();
    const parsed = createTicketSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError(
        Object.fromEntries(
          parsed.error.errors.map((e) => [e.path.join('.'), [e.message]])
        )
      );
    }

    const ticket = await createTicket(parsed.data, user.uid, user.email);

    await createNotificationForRole('agent', {
      type: 'ticket.created',
      title: `New ticket: ${ticket.subject}`,
      body: `A new ${ticket.priority} priority ticket was created`,
      ticketId: ticket.id,
      ticketNumber: ticket.ticketNumber,
      actorId: user.uid,
      actorName: user.email,
      metadata: { priority: ticket.priority },
    });

    await logActivity({
      action: 'ticket.created',
      entityType: 'ticket',
      entityId: ticket.id,
      performedBy: user.uid,
      performedByName: user.email,
      metadata: { subject: ticket.subject, priority: ticket.priority },
    });

    return NextResponse.json({ ticket }, { status: 201 });
  },
  { permissions: ['ticket.create'] }
);
