import { NextResponse } from 'next/server';
import { createHandler } from '@/lib/api-handler';
import { prisma } from '@/lib/prisma';
import { handleApiError, NotFoundError } from '@/lib/errors';
import { z } from 'zod';

const updateRoleSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  permissions: z.array(z.string()).optional(),
});

export const PATCH = createHandler(
  async (req, { user, params }) => {
    try {
      const body = await req.json();
      const parsed = updateRoleSchema.safeParse(body);

      if (!parsed.success) {
        return NextResponse.json({ error: 'Invalid request', details: parsed.error.errors }, { status: 400 });
      }

      const existing = await prisma.customRole.findUnique({ where: { id: params.id } });
      if (!existing) throw new NotFoundError('Role');

      const data: Record<string, unknown> = {};
      if (parsed.data.name !== undefined) data.name = parsed.data.name;
      if (parsed.data.permissions !== undefined) data.permissions = parsed.data.permissions;

      const role = await prisma.customRole.update({
        where: { id: params.id },
        data: data as any,
      });

      const userCount = await prisma.user.count({ where: { customRoleId: params.id } });

      return NextResponse.json({
        role: { id: role.id, name: role.name, permissions: role.permissions, userCount, createdAt: role.createdAt.getTime() },
      });
    } catch (err) {
      return handleApiError(err);
    }
  },
  { roles: ['super_admin'] }
);

export const DELETE = createHandler(
  async (req, { user, params }) => {
    const existing = await prisma.customRole.findUnique({ where: { id: params.id } });
    if (!existing) throw new NotFoundError('Role');

    await prisma.user.updateMany({
      where: { customRoleId: params.id },
      data: { customRoleId: null },
    });

    await prisma.customRole.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true });
  },
  { roles: ['super_admin'] }
);