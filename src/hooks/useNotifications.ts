'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { apiFetch } from '@/lib/api-client';

export function useNotifications(limitCount = 50) {
  const user = useAuthStore((s) => s.user);
  const notifications = useNotificationStore((s) => s.notifications);
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const loading = useNotificationStore((s) => s.loading);
  const setNotifications = useNotificationStore((s) => s.setNotifications);
  const refreshKey = useNotificationStore((s) => s.notifications.length);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        const data = await apiFetch('/api/notifications');
        if (!cancelled) {
          setNotifications(data.notifications || []);
        }
      } catch {
        if (!cancelled) setNotifications([]);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return { notifications, loading, error: null, unreadCount, refresh: () => {} };
}