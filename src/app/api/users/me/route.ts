import { NextResponse } from 'next/server';
import { createHandler } from '@/lib/api-handler';
import { prisma } from '@/lib/prisma';
import { getUser } from '@/lib/services/user.service';
import { handleApiError } from '@/lib/errors';
import { z } from 'zod';

const updateProfileSchema = z.object({
  displayName: z.string().min(2).max(100).optional(),
  avatarUrl: z.string().optional(),
});

export const GET = createHandler(async (req, { user }) => {
  const profile = await getUser(user.uid);
  return NextResponse.json({ user: profile });
});

export const PATCH = createHandler(async (req, { user }) => {
  try {
    const body = await req.json();
    const parsed = updateProfileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.errors },
        { status: 400 }
      );
    }

    const data: Record<string, unknown> = {};
    if (parsed.data.displayName !== undefined) data.displayName = parsed.data.displayName;
    if (parsed.data.avatarUrl !== undefined) data.avatarUrl = parsed.data.avatarUrl;

    await prisma.user.update({
      where: { id: user.uid },
      data: data as any,
    });

    const updated = await getUser(user.uid);
    return NextResponse.json({ user: updated });
  } catch (err) {
    return handleApiError(err);
  }
});