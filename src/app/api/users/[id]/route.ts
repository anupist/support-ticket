import { NextResponse } from 'next/server';
import { createHandler } from '@/lib/api-handler';
import { getUser, updateUserRole } from '@/lib/services/user.service';
import { updateUserSchema } from '@/lib/validations/user.schema';
import { ValidationError } from '@/lib/errors';

export const PATCH = createHandler(
  async (req, { user, params }) => {
    const body = await req.json();
    const parsed = updateUserSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError(
        Object.fromEntries(
          parsed.error.errors.map((e) => [e.path.join('.'), [e.message]])
        )
      );
    }

    if (parsed.data.role) {
      await updateUserRole(params.id, parsed.data.role);
    }

    const updated = await getUser(params.id);
    return NextResponse.json({ user: updated });
  },
  { roles: ['super_admin'] }
);
