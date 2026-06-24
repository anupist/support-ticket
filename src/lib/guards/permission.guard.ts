import type { Role } from '@/types';
import { can } from '@/lib/permissions';
import { ForbiddenError } from '@/lib/errors';

type Action = Parameters<typeof can>[1];

export function requirePermission(
  userRole: Role,
  action: Action
): void {
  if (!can(userRole, action)) {
    throw new ForbiddenError(`Missing required permission: ${action}`);
  }
}
