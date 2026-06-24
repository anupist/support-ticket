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
import type { Ticket, TicketStatus } from '@/types';

interface UseTicketsOptions {
  status?: TicketStatus | 'all';
  limitCount?: number;
}

interface UseTicketsResult {
  tickets: Ticket[];
  loading: boolean;
  error: string | null;
}

export function useTickets(options: UseTicketsOptions = {}): UseTicketsResult {
  const { status = 'all', limitCount = 50 } = options;
  const user = useAuthStore((s) => s.user);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setTickets([]);
      setLoading(false);
      return;
    }

    const u = user;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (status !== 'all') params.set('status', status);
      if (u.role !== 'client') params.set('all', 'true');

      try {
        const data = await apiFetch(`/api/tickets?${params.toString()}`);
        if (!cancelled) {
          setTickets(data.tickets || []);
          setLoading(false);
        }
      } catch {
        // fall through to Firestore
      }

      const constraints: any[] = [
        where('tenantId', '==', u.tenantId || DEFAULT_TENANT_ID),
      ];

      if (u.role === 'client') {
        constraints.push(where('createdBy', '==', u.uid));
      }

      if (status !== 'all') {
        constraints.push(where('status', '==', status));
      }

      constraints.push(orderBy('lastActivityAt', 'desc'));
      constraints.push(limit(limitCount));

      const q = query(collectionRef(COLLECTIONS.TICKETS), ...constraints);

      const unsub = onSnapshot(
        q,
        (snapshot) => {
          if (!cancelled) {
            const results = snapshot.docs.map(
              (doc) => ({ id: doc.id, ...doc.data() } as Ticket)
            );
            setTickets(results);
            setLoading(false);
            setError(null);
          }
        },
        () => {
          if (!cancelled) {
            apiFetch(`/api/tickets?${params.toString()}`)
              .then((data) => {
                if (!cancelled) {
                  setTickets(data.tickets || []);
                  setLoading(false);
                }
              })
              .catch(() => {
                if (!cancelled) setLoading(false);
              });
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
  }, [user, status, limitCount]);

  return { tickets, loading, error };
}
