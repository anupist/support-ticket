'use client';

import { useEffect, useState } from 'react';
import { onSnapshot, doc } from 'firebase/firestore';
import { docRef } from '@/lib/db';
import { COLLECTIONS } from '@/lib/constants';
import { apiFetch } from '@/lib/api-client';
import { useAuthStore } from '@/stores/authStore';
import type { Ticket } from '@/types';

interface UseTicketResult {
  ticket: Ticket | null;
  loading: boolean;
  error: string | null;
}

export function useTicket(ticketId: string | null): UseTicketResult {
  const authUser = useAuthStore((s) => s.user);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ticketId) {
      setTicket(null);
      setLoading(false);
      return;
    }

    const id = ticketId;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      if (authUser) {
        try {
          const data = await apiFetch(`/api/tickets/${id}`);
          if (!cancelled && data.ticket) {
            setTicket(data.ticket);
            setLoading(false);
          }
        } catch {
          // will be handled by Firestore fallback below
        }
      }

      const ref = docRef(COLLECTIONS.TICKETS, id);
      const unsub = onSnapshot(
        ref,
        (snap) => {
          if (!cancelled) {
            if (snap.exists()) {
              setTicket({ id: snap.id, ...snap.data() } as Ticket);
            }
            setLoading(false);
            setError(null);
          }
        },
        () => {
          if (!cancelled) {
            apiFetch(`/api/tickets/${id}`)
              .then((data) => {
                if (!cancelled) {
                  setTicket(data.ticket || null);
                  setLoading(false);
                  if (!data.ticket) setError('Ticket not found');
                }
              })
              .catch(() => {
                if (!cancelled) {
                  setLoading(false);
                  setError('Ticket not found');
                }
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
  }, [ticketId, authUser]);

  return { ticket, loading, error };
}
