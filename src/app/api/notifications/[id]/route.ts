import { NextResponse } from 'next/server';
import { createHandler } from '@/lib/api-handler';
import { markNotificationAsRead } from '@/lib/services/notification.service';

export const PATCH = createHandler(async (req, { user, params }) => {
  await markNotificationAsRead(params.id);
  return NextResponse.json({ success: true });
});
