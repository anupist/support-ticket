'use client';

import { useEffect, useState, useRef } from 'react';
import {
  onSnapshot,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { collectionRef } from '@/lib/db';
import { COLLECTIONS, DEFAULT_TENANT_ID } from '@/lib/constants';
import { apiFetch } from '@/lib/api-client';
import { useAuthStore } from '@/stores/authStore';
import type { TicketMessage, MessageType } from '@/types';

interface UseTicketMessagesResult {
  messages: TicketMessage[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => void;
  sendMessage: (body: string, messageType: MessageType) => Promise<TicketMessage | null>;
}

export function useTicketMessages(ticketId: string | null): UseTicketMessagesResult {
  const authUser = useAuthStore((s) => s.user);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const oldestDocRef = useRef<any>(null);
  const [page, setPage] = useState(0);

  useEffect(() => {
    if (!ticketId) {
      setMessages([]);
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
          const data = await apiFetch(`/api/tickets/${id}/messages`);
          if (!cancelled) {
            setMessages(data.messages || []);
            setHasMore(false);
            setLoading(false);
          }
        } catch {
          // fall through to Firestore
        }
      }

      const messagesRef = collectionRef(COLLECTIONS.TICKETS, id, 'messages');
      const q = query(messagesRef, orderBy('createdAt', 'asc'), limit(50));

      const unsub = onSnapshot(
        q,
        (snapshot) => {
          if (!cancelled) {
            const results = snapshot.docs.map(
              (doc) => ({ id: doc.id, ...doc.data() } as TicketMessage)
            );
            setMessages(results);
            oldestDocRef.current = snapshot.docs[0] || null;
            setHasMore(snapshot.docs.length === 50);
            setLoading(false);
            setError(null);
          }
        },
        () => {
          if (!cancelled && authUser) {
            apiFetch(`/api/tickets/${id}/messages`)
              .then((data) => {
                if (!cancelled) {
                  setMessages(data.messages || []);
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
  }, [ticketId, page, authUser]);

  async function loadMore() {
    if (!ticketId || !oldestDocRef.current) return;
    setPage((p) => p + 1);
  }

  async function sendMessage(body: string, messageType: MessageType): Promise<TicketMessage | null> {
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
      await apiFetch(`/api/tickets/${ticketId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ body, messageType }),
      });

      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      return null;
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      return null;
    }
  }

  return { messages, loading, error, hasMore, loadMore, sendMessage };
}
