export type Timestamp = ReturnType<typeof Date.now>;

export interface BaseDocument {
  id: string;
  tenantId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type Role = 'client' | 'agent' | 'super_admin';

export type TicketStatus =
  | 'open'
  | 'in_progress'
  | 'resolved'
  | 'closed';

export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';

export type MessageType = 'public' | 'internal_note';

export type NotificationType =
  | 'ticket.created'
  | 'ticket.assigned'
  | 'ticket.status_changed'
  | 'message.added'
  | 'message.internal_note'
  | 'user.mentioned'
  | 'ticket.reopened'
  | 'ticket.priority_changed';

export interface PaginationParams {
  limit?: number;
  cursor?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  nextCursor?: string;
  hasMore: boolean;
}
