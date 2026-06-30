'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { apiFetch } from '@/lib/api-client';
import type { Ticket, TicketStatus } from '@/types';

interface UseTicketsOptions {
  status?: TicketStatus | 'all';
  search?: string;
  projectId?: string;
  pageSize?: number;
}

interface UseTicketsResult {
  tickets: Ticket[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
  loadMore: () => void;
  hasMore: boolean;
  totalCount: number;
  pageSize: number;
}

export function useTickets(options: UseTicketsOptions = {}): UseTicketsResult {
  const { status = 'all', search = '', projectId, pageSize = 10 } = options;
  const user = useAuthStore((s) => s.user);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadTickets = useCallback(
    async (pageNum: number, append: boolean) => {
      if (!user) {
        setTickets([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (status !== 'all') params.set('status', status);
      if (search) params.set('search', search);
      if (projectId) params.set('projectId', projectId);
      params.set('page', String(pageNum));
      params.set('limit', String(pageSize));

      try {
        const data = await apiFetch(`/api/tickets?${params.toString()}`);
        if (append) {
          setTickets((prev) => [...prev, ...(data.tickets || [])]);
        } else {
          setTickets(data.tickets || []);
        }
        setTotalCount(data.totalCount || 0);
      } catch (err: any) {
        setError(err.message || 'Failed to load tickets');
      } finally {
        setLoading(false);
      }
    },
    [user, status, search, projectId, pageSize]
  );

  // Reset on filter change
  useEffect(() => {
    setPage(1);
    setTickets([]);
    loadTickets(1, false);
  }, [user, status, search, projectId, pageSize, refreshKey]);

  const loadMore = useCallback(() => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadTickets(nextPage, true);
  }, [page, loadTickets]);

  const refresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  const hasMore = tickets.length < totalCount;

  return { tickets, loading, error, refresh, loadMore, hasMore, totalCount, pageSize };
}
