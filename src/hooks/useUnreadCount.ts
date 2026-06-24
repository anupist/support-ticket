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

export function useUnreadCount(): number {
  const user = useAuthStore((s) => s.user);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    const u = user;
    let cancelled = false;

    async function load() {
      try {
        const data = await apiFetch('/api/notifications');
        if (!cancelled && data.notifications) {
          setUnreadCount(data.notifications.filter((n: any) => !n.isRead).length);
        }
      } catch {
        // fall through to Firestore
      }

      const q = query(
        collectionRef(COLLECTIONS.NOTIFICATIONS),
        where('userId', '==', u.uid),
        where('tenantId', '==', u.tenantId || DEFAULT_TENANT_ID),
        where('isRead', '==', false),
        orderBy('createdAt', 'desc'),
        limit(100)
      );

      const unsub = onSnapshot(
        q,
        (snapshot) => {
          if (!cancelled) {
            setUnreadCount(snapshot.size);
          }
        },
        () => {
          if (!cancelled) {
            apiFetch('/api/notifications')
              .then((data) => {
                if (!cancelled && data.notifications) {
                  setUnreadCount(data.notifications.filter((n: any) => !n.isRead).length);
                }
              })
              .catch(() => {});
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
  }, [user]);

  return unreadCount;
}
