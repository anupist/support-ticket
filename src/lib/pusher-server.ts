import Pusher from 'pusher';

let pusher: Pusher | null = null;

function getPusherServer(): Pusher {
  if (!pusher) {
    pusher = new Pusher({
      appId: process.env.PUSHER_APP_ID!,
      key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
      secret: process.env.PUSHER_SECRET!,
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      useTLS: true,
    });
  }
  return pusher;
}

export async function triggerNotification(
  userId: string,
  event: string,
  payload: Record<string, unknown>
): Promise<void> {
  try {
    await getPusherServer().trigger(`private-user-${userId}`, event, payload);
  } catch (err) {
    console.error('Pusher trigger failed:', err);
  }
}

export async function triggerNotificationBatch(
  userIds: string[],
  event: string,
  payload: Record<string, unknown>
): Promise<void> {
  try {
    const server = getPusherServer();
    await Promise.all(
      userIds.map((uid) =>
        server.trigger(`private-user-${uid}`, event, payload)
      )
    );
  } catch (err) {
    console.error('Pusher batch trigger failed:', err);
  }
}