'use client';

import { useEffect, useState, useCallback } from 'react';
import { apiFetch } from '@/lib/api-client';
import { useAuthStore } from '@/stores/authStore';
import type { Ticket, PartialTicketUpdate } from '@/types';

interface UseTicketResult {
  ticket: Ticket | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
  updateTicket: (updates: PartialTicketUpdate) => void;
}

export function useTicket(ticketId: string | null): UseTicketResult {
  const authUser = useAuthStore((s) => s.user);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!ticketId || !authUser) {
      setTicket(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      if (!ticket) setLoading(true);
      setError(null);

      try {
        const data = await apiFetch(`/api/tickets/${ticketId}`);
        if (!cancelled) {
          setTicket(data.ticket || null);
          if (!data.ticket) setError('Ticket not found');
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message || 'Failed to load ticket');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [ticketId, authUser, refreshKey]);

  const refresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  const updateTicket = useCallback((updates: PartialTicketUpdate) => {
    setTicket((prev) => prev ? { ...prev, ...updates } : prev);
  }, []);

  return { ticket, loading, error, refresh, updateTicket };
}
