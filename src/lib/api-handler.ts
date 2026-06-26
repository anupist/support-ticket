import { NextResponse } from 'next/server';
import { verifyAuth, type AuthenticatedUser } from '@/lib/guards/auth.guard';
import { requireRole } from '@/lib/guards/role.guard';
import { requirePermission } from '@/lib/guards/permission.guard';
import { AppError, ValidationError } from '@/lib/errors';
import type { Role } from '@/types';

type Action = Parameters<typeof requirePermission>[1];

interface HandlerContext {
  user: AuthenticatedUser;
  params: Record<string, string>;
}

type ApiHandler = (req: Request, context: HandlerContext) => Promise<Response>;

interface RouteConfig {
  auth?: boolean;
  roles?: Role[];
  permissions?: Action[];
}

function parseError(err: unknown): { statusCode: number; code: string; message: string; fields?: Record<string, string[]> } {
  if (err instanceof ValidationError) {
    return { statusCode: 400, code: 'validation_error', message: err.message, fields: err.fields };
  }
  if (err instanceof AppError) {
    return { statusCode: err.statusCode, code: err.code, message: err.message };
  }
  console.error('Unhandled error:', err);
  return { statusCode: 500, code: 'internal_error', message: 'An unexpected error occurred' };
}

export function createHandler(
  handler: ApiHandler,
  config: RouteConfig = {}
): (req: Request, context: { params: Promise<Record<string, string>> }) => Promise<Response> {
  return async (req, context) => {
    try {
      let user: AuthenticatedUser | undefined;

      if (config.auth !== false) {
        user = await verifyAuth(req);
      }

      if (config.roles && user) {
        requireRole(user.role as Role, config.roles);
      }

      if (config.permissions && user) {
        for (const permission of config.permissions) {
          requirePermission(user.role as Role, permission, user.customPermissions);
        }
      }

      const params = await context.params;
      return handler(req, { user: user!, params });
    } catch (err) {
      const { statusCode, code, message, fields } = parseError(err);
      return NextResponse.json(
        { error: { code, message, ...(fields ? { fields } : {}) } },
        { status: statusCode }
      );
    }
  };
}
