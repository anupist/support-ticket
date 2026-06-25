import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createUser } from '@/lib/services/user.service';
import { generateSessionToken, getSessionExpiry } from '@/lib/auth';
import { handleApiError, ConflictError } from '@/lib/errors';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  displayName: z.string().min(2).max(100),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.errors },
        { status: 400 }
      );
    }

    const { email, password, displayName } = parsed.data;

    const user = await createUser({ email, password, displayName, role: 'client' });

    const token = generateSessionToken();
    await prisma.session.create({
      data: {
        userId: user.id,
        token,
        expiresAt: getSessionExpiry(),
      },
    });

    const response = NextResponse.json({ user }, { status: 201 });
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