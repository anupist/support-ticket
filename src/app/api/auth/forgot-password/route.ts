import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendPasswordResetEmail } from '@/lib/services/mail.service';
import { handleApiError } from '@/lib/errors';
import { randomUUID } from 'crypto';
import { z } from 'zod';

const forgotSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = forgotSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    const { email } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ message: 'If the email exists, a reset link has been sent.' });
    }

    const token = randomUUID();
    await prisma.passwordResetToken.create({
      data: {
        email,
        token,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}`;
    await sendPasswordResetEmail(email, resetLink);

    return NextResponse.json({ message: 'If the email exists, a reset link has been sent.' });
  } catch (err) {
    return handleApiError(err);
  }
}