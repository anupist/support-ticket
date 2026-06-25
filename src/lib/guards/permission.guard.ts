import type { Role } from '@/types';
import { can } from '@/lib/permissions';
import { ForbiddenError } from '@/lib/errors';
import type { AuthenticatedUser } from '@/lib/guards/auth.guard';

type Action = Parameters<typeof can>[1];

export function requirePermission(
  userRole: Role,
  action: Action,
  customPermissions?: string[]
): void {
  if (!can(userRole, action, customPermissions)) {
    throw new ForbiddenError(`Missing required permission: ${action}`);
  }
}