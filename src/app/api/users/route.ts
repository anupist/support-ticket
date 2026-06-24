import { NextResponse } from 'next/server';
import { createHandler } from '@/lib/api-handler';
import { getUsersByTenant } from '@/lib/services/user.service';

export const GET = createHandler(
  async (req, { user }) => {
    const users = await getUsersByTenant(user.tenantId);
    return NextResponse.json({ users });
  },
  { permissions: ['user.list'] }
);
