'use client';

import { useEffect, useState, useRef } from 'react';
import { apiFetch } from '@/lib/api-client';
import { useAuthStore } from '@/stores/authStore';
import { useMessageStore } from '@/stores/messageStore';
import { DEFAULT_TENANT_ID } from '@/lib/constants';
import type { TicketMessage, MessageType } from '@/types';

interface UseTicketMessagesResult {
  messages: TicketMessage[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => void;
  sendMessage: (body: string, messageType: MessageType, attachmentIds?: string[]) => Promise<TicketMessage | null>;
  refresh: () => void;
}

export function useTicketMessages(ticketId: string | null): UseTicketMessagesResult {
  const authUser = useAuthStore((s) => s.user);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const consumePending = useMessageStore((s) => s.consumePending);
  const pendingConsumedRef = useRef(false);

  useEffect(() => {
    if (!ticketId || !authUser) {
      setMessages([]);
      setLoading(false);
      return;
    }

    const id = ticketId;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const data = await apiFetch(`/api/tickets/${id}/messages`);
        if (!cancelled) {
          let loaded = data.messages || [];

          const pending = consumePending(id);
          if (pending.length > 0) {
            const existingIds = new Set(loaded.map((m: any) => m.id));
            const newOnes = pending.filter((m) => !existingIds.has(m.id));
            loaded = mergeMessages(loaded, newOnes);
          }

          setMessages(loaded);
          setHasMore(false);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message || 'Failed to load messages');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    pendingConsumedRef.current = false;

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticketId, authUser, refreshKey]);

  useEffect(() => {
    if (!ticketId || loading || pendingConsumedRef.current) return;

    const unsub = useMessageStore.subscribe((state, prev) => {
      const pending = state.pendingByTicket[ticketId!];
      const prevPending = prev.pendingByTicket[ticketId!];
      if (pending && pending !== prevPending && pending.length > (prevPending?.length || 0)) {
        const newMsg = pending[pending.length - 1];
        setMessages((prevMsgs) => {
          if (prevMsgs.some((m) => m.id === newMsg.id)) return prevMsgs;
          return [...prevMsgs, newMsg];
        });
        consumePending(ticketId!);
      }
    });

    pendingConsumedRef.current = true;

    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticketId, loading]);

  function loadMore() {
    // Pagination placeholder
  }

  async function sendMessage(body: string, messageType: MessageType, attachmentIds?: string[]): Promise<TicketMessage | null> {
    if (!ticketId) return null;

    const now = Date.now();

    const optimistic: TicketMessage = {
      id: `temp-${now}`,
      body,
      messageType,
      createdBy: '',
      createdByName: '',
      createdByRole: '',
      attachments: [],
      isEdited: false,
      editedAt: null,
      tenantId: DEFAULT_TENANT_ID,
      createdAt: now,
      updatedAt: now,
    };

    setMessages((prev) => [...prev, optimistic]);

    try {
      const res = await apiFetch(`/api/tickets/${ticketId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ body, messageType, attachmentIds }),
      });

      const serverMsg = res.message;
      setMessages((prev) => {
        const filtered = prev.filter((m) => m.id !== optimistic.id);
        if (serverMsg && !filtered.some((m) => m.id === serverMsg.id)) {
          const mapped = {
            id: serverMsg.id,
            body: serverMsg.body,
            messageType: serverMsg.messageType,
            createdBy: serverMsg.createdBy,
            createdByName: serverMsg.createdByName,
            createdByAvatarUrl: serverMsg.createdByAvatarUrl || '',
            createdByRole: serverMsg.createdByRole,
            attachments: serverMsg.attachments || [],
            isEdited: serverMsg.isEdited || false,
            editedAt: serverMsg.editedAt || null,
            tenantId: serverMsg.tenantId || DEFAULT_TENANT_ID,
            createdAt: serverMsg.createdAt || Date.now(),
            updatedAt: serverMsg.updatedAt || Date.now(),
          };
          return [...filtered, mapped];
        }
        return filtered;
      });
      return null;
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      return null;
    }
  }

  function refresh() {
    setRefreshKey((k) => k + 1);
  }

  return { messages, loading, error, hasMore, loadMore, sendMessage, refresh };
}

function mergeMessages(apiMessages: TicketMessage[], pending: TicketMessage[]): TicketMessage[] {
  const idSet = new Set(apiMessages.map((m) => m.id));
  const newOnes = pending.filter((m) => !idSet.has(m.id));
  if (newOnes.length === 0) return apiMessages;

  const all = [...apiMessages, ...newOnes];
  all.sort((a, b) => a.createdAt - b.createdAt);
  return all;
}