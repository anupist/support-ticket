import { prisma } from '@/lib/prisma';
import { UnauthorizedError } from '@/lib/errors';

export interface AuthenticatedUser {
  uid: string;
  email: string;
  role: string;
  tenantId: string;
  displayName: string;
  avatarUrl: string;
  customPermissions?: string[];
}

export async function verifyAuth(request: Request): Promise<AuthenticatedUser> {
  const cookie = request.headers.get('Cookie') || '';
  const sessionMatch = cookie.match(/session=([^;]+)/);
  if (sessionMatch) {
    return verifySession(sessionMatch[1]);
  }

  throw new UnauthorizedError('Missing or invalid session');
}

export async function verifySession(sessionToken: string): Promise<AuthenticatedUser> {
  const session = await prisma.session.findUnique({
    where: { token: sessionToken },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) {
    if (session) {
      await prisma.session.delete({ where: { id: session.id } });
    }
    throw new UnauthorizedError('Invalid or expired session');
  }

  let customPermissions: string[] | undefined;
  if (session.user.customRoleId) {
    const customRole = await prisma.customRole.findUnique({
      where: { id: session.user.customRoleId },
    });
    if (customRole) {
      customPermissions = customRole.permissions as string[];
    }
  }

  return {
    uid: session.user.id,
    email: session.user.email,
    role: session.user.role,
    tenantId: session.user.tenantId,
    displayName: session.user.displayName,
    avatarUrl: session.user.avatarUrl,
    customPermissions,
  };
}