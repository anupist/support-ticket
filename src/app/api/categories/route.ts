import { NextResponse } from 'next/server';
import { createHandler } from '@/lib/api-handler';
import { prisma } from '@/lib/prisma';

export const GET = createHandler(async (req, { user }) => {
  const categories = await prisma.ticketCategory.findMany({
    where: {
      tenantId: user.tenantId,
      isActive: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  const mapped = categories.map((row) => ({
    id: row.id,
    name: row.name,
    tenantId: row.tenantId,
    isActive: row.isActive,
    createdAt: new Date(row.createdAt).getTime(),
    updatedAt: new Date(row.updatedAt).getTime(),
  }));

  return NextResponse.json({ categories: mapped });
});
