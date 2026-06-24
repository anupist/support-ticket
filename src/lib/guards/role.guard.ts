import type { Role } from '@/types';
import { ForbiddenError } from '@/lib/errors';

const ROLE_HIERARCHY: Record<Role, number> = {
  client: 0,
  agent: 1,
  super_admin: 2,
};

export function requireRole(
  userRole: Role,
  requiredRoles: Role[]
): void {
  if (!requiredRoles.includes(userRole)) {
    throw new ForbiddenError(
      `Required role: ${requiredRoles.join(' or ')}. Current role: ${userRole}`
    );
  }
}

export function requireMinRole(
  userRole: Role,
  minRole: Role
): void {
  if (ROLE_HIERARCHY[userRole] < ROLE_HIERARCHY[minRole]) {
    throw new ForbiddenError(
      `Requires at least ${minRole} role. Current role: ${userRole}`
    );
  }
}
