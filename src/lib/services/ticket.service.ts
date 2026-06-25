import { prisma } from '@/lib/prisma';
import { DEFAULT_TENANT_ID } from '@/lib/constants';
import type { Ticket, CreateTicketInput, UpdateTicketInput } from '@/types';
import { NotFoundError } from '@/lib/errors';
import { generateTicketNumber } from '@/lib/utils';

export async function getNextTicketNumber(): Promise<string> {
  let counter = await prisma.ticketNumberCounter.findUnique({
    where: { id: DEFAULT_TENANT_ID },
  });

  if (!counter) {
    counter = await prisma.ticketNumberCounter.create({
      data: { id: DEFAULT_TENANT_ID, currentValue: 0 },
    });
  }

  const updated = await prisma.ticketNumberCounter.update({
    where: { id: DEFAULT_TENANT_ID },
    data: { currentValue: { increment: 1 } },
  });

  return generateTicketNumber(updated.currentValue);
}

export async function createTicket(
  input: CreateTicketInput,
  userId: string,
  userName: string
): Promise<Ticket> {
  const ticketNumber = await getNextTicketNumber();
  const now = new Date();

  const ticket = await prisma.ticket.create({
    data: {
      ticketNumber,
      subject: input.subject,
      description: input.description,
      status: 'open',
      priority: input.priority,
      categoryId: input.categoryId,
      tags: (input.tags || []),
      createdBy: userId,
      createdByName: userName,
      lastActivityAt: now,
      tenantId: DEFAULT_TENANT_ID,
      organizationId: DEFAULT_TENANT_ID,
    },
  });

  return mapTicketRow(ticket);
}

export async function getTicket(ticketId: string): Promise<Ticket> {
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
  });

  if (!ticket) throw new NotFoundError('Ticket');
  return mapTicketRow(ticket);
}

export async function updateTicket(
  ticketId: string,
  input: UpdateTicketInput
): Promise<Ticket> {
  const data: Record<string, unknown> = {};

  if (input.status !== undefined) data.status = input.status;
  if (input.priority !== undefined) data.priority = input.priority;
  if (input.assignedTo !== undefined) {
    data.assignedTo = input.assignedTo;
  }
  if (input.categoryId !== undefined) data.categoryId = input.categoryId;
  if (input.tags !== undefined) data.tags = input.tags;

  const ticket = await prisma.ticket.update({
    where: { id: ticketId },
    data: data as any,
  });

  if (!ticket) throw new NotFoundError('Ticket');

  return mapTicketRow(ticket);
}

export async function getTicketsByFilter(params: {
  tenantId: string;
  status?: string;
  priority?: string;
  createdBy?: string;
  assignedTo?: string;
  limitCount?: number;
}) {
  const where: Record<string, unknown> = {
    tenantId: params.tenantId,
  };

  if (params.status) where.status = params.status;
  if (params.priority) where.priority = params.priority;
  if (params.createdBy) where.createdBy = params.createdBy;
  if (params.assignedTo) where.assignedTo = params.assignedTo;

  const tickets = await prisma.ticket.findMany({
    where: where as any,
    orderBy: { lastActivityAt: 'desc' },
    take: params.limitCount || 50,
  });

  return tickets.map(mapTicketRow);
}

function mapTicketRow(row: any): Ticket {
  return {
    id: row.id,
    ticketNumber: row.ticketNumber,
    subject: row.subject,
    description: row.description,
    status: row.status,
    priority: row.priority,
    categoryId: row.categoryId,
    categoryName: row.categoryName,
    tags: row.tags || [],
    assignedTo: row.assignedTo,
    assignedToName: row.assignedToName,
    createdBy: row.createdBy,
    createdByName: row.createdByName,
    lastActivityAt: new Date(row.lastActivityAt).getTime(),
    lastMessageAt: row.lastMessageAt ? new Date(row.lastMessageAt).getTime() : null,
    lastMessageBy: row.lastMessageBy,
    lastMessageByRole: row.lastMessageByRole,
    lastMessagePreview: row.lastMessagePreview,
    messageCount: row.messageCount || 0,
    isArchived: row.isArchived || false,
    tenantId: row.tenantId,
    organizationId: row.organizationId,
    createdAt: new Date(row.createdAt).getTime(),
    updatedAt: new Date(row.updatedAt).getTime(),
  };
}