import { NextResponse } from 'next/server';
import { createHandler } from '@/lib/api-handler';
import { prisma } from '@/lib/prisma';

export const GET = createHandler(async (req, { user }) => {
  const { searchParams } = new URL(req.url);
  const days = Math.min(Math.max(parseInt(searchParams.get('days') || '15'), 1), 90);

  const now = new Date();
  const startDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - days));

  const tickets = await prisma.ticket.findMany({
    where: {
      createdAt: { gte: startDate },
      tenantId: user.tenantId,
    },
    select: { createdAt: true },
  });

  const dailyCount: Record<string, number> = {};
  for (let i = 0; i <= days; i++) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - days + i));
    dailyCount[d.toISOString().split('T')[0]] = 0;
  }

  for (const t of tickets) {
    const key = new Date(t.createdAt).toISOString().split('T')[0];
    if (dailyCount[key] !== undefined) dailyCount[key]++;
  }

  const data = Object.entries(dailyCount).map(([date, count]) => ({ date, count }));
  return NextResponse.json({ data });
});