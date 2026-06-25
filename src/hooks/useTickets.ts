'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { apiFetch } from '@/lib/api-client';
import type { Ticket, TicketStatus } from '@/types';

interface UseTicketsOptions {
  status?: TicketStatus | 'all';
  search?: string;
  limitCount?: number;
}

interface UseTicketsResult {
  tickets: Ticket[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useTickets(options: UseTicketsOptions = {}): UseTicketsResult {
  const { status = 'all', search = '', limitCount = 50 } = options;
  const user = useAuthStore((s) => s.user);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

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
      if (search) params.set('search', search);

      try {
        const data = await apiFetch(`/api/tickets?${params.toString()}`);
        if (!cancelled) {
          setTickets(data.tickets || []);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message || 'Failed to load tickets');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [user, status, search, limitCount, refreshKey]);

  function refresh() {
    setRefreshKey((k) => k + 1);
  }

  return { tickets, loading, error, refresh };
}