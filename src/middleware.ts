import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicPaths = ['/auth/login', '/auth/register'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname === '/favicon.ico') {
    return NextResponse.next();
  }

  const session = request.cookies.get('session')?.value;

  if (publicPaths.some((p) => pathname.startsWith(p))) {
    if (session) {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify`,
          {
            headers: { Cookie: `session=${session}` },
          }
        );

        if (response.ok) {
          const { role } = await response.json();
          const dest = role === 'client' ? '/portal' : '/admin';
          return NextResponse.redirect(new URL(dest, request.url));
        }
      } catch {
        // Fall through to show login
      }
    }
    return NextResponse.next();
  }

  if (!session) {
    if (pathname === '/' || pathname.startsWith('/admin') || pathname.startsWith('/portal')) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
    return NextResponse.next();
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify`,
      {
        headers: { Cookie: `session=${session}` },
      }
    );

    if (!response.ok) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    const { role } = await response.json();

    if (pathname === '/') {
      const dest = role === 'client' ? '/portal' : '/admin';
      return NextResponse.redirect(new URL(dest, request.url));
    }

    if (pathname.startsWith('/admin') && !['agent', 'super_admin'].includes(role)) {
      return NextResponse.redirect(new URL('/portal', request.url));
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};