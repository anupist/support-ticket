import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifySession } from '@/lib/guards/auth.guard';

export default async function Home() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session')?.value;

  if (!sessionCookie) {
    redirect('/auth/login');
  }

  try {
    const user = await verifySession(sessionCookie);
    if (user.role === 'client') {
      redirect('/portal');
    }
    redirect('/admin');
  } catch {
    redirect('/auth/login');
  }
}