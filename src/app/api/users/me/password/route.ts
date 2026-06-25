import { NextResponse } from 'next/server';
import { createHandler } from '@/lib/api-handler';
import { prisma } from '@/lib/prisma';
import { verifyPassword, hashPassword } from '@/lib/auth';
import { handleApiError } from '@/lib/errors';
import { z } from 'zod';

const changePasswordSchema = z.object({
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8),
});

export const POST = createHandler(async (req, { user }) => {
  try {
    const body = await req.json();
    const parsed = changePasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.errors },
        { status: 400 }
      );
    }

    const dbUser = await prisma.user.findUnique({ where: { id: user.uid } });
    if (!dbUser) {
      return NextResponse.json(
        { error: { code: 'unauthorized', message: 'User not found' } },
        { status: 401 }
      );
    }

    if (!dbUser.mustChangePassword) {
      if (!parsed.data.currentPassword) {
        return NextResponse.json(
          { error: { code: 'validation_error', message: 'Current password is required' } },
          { status: 400 }
        );
      }
      if (!verifyPassword(parsed.data.currentPassword, dbUser.passwordHash)) {
        return NextResponse.json(
          { error: { code: 'validation_error', message: 'Current password is incorrect' } },
          { status: 400 }
        );
      }
    }

    await prisma.user.update({
      where: { id: user.uid },
      data: {
        passwordHash: hashPassword(parsed.data.newPassword),
        mustChangePassword: false,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return handleApiError(err);
  }
});