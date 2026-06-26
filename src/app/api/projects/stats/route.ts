import { NextResponse } from 'next/server';
import { createHandler } from '@/lib/api-handler';
import { getProjectTicketStats } from '@/lib/services/project.service';

export const GET = createHandler(async (req, { user }) => {
  const userId = user.role === 'client' ? user.uid : undefined;
  const data = await getProjectTicketStats(user.tenantId, userId);
  return NextResponse.json({ data });
});
