import { NextResponse } from 'next/server';
import { verifySession } from '@/lib/guards/auth.guard';
import { handleApiError } from '@/lib/errors';

export async function GET(request: Request) {
  try {
    const cookie = request.headers.get('cookie') || '';
    const sessionMatch = cookie.match(/session=([^;]+)/);

    if (!sessionMatch) {
      return NextResponse.json(
        { error: { code: 'unauthorized', message: 'No session' } },
        { status: 401 }
      );
    }

    const user = await verifySession(sessionMatch[1]);
    return NextResponse.json({ uid: user.uid, email: user.email, role: user.role, tenantId: user.tenantId, displayName: user.displayName, avatarUrl: user.avatarUrl });
  } catch (err) {
    return handleApiError(err);
  }
}