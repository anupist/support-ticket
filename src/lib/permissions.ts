import type { Role, TicketStatus, TicketPriority } from '@/types';
import { STATUS_TRANSITIONS } from './constants';

type Action =
  | 'ticket.create'
  | 'ticket.view'
  | 'ticket.list'
  | 'ticket.update_status'
  | 'ticket.assign'
  | 'ticket.close'
  | 'ticket.reopen'
  | 'ticket.delete'
  | 'message.create'
  | 'message.reply_public'
  | 'message.reply_internal'
  | 'message.view_internal'
  | 'user.manage'
  | 'user.list'
  | 'dashboard.view'
  | 'category.manage'
  | 'settings.view'
  | 'project.manage'
  | 'project.view';

const PERMISSION_MATRIX: Record<Role, Set<Action>> = {
  client: new Set([
    'ticket.create',
    'ticket.view',
    'ticket.list',
    'ticket.close',
    'message.create',
    'message.reply_public',
    'project.manage',
    'project.view',
  ]),
  agent: new Set([
    'ticket.create',
    'ticket.view',
    'ticket.list',
    'ticket.update_status',
    'ticket.assign',
    'ticket.close',
    'ticket.reopen',
    'message.create',
    'message.reply_public',
    'message.reply_internal',
    'message.view_internal',
    'dashboard.view',
    'project.view',
  ]),
  super_admin: new Set([
    'ticket.create',
    'ticket.view',
    'ticket.list',
    'ticket.update_status',
    'ticket.assign',
    'ticket.close',
    'ticket.reopen',
    'ticket.delete',
    'message.create',
    'message.reply_public',
    'message.reply_internal',
    'message.view_internal',
    'user.manage',
    'user.list',
    'dashboard.view',
    'category.manage',
    'settings.view',
    'project.manage',
    'project.view',
  ]),
};

export function can(userRole: Role, action: Action, customPermissions?: string[]): boolean {
  if (customPermissions) {
    return customPermissions.includes(action);
  }
  return PERMISSION_MATRIX[userRole]?.has(action) ?? false;
}

export function canTransitionStatus(
  userRole: Role,
  currentStatus: TicketStatus,
  nextStatus: TicketStatus
): boolean {
  if (userRole === 'client' && nextStatus === 'closed' && currentStatus !== 'closed') {
    return true;
  }
  if (userRole === 'client') return false;

  const allowed = STATUS_TRANSITIONS[currentStatus];
  if (!allowed) return false;
  return allowed.includes(nextStatus);
}

export function canAccessTicket(
  userRole: Role,
  userId: string,
  ticketCreatorId: string,
  ticketAssignedTo?: string | null
): boolean {
  if (userRole === 'super_admin') return true;
  if (userRole === 'client') return userId === ticketCreatorId;
  if (userRole === 'agent') return userId === ticketAssignedTo || userId === ticketCreatorId;
  return false;
}
