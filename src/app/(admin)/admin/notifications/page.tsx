'use client';

import Link from 'next/link';
import { AuthProvider } from '@/providers/AuthProvider';
import { useNotifications } from '@/hooks/useNotifications';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/EmptyState';
import { Skeleton } from '@/components/shared/LoadingSkeleton';
import { Bell, CheckCheck } from 'lucide-react';
import { RelativeTime } from '@/components/relative-time';

function AdminNotificationsContent() {
  const { notifications, loading, unreadCount } = useNotifications();

  async function markAllRead() {
    await fetch('/api/notifications', { method: 'POST' });
  }

  async function markRead(id: string) {
    await fetch(`/api/notifications/${id}`, { method: 'PATCH' });
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">System notifications and alerts</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead}>
            <CheckCheck className="h-4 w-4" />
            Mark all read
          </Button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={<Bell className="h-12 w-12" />}
          title="No notifications"
          description="Notifications will appear here when there's activity."
        />
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <Link
              key={n.id}
              href={`/admin/tickets/${n.ticketId}`}
              onClick={() => !n.isRead && markRead(n.id)}
            >
              <Card
                className={`transition-colors hover:bg-muted/50 cursor-pointer ${
                  !n.isRead ? 'border-primary/30 bg-primary/5' : ''
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${!n.isRead ? 'font-semibold' : ''}`}>{n.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{n.body}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="text-xs text-muted-foreground"><RelativeTime date={n.createdAt} /></span>
                      {!n.isRead && <span className="h-2 w-2 rounded-full bg-primary" />}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminNotificationsPage() {
  return (
    <AuthProvider>
      <AdminNotificationsContent />
    </AuthProvider>
  );
}
