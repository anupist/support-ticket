'use client';

import { AuthProvider, useAuth } from '@/providers/AuthProvider';
import { PusherProvider } from '@/providers/PusherProvider';
import { useUnreadCount } from '@/hooks/useUnreadCount';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Ticket,
  Users,
  FolderTree,
  Bell,
  Settings,
  LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, badge: false },
  { href: '/admin/tickets', label: 'Tickets', icon: Ticket, badge: false },
  { href: '/admin/users', label: 'Users', icon: Users, badge: false },
  { href: '/admin/categories', label: 'Categories', icon: FolderTree, badge: false },
  { href: '/admin/notifications', label: 'Notifications', icon: Bell, badge: true },
  { href: '/admin/settings', label: 'Settings', icon: Settings, badge: false },
];

function AdminShell({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const unreadCount = useUnreadCount();
  const pathname = usePathname();

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="w-64 border-r bg-sidebar flex flex-col">
        <div className="p-6 border-b">
          <h2 className="text-lg font-bold">Admin Panel</h2>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <div className="relative">
                  <Icon className="h-4 w-4" />
                  {item.badge && unreadCount > 0 && (
                    <span className="absolute -top-2 -right-2 flex h-4 min-w-[14px] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground leading-none">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </div>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t">
          <div className="flex items-center gap-3 mb-3">
            <Avatar
              fallback={user?.displayName || 'A'}
              size="sm"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.displayName || 'Admin'}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="w-full" asChild>
            <Link href="/auth/login">
              <LogOut className="h-4 w-4" />
              Sign Out
            </Link>
          </Button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="p-6 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <PusherProvider>
        <AdminShell>{children}</AdminShell>
      </PusherProvider>
    </AuthProvider>
  );
}
