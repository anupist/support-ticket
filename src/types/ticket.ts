import type { BaseDocument, TicketStatus, TicketPriority, Timestamp } from './common';

export interface TicketAttachment {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  url: string;
  uploadedAt: Timestamp;
}

export interface Ticket extends BaseDocument {
  ticketNumber: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  categoryId: string;
  categoryName?: string;
  tags: string[];
  assignedTo: string | null;
  assignedToName: string | null;
  createdBy: string;
  createdByName: string;
  lastActivityAt: Timestamp;
  lastMessageAt: Timestamp | null;
  lastMessageBy: string | null;
  lastMessageByRole: string | null;
  lastMessagePreview: string | null;
  messageCount: number;
  isArchived: boolean;
  organizationId: string;
}

export interface CreateTicketInput {
  subject: string;
  description: string;
  priority: TicketPriority;
  categoryId: string;
  tags?: string[];
}

export interface UpdateTicketInput {
  status?: TicketStatus;
  priority?: TicketPriority;
  categoryId?: string;
  assignedTo?: string | null;
  tags?: string[];
}
