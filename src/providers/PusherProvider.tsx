'use client';

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { useMessageStore } from '@/stores/messageStore';
import { getPusherClient, disconnectPusher } from '@/lib/pusher-client';
import type { Notification, TicketMessage } from '@/types';

export function PusherProvider({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const addNotification = useNotificationStore((s) => s.addNotification);
  const markRead = useNotificationStore((s) => s.markRead);
  const markAllRead = useNotificationStore((s) => s.markAllRead);
  const addPendingMessage = useMessageStore((s) => s.addPending);
  const subscribedRef = useRef(false);

  useEffect(() => {
    if (!user) {
      subscribedRef.current = false;
      disconnectPusher();
      return;
    }

    if (subscribedRef.current) return;

    const client = getPusherClient();
    const channel = client.subscribe(`private-user-${user.uid}`);

    channel.bind('notification.created', (data: { notification: Notification }) => {
      addNotification(data.notification);
    });

    channel.bind('notification.marked-read', (data: { notificationId: string }) => {
      markRead(data.notificationId);
    });

    channel.bind('notification.all-read', () => {
      markAllRead();
    });

    channel.bind('ticket.new-message', (data: { ticketId: string; message: TicketMessage }) => {
      addPendingMessage(data.ticketId, data.message);
    });

    subscribedRef.current = true;

    return () => {
      channel.unbind_all();
      client.unsubscribe(`private-user-${user.uid}`);
      subscribedRef.current = false;
    };
  }, [user, addNotification, markRead, markAllRead, addPendingMessage]);

  return <>{children}</>;
}