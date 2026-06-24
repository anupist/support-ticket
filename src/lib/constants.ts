import type { TicketStatus, TicketPriority, Role, NotificationType } from '@/types';

export const TICKET_STATUSES: TicketStatus[] = [
  'open',
  'in_progress',
  'waiting_on_client',
  'waiting_on_agent',
  'resolved',
  'closed',
];

export const TICKET_PRIORITIES: TicketPriority[] = [
  'low',
  'medium',
  'high',
  'urgent',
];

export const ROLES: Role[] = ['client', 'agent', 'super_admin'];

export const STATUS_TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
  open: ['in_progress', 'waiting_on_agent', 'closed'],
  in_progress: ['waiting_on_client', 'resolved', 'closed'],
  waiting_on_client: ['in_progress', 'closed'],
  waiting_on_agent: ['in_progress', 'resolved', 'closed'],
  resolved: ['closed', 'open'],
  closed: ['open'],
};

export const NOTIFICATION_TYPES: Record<string, NotificationType> = {
  TICKET_CREATED: 'ticket.created',
  TICKET_ASSIGNED: 'ticket.assigned',
  STATUS_CHANGED: 'ticket.status_changed',
  MESSAGE_ADDED: 'message.added',
  INTERNAL_NOTE: 'message.internal_note',
  USER_MENTIONED: 'user.mentioned',
  TICKET_REOPENED: 'ticket.reopened',
  PRIORITY_CHANGED: 'ticket.priority_changed',
};

export const STATUS_LABELS: Record<TicketStatus, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  waiting_on_client: 'Waiting on Client',
  waiting_on_agent: 'Waiting on Agent',
  resolved: 'Resolved',
  closed: 'Closed',
};

export const PRIORITY_LABELS: Record<TicketPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
};

export const DEFAULT_TENANT_ID = process.env.NEXT_PUBLIC_DEFAULT_TENANT_ID || 'org_default';
export const DEFAULT_ORG_ID = DEFAULT_TENANT_ID;

export const COLLECTIONS = {
  ORGANIZATIONS: 'organizations',
  USERS: 'users',
  TICKETS: 'tickets',
  MESSAGES: 'messages',
  NOTIFICATIONS: 'notifications',
  ACTIVITY_LOGS: 'activity_logs',
  ATTACHMENTS: 'attachments',
  CATEGORIES: 'ticket_categories',
  READ_STATUS: 'user_ticket_read_status',
  COUNTERS: 'counters',
} as const;

export const TICKET_NUMBER_PREFIX = 'TKT-';
