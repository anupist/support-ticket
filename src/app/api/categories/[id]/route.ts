import { NextResponse } from 'next/server';
import { createHandler } from '@/lib/api-handler';
import { prisma } from '@/lib/prisma';
import { NotFoundError } from '@/lib/errors';
import { z } from 'zod';

const updateSchema = z.object({
  name: z.string().min(1).max(100),
});

export const PATCH = createHandler(
  async (req, { user, params }) => {
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const existing = await prisma.ticketCategory.findUnique({ where: { id: params.id } });
    if (!existing) throw new NotFoundError('Category');

    const category = await prisma.ticketCategory.update({
      where: { id: params.id },
      data: { name: parsed.data.name },
    });

    return NextResponse.json({
      category: {
        id: category.id,
        name: category.name,
        tenantId: category.tenantId,
        isActive: category.isActive,
        createdAt: new Date(category.createdAt).getTime(),
        updatedAt: new Date(category.updatedAt).getTime(),
      },
    });
  },
  { permissions: ['category.manage'] }
);

export const DELETE = createHandler(
  async (req, { user, params }) => {
    const existing = await prisma.ticketCategory.findUnique({ where: { id: params.id } });
    if (!existing) throw new NotFoundError('Category');

    await prisma.ticketCategory.update({
      where: { id: params.id },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true });
  },
  { permissions: ['category.manage'] }
);
