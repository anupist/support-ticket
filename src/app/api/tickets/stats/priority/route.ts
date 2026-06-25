import { NextResponse } from 'next/server';
import { createHandler } from '@/lib/api-handler';
import { prisma } from '@/lib/prisma';

export const GET = createHandler(async (req, { user }) => {
  const tickets = await prisma.ticket.findMany({
    where: { tenantId: user.tenantId },
    select: { priority: true },
  });

  const counts: Record<string, number> = {};
  for (const t of tickets) {
    counts[t.priority] = (counts[t.priority] || 0) + 1;
  }

  const data = Object.entries(counts).map(([name, value]) => ({ name, value }));
  return NextResponse.json({ data });
});