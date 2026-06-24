import { NextResponse } from 'next/server';
import { getAdminAuth } from '@/lib/firebase-admin';
import { createUser } from '@/lib/services/user.service';
import { handleApiError } from '@/lib/errors';
import { z } from 'zod';

const registerSchema = z.object({
  idToken: z.string().min(1, 'Token is required'),
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

    const { idToken, displayName } = parsed.data;
    const decoded = await getAdminAuth().verifyIdToken(idToken);

    const userRecord = await getAdminAuth().getUser(decoded.uid);

    const user = await createUser({
      id: userRecord.uid,
      email: userRecord.email || '',
      displayName,
      role: 'client',
    });

    const expiresIn = 60 * 60 * 24 * 5 * 1000;
    const sessionCookie = await getAdminAuth().createSessionCookie(idToken, {
      expiresIn,
    });

    const response = NextResponse.json({ user }, { status: 201 });
    response.cookies.set('session', sessionCookie, {
      maxAge: expiresIn / 1000,
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
