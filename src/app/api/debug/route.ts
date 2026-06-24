import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/guards/auth.guard';
import { prisma } from '@/lib/prisma';
import { handleApiError } from '@/lib/errors';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    const cookieHeader = request.headers.get('Cookie');

    const diagnostics: Record<string, any> = {
      hasAuthHeader: !!authHeader,
      authHeaderPrefix: authHeader?.substring(0, 20),
      hasCookieHeader: !!cookieHeader,
      cookiePreview: cookieHeader?.substring(0, 100),
    };

    try {
      const user = await verifyAuth(request);
      diagnostics.authUser = { uid: user.uid, email: user.email, role: user.role };

      const ticketCount = await prisma.ticket.count({
        where: { createdBy: user.uid, tenantId: user.tenantId },
      });
      diagnostics.ticketCountForUid = ticketCount;

      const userRecord = await prisma.user.findUnique({ where: { id: user.uid } });
      diagnostics.dbUserExists = !!userRecord;
      diagnostics.dbUserEmail = userRecord?.email;
    } catch (err: any) {
      diagnostics.authError = err.message;
    }

    return NextResponse.json(diagnostics);
  } catch (err) {
    return handleApiError(err);
  }
}
