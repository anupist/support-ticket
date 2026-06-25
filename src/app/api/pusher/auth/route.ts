import { NextResponse } from 'next/server';
import { verifySession } from '@/lib/guards/auth.guard';
import Pusher from 'pusher';

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
});

export async function POST(request: Request) {
  try {
    const cookie = request.headers.get('cookie') || '';
    const sessionMatch = cookie.match(/session=([^;]+)/);

    if (!sessionMatch) {
      return NextResponse.json({ error: 'No session' }, { status: 401 });
    }

    const user = await verifySession(sessionMatch[1]);
    const formData = await request.formData();
    const socketId = formData.get('socket_id') as string;
    const channelName = formData.get('channel_name') as string;

    const expectedChannel = `private-user-${user.uid}`;
    if (channelName !== expectedChannel) {
      return NextResponse.json({ error: 'Forbidden channel' }, { status: 403 });
    }

    const auth = pusher.authorizeChannel(socketId, channelName);
    return NextResponse.json(auth);
  } catch {
    return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
  }
}