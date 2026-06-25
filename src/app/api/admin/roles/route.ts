import { NextResponse } from 'next/server';
import { createHandler } from '@/lib/api-handler';
import { prisma } from '@/lib/prisma';
import { DEFAULT_TENANT_ID } from '@/lib/constants';
import { handleApiError, ConflictError } from '@/lib/errors';
import { z } from 'zod';

const createRoleSchema = z.object({
  name: z.string().min(2).max(50),
  permissions: z.array(z.string()),
});

export const GET = createHandler(
  async (req, { user }) => {
    const roles = await prisma.customRole.findMany({
      where: { tenantId: DEFAULT_TENANT_ID },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { users: true } } },
    });

    return NextResponse.json({
      roles: roles.map((r) => ({
        id: r.id,
        name: r.name,
        permissions: r.permissions,
        userCount: r._count.users,
        createdAt: r.createdAt.getTime(),
      })),
    });
  },
  { roles: ['super_admin'] }
);

export const POST = createHandler(
  async (req, { user }) => {
    try {
      const body = await req.json();
      const parsed = createRoleSchema.safeParse(body);

      if (!parsed.success) {
        return NextResponse.json({ error: 'Invalid request', details: parsed.error.errors }, { status: 400 });
      }

      const role = await prisma.customRole.create({
        data: {
          name: parsed.data.name,
          permissions: parsed.data.permissions,
          tenantId: DEFAULT_TENANT_ID,
        },
      });

      return NextResponse.json({
        role: { id: role.id, name: role.name, permissions: role.permissions, userCount: 0, createdAt: role.createdAt.getTime() },
      }, { status: 201 });
    } catch (err) {
      return handleApiError(err);
    }
  },
  { roles: ['super_admin'] }
);