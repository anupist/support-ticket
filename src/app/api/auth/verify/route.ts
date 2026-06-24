import { NextResponse } from 'next/server';
import { verifySessionCookie } from '@/lib/guards/auth.guard';
import { handleApiError } from '@/lib/errors';

export async function GET(request: Request) {
  try {
    const session = request.headers.get('cookie')?.match(/session=([^;]+)/)?.[1];

    if (!session) {
      return NextResponse.json(
        { error: { code: 'unauthorized', message: 'No session' } },
        { status: 401 }
      );
    }

    const user = await verifySessionCookie(session);
    return NextResponse.json({ uid: user.uid, email: user.email, role: user.role, tenantId: user.tenantId });
  } catch (err) {
    return handleApiError(err);
  }
}
