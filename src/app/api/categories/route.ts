import { NextResponse } from 'next/server';
import { createHandler } from '@/lib/api-handler';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const DEFAULT_CATEGORIES = [
  'Billing',
  'Technical Issue',
  'Account',
  'Feature Request',
  'Other',
];

const createSchema = z.object({
  name: z.string().min(1).max(100),
});

export const GET = createHandler(async (req, { user }) => {
  let categories = await prisma.ticketCategory.findMany({
    where: {
      tenantId: user.tenantId,
      isActive: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  // Seed default categories if none exist
  if (categories.length === 0) {
    const now = new Date();
    const seedData = DEFAULT_CATEGORIES.map((name) => ({
      name,
      tenantId: user.tenantId,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    }));

    await prisma.ticketCategory.createMany({ data: seedData });

    categories = await prisma.ticketCategory.findMany({
      where: { tenantId: user.tenantId, isActive: true },
      orderBy: { createdAt: 'asc' },
    });
  }

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

export const POST = createHandler(
  async (req, { user }) => {
    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const category = await prisma.ticketCategory.create({
      data: {
        name: parsed.data.name,
        tenantId: user.tenantId,
        isActive: true,
      },
    });

    return NextResponse.json(
      {
        category: {
          id: category.id,
          name: category.name,
          tenantId: category.tenantId,
          isActive: category.isActive,
          createdAt: new Date(category.createdAt).getTime(),
          updatedAt: new Date(category.updatedAt).getTime(),
        },
      },
      { status: 201 }
    );
  },
  { permissions: ['category.manage'] }
);
