'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { Bell, CheckCheck, ExternalLink } from 'lucide-react';
import { RelativeTime } from '@/components/relative-time';

export function NotificationBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const authUser = useAuthStore((s) => s.user);
  const notifications = useNotificationStore((s) => s.notifications);
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const markRead = useNotificationStore((s) => s.markRead);
  const markAllReadAction = useNotificationStore((s) => s.markAllRead);

  const isClient = authUser?.role === 'client';

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  async function handleMarkRead(id: string) {
    await fetch(`/api/notifications/${id}`, { method: 'PATCH' }).catch(() => {});
    markRead(id);
  }

  async function handleMarkAllRead() {
    await fetch('/api/notifications', { method: 'POST' }).catch(() => {});
    markAllReadAction();
  }

  function handleNavigate(ticketId: string, notifId: string) {
    if (!notifications.find((n) => n.id === notifId)?.isRead) {
      handleMarkRead(notifId);
    }
    setOpen(false);
    const base = isClient ? '/portal' : '/admin';
    router.push(`${base}/tickets/${ticketId}`);
  }

  const sorted = [...notifications].sort((a, b) => {
    if (a.isRead !== b.isRead) return a.isRead ? 1 : -1;
    return b.createdAt - a.createdAt;
  });
  const recent = sorted.slice(0, 10);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-full hover:bg-accent transition-colors"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-[14px] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground leading-none ring-2 ring-background">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 rounded-lg border bg-card shadow-lg z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <span className="text-sm font-semibold">Notifications</span>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead} className="flex items-center gap-1 text-xs text-primary hover:underline">
                <CheckCheck className="h-3 w-3" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {recent.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                No notifications yet
              </div>
            ) : (
              recent.map((n) => {
                const isUnread = !n.isRead;
                return (
                  <button
                    key={n.id}
                    onClick={() => handleNavigate(n.ticketId, n.id)}
                    className={`w-full text-left px-4 py-3 hover:bg-accent transition-colors border-b last:border-b-0 ${
                      isUnread ? 'bg-primary/5' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${isUnread ? 'font-semibold' : ''} truncate`}>{n.title}</p>
                        {n.body && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.body}</p>}
                        <p className="text-[10px] text-muted-foreground mt-1">
                          <RelativeTime date={n.createdAt} />
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        {isUnread && <span className="h-2 w-2 rounded-full bg-primary" />}
                        {!isUnread && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleMarkRead(n.id); }}
                            className="text-muted-foreground hover:text-primary"
                          >
                            <CheckCheck className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          <div className="border-t px-4 py-2">
            <button
              onClick={() => { setOpen(false); router.push(`${isClient ? '/portal' : '/admin'}/notifications`); }}
              className="flex items-center justify-center gap-1 w-full text-xs text-muted-foreground hover:text-primary py-1"
            >
              <ExternalLink className="h-3 w-3" />
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
}