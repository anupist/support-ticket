import { NextResponse } from 'next/server';
import { createHandler } from '@/lib/api-handler';
import { prisma } from '@/lib/prisma';
import { getUser } from '@/lib/services/user.service';
import { handleApiError, NotFoundError } from '@/lib/errors';
import { z } from 'zod';

export const GET = createHandler(async (req, { user, params }) => {
  const profile = await getUser(params.id);
  return NextResponse.json({ user: profile });
});

const updateUserSchema = z.object({
  role: z.enum(['client', 'agent', 'super_admin']).optional(),
  customRoleId: z.string().nullable().optional(),
});

export const PATCH = createHandler(
  async (req, { user, params }) => {
    try {
      const body = await req.json();
      const parsed = updateUserSchema.safeParse(body);

      if (!parsed.success) {
        return NextResponse.json({ error: 'Invalid request', details: parsed.error.errors }, { status: 400 });
      }

      const existing = await prisma.user.findUnique({ where: { id: params.id } });
      if (!existing) throw new NotFoundError('User');

      const data: Record<string, unknown> = {};
      if (parsed.data.role !== undefined) data.role = parsed.data.role;
      if (parsed.data.customRoleId !== undefined) data.customRoleId = parsed.data.customRoleId;

      await prisma.user.update({ where: { id: params.id }, data: data as any });

      const updated = await getUser(params.id);
      return NextResponse.json({ user: updated });
    } catch (err) {
      return handleApiError(err);
    }
  },
  { permissions: ['user.manage'] }
);