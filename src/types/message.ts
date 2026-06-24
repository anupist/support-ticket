import type { BaseDocument, MessageType, Timestamp } from './common';
import type { TicketAttachment } from './ticket';

export interface TicketMessage extends BaseDocument {
  body: string;
  messageType: MessageType;
  createdBy: string;
  createdByName: string;
  createdByRole: string;
  attachments: TicketAttachment[];
  isEdited: boolean;
  editedAt: Timestamp | null;
}

export interface CreateMessageInput {
  body: string;
  messageType: MessageType;
  attachmentIds?: string[];
}
