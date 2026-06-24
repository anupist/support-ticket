import type { BaseDocument, NotificationType } from './common';

export interface Notification extends BaseDocument {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  ticketId: string;
  ticketNumber: string;
  actorId: string;
  actorName: string;
  isRead: boolean;
  readAt: number | null;
  metadata: Record<string, string>;
}
