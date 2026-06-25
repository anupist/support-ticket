import { create } from 'zustand';
import type { TicketMessage } from '@/types';

interface MessageStore {
  pendingByTicket: Record<string, TicketMessage[]>;
  addPending: (ticketId: string, message: TicketMessage) => void;
  consumePending: (ticketId: string) => TicketMessage[];
}

export const useMessageStore = create<MessageStore>((set, get) => ({
  pendingByTicket: {},
  addPending: (ticketId, message) =>
    set((s) => ({
      pendingByTicket: {
        ...s.pendingByTicket,
        [ticketId]: [...(s.pendingByTicket[ticketId] || []), message],
      },
    })),
  consumePending: (ticketId) => {
    const messages = get().pendingByTicket[ticketId] || [];
    if (messages.length > 0) {
      set((s) => {
        const { [ticketId]: _, ...rest } = s.pendingByTicket;
        return { pendingByTicket: rest };
      });
    }
    return messages;
  },
}));