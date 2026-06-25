'use client';

import { useNotificationStore } from '@/stores/notificationStore';

export function useUnreadCount(): number {
  return useNotificationStore((s) => s.unreadCount);
}