import { NextResponse } from 'next/server';
import { createHandler } from '@/lib/api-handler';
import { prisma } from '@/lib/prisma';
import { createTicket, getTicketsByFilter } from '@/lib/services/ticket.service';
import { createNotificationForStaff } from '@/lib/services/notification.service';
import { logActivity } from '@/lib/services/activity.service';
import { sendTicketCreatedEmail } from '@/lib/services/mail.service';
import { createTicketSchema } from '@/lib/validations/ticket.schema';
import { ValidationError } from '@/lib/errors';
import { DEFAULT_TENANT_ID } from '@/lib/constants';

export const GET = createHandler(async (req, { user }) => {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const priority = searchParams.get('priority');
  const search = searchParams.get('search');
  const projectId = searchParams.get('projectId');

  const tickets = await getTicketsByFilter({
    tenantId: user.tenantId,
    status: status || undefined,
    priority: priority || undefined,
    search: search || undefined,
    projectId: projectId || undefined,
    createdBy: user.role === 'client' ? user.uid : undefined,
    assignedTo: user.role === 'agent' ? user.uid : undefined,
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

    const ticket = await createTicket(parsed.data, user.uid, user.displayName || user.email);

    const createdLink = `${process.env.NEXT_PUBLIC_APP_URL}/admin/tickets/${ticket.id}`;

    await createNotificationForStaff({
      type: 'ticket.created',
      title: `New ticket: ${ticket.subject}`,
      body: `A new ${ticket.priority} priority ticket was created`,
      ticketId: ticket.id,
      ticketNumber: ticket.ticketNumber,
      actorId: user.uid,
      actorName: user.displayName || user.email,
      metadata: { priority: ticket.priority },
    });

    const agents = await prisma.user.findMany({
      where: { role: { in: ['agent', 'super_admin'] }, tenantId: DEFAULT_TENANT_ID, isActive: true },
    });
    for (const agent of agents) {
      await sendTicketCreatedEmail(agent.email, agent.displayName, ticket.ticketNumber, ticket.subject, createdLink).catch(() => {});
    }

    await logActivity({
      action: 'ticket.created',
      entityType: 'ticket',
      entityId: ticket.id,
      performedBy: user.uid,
      performedByName: user.displayName || user.email,
      metadata: { subject: ticket.subject, priority: ticket.priority },
    });

    return NextResponse.json({ ticket }, { status: 201 });
  },
  { permissions: ['ticket.create'] }
);
