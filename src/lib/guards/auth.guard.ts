import { getAdminAuth } from '@/lib/firebase-admin';
import { UnauthorizedError } from '@/lib/errors';

export interface AuthenticatedUser {
  uid: string;
  email: string;
  role: string;
  tenantId: string;
}

export async function verifyAuth(request: Request): Promise<AuthenticatedUser> {
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.split('Bearer ')[1];
    try {
      const decoded = await getAdminAuth().verifyIdToken(token);
      return {
        uid: decoded.uid,
        email: decoded.email || '',
        role: (decoded.role as string) || 'client',
        tenantId: (decoded.tenantId as string) || 'org_default',
      };
    } catch {
      throw new UnauthorizedError('Invalid or expired token');
    }
  }

  const cookie = request.headers.get('Cookie') || '';
  const sessionMatch = cookie.match(/session=([^;]+)/);
  if (sessionMatch) {
    return verifySessionCookie(sessionMatch[1]);
  }

  throw new UnauthorizedError('Missing or invalid authorization header');
}

export async function verifySessionCookie(session: string): Promise<AuthenticatedUser> {
  try {
    const decoded = await getAdminAuth().verifySessionCookie(session, true);
    return {
      uid: decoded.uid,
      email: decoded.email || '',
      role: (decoded.role as string) || 'client',
      tenantId: (decoded.tenantId as string) || 'org_default',
    };
  } catch {
    throw new UnauthorizedError('Invalid or expired session');
  }
}
