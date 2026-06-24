'use client';

import { useEffect, useState } from 'react';
import {
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import { collectionRef } from '@/lib/db';
import { COLLECTIONS, DEFAULT_TENANT_ID } from '@/lib/constants';
import { useAuthStore } from '@/stores/authStore';
import { apiFetch } from '@/lib/api-client';
import type { Notification } from '@/types';

interface UseNotificationsResult {
  notifications: Notification[];
  loading: boolean;
  error: string | null;
  unreadCount: number;
}

export function useNotifications(limitCount = 50): UseNotificationsResult {
  const user = useAuthStore((s) => s.user);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    const u = user;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const data = await apiFetch('/api/notifications');
        if (!cancelled) {
          setNotifications(data.notifications || []);
          setLoading(false);
        }
      } catch {
        // fall through to Firestore
      }

      const q = query(
        collectionRef(COLLECTIONS.NOTIFICATIONS),
        where('userId', '==', u.uid),
        where('tenantId', '==', u.tenantId || DEFAULT_TENANT_ID),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const unsub = onSnapshot(
        q,
        (snapshot) => {
          if (!cancelled) {
            const results = snapshot.docs.map(
              (doc) => ({ id: doc.id, ...doc.data() } as Notification)
            );
            setNotifications(results);
            setLoading(false);
            setError(null);
          }
        },
        (err) => {
          if (!cancelled) {
            setError(err.message);
            setLoading(false);
          }
        }
      );

      return () => {
        unsub();
      };
    }

    const cleanup = load();
    return () => {
      cancelled = true;
      cleanup.then((fn) => fn?.());
    };
  }, [user, limitCount]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return { notifications, loading, error, unreadCount };
}
