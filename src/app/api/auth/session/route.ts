import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, generateSessionToken, getSessionExpiry } from '@/lib/auth';
import { getUserByEmail } from '@/lib/services/user.service';
import { handleApiError, UnauthorizedError } from '@/lib/errors';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.errors },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !verifyPassword(password, user.passwordHash)) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const token = generateSessionToken();
    await prisma.session.create({
      data: {
        userId: user.id,
        token,
        expiresAt: getSessionExpiry(),
      },
    });

    const metadata = (user.metadata as any) || {};
    const isFirstLogin = !metadata.lastLoginAt;

    await prisma.user.update({
      where: { id: user.id },
      data: { metadata: { ...metadata, lastLoginAt: Date.now() } },
    });

    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        tenantId: user.tenantId,
        avatarUrl: user.avatarUrl,
      },
      mustChangePassword: user.mustChangePassword,
    });

    response.cookies.set('session', token, {
      maxAge: 5 * 24 * 60 * 60,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return response;
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete('session');
  return response;
}