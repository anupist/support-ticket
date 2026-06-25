import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { handleApiError } from '@/lib/errors';
import { z } from 'zod';

const resetSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = resetSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    const { token, password } = parsed.data;

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
      return NextResponse.json(
        { error: { code: 'invalid_token', message: 'Invalid or expired reset token' } },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email: resetToken.email } });
    if (!user) {
      return NextResponse.json(
        { error: { code: 'not_found', message: 'User not found' } },
        { status: 404 }
      );
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: hashPassword(password) },
    });

    await prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() },
    });

    return NextResponse.json({ message: 'Password reset successfully' });
  } catch (err) {
    return handleApiError(err);
  }
}