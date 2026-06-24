import { NextResponse } from 'next/server';
import { getAdminAuth } from '@/lib/firebase-admin';
import { handleApiError } from '@/lib/errors';

export async function POST(request: Request) {
  try {
    const { idToken } = await request.json();
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days

    const sessionCookie = await getAdminAuth().createSessionCookie(idToken, {
      expiresIn,
    });

    const response = NextResponse.json({ success: true });

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

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete('session');
  return response;
}
